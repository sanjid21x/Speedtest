import React, { useState } from 'react';
import { ClientNetworkDetails } from '../types/speedtest';
import {
  Globe,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Server,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  XCircle,
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
  const [copiedV4, setCopiedV4] = useState(false);
  const [copiedV6, setCopiedV6] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const handleCopy = (text: string, isV6: boolean) => {
    if (!text || text.includes('No IPv6')) return;
    navigator.clipboard.writeText(text);
    if (isV6) {
      setCopiedV6(true);
      setTimeout(() => setCopiedV6(false), 2000);
    } else {
      setCopiedV4(true);
      setTimeout(() => setCopiedV4(false), 2000);
    }
  };

  const isDark = theme === 'dark';
  const upstream = networkInfo.upstreamInfo;

  const ipv4Address = networkInfo.ipv4?.ip || (networkInfo.ipVersion === 'IPv4' ? networkInfo.ip : undefined);
  const ipv4Supported = networkInfo.ipv4?.supported ?? (Boolean(ipv4Address && !ipv4Address.includes(':')));

  const ipv6Address = networkInfo.ipv6?.ip || (networkInfo.ipVersion === 'IPv6' ? networkInfo.ip : undefined);
  const ipv6Supported = networkInfo.ipv6?.supported ?? (Boolean(ipv6Address && ipv6Address.includes(':')));

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-cyan-950/20'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-200">
                Network Identity & Dual-Stack Connectivity
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                {networkInfo.city}, {networkInfo.countryCode} {networkInfo.flag}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Authoritative real-time diagnostic of your ISP, IPv4, and IPv6 public addresses
            </p>
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
          title="Re-probe network and IP details"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${networkInfo.isLoading ? 'animate-spin text-cyan-400' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Deduplicated 3-Column Grid: IPv4 Details, IPv6 Details, and Main ISP Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Box 1: IPv4 Support & IP */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                IPv4 Connectivity
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  ipv4Supported
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {ipv4Supported ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Supported
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-400" />
                    Not Detected
                  </>
                )}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-mono text-sm sm:text-base font-bold tracking-tight text-cyan-300 truncate select-all">
                {networkInfo.isLoading ? 'Probing IPv4...' : ipv4Address || 'None detected'}
              </span>
              {ipv4Address && (
                <button
                  onClick={() => handleCopy(ipv4Address, false)}
                  className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 cursor-pointer shrink-0 ${
                    copiedV4
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-cyan-300'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                  title="Copy IPv4 Address"
                >
                  {copiedV4 ? (
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
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Route Type:</span>
            <span className="text-emerald-400 font-semibold font-mono">
              Public IPv4 • Direct Wire
            </span>
          </div>
        </div>

        {/* Box 2: IPv6 Support & IP */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                IPv6 Connectivity
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  ipv6Supported
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}
              >
                {ipv6Supported ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-purple-400" />
                    Supported • Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-slate-400" />
                    Not Detected
                  </>
                )}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className={`font-mono text-xs sm:text-sm font-bold tracking-tight truncate select-all ${
                ipv6Supported ? 'text-purple-300' : 'text-slate-500 italic'
              }`}>
                {networkInfo.isLoading
                  ? 'Probing IPv6 route...'
                  : ipv6Supported && ipv6Address
                  ? ipv6Address
                  : 'No IPv6 route from ISP'}
              </span>
              {ipv6Supported && ipv6Address && (
                <button
                  onClick={() => handleCopy(ipv6Address, true)}
                  className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 cursor-pointer shrink-0 ${
                    copiedV6
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-purple-300'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                  title="Copy IPv6 Address"
                >
                  {copiedV6 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-purple-300" />
                      <span className="text-[10px] font-medium hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Route Type:</span>
            <span className={`font-semibold font-mono ${ipv6Supported ? 'text-purple-300' : 'text-slate-500'}`}>
              {ipv6Supported ? 'Native Dual-Stack Unicast' : 'IPv4-Only Network Transition'}
            </span>
          </div>
        </div>

        {/* Box 3: Main ISP Provider, ASN & Upstream Transit */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/70 border-indigo-900/40' : 'bg-slate-50 border-indigo-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Server className="w-3.5 h-3.5" />
                Main ISP Provider
              </span>
              {networkInfo.asn && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-bold shrink-0">
                  {networkInfo.asn}
                </span>
              )}
            </div>

            <p
              className={`text-base sm:text-lg font-extrabold truncate leading-tight mt-1 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
              title={networkInfo.isp}
            >
              {networkInfo.isLoading ? 'Detecting ISP...' : networkInfo.isp}
            </p>

            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <span>{networkInfo.city}, {networkInfo.country}</span>
              <span>{networkInfo.flag}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Primary Upstream:</span>
            <span className="text-amber-400 font-semibold font-mono truncate max-w-[150px]">
              {upstream?.upstreams?.[0] || 'National BDIX Transit'}
            </span>
          </div>
        </div>
      </div>

      {/* Upstream Transit Channels Collapsible Drawer */}
      {upstream && (
        <div className="mt-3 pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upstream Transit Nodes ({upstream.count}) & Domestic Peering Channels</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-bold">
              {showFullDetails ? 'Collapse Details' : 'View Network Topology'}
              {showFullDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          {showFullDetails && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 animate-fade-in">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-slate-400 font-medium">Upstream Carriers:</span>
                {upstream.upstreams.map((carrier, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded font-mono text-[10.5px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {carrier}
                  </span>
                ))}
              </div>

              {upstream.routeChannels && upstream.routeChannels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 font-medium">Route Channels:</span>
                  {upstream.routeChannels.map((channel, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded font-mono text-[10.5px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
