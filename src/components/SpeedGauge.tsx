import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ConnectionMode, SpeedUnit, TestDurationOption, TestStage } from '../types/speedtest';
import { formatSpeedValue, getUnitLabel, getUnitDescription } from '../services/unitHelper';
import {
  Play,
  Square,
  RotateCcw,
  Zap,
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  Gauge,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SpeedGaugeProps {
  stage: TestStage;
  currentValue: number; // in raw Mbps
  downloadValue: number; // in raw Mbps
  uploadValue: number; // in raw Mbps
  pingValue: number;
  jitterValue: number;
  unit: SpeedUnit;
  onToggleUnit: () => void;
  duration: TestDurationOption;
  onChangeDuration: (dur: TestDurationOption) => void;
  connectionMode: ConnectionMode;
  onChangeConnectionMode: (mode: ConnectionMode) => void;
  channelsCount: number;
  onChangeChannelsCount: (count: number) => void;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  theme: 'dark' | 'light';
}

// Calibrated Multi-Gigabit Scale Points (0 to 10,000 Mbps / 10 Gbps)
// Logarithmic/calibrated progression giving precision at broadband rates (<500M)
// while sweeping smoothly all the way to 10 Gbps multi-gig enterprise line speeds.
const SCALE_POINTS_10G = [
  { val: 0, label: '0', pct: 0 },
  { val: 25, label: '25M', pct: 0.10 },
  { val: 100, label: '100M', pct: 0.22 },
  { val: 500, label: '500M', pct: 0.36 },
  { val: 1000, label: '1G', pct: 0.50 },
  { val: 2500, label: '2.5G', pct: 0.65 },
  { val: 5000, label: '5G', pct: 0.78 },
  { val: 7500, label: '7.5G', pct: 0.89 },
  { val: 10000, label: '10G', pct: 1.0 },
];

function valueToPercent(val: number): number {
  if (val <= 0) return 0;
  if (val >= 10000) return 1.0;

  for (let i = 0; i < SCALE_POINTS_10G.length - 1; i++) {
    const cur = SCALE_POINTS_10G[i];
    const nxt = SCALE_POINTS_10G[i + 1];
    if (val >= cur.val && val <= nxt.val) {
      const span = nxt.val - cur.val;
      const ratio = (val - cur.val) / span;
      return cur.pct + ratio * (nxt.pct - cur.pct);
    }
  }
  return 1.0;
}

const DURATION_OPTIONS: { val: TestDurationOption; label: string; tooltip: string }[] = [
  { val: 5, label: '5s', tooltip: '5 seconds quick test' },
  { val: 10, label: '10s', tooltip: '10 seconds standard test' },
  { val: 15, label: '15s', tooltip: '15 seconds thorough test' },
  { val: 20, label: '20s', tooltip: '20 seconds precision test' },
  { val: 30, label: '30s', tooltip: '30 seconds endurance test' },
];

const PRESET_CHANNELS = [1, 8, 16, 32, 64, 100];

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  stage,
  currentValue,
  downloadValue,
  uploadValue,
  pingValue,
  jitterValue,
  unit,
  onToggleUnit,
  duration,
  onChangeDuration,
  connectionMode,
  onChangeConnectionMode,
  channelsCount,
  onChangeChannelsCount,
  onStart,
  onStop,
  onRestart,
  theme,
}) => {
  const [showChannelCustomizer, setShowChannelCustomizer] = useState(false);

  const isTesting =
    stage === 'initializing' ||
    stage === 'choosing_endpoint' ||
    stage === 'testing_ping' ||
    stage === 'testing_jitter' ||
    stage === 'testing_download' ||
    stage === 'testing_upload' ||
    stage === 'calculating_results';

  const isCompleted = stage === 'completed';

  // Compact 250-degree sweep dial (calibrated for high visual clarity)
  const START_ANGLE = 145;
  const END_ANGLE = 395;
  const TOTAL_SWEEP = END_ANGLE - START_ANGLE; // 250 deg

  const RADIUS = 118;
  const CENTER_X = 180;
  const CENTER_Y = 142;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const ARC_LENGTH = (TOTAL_SWEEP / 360) * CIRCUMFERENCE;

  // Active speed to display, smoothed with frame-rate independent EMA for ultra-silky needle motion
  const [smoothedValue, setSmoothedValue] = useState(currentValue);
  const smoothedRef = useRef(currentValue);
  smoothedRef.current = smoothedValue;

  useEffect(() => {
    if (!isTesting) {
      setSmoothedValue(isCompleted ? downloadValue : 0);
      return;
    }
    const target = stage === 'testing_download' || stage === 'testing_upload' ? currentValue : 0;
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min(0.08, (time - lastTime) / 1000);
      lastTime = time;

      const current = smoothedRef.current;
      const delta = target - current;

      if (Math.abs(delta) < 0.04) {
        setSmoothedValue(target);
      } else {
        // Silky exponential lerp factor (60–144Hz smooth glide)
        const lerpFactor = 1 - Math.exp(-14 * dt);
        const nextVal = current + delta * lerpFactor;
        setSmoothedValue(nextVal);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [currentValue, downloadValue, isTesting, isCompleted, stage]);

  // Active speedometer percentage based on 0 - 10 Gbps scale
  const progressRatio = useMemo(() => {
    if (stage === 'testing_download' || stage === 'testing_upload') {
      return valueToPercent(smoothedValue);
    }
    if (isCompleted) {
      return valueToPercent(downloadValue);
    }
    return 0;
  }, [stage, smoothedValue, downloadValue, isCompleted]);

  // Stroke Dashoffset for active glowing speed arc
  const strokeDashoffset = ARC_LENGTH - ARC_LENGTH * Math.min(1, Math.max(0, progressRatio));

  // Needle angle
  const needleAngle = START_ANGLE + progressRatio * TOTAL_SWEEP;

  // Formatted speed number (adaptive Gbps / Mbps formatting)
  const speedDisplay = useMemo(() => {
    const rawVal =
      stage === 'testing_download' || stage === 'testing_upload'
        ? smoothedValue
        : isCompleted
        ? downloadValue
        : 0;

    if (unit === 'MBps') {
      const mbSec = rawVal / 8;
      if (mbSec >= 1000) {
        return {
          main: (mbSec / 1024).toFixed(2),
          unitLabel: 'GB/s',
          sub: `${mbSec.toFixed(1)} MB/s`,
        };
      }
      return {
        main: mbSec.toFixed(1),
        unitLabel: 'MB/s',
        sub: `${rawVal.toFixed(1)} Mbps`,
      };
    }

    // Default Mbps / Gbps
    if (rawVal >= 1000) {
      return {
        main: (rawVal / 1000).toFixed(2),
        unitLabel: 'Gbps',
        sub: `${rawVal.toFixed(0)} Mbps`,
      };
    }

    return {
      main: rawVal.toFixed(1),
      unitLabel: 'Mbps',
      sub: `${(rawVal / 8).toFixed(1)} MB/s`,
    };
  }, [stage, smoothedValue, downloadValue, isCompleted, unit]);

  const needleLength = RADIUS - 10;
  const tailLength = 20;

  // Ticks computation for 0 to 10 Gbps
  const ticks = useMemo(() => {
    const list: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      tx?: number;
      ty?: number;
      label?: string;
      isMajor: boolean;
      isRedline: boolean;
    }> = [];

    const SUBDIVISIONS = 40;
    for (let i = 0; i <= SUBDIVISIONS; i++) {
      const pct = i / SUBDIVISIONS;
      const angleDeg = START_ANGLE + pct * TOTAL_SWEEP;
      const rad = (angleDeg * Math.PI) / 180;
      const isRedline = pct >= 0.85;

      const matchedScale = SCALE_POINTS_10G.find((sp) => Math.abs(sp.pct - pct) < 0.02);
      const isMajor = matchedScale !== undefined || i % 4 === 0;

      const rOuter = RADIUS + 6;
      const rInner = isMajor ? RADIUS - 8 : RADIUS - 3;

      const x1 = CENTER_X + rInner * Math.cos(rad);
      const y1 = CENTER_Y + rInner * Math.sin(rad);
      const x2 = CENTER_X + rOuter * Math.cos(rad);
      const y2 = CENTER_Y + rOuter * Math.sin(rad);

      let tx, ty, label;
      if (matchedScale) {
        label = matchedScale.label;
        const rText = RADIUS - 20;
        tx = CENTER_X + rText * Math.cos(rad);
        ty = CENTER_Y + rText * Math.sin(rad) + 3;
      }

      list.push({ x1, y1, x2, y2, tx, ty, label, isMajor, isRedline });
    }
    return list;
  }, [START_ANGLE, TOTAL_SWEEP, RADIUS, CENTER_X, CENTER_Y]);

  const isDark = theme === 'dark';

  const handleModeChange = (mode: ConnectionMode) => {
    if (isTesting) return;
    onChangeConnectionMode(mode);
    if (mode === 'single') {
      onChangeChannelsCount(1);
    } else if (mode === 'multi') {
      onChangeChannelsCount(8);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-2xl mx-auto">
      {/* Multi-Gigabit Speed Meter Card (0 to 10 Gbps with 1 to 100 Channel Controller) */}
      <div
        className={`relative w-full rounded-2xl p-4 sm:p-5 border shadow-xl backdrop-blur-xl transition-all duration-300 flex flex-col items-center ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-cyan-950/20'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/60'
        }`}
      >
        {/* Top Controls Bar: Duration, Unit Toggle, and Connection Mode */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2 relative z-10">
          {/* Connection Channel Mode: Single vs Multi vs Custom (1 - 100) */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              Channels:
            </span>
            <button
              disabled={isTesting}
              onClick={() => handleModeChange('single')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                connectionMode === 'single'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Single Channel: 1 stream to test raw single-thread TCP socket throughput"
            >
              Single (1x)
            </button>
            <button
              disabled={isTesting}
              onClick={() => handleModeChange('multi')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                connectionMode === 'multi'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Multi Channel: 8 parallel streams (Ookla standard for full fiber link saturation)"
            >
              Multi (8x)
            </button>
            <button
              disabled={isTesting}
              onClick={() => {
                handleModeChange('custom');
                setShowChannelCustomizer(!showChannelCustomizer);
              }}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                connectionMode === 'custom'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Custom Channel: configure from 1 to 100 concurrent streams (e.g. 100 files downloading together)"
            >
              <Sliders className="w-3 h-3" />
              <span>{connectionMode === 'custom' ? `${channelsCount}x` : 'Custom (1-100x)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Test Duration Selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Time:
              </span>
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.val}
                  disabled={isTesting}
                  onClick={() => onChangeDuration(opt.val)}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    duration === opt.val
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={opt.tooltip}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Unit Switcher: Mbps ↔ MB/s */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <button
                onClick={onToggleUnit}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-extrabold rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                title={getUnitDescription(unit)}
              >
                <Gauge className="w-3 h-3" />
                <span>{getUnitLabel(unit)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Custom 1 to 100 Channel Slider Drawer */}
        {(showChannelCustomizer || connectionMode === 'custom') && !isTesting && (
          <div className="w-full mb-3 p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-slate-200 animate-fade-in flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Concurrent Connection Channels:
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {channelsCount} Channels
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  ({channelsCount} files downloading together concurrently)
                </span>
              </div>
              <button
                onClick={() => setShowChannelCustomizer(false)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Hide
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400">1</span>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={channelsCount}
                onChange={(e) => {
                  onChangeConnectionMode('custom');
                  onChangeChannelsCount(Number(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] font-mono text-amber-400 font-bold">100</span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
              {PRESET_CHANNELS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onChangeConnectionMode(preset === 1 ? 'single' : preset === 8 ? 'multi' : 'custom');
                    onChangeChannelsCount(preset);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded border transition-all cursor-pointer ${
                    channelsCount === preset
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {preset} {preset === 1 ? 'Stream' : 'Streams'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 0 to 10 Gbps Speedometer Dial (ViewBox optimized, ~30% shorter) */}
        <div className="relative w-[280px] sm:w-[340px] h-[180px] sm:h-[215px] flex items-center justify-center overflow-hidden">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="10 10 340 240"
          >
            <defs>
              <filter id="gauge-glow-10g" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="clean-arc-gradient-10g" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="35%" stopColor="#3b82f6" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              <radialGradient id="clean-center-cap-10g" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
            </defs>

            {/* Background Dial Track */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS}
              fill="none"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
              transform={`rotate(${START_ANGLE} ${CENTER_X} ${CENTER_Y})`}
            />

            {/* Redline Bandwidth Marker (>= 7.5 Gbps) */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS}
              fill="none"
              stroke="#ef4444"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH * 0.15} ${CIRCUMFERENCE}`}
              strokeDashoffset={-ARC_LENGTH * 0.85}
              opacity="0.25"
              transform={`rotate(${START_ANGLE} ${CENTER_X} ${CENTER_Y})`}
            />

            {/* Active Sweeping Glow Speed Arc */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS}
              fill="none"
              stroke="url(#clean-arc-gradient-10g)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              filter="url(#gauge-glow-10g)"
              transform={`rotate(${START_ANGLE} ${CENTER_X} ${CENTER_Y})`}
              style={{ transition: isTesting ? 'none' : 'stroke-dashoffset 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />

            {/* Tick Marks & Scale Numerals (0 to 10 Gbps) */}
            {ticks.map((t, idx) => (
              <g key={idx}>
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.isRedline ? '#ef4444' : t.isMajor ? (isDark ? '#cbd5e1' : '#475569') : (isDark ? '#475569' : '#94a3b8')}
                  strokeWidth={t.isMajor ? (t.isRedline ? '2.5' : '2') : '1'}
                  strokeLinecap="round"
                />
                {t.label !== undefined && t.tx !== undefined && t.ty !== undefined && (
                  <text
                    x={t.tx}
                    y={t.ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[8.5px] font-bold font-mono select-none ${
                      t.isRedline
                        ? 'fill-rose-500 font-extrabold'
                        : isDark
                        ? 'fill-slate-300'
                        : 'fill-slate-600'
                    }`}
                  >
                    {t.label}
                  </text>
                )}
              </g>
            ))}

            {/* Ultra-Smooth Needle with Counterweight */}
            <g
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: `${CENTER_X}px ${CENTER_Y}px`,
                transition: isTesting ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={CENTER_X - tailLength}
                y2={CENTER_Y}
                stroke={isDark ? '#334155' : '#94a3b8'}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={CENTER_X + needleLength}
                y2={CENTER_Y}
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#gauge-glow-10g)"
              />
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={CENTER_X + needleLength}
                y2={CENTER_Y}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle
                cx={CENTER_X + needleLength}
                cy={CENTER_Y}
                r="2.5"
                fill="#ffffff"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
            </g>

            {/* Center Chrome Pivot */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r="15"
              fill="url(#clean-center-cap-10g)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <circle cx={CENTER_X} cy={CENTER_Y} r="5.5" fill="#ef4444" />
          </svg>

          {/* Compact Status Badge inside dial */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs ${
                stage === 'testing_download'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
                  : stage === 'testing_upload'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 animate-pulse'
                  : stage === 'testing_ping' || stage === 'testing_jitter'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                  : isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {stage === 'testing_download'
                ? `Download (${channelsCount} Ch)`
                : stage === 'testing_upload'
                ? 'Testing Upload'
                : stage === 'testing_ping'
                ? 'Testing Ping'
                : stage === 'testing_jitter'
                ? 'Testing Jitter'
                : stage === 'calculating_results'
                ? 'Analyzing'
                : isCompleted
                ? 'Test Complete'
                : '10G Wire Ready'}
            </span>
          </div>
        </div>

        {/* Dynamic Speed Readout (Shows 0 - 10 Gbps) */}
        <div className="flex flex-col items-center mt-1 mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              {speedDisplay.main}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-cyan-400 uppercase tracking-wider">
              {speedDisplay.unitLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
            <span>{speedDisplay.sub}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-mono text-[11px] font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {channelsCount === 1 ? '1 Stream' : `${channelsCount} Channels`}
            </span>
          </div>
        </div>

        {/* 4 Primary Metrics Summary Bar */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-slate-800/80">
          {/* Latency */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-400" />
              Ping
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-slate-100 mt-0.5">
              {pingValue > 0 ? (
                <>
                  {pingValue}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">ms</span>
                </>
              ) : (
                '--'
              )}
            </div>
          </div>

          {/* Jitter */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Activity className="w-3 h-3 text-purple-400" />
              Jitter
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-slate-100 mt-0.5">
              {jitterValue > 0 ? (
                <>
                  ±{jitterValue}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">ms</span>
                </>
              ) : (
                '--'
              )}
            </div>
          </div>

          {/* Download */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center ${
              stage === 'testing_download'
                ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                : isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
              <ArrowDown className="w-3 h-3" />
              Download
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-300 mt-0.5">
              {downloadValue > 0 ? (
                <>
                  {formatSpeedValue(downloadValue, unit, 1)}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                    {getUnitLabel(unit)}
                  </span>
                </>
              ) : (
                '--'
              )}
            </div>
          </div>

          {/* Upload */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center ${
              stage === 'testing_upload'
                ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30'
                : isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1 uppercase tracking-wider">
              <ArrowUp className="w-3 h-3" />
              Upload
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-purple-300 mt-0.5">
              {uploadValue > 0 ? (
                <>
                  {formatSpeedValue(uploadValue, unit, 1)}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                    {getUnitLabel(unit)}
                  </span>
                </>
              ) : (
                '--'
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-3.5 flex items-center justify-center">
          {!isTesting ? (
            <button
              onClick={isCompleted ? onRestart : onStart}
              className="group relative flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer gap-2"
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Run Test Again</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Speed Test</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-rose-600/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
