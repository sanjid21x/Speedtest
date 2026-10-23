import React, { useMemo, useState } from 'react';
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
  connectionMode?: ConnectionMode;
  onChangeConnectionMode?: (mode: ConnectionMode) => void;
  channelsCount: number; // Represents threads count
  onChangeChannelsCount: (count: number) => void;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  theme: 'dark' | 'light';
  payloadMb?: number;
  onChangePayloadMb?: (mb: number) => void;
}

const DURATION_OPTIONS: { val: TestDurationOption; label: string; tooltip: string }[] = [
  { val: 5, label: '5s', tooltip: '5 seconds quick test' },
  { val: 10, label: '10s', tooltip: '10 seconds standard test' },
  { val: 15, label: '15s', tooltip: '15 seconds thorough test' },
  { val: 20, label: '20s', tooltip: '20 seconds precision test' },
  { val: 30, label: '30s', tooltip: '30 seconds endurance test' },
];

// Fixed Click Options for Threads: 1x, 2x, 4x, 8x, 16x, 32x (No customizable options)
const THREAD_OPTIONS = [1, 2, 4, 8, 16, 32] as const;

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
  onChangeConnectionMode,
  channelsCount,
  onChangeChannelsCount,
  onStart,
  onStop,
  onRestart,
  theme,
  payloadMb = 500,
  onChangePayloadMb,
}) => {
  const [showPayloadCustomizer, setShowPayloadCustomizer] = useState(false);

  const isTesting =
    stage === 'initializing' ||
    stage === 'choosing_endpoint' ||
    stage === 'testing_ping' ||
    stage === 'testing_jitter' ||
    stage === 'testing_download' ||
    stage === 'testing_upload' ||
    stage === 'calculating_results';

  const isCompleted = stage === 'completed';

  // Primary live speed calculation for display
  const displayRawValue = useMemo(() => {
    if (stage === 'testing_download') return currentValue;
    if (stage === 'testing_upload') return currentValue;
    if (isCompleted) return downloadValue;
    return currentValue;
  }, [stage, currentValue, downloadValue, isCompleted]);

  // Formatted speed number & unit
  const speedDisplay = useMemo(() => {
    const formatted = formatSpeedValue(displayRawValue, unit, 2);
    const unitLabel = getUnitLabel(unit);

    let subText = '';
    if (unit === 'mbps') {
      const mbpsToMBps = (displayRawValue / 8).toFixed(2);
      subText = `(${mbpsToMBps} MB/s download rate)`;
    } else {
      const mbpsEquiv = displayRawValue.toFixed(2);
      subText = `(${mbpsEquiv} Mbps bandwidth)`;
    }

    return {
      main: formatted,
      unitLabel,
      sub: subText,
    };
  }, [displayRawValue, unit]);

  const isDark = theme === 'dark';

  const handleThreadSelect = (threads: number) => {
    if (isTesting) return;
    onChangeChannelsCount(threads);
    if (onChangeConnectionMode) {
      onChangeConnectionMode(threads === 1 ? 'single' : 'multi');
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-2xl mx-auto">
      {/* SANJID Special Digital Speed Terminal Card */}
      <div
        className={`relative w-full rounded-2xl p-4 sm:p-6 border shadow-2xl backdrop-blur-xl transition-all duration-300 flex flex-col items-center ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-cyan-950/20'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/60'
        }`}
      >
        {/* Top Controls Bar: Threads (1x to 32x), Payload, Duration, Unit Toggle */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mb-3 relative z-10">
          {/* Threads: 1x, 2x, 4x, 8x, 16x, 32x (No custom options) */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              Threads:
            </span>
            {THREAD_OPTIONS.map((threads) => (
              <button
                key={threads}
                disabled={isTesting}
                onClick={() => handleThreadSelect(threads)}
                className={`px-2 sm:px-2.5 py-0.5 text-xs font-bold font-mono rounded-md transition-all cursor-pointer ${
                  channelsCount === threads
                    ? 'bg-cyan-500 text-slate-950 shadow-xs ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={`${threads} Thread${threads === 1 ? '' : 's'} (${threads} concurrent socket stream${threads === 1 ? '' : 's'})`}
              >
                {threads}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Custom Payload Megabyte Toggle Pill */}
            <button
              disabled={isTesting}
              onClick={() => setShowPayloadCustomizer(!showPayloadCustomizer)}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 border ${
                showPayloadCustomizer
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-950/60 text-amber-300 border-amber-500/30 hover:border-amber-400'
              } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Custom Payload (100 to 5000 MB): large payload prevents needle fluctuation and TCP dips"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Payload: {payloadMb >= 1000 ? `${(payloadMb / 1000).toFixed(payloadMb % 1000 === 0 ? 0 : 1)} GB` : `${payloadMb} MB`}</span>
            </button>

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

        {/* Custom 100 to 5000 MB Payload Slider Drawer */}
        {showPayloadCustomizer && (
          <div className="w-full mb-3 p-3 rounded-xl bg-slate-950/85 border border-cyan-500/35 text-slate-200 animate-fade-in flex flex-col gap-2.5 shadow-lg shadow-cyan-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Custom Payload Size (SANJID Special):
                </span>
                <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {payloadMb >= 1000 ? `${(payloadMb / 1000).toFixed(payloadMb % 1000 === 0 ? 0 : 1)} GB` : `${payloadMb} MB`}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  ({payloadMb} MB per stream • High buffer prevents fluctuation)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPayloadCustomizer(false)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Hide
              </button>
            </div>

            {/* Continuous range slider: 100 to 5000 MB */}
            <div className="flex items-center gap-3">
              <span className="text-[10.5px] font-mono font-bold text-slate-400 shrink-0">100 MB</span>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                disabled={isTesting}
                value={payloadMb}
                onChange={(e) => onChangePayloadMb && onChangePayloadMb(Number(e.target.value))}
                className={`w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg ${
                  isTesting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Drag slider to set custom test payload from 100 MB to 5000 MB"
              />
              <span className="text-[10.5px] font-mono font-bold text-cyan-400 shrink-0">5000 MB (5 GB)</span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
              {[100, 250, 500, 1000, 2500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isTesting}
                  onClick={() => onChangePayloadMb && onChangePayloadMb(preset)}
                  className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded border transition-all cursor-pointer ${
                    payloadMb === preset
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {preset >= 1000 ? `${preset / 1000} GB` : `${preset} MB`}
                  {preset === 500 ? ' (Standard)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BIG DIGITAL TEXT METER (Replaces SVG speed gauge circular arc) */}
        {/* ============================================================== */}
        <div className="w-full flex flex-col items-center justify-center py-8 sm:py-10 my-1 rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950/95 border border-slate-800/90 relative overflow-hidden shadow-2xl">
          {/* Ambient dynamic stage glow */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 blur-3xl opacity-25 ${
              stage === 'testing_download'
                ? 'bg-cyan-500'
                : stage === 'testing_upload'
                ? 'bg-purple-600'
                : stage === 'testing_ping' || stage === 'testing_jitter'
                ? 'bg-amber-500'
                : isCompleted
                ? 'bg-emerald-500'
                : 'bg-cyan-900/20'
            }`}
          />

          {/* Active Stage Banner Pill */}
          <div className="mb-4 relative z-10">
            <span
              className={`text-xs sm:text-sm font-black uppercase tracking-wider px-4 py-1.5 rounded-full border shadow-md flex items-center gap-2 ${
                stage === 'testing_download'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/20 animate-pulse'
                  : stage === 'testing_upload'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20 animate-pulse'
                  : stage === 'testing_ping' || stage === 'testing_jitter'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20 animate-pulse'
                  : stage === 'calculating_results'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-indigo-500/20 animate-pulse'
                  : isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  stage === 'testing_download'
                    ? 'bg-cyan-400 animate-ping'
                    : stage === 'testing_upload'
                    ? 'bg-purple-400 animate-ping'
                    : stage === 'testing_ping' || stage === 'testing_jitter'
                    ? 'bg-amber-400 animate-ping'
                    : isCompleted
                    ? 'bg-emerald-400'
                    : 'bg-slate-500'
                }`}
              />
              {stage === 'testing_download'
                ? `Testing Download Speed • ${channelsCount} Threads Active`
                : stage === 'testing_upload'
                ? `Testing Upload Speed • ${channelsCount} Threads Active`
                : stage === 'testing_ping'
                ? 'Measuring Latency (Ping) Real Socket'
                : stage === 'testing_jitter'
                ? 'Measuring Latency Stability (Jitter)'
                : stage === 'calculating_results'
                ? 'Analyzing Wire Metrics'
                : isCompleted
                ? 'Benchmark Test Complete'
                : 'Direct Wire Socket Terminal Ready'}
            </span>
          </div>

          {/* BIG MAIN NUMERICAL SPEED DISPLAY */}
          <div className="flex items-baseline justify-center gap-2 sm:gap-4 relative z-10 px-4">
            <span
              className={`text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter tabular-nums leading-none select-none transition-all duration-150 ${
                stage === 'testing_download'
                  ? 'text-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.65)]'
                  : stage === 'testing_upload'
                  ? 'text-purple-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.65)]'
                  : stage === 'testing_ping' || stage === 'testing_jitter'
                  ? 'text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.55)]'
                  : isCompleted
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-300 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                  : 'text-slate-300'
              }`}
            >
              {speedDisplay.main}
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black uppercase font-mono tracking-wide text-cyan-400/90 self-end pb-2 sm:pb-3 drop-shadow-sm">
              {speedDisplay.unitLabel}
            </span>
          </div>

          {/* Secondary Subtitle / Conversion / Threads / Payload info */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3 relative z-10 text-xs sm:text-sm text-slate-400 font-mono">
            <span className="font-bold text-slate-200">{speedDisplay.sub}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {channelsCount} {channelsCount === 1 ? 'Thread' : 'Threads'}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-cyan-300 font-bold">
              {payloadMb >= 1000 ? `${(payloadMb / 1000).toFixed(1)} GB` : `${payloadMb} MB`} Payload / Thread
            </span>
          </div>
        </div>

        {/* 4 Primary Metrics Summary Bar (Ping, Jitter, Download, Upload) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80">
          {/* Latency (Ping) */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center ${
              stage === 'testing_ping'
                ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                : isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Ping
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-slate-100 mt-0.5">
              {pingValue > 0 ? (
                <>
                  {pingValue}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">ms</span>
                </>
              ) : (
                '--'
              )}
            </div>
          </div>

          {/* Jitter */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center ${
              stage === 'testing_jitter'
                ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30'
                : isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Jitter
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-slate-100 mt-0.5">
              {jitterValue > 0 ? (
                <>
                  ±{jitterValue}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">ms</span>
                </>
              ) : (
                '--'
              )}
            </div>
          </div>

          {/* Download */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center ${
              stage === 'testing_download'
                ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                : isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10.5px] font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
              <ArrowDown className="w-3.5 h-3.5" />
              Download
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-cyan-300 mt-0.5">
              {downloadValue > 0 ? (
                <>
                  {formatSpeedValue(downloadValue, unit, 1)}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">
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
            className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center ${
              stage === 'testing_upload'
                ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30'
                : isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10.5px] font-bold text-purple-400 flex items-center gap-1 uppercase tracking-wider">
              <ArrowUp className="w-3.5 h-3.5" />
              Upload
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-purple-300 mt-0.5">
              {uploadValue > 0 ? (
                <>
                  {formatSpeedValue(uploadValue, unit, 1)}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">
                    {getUnitLabel(unit)}
                  </span>
                </>
              ) : (
                '--'
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Button (Start / Stop / Restart) */}
        <div className="mt-4 flex items-center justify-center">
          {!isTesting ? (
            <button
              onClick={isCompleted ? onRestart : onStart}
              className="group relative flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer gap-2.5"
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
              className="flex items-center justify-center px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer gap-2.5"
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
