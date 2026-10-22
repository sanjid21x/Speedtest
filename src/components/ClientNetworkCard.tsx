import React, { useState } from 'react';
import { ClientNetworkDetails, SpeedTestServer } from '../types/speedtest';
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
  GitFork,
  Radio,
  Zap,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';

interface ClientNetworkCardProps {
  networkInfo: ClientNetworkDetails;
  activeServer?: SpeedTestServer;
  onRefresh: () => void;
  theme: 'dark' | 'light';
}

export const ClientNetworkCard: React.FC<ClientNetworkCardProps> = ({
  networkInfo,
  activeServer,
  onRefresh,
  theme,
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const handleCopyIp = () => {
    if (!networkInfo.ip) return;
    navigator.clipboard.writeText(networkInfo.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = theme === 'dark';
  const upstream = networkInfo.upstreamInfo;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-cyan-950/20'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-700/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-300">
                Network Identity & ISP Routing
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
            <p className="text-xs text-slate-400">Real-time public IP, Upstream Transit & BDIX route channels</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={networkInfo.isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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

      {/* Main Grid: IP Address, Internet Service Provider Box, Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Box 1: Public IP Box */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Public IP Address
              </span>
              <span className="text-[11px] font-bold text-cyan-400 font-mono">
                {networkInfo.ipVersion}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-base font-bold tracking-tight text-cyan-300 truncate select-all">
                {networkInfo.isLoading ? 'Probing gateway...' : networkInfo.ip}
              </span>
              <button
                onClick={handleCopyIp}
                className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 cursor-pointer shrink-0 ${
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

          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>NAT Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Direct Route
            </span>
          </div>
        </div>

        {/* Box 2: Internet Service Provider Box (Main ISP Name first line, Upstreams, Route Channels & Bandwidth) */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between md:col-span-1 transition-all ${
            isDark ? 'bg-slate-950/70 border-indigo-900/40' : 'bg-slate-50 border-indigo-200'
          }`}
        >
          <div>
            {/* First Line: Main ISP Name prominently displayed */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
                  Main ISP Provider
                </span>
                <p
                  className={`text-base sm:text-lg font-extrabold truncate leading-tight ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                  title={networkInfo.isp}
                >
                  {networkInfo.isLoading ? 'Detecting ISP...' : networkInfo.isp}
                </p>
              </div>
              {networkInfo.asn && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-bold shrink-0 self-start mt-1">
                  {networkInfo.asn}
                </span>
              )}
            </div>

            {/* SANJID Special Multi-Gigabit Engine Badge */}
            <div className="mt-2 px-2 py-1 rounded bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center justify-between text-[10.5px]">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                SANJID Special Engine
              </span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">Zero Proxy • Direct Wire</span>
            </div>

            {/* Active Direct Test Endpoint Target */}
            {activeServer && (
              <div className="mt-1.5 px-2 py-1.5 rounded bg-slate-900/90 border border-slate-800 flex flex-col gap-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                    <Radio className="w-3 h-3 text-indigo-400" />
                    Target Socket:
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono font-bold uppercase text-[9px] border ${
                      (activeServer.siteType || '').includes('BDIX') || activeServer.category === 'bdix'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : (activeServer.siteType || '').includes('IIG') || activeServer.category === 'iig'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {activeServer.siteType || (activeServer.category === 'bdix' ? 'Domestic BDIX Site' : 'IIG Gateway')}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-slate-200">
                  <span className="truncate max-w-[150px]" title={activeServer.name}>{activeServer.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 text-[9.5px]">
                    IPv4: {activeServer.ipAddress || (activeServer.category === 'iig' ? '165.21.70.30' : '103.77.188.20')}
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-400 font-mono truncate">
                  {activeServer.location} • <span className="text-emerald-400 font-bold">IPv4 Direct</span>
                </div>
              </div>
            )}

            {/* Subtitle: ISP Category & Org */}
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 mb-1.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-400">
                <Server className="w-3 h-3 text-indigo-400" />
                Autonomous System
              </span>
              {networkInfo.org && networkInfo.org !== networkInfo.isp && (
                <span className="text-[10.5px] text-slate-400 truncate max-w-[170px]" title={networkInfo.org}>
                  {networkInfo.org}
                </span>
              )}
            </div>

            {/* Total ISP Bandwidth Highlight */}
            {upstream?.totalBandwidth && (
              <div
                className={`mt-2 px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/25'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                    Total ISP Bandwidth
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate">
                    {upstream.totalBandwidth}
                  </span>
                </div>
              </div>
            )}

            {/* Upstream Carriers Summary (Count and Names) */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <GitFork className="w-3 h-3 text-cyan-400" />
                  Upstream Providers:
                </span>
                <span className="text-cyan-400 font-bold font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
                  {upstream?.count || 3} Active
                </span>
              </div>

              {/* Upstream names chips */}
              <div className="flex flex-wrap gap-1 mt-1">
                {upstream?.upstreams.map((up, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 rounded border truncate max-w-full font-medium ${
                      isDark
                        ? 'bg-slate-800 text-slate-200 border-slate-700/60'
                        : 'bg-slate-200/80 text-slate-800 border-slate-300'
                    }`}
                    title={up}
                  >
                    {up}
                  </span>
                ))}
              </div>
            </div>

            {/* ISP Route Channels Summary */}
            <div className="mt-2.5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                ISP Route Channels:
              </span>
              <div className="space-y-1 mt-0.5">
                {upstream?.routeChannels.slice(0, 3).map((ch, idx) => (
                  <div
                    key={idx}
                    className={`text-[10.5px] flex items-center gap-1.5 truncate ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                    title={ch}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                    <span className="truncate">{ch}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle button for full routing details */}
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            type="button"
            className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between w-full text-[11px] text-indigo-300 hover:text-indigo-200 font-semibold cursor-pointer transition-colors"
          >
            <span>{showFullDetails ? 'Hide Detailed Topology' : 'View Full Topology & Channels'}</span>
            {showFullDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Box 3: Detected Location */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Detected Location
              </span>
              <span className="text-base">{networkInfo.flag || '🇧🇩'}</span>
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

          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Peering Region:</span>
            <span className="text-cyan-400 font-mono font-medium">BDIX Dhaka Core</span>
          </div>
        </div>
      </div>

      {/* Expanded Full Topology Panel when user clicks "View Full Topology & Channels" */}
      {showFullDetails && upstream && (
        <div className="mt-3.5 p-3.5 rounded-xl border border-indigo-500/30 bg-slate-950/90 animate-fade-in text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Complete ISP Network & Upstream Specification
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">
              {upstream.totalBandwidth}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* All Upstream Providers */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-400 mb-1.5">
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  Upstream Transit Providers ({upstream.count})
                </span>
              </div>
              <ul className="space-y-1">
                {upstream.upstreams.map((up, idx) => (
                  <li
                    key={idx}
                    className="text-[11px] text-slate-300 flex items-center gap-2 px-2 py-1 rounded bg-slate-950/60 border border-slate-800/60 font-mono"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{up}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* All Route Channels */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 mb-1.5">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  ISP Route Channels ({upstream.routeChannels.length})
                </span>
              </div>
              <ul className="space-y-1">
                {upstream.routeChannels.map((ch, idx) => (
                  <li
                    key={idx}
                    className="text-[11px] text-slate-300 flex items-center gap-2 px-2 py-1 rounded bg-slate-950/60 border border-slate-800/60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{ch}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
