import React, { useState } from 'react';
import { ClientNetworkDetails } from '../types/speedtest';
import {
  Globe,
  Wifi,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Server,
  Layers,
} from 'lucide-react';

interface ClientNetworkCardProps {
  networkInfo: ClientNetworkDetails;
  onRefresh: () => void;
  theme: 'dark' | 'light';
}

export const ClientNetworkCard: React.FC<ClientNetworkCardProps> = ({
  networkInfo,
  onRefresh,
  theme,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyIp = () => {
    if (!networkInfo.ip) return;
    navigator.clipboard.writeText(networkInfo.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-cyan-950/20'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-300">
                Your Network Identity
              </h3>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                  networkInfo.ipVersion === 'IPv6'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                }`}
              >
                {networkInfo.ipVersion}
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time public IP & ISP routing probe</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={networkInfo.isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
          title="Refresh IP and ISP information"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${networkInfo.isLoading ? 'animate-spin text-cyan-400' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Public IP Box */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Public IP Address
            </span>
            <span className="text-[11px] font-bold text-cyan-400 font-mono">
              {networkInfo.ipVersion}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-cyan-300 truncate select-all">
              {networkInfo.isLoading ? 'Probing gateway...' : networkInfo.ip}
            </span>
            <button
              onClick={handleCopyIp}
              className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-cyan-300'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
              }`}
              title="Copy IP Address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-medium hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ISP Name & ASN */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Internet Service Provider
            </span>
            {networkInfo.asn && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {networkInfo.asn}
              </span>
            )}
          </div>

          <div className="mt-1">
            <p className="text-base font-bold text-slate-100 truncate" title={networkInfo.isp}>
              {networkInfo.isLoading ? 'Detecting ISP...' : networkInfo.isp}
            </p>
            {networkInfo.org && networkInfo.org !== networkInfo.isp && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{networkInfo.org}</p>
            )}
          </div>
        </div>

        {/* Geo Location & Transit */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Detected Location
            </span>
            <span className="text-base">{networkInfo.flag || '🌐'}</span>
          </div>

          <div className="mt-1">
            <p className="text-base font-bold text-slate-100 truncate">
              {networkInfo.isLoading
                ? 'Locating...'
                : `${networkInfo.city}${networkInfo.region ? `, ${networkInfo.region}` : ''}`}
            </p>
            <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <span>{networkInfo.country}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[11px]">{networkInfo.countryCode}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
