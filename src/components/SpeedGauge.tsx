import React, { useMemo } from 'react';
import { SpeedUnit, TestDurationOption, TestStage } from '../types/speedtest';
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
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  theme: 'dark' | 'light';
}

// Clean Speedometer Scale Points (0 to 1000 Mbps)
const SCALE_POINTS = [
  { val: 0, pct: 0 },
  { val: 10, pct: 0.10 },
  { val: 25, pct: 0.22 },
  { val: 50, pct: 0.35 },
  { val: 100, pct: 0.50 },
  { val: 200, pct: 0.65 },
  { val: 350, pct: 0.78 },
  { val: 500, pct: 0.88 },
  { val: 1000, pct: 1.0 },
];

function valueToPercent(val: number): number {
  if (val <= 0) return 0;
  if (val >= 1000) return 1.0;

  for (let i = 0; i < SCALE_POINTS.length - 1; i++) {
    const cur = SCALE_POINTS[i];
    const nxt = SCALE_POINTS[i + 1];
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
  onStart,
  onStop,
  onRestart,
  theme,
}) => {
  const isTesting =
    stage === 'initializing' ||
    stage === 'choosing_endpoint' ||
    stage === 'testing_ping' ||
    stage === 'testing_jitter' ||
    stage === 'testing_download' ||
    stage === 'testing_upload' ||
    stage === 'calculating_results';

  const isCompleted = stage === 'completed';

  // Compact 240-degree sweep dial (calibrated to be 30% shorter in height)
  const START_ANGLE = 145;
  const END_ANGLE = 395;
  const TOTAL_SWEEP = END_ANGLE - START_ANGLE; // 250 deg

  const RADIUS = 118;
  const CENTER_X = 180;
  const CENTER_Y = 142;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const ARC_LENGTH = (TOTAL_SWEEP / 360) * CIRCUMFERENCE;

  // Active speedometer percentage
  const progressRatio = useMemo(() => {
    if (stage === 'testing_download') {
      return valueToPercent(currentValue);
    }
    if (stage === 'testing_upload') {
      return valueToPercent(currentValue);
    }
    if (isCompleted) {
      return valueToPercent(downloadValue);
    }
    return 0;
  }, [stage, currentValue, downloadValue, isCompleted]);

  // Stroke Dashoffset for active glowing speed arc
  const strokeDashoffset = ARC_LENGTH - ARC_LENGTH * Math.min(1, Math.max(0, progressRatio));

  // Needle angle
  const needleAngle = START_ANGLE + progressRatio * TOTAL_SWEEP;

  // Formatted speed number (for the bottom readout)
  const displaySpeedNumber = useMemo(() => {
    if (stage === 'testing_download' || stage === 'testing_upload') {
      return formatSpeedValue(currentValue, unit, 1);
    }
    if (isCompleted) {
      return formatSpeedValue(downloadValue, unit, 1);
    }
    return '0.0';
  }, [stage, currentValue, downloadValue, isCompleted, unit]);

  // Coordinates for needle
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLength = RADIUS - 10;
  const needleTipX = CENTER_X + needleLength * Math.cos(needleRad);
  const needleTipY = CENTER_Y + needleLength * Math.sin(needleRad);

  const tailLength = 20;
  const tailX = CENTER_X - tailLength * Math.cos(needleRad);
  const tailY = CENTER_Y - tailLength * Math.sin(needleRad);

  // Ticks computation
  const ticks = useMemo(() => {
    const list: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      tx?: number;
      ty?: number;
      val?: number;
      isMajor: boolean;
      isRedline: boolean;
    }> = [];

    const SUBDIVISIONS = 36;
    for (let i = 0; i <= SUBDIVISIONS; i++) {
      const pct = i / SUBDIVISIONS;
      const angleDeg = START_ANGLE + pct * TOTAL_SWEEP;
      const rad = (angleDeg * Math.PI) / 180;
      const isRedline = pct >= 0.85;

      const matchedScale = SCALE_POINTS.find((sp) => Math.abs(sp.pct - pct) < 0.025);
      const isMajor = matchedScale !== undefined || i % 3 === 0;

      const rOuter = RADIUS + 6;
      const rInner = isMajor ? RADIUS - 8 : RADIUS - 3;

      const x1 = CENTER_X + rInner * Math.cos(rad);
      const y1 = CENTER_Y + rInner * Math.sin(rad);
      const x2 = CENTER_X + rOuter * Math.cos(rad);
      const y2 = CENTER_Y + rOuter * Math.sin(rad);

      let tx, ty, val;
      if (matchedScale) {
        val = matchedScale.val;
        const rText = RADIUS - 20;
        tx = CENTER_X + rText * Math.cos(rad);
        ty = CENTER_Y + rText * Math.sin(rad) + 3;
      }

      list.push({ x1, y1, x2, y2, tx, ty, val, isMajor, isRedline });
    }
    return list;
  }, [START_ANGLE, TOTAL_SWEEP, RADIUS, CENTER_X, CENTER_Y]);

  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center select-none w-full max-w-2xl mx-auto">
      {/* 30% Shorter Compact Speed Meter Card */}
      <div
        className={`relative w-full rounded-2xl p-4 sm:p-5 border shadow-xl backdrop-blur-xl transition-all duration-300 flex flex-col items-center ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-cyan-950/20'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/60'
        }`}
      >
        {/* Top Controls Bar: Compact Duration & Unit Toggle */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2 relative z-10">
          {/* Test Duration Selector */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              Duration:
            </span>
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.val}
                disabled={isTesting}
                onClick={() => onChangeDuration(opt.val)}
                className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
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
            <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-purple-400" />
              Unit:
            </span>
            <button
              onClick={onToggleUnit}
              className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:brightness-110 active:scale-95 transition-all"
              title={getUnitDescription(unit)}
            >
              <span>{getUnitLabel(unit)}</span>
              <span className="text-[9px] text-purple-200 font-medium">
                (Click for {unit === 'mbps' ? 'MB/s' : 'Mbps'})
              </span>
            </button>
          </div>
        </div>

        {/* Clean, Shorter Speedometer Dial (ViewBox optimized, ~30% shorter) */}
        <div className="relative w-[280px] sm:w-[330px] h-[180px] sm:h-[210px] flex items-center justify-center overflow-hidden">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="10 10 340 240"
          >
            <defs>
              <filter id="gauge-glow-short" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="clean-arc-gradient-short" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="80%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              <radialGradient id="clean-center-cap-short" cx="35%" cy="35%" r="65%">
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

            {/* Redline Bandwidth Marker */}
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
              stroke="url(#clean-arc-gradient-short)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              filter="url(#gauge-glow-short)"
              transform={`rotate(${START_ANGLE} ${CENTER_X} ${CENTER_Y})`}
              className="transition-all duration-150 ease-out"
            />

            {/* Tick Marks & Scale Numerals */}
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
                {t.val !== undefined && t.tx !== undefined && t.ty !== undefined && (
                  <text
                    x={t.tx}
                    y={t.ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[9px] font-bold font-mono select-none ${
                      t.isRedline
                        ? 'fill-rose-500 font-extrabold'
                        : isDark
                        ? 'fill-slate-300'
                        : 'fill-slate-600'
                    }`}
                  >
                    {t.val}
                  </text>
                )}
              </g>
            ))}

            {/* Needle with Counterweight */}
            <g className="transition-transform duration-150 ease-out">
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={tailX}
                y2={tailY}
                stroke={isDark ? '#334155' : '#94a3b8'}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={needleTipX}
                y2={needleTipY}
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#gauge-glow-short)"
              />
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={needleTipX}
                y2={needleTipY}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle
                cx={needleTipX}
                cy={needleTipY}
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
              fill="url(#clean-center-cap-short)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <circle cx={CENTER_X} cy={CENTER_Y} r="5.5" fill="#ef4444" />
          </svg>

          {/* Compact Subtle Status Badge inside dial */}
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
                ? 'Testing Download'
                : stage === 'testing_upload'
                ? 'Testing Upload'
                : stage === 'testing_ping'
                ? 'Testing Ping'
                : stage === 'testing_jitter'
                ? 'Testing Jitter'
                : stage === 'calculating_results'
                ? 'Analyzing'
                : isCompleted
                ? 'Test Finished'
                : 'Ready'}
            </span>
          </div>
        </div>

        {/* Big Speed Readout at the BOTTOM of the Meter */}
        <div className="w-full flex flex-col items-center justify-center my-1 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {stage === 'testing_download'
              ? 'Download Bandwidth'
              : stage === 'testing_upload'
              ? 'Upload Bandwidth'
              : isCompleted
              ? 'Final Download Result'
              : 'Speed Rate'}
          </div>

          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_16px_rgba(6,182,212,0.35)]">
              {displaySpeedNumber}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-cyan-400 uppercase tracking-wide">
              {getUnitLabel(unit)}
            </span>
          </div>
        </div>

        {/* 4 Compact Metric Cards (Ping, Jitter, Download, Upload) */}
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

        {/* Clean Primary Action Button (Compact & Sleek) */}
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
