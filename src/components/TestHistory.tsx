import React, { useState } from 'react';
import { SpeedTestResult, SpeedUnit } from '../types/speedtest';
import { clearHistory, exportHistoryAsCSV } from '../services/history';
import { formatSpeedValue, getUnitLabel } from '../services/unitHelper';
import {
  History,
  Trash2,
  Download,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Radio,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TestHistoryProps {
  history: SpeedTestResult[];
  unit: SpeedUnit;
  onHistoryCleared: () => void;
  theme: 'dark' | 'light';
}

export const TestHistory: React.FC<TestHistoryProps> = ({
  history,
  unit,
  onHistoryCleared,
  theme,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleClear = () => {
    clearHistory();
    setIsConfirmingClear(false);
    onHistoryCleared();
  };

  if (history.length === 0) {
    return null;
  }

  const displayedHistory = expanded ? history : history.slice(0, 5);
  const unitLabel = getUnitLabel(unit);

  return (
    <div
      className={`w-full max-w-2xl rounded-2xl border p-5 sm:p-6 shadow-xl transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-800/40">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold">Local Test History</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportHistoryAsCSV(history)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="Download history as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {!isConfirmingClear ? (
            <button
              onClick={() => setIsConfirmingClear(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-95 transition-all cursor-pointer"
              title="Clear all saved test history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-rose-400 font-medium hidden sm:inline">
                Delete all?
              </span>
              <button
                onClick={handleClear}
                type="button"
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsConfirmingClear(false)}
                type="button"
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Items */}
      <div className="divide-y divide-slate-800/40 mt-3">
        {displayedHistory.map((item) => {
          const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });
          const timeStr = new Date(item.timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-200">
                    {dateStr} <span className="text-slate-500 font-normal">at {timeStr}</span>
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                      (item.server.siteType || '').includes('BDIX') || item.server.category === 'bdix'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : (item.server.siteType || '').includes('IIG') || item.server.category === 'iig'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : (item.server.siteType || '').includes('GGC') || item.server.category === 'ggc'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : (item.server.siteType || '').includes('FNA') || item.server.category === 'fna'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {item.server.siteType ||
                      (item.server.category === 'bdix'
                        ? 'Domestic BDIX Site'
                        : item.server.category === 'iig'
                        ? 'IIG Subsea Gateway'
                        : item.server.category === 'ggc'
                        ? 'GGC Cache'
                        : item.server.category === 'fna'
                        ? 'FNA Edge'
                        : 'Global CDN')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {item.server.name}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    IPv4: {item.server.ipAddress || '103.77.188.20'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {item.server.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 font-mono">
                {/* Download */}
                <div className="flex items-center gap-1">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400 font-bold text-sm">
                    {formatSpeedValue(item.downloadMbps, unit, 1)}
                  </span>
                  <span className="text-[10px] text-slate-500">{unitLabel}</span>
                </div>

                {/* Upload */}
                <div className="flex items-center gap-1">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm">
                    {formatSpeedValue(item.uploadMbps, unit, 1)}
                  </span>
                  <span className="text-[10px] text-slate-500">{unitLabel}</span>
                </div>

                {/* Ping */}
                <div className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-200 font-semibold">
                    {item.pingMs}
                  </span>
                  <span className="text-[10px] text-slate-500">ms</span>
                </div>

                {/* Jitter */}
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-200 font-semibold">
                    {item.jitterMs}
                  </span>
                  <span className="text-[10px] text-slate-500">ms</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more toggle */}
      {history.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          type="button"
          className="mt-3 w-full py-2 flex items-center justify-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <span>{expanded ? 'Show Less' : `Show All (${history.length})`}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
