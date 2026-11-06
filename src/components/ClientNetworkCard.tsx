import React, { useState, useMemo } from 'react';
import {
  ClientNetworkDetails,
  SpeedTestServer,
  IpTestProtocol,
  BackendRouteHop,
} from '../types/speedtest';
import { generateBackendRouteHops } from '../services/ispIntelligence';
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
  Network,
  Laptop,
  Wifi,
  Anchor,
  Zap,
  ArrowRight,
  Activity,
  CornerDownRight,
  Shield,
} from 'lucide-react';

interface ClientNetworkCardProps {
  networkInfo: ClientNetworkDetails;
  onRefresh: () => void;
  theme: 'dark' | 'light';
  activeServer?: SpeedTestServer;
  ipProtocol?: IpTestProtocol;
}

export const ClientNetworkCard: React.FC<ClientNetworkCardProps> = ({
  networkInfo,
  onRefresh,
  theme,
  activeServer,
  ipProtocol = 'ipv4',
}) => {
  const [copiedV4, setCopiedV4] = useState(false);
  const [copiedV6, setCopiedV6] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [copiedHopIp, setCopiedHopIp] = useState<string | null>(null);
  const [copiedAllRoute, setCopiedAllRoute] = useState(false);

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

  const handleCopyHopIp = (ip: string) => {
    const cleanIp = ip.split(' ')[0];
    navigator.clipboard.writeText(cleanIp);
    setCopiedHopIp(ip);
    setTimeout(() => setCopiedHopIp(null), 2000);
  };

  const isDark = theme === 'dark';
  const upstream = networkInfo.upstreamInfo;

  const ipv4Address = networkInfo.ipv4?.ip || (networkInfo.ipVersion === 'IPv4' ? networkInfo.ip : undefined);
  const ipv4Supported = networkInfo.ipv4?.supported ?? Boolean(ipv4Address && !ipv4Address.includes(':'));

  const ipv6Address = networkInfo.ipv6?.ip || (networkInfo.ipVersion === 'IPv6' ? networkInfo.ip : undefined);
  const ipv6Supported = networkInfo.ipv6?.supported ?? Boolean(ipv6Address && ipv6Address.includes(':'));

  // Dynamically compute the hop-by-hop route
  const routeHops = useMemo<BackendRouteHop[]>(() => {
    return generateBackendRouteHops(activeServer, networkInfo, ipProtocol);
  }, [activeServer, networkInfo, ipProtocol]);

  const handleCopyAllRoute = () => {
    const traceText = routeHops
      .map(
        (h) =>
          `Hop ${h.hop}: ${h.name} [${h.ip}] - ${h.roleLabel} (${h.location}) ~${h.latencyEstMs}ms`
      )
      .join('\n');
    navigator.clipboard.writeText(traceText);
    setCopiedAllRoute(true);
    setTimeout(() => setCopiedAllRoute(false), 2500);
  };

  const getHopIcon = (deviceType: BackendRouteHop['deviceType']) => {
    switch (deviceType) {
      case 'client':
        return <Laptop className="w-4 h-4 text-cyan-400" />;
      case 'lan_router':
        return <Wifi className="w-4 h-4 text-emerald-400" />;
      case 'cgnat_proxy':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'isp_core':
        return <Server className="w-4 h-4 text-indigo-400" />;
      case 'landing_station':
        return <Anchor className="w-4 h-4 text-rose-400" />;
      case 'ixp_switch':
        return <Network className="w-4 h-4 text-blue-400" />;
      case 'transit_carrier':
        return <Globe className="w-4 h-4 text-purple-400" />;
      case 'destination_server':
      default:
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-cyan-950/20'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      {/* Top Header: Cleanly Renamed to "ISP Info" */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-200">
                ISP Info
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
              <span
                className={`font-mono text-xs sm:text-sm font-bold tracking-tight truncate select-all ${
                  ipv6Supported ? 'text-purple-300' : 'text-slate-500 italic'
                }`}
              >
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

      {/* ============================================================== */}
      {/* EXPANDABLE ARROW: BACKEND CONNECTION ROUTE DETAIL (Hop-by-Hop) */}
      {/* ============================================================== */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/60">
        <button
          onClick={() => setShowRouteDetails(!showRouteDetails)}
          type="button"
          className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
            showRouteDetails
              ? 'bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/30'
              : isDark
              ? 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title="Toggle backend packet routing detail with IP addresses, proxies, routers, and target server"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg ${
                showRouteDetails ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-cyan-400'
              }`}
            >
              <Network className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold tracking-wide">
                  Backend Connection Route Details
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  {routeHops.length} Hops to {activeServer?.name || 'Main Server'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                IP proxies, local ONT, ISP core routers, BDIX / submarine landing gateways
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-cyan-400 pl-2 shrink-0">
            <span>{showRouteDetails ? 'Collapse Route' : 'Show Route'}</span>
            <div
              className={`p-1 rounded-full transition-transform duration-200 ${
                showRouteDetails ? 'rotate-180 bg-cyan-500/20' : 'bg-slate-800'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {/* Expanded Hop-by-Hop Traceroute Node Diagram */}
        {showRouteDetails && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-xs animate-fade-in shadow-xl shadow-cyan-950/20">
            {/* Header info strip inside drawer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Live Socket Packet Path:
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[10.5px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                  {ipProtocol === 'ipv6'
                    ? 'Native IPv6 Socket'
                    : ipProtocol === 'ipv4_to_ipv6'
                    ? 'NAT64 Stateful Translation'
                    : ipProtocol === 'ipv6_to_ipv4'
                    ? '464XLAT Carrier PLAT'
                    : 'Native IPv4 Socket'}
                </span>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  • Target: <strong className="text-cyan-300">{activeServer?.name || 'Main Server'}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyAllRoute}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                title="Copy complete traceroute hop sequence to clipboard"
              >
                {copiedAllRoute ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied Traceroute!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            {/* Vertical Interactive Hop-by-Hop Node Diagram */}
            <div className="space-y-0 relative">
              {routeHops.map((hop, index) => {
                const isLast = index === routeHops.length - 1;
                const isFirst = index === 0;

                return (
                  <div key={hop.hop} className="relative pl-8 pb-3.5 last:pb-1">
                    {/* Connecting line to next hop */}
                    {!isLast && (
                      <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/60 via-indigo-500/40 to-slate-800" />
                    )}

                    {/* Hop badge circle */}
                    <div
                      className={`absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono font-black border shadow-sm ${
                        isLast
                          ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white border-cyan-300 ring-2 ring-cyan-500/30'
                          : isFirst
                          ? 'bg-slate-900 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      {hop.hop}
                    </div>

                    {/* Hop Card Content */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                        isLast
                          ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-950 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="p-1 rounded-md bg-slate-800/90 shrink-0">
                            {getHopIcon(hop.deviceType)}
                          </div>
                          <span className="font-bold text-slate-200 text-xs sm:text-[13px]">
                            {hop.name}
                          </span>
                          <span
                            className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                              isLast
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : hop.deviceType === 'cgnat_proxy'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : hop.deviceType === 'landing_station'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {hop.roleLabel}
                          </span>
                        </div>

                        {/* Latency Pill */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono shrink-0 self-start sm:self-auto">
                          <span className="text-slate-500">Latency:</span>
                          <span
                            className={`font-black ${
                              isLast
                                ? 'text-cyan-400'
                                : hop.latencyEstMs > 20
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            ~{hop.latencyEstMs} ms
                          </span>
                        </div>
                      </div>

                      {/* IP Address, ASN & Location Details */}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/50 text-[11px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400 font-mono text-[10.5px]">IP:</span>
                          <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[240px] select-all">
                            {hop.ip}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyHopIp(hop.ip)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer transition-colors"
                            title="Copy IP"
                          >
                            {copiedHopIp === hop.ip ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          {hop.asn && (
                            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                              {hop.asn}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[10.5px]">
                          <span>{hop.location}</span>
                          {hop.notes && (
                            <>
                              <span className="text-slate-600 hidden md:inline">•</span>
                              <span className="text-slate-400 text-[10px] hidden md:inline italic">
                                {hop.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upstream Transit Channels Collapsible Drawer */}
      {upstream && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60">
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
