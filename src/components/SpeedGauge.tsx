import React, { useMemo } from 'react';
import { TestStage } from '../types/speedtest';
import { Play, Square, RotateCcw } from 'lucide-react';

interface SpeedGaugeProps {
  stage: TestStage;
  currentValue: number;
  downloadValue: number;
  uploadValue: number;
  pingValue: number;
  jitterValue: number;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  theme: 'dark' | 'light';
}

const SCALE_POINTS = [
  { val: 0, pct: 0 },
  { val: 1, pct: 0.10 },
  { val: 5, pct: 0.22 },
  { val: 10, pct: 0.33 },
  { val: 25, pct: 0.46 },
  { val: 50, pct: 0.58 },
  { val: 100, pct: 0.70 },
  { val: 250, pct: 0.82 },
  { val: 500, pct: 0.91 },
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

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  stage,
  currentValue,
  downloadValue,
  uploadValue,
  pingValue,
  jitterValue,
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

  // Arc angles: 240-degree sweep from -210 deg to 30 deg (or 150 deg to 390 deg)
  const START_ANGLE = 150;
  const END_ANGLE = 390;
  const TOTAL_SWEEP = END_ANGLE - START_ANGLE; // 240 deg

  const RADIUS = 140;
  const CENTER_X = 180;
  const CENTER_Y = 180;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const ARC_LENGTH = (TOTAL_SWEEP / 360) * CIRCUMFERENCE;

  // Active value driven strictly by real measured value
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

  // Stroke Dashoffset
  const strokeDashoffset = ARC_LENGTH - ARC_LENGTH * Math.min(1, Math.max(0, progressRatio));

  // Needle angle in degrees
  const needleAngle = START_ANGLE + progressRatio * TOTAL_SWEEP;

  // Color scheme based on stage
  const arcGradientId = stage === 'testing_upload' ? 'uploadGrad' : 'downloadGrad';

  // Render ticks
  const ticks = useMemo(() => {
    return SCALE_POINTS.map((pt) => {
      const angle = START_ANGLE + pt.pct * TOTAL_SWEEP;
      const rad = (angle * Math.PI) / 180;
      const innerR = RADIUS - 18;
      const outerR = RADIUS - 6;
      const labelR = RADIUS - 30;

      const x1 = CENTER_X + innerR * Math.cos(rad);
      const y1 = CENTER_Y + innerR * Math.sin(rad);
      const x2 = CENTER_X + outerR * Math.cos(rad);
      const y2 = CENTER_Y + outerR * Math.sin(rad);
      const lx = CENTER_X + labelR * Math.cos(rad);
      const ly = CENTER_Y + labelR * Math.sin(rad);

      return {
        ...pt,
        x1,
        y1,
        x2,
        y2,
        lx,
        ly,
        active: progressRatio >= pt.pct,
      };
    });
  }, [progressRatio]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[420px] mx-auto select-none">
      {/* Outer Glow in Dark Mode */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-500/5'
        } ${isTesting ? 'opacity-100 scale-105' : 'opacity-40'}`}
      />

      {/* SVG Speedometer */}
      <div className="relative w-full aspect-square max-w-[360px] sm:max-w-[400px]">
        <svg
          viewBox="0 0 360 360"
          className="w-full h-full overflow-visible drop-shadow-md"
        >
          <defs>
            {/* Download Gradient */}
            <linearGradient id="downloadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Upload Gradient */}
            <linearGradient id="uploadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            {/* Pointer / Needle Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${CENTER_X + RADIUS * Math.cos((START_ANGLE * Math.PI) / 180)} ${
              CENTER_Y + RADIUS * Math.sin((START_ANGLE * Math.PI) / 180)
            } A ${RADIUS} ${RADIUS} 0 1 1 ${
              CENTER_X + RADIUS * Math.cos((END_ANGLE * Math.PI) / 180)
            } ${CENTER_Y + RADIUS * Math.sin((END_ANGLE * Math.PI) / 180)}`}
            fill="none"
            stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'}
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <path
            d={`M ${CENTER_X + RADIUS * Math.cos((START_ANGLE * Math.PI) / 180)} ${
              CENTER_Y + RADIUS * Math.sin((START_ANGLE * Math.PI) / 180)
            } A ${RADIUS} ${RADIUS} 0 1 1 ${
              CENTER_X + RADIUS * Math.cos((END_ANGLE * Math.PI) / 180)
            } ${CENTER_Y + RADIUS * Math.sin((END_ANGLE * Math.PI) / 180)}`}
            fill="none"
            stroke={`url(#${arcGradientId})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-150 ease-out"
          />

          {/* Scale Ticks and Labels */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={
                  t.active
                    ? stage === 'testing_upload'
                      ? '#34d399'
                      : '#38bdf8'
                    : theme === 'dark'
                    ? '#334155'
                    : '#cbd5e1'
                }
                strokeWidth={t.val % 10 === 0 ? '2.5' : '1.5'}
                strokeLinecap="round"
              />
              {/* Tick numeric labels */}
              {[0, 5, 25, 100, 500, 1000].includes(t.val) && (
                <text
                  x={t.lx}
                  y={t.ly + 4}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-medium transition-colors ${
                    t.active
                      ? theme === 'dark'
                        ? 'fill-cyan-400 font-bold'
                        : 'fill-cyan-600 font-bold'
                      : theme === 'dark'
                      ? 'fill-slate-500'
                      : 'fill-slate-400'
                  }`}
                >
                  {t.val}
                </text>
              )}
            </g>
          ))}

          {/* Needle / Dial Indicator */}
          {isTesting && (
            <g
              transform={`rotate(${needleAngle}, ${CENTER_X}, ${CENTER_Y})`}
              className="transition-transform duration-100 ease-out"
            >
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={CENTER_X + RADIUS - 14}
                y2={CENTER_Y}
                stroke={stage === 'testing_upload' ? '#10b981' : '#06b6d4'}
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
              />
              <circle
                cx={CENTER_X + RADIUS - 14}
                cy={CENTER_Y}
                r="4.5"
                fill="#ffffff"
                stroke={stage === 'testing_upload' ? '#059669' : '#0284c7'}
                strokeWidth="2"
              />
            </g>
          )}

          {/* Center Hub */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="16"
            fill={theme === 'dark' ? '#0f172a' : '#f8fafc'}
            stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
            strokeWidth="3"
          />
        </svg>

        {/* Center Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          {/* State 1: Idle / Ready */}
          {stage === 'idle' && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">
                SpeedTest
              </span>
              <span className="text-2xl font-bold tracking-tight text-cyan-400 mb-4">
                READY
              </span>
              <button
                onClick={onStart}
                type="button"
                className="group relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-base text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START</span>
              </button>
            </div>
          )}

          {/* State 2: Initializing / Choosing Endpoint / Ping */}
          {(stage === 'initializing' ||
            stage === 'choosing_endpoint' ||
            stage === 'testing_ping' ||
            stage === 'testing_jitter') && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 mb-1 animate-pulse">
                {stage === 'testing_jitter' ? 'JITTER TEST' : stage === 'testing_ping' ? 'PING TEST' : 'CONNECTING'}
              </span>
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
                {pingValue > 0 ? pingValue : '--'}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-4">
                ms latency
              </span>
              <button
                onClick={onStop}
                type="button"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </button>
            </div>
          )}

          {/* State 3: Download Testing */}
          {stage === 'testing_download' && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 mb-1">
                DOWNLOAD
              </span>
              <span className="text-5xl font-extrabold font-mono tracking-tight text-white mb-1">
                {currentValue > 0 ? currentValue.toFixed(1) : '0.0'}
              </span>
              <span className="text-sm font-bold tracking-wider text-slate-400 mb-4">
                Mbps
              </span>
              <button
                onClick={onStop}
                type="button"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </button>
            </div>
          )}

          {/* State 4: Upload Testing */}
          {stage === 'testing_upload' && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400 mb-1">
                UPLOAD
              </span>
              <span className="text-5xl font-extrabold font-mono tracking-tight text-white mb-1">
                {currentValue > 0 ? currentValue.toFixed(1) : '0.0'}
              </span>
              <span className="text-sm font-bold tracking-wider text-slate-400 mb-4">
                Mbps
              </span>
              <button
                onClick={onStop}
                type="button"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </button>
            </div>
          )}

          {/* State 5: Calculating Results */}
          {stage === 'calculating_results' && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xs uppercase tracking-widest font-semibold text-purple-400 mb-2 animate-pulse">
                FINALIZING
              </span>
              <span className="text-2xl font-bold tracking-tight text-slate-200">
                Calculating...
              </span>
            </div>
          )}

          {/* State 6: Completed */}
          {isCompleted && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">
                YOUR RESULT
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-cyan-400">
                  {downloadValue.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-400">Mbps</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 mb-3">
                Upload: <span className="font-mono text-emerald-400 font-semibold">{uploadValue.toFixed(1)}</span> Mbps
              </span>
              <button
                onClick={onRestart}
                type="button"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-white bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 hover:border-cyan-500 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>TEST AGAIN</span>
              </button>
            </div>
          )}

          {/* State 7: Error */}
          {stage === 'error' && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xs uppercase tracking-widest font-semibold text-rose-400 mb-1">
                TEST STOPPED
              </span>
              <span className="text-sm font-semibold text-slate-300 mb-4 px-2 text-center line-clamp-2">
                Connection issue
              </span>
              <button
                onClick={onRestart}
                type="button"
                className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
