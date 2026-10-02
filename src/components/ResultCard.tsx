import React, { useState } from 'react';
import { SpeedTestResult } from '../types/speedtest';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Radio,
  Server,
  Share2,
  Check,
  Copy,
  Info,
  Laptop,
  Wifi,
} from 'lucide-react';

interface ResultCardProps {
  result: SpeedTestResult;
  theme: 'dark' | 'light';
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, theme }) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const formattedDate = new Date(result.timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const getShareText = () => {
    const routeCategory = result.server.categoryLabel ? `Route: ${result.server.categoryLabel}\n` : '';
    return `Speed Test Result

Download: ${result.downloadMbps} Mbps
Upload: ${result.uploadMbps} Mbps
Ping: ${result.pingMs} ms
Jitter: ${result.jitterMs} ms
${routeCategory}Server: ${result.server.name} (${result.server.location})
Tested on: ${formattedDate}`;
  };

  const handleShare = async () => {
    const text = getShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Speed Test Result',
          text,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback manual prompt
      window.prompt('Copy your result:', text);
    }
  };

  return (
    <div
      className={`w-full max-w-2xl rounded-2xl border p-5 sm:p-6 shadow-xl transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-800/40">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Official Measurement
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Connection Summary
          </h2>
        </div>
        <button
          onClick={handleShare}
          type="button"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all cursor-pointer"
          title="Share or copy speed test result"
        >
          {copied || shareSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share Result</span>
            </>
          )}
        </button>
      </div>

      {/* Main 4 Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
        {/* Download */}
        <div
          className={`flex flex-col p-4 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-950/60 border-cyan-500/20' : 'bg-slate-50 border-cyan-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-1">
            <ArrowDownCircle className="w-4 h-4" />
            <span>DOWNLOAD</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
            {result.downloadMbps}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Mbps</span>
        </div>

        {/* Upload */}
        <div
          className={`flex flex-col p-4 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-950/60 border-emerald-500/20' : 'bg-slate-50 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
            <ArrowUpCircle className="w-4 h-4" />
            <span>UPLOAD</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {result.uploadMbps}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Mbps</span>
        </div>

        {/* Ping */}
        <div
          className={`flex flex-col p-4 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-1">
            <Radio className="w-4 h-4" />
            <span>PING</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
            {result.pingMs}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ms latency</span>
        </div>

        {/* Jitter */}
        <div
          className={`flex flex-col p-4 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>JITTER</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
            {result.jitterMs}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ms variation</span>
        </div>
      </div>

      {/* Metadata & Diagnostics Grid */}
      <div
        className={`rounded-xl p-4 text-xs space-y-2.5 ${
          theme === 'dark' ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-50 text-slate-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/40 pb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-400">Test Server:</span>
            <span className="font-medium text-slate-200">{result.server.name}</span>
            {result.server.categoryLabel && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                {result.server.categoryLabel}
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px]">{result.server.location}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/40 pb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-400">Timestamp:</span>
            <span>{formattedDate}</span>
          </div>
          <span className="text-slate-400 text-[11px]">Duration: {result.durationSeconds}s</span>
        </div>

        {result.deviceInfo && (
          <div className="flex items-center gap-1.5 border-b border-slate-800/40 pb-2">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-400">Client Environment:</span>
            <span>
              {result.deviceInfo.browser} on {result.deviceInfo.os}
            </span>
          </div>
        )}

        {/* Browser Network Information API (Strictly labeled as estimate) */}
        {result.networkInfo && (
          <div className="pt-1 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <Wifi className="w-3.5 h-3.5" />
              <span>Browser Network API (Theoretical Estimate):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-5 text-[11px] text-slate-400">
              {result.networkInfo.effectiveType && (
                <div>Type: <span className="text-slate-200 font-mono uppercase">{result.networkInfo.effectiveType}</span></div>
              )}
              {result.networkInfo.downlink !== undefined && (
                <div>Est. Downlink: <span className="text-slate-200 font-mono">{result.networkInfo.downlink} Mbps</span></div>
              )}
              {result.networkInfo.rtt !== undefined && (
                <div>Est. RTT: <span className="text-slate-200 font-mono">{result.networkInfo.rtt} ms</span></div>
              )}
            </div>
            <p className="pl-5 text-[10px] text-slate-500 italic">
              Note: Browser estimates above are provided by navigator.connection and are separate from our actual speed test measurement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
