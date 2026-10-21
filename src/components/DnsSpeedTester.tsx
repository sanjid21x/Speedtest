import React, { useState, useEffect } from 'react';
import { CurrentDnsInfo, DnsCategory, DnsServerEndpoint, ClientNetworkDetails } from '../types/speedtest';
import { TOP_DNS_SERVERS, probeDnsServer, detectCurrentDnsInfo, probeCurrentDnsLiveSample } from '../services/dnsTesterService';
import {
  Globe,
  Shield,
  ShieldCheck,
  Zap,
  RotateCcw,
  Play,
  CheckCircle2,
  Trophy,
  Activity,
  Layers,
  Search,
  Wifi,
  Sparkles,
  Server,
  Lock,
  Cpu,
  ArrowRight,
  Radio,
  Clock,
  Copy,
  Check,
  Pause,
} from 'lucide-react';

interface DnsSpeedTesterProps {
  clientNetwork?: ClientNetworkDetails;
  theme: 'dark' | 'light';
}

const CATEGORY_TABS: { id: DnsCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All DNS (23)', icon: '🌐' },
  { id: 'privacy', label: 'Privacy & No-Log', icon: '🔒' },
  { id: 'security', label: 'Security & Malware', icon: '🛡️' },
  { id: 'adblock', label: 'Ad-Blocking', icon: '🚫' },
  { id: 'domestic', label: 'Domestic BDIX', icon: '🇧🇩' },
  { id: 'global', label: 'Global Anycast', icon: '⚡' },
];

export const DnsSpeedTester: React.FC<DnsSpeedTesterProps> = ({ clientNetwork, theme }) => {
  const [dnsList, setDnsList] = useState<DnsServerEndpoint[]>(() => [...TOP_DNS_SERVERS]);
  const [activeTab, setActiveTab] = useState<DnsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testedCount, setTestedCount] = useState(0);
  const [sortBy, setSortBy] = useState<'recommended' | 'fastest' | 'name'>('recommended');
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [copiedIp, setCopiedIp] = useState(false);

  // Current DNS details
  const [currentDns, setCurrentDns] = useState<CurrentDnsInfo>({
    name: 'Detecting Default Resolver...',
    provider: clientNetwork?.isp || 'Local Broadband ISP',
    ip: '192.168.1.1 (Gateway DNS) / Dynamic DHCP',
    stability: '99.8% Rock Solid (Optimal)',
    stabilityScore: 99.8,
    jitterMs: 1,
    packetLossPercent: 0,
    averageLatencyMs: 12,
    status: 'idle',
    currentPingMs: 12,
    currentJitterMs: 1,
    livePingHistory: [14, 12, 11, 13, 12, 12, 11, 12],
    monitoringActive: true,
  });
  const [isCheckingCurrent, setIsCheckingCurrent] = useState(false);

  // Load and probe current DNS upon initialization
  useEffect(() => {
    let isMounted = true;
    const runDetect = async () => {
      setIsCheckingCurrent(true);
      const info = await detectCurrentDnsInfo(clientNetwork?.isp, clientNetwork?.asn);
      if (isMounted) {
        setCurrentDns(info);
        setIsCheckingCurrent(false);
      }
    };
    runDetect();
    return () => {
      isMounted = false;
    };
  }, [clientNetwork?.isp, clientNetwork?.asn]);

  // Live telemetry interval: measures live ping and jitter of current DNS resolver
  useEffect(() => {
    if (!isLiveMonitoring) return;

    const intervalId = setInterval(async () => {
      try {
        const sample = await probeCurrentDnsLiveSample(currentDns.currentPingMs);
        setCurrentDns((prev) => {
          const newHistory = [...(prev.livePingHistory || []), sample.pingMs].slice(-14);
          const sum = newHistory.reduce((a, b) => a + b, 0);
          const newAvg = Math.round(sum / newHistory.length);

          return {
            ...prev,
            currentPingMs: sample.pingMs,
            currentJitterMs: sample.jitterMs,
            livePingHistory: newHistory,
            averageLatencyMs: newAvg,
          };
        });
      } catch {
        // Ignore single transient interval error
      }
    }, 2200);

    return () => clearInterval(intervalId);
  }, [isLiveMonitoring, currentDns.currentPingMs]);

  const handleRecheckCurrentDns = async () => {
    setIsCheckingCurrent(true);
    const info = await detectCurrentDnsInfo(clientNetwork?.isp, clientNetwork?.asn);
    setCurrentDns(info);
    setIsCheckingCurrent(false);
  };

  const handleCopyCurrentIp = () => {
    navigator.clipboard?.writeText(currentDns.ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const isDark = theme === 'dark';

  // Run single test
  const runSingleDnsTest = async (server: DnsServerEndpoint) => {
    setDnsList((prev) =>
      prev.map((s) => (s.id === server.id ? { ...s, status: 'testing' } : s))
    );

    try {
      const res = await probeDnsServer(server);
      setDnsList((prev) =>
        prev.map((s) =>
          s.id === server.id
            ? {
                ...s,
                latencyMs: res.latencyMs,
                jitterMs: res.jitterMs,
                rating: res.rating,
                status: 'success',
              }
            : s
        )
      );
    } catch {
      setDnsList((prev) =>
        prev.map((s) => (s.id === server.id ? { ...s, status: 'failed' } : s))
      );
    }
  };

  // Run all tests sequentially
  const handleTestAllDns = async () => {
    if (isTestingAll) return;
    setIsTestingAll(true);
    setTestedCount(0);

    const listToRun = [...filteredList];
    for (let i = 0; i < listToRun.length; i++) {
      const server = listToRun[i];
      await runSingleDnsTest(server);
      setTestedCount(i + 1);
    }

    setIsTestingAll(false);
  };

  const handleResetDns = () => {
    setDnsList([...TOP_DNS_SERVERS]);
    setTestedCount(0);
  };

  // Filtering & Sorting
  const filteredList = dnsList.filter((s) => {
    const matchesTab = activeTab === 'all' || s.category === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.primaryIp.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'fastest') {
      const aVal = a.status === 'success' && a.latencyMs !== undefined ? a.latencyMs : 9999;
      const bVal = b.status === 'success' && b.latencyMs !== undefined ? b.latencyMs : 9999;
      return aVal - bVal;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Default recommended: success lowest first, then original order
    const aVal = a.status === 'success' && a.latencyMs !== undefined ? a.latencyMs : 5000;
    const bVal = b.status === 'success' && b.latencyMs !== undefined ? b.latencyMs : 5000;
    return aVal - bVal;
  });

  // Fastest tested DNS
  const successfulTested = dnsList.filter((s) => s.status === 'success' && s.latencyMs !== undefined);
  const fastestDns =
    successfulTested.length > 0
      ? [...successfulTested].sort((a, b) => (a.latencyMs || 999) - (b.latencyMs || 999))[0]
      : null;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-cyan-950/20'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
                DNS Speed & Resolution Benchmark
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  23 Top DNS Resolvers
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live round-trip lookup latency, jitter, threat filtering, and stability checker across worldwide DNS providers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {successfulTested.length > 0 && (
            <button
              onClick={handleResetDns}
              disabled={isTestingAll}
              className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
              title="Reset DNS Metrics"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleTestAllDns}
            disabled={isTestingAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer ${
              isTestingAll
                ? 'bg-cyan-600/50 text-cyan-200 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <Play className={`w-4 h-4 ${isTestingAll ? 'animate-spin' : ''}`} />
            <span>
              {isTestingAll ? `Testing (${testedCount}/${filteredList.length})...` : 'Test All 23 DNS'}
            </span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: My Current DNS Details Box (Professionally Organized Live Monitoring) */}
      <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-xl backdrop-blur-xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Server className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
                  My Current DNS Resolver
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active IPv4
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  Port 53 / DoH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time active recursive DNS resolver configuration, live latency telemetry, and jitter stability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Live Monitoring Toggle */}
            <button
              onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLiveMonitoring
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-xs shadow-emerald-500/10'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle live ping and jitter monitoring"
            >
              {isLiveMonitoring ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Monitor: ON</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-slate-400" />
                  <span>Live Monitor: PAUSED</span>
                </>
              )}
            </button>

            {/* Recheck Stability Button */}
            <button
              onClick={handleRecheckCurrentDns}
              disabled={isCheckingCurrent}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer disabled:opacity-50"
              title="Re-run 5-sample DNS stability check"
            >
              <Activity className={`w-3.5 h-3.5 ${isCheckingCurrent ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
              <span>{isCheckingCurrent ? 'Auditing...' : 'Re-check'}</span>
            </button>
          </div>
        </div>

        {/* 4 Professional Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Card 1: DNS Name & Provider */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                1. Upstream DNS Resolver
              </span>
              <p className="text-sm font-bold text-slate-100 truncate mt-1.5" title={currentDns.name}>
                {currentDns.name}
              </p>
              <p className="text-xs font-medium text-indigo-300 truncate mt-0.5" title={currentDns.provider}>
                {currentDns.provider}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">{currentDns.resolverType || 'Recursive Node'}</span>
              <span className="text-emerald-400 font-bold">IPv4 Direct</span>
            </div>
          </div>

          {/* Card 2: DNS IP Address */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                2. Real DNS Server IP
              </span>
              <div className="flex items-center justify-between gap-1 mt-1.5">
                <span className="text-sm font-mono font-black text-amber-300 truncate" title={currentDns.ip}>
                  {currentDns.ip}
                </span>
                <button
                  onClick={handleCopyCurrentIp}
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Copy Real DNS IP"
                >
                  {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                Router Forwarder: 192.168.1.1 (CPE Gateway)
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">Real Recursive IP</span>
              <span className="text-amber-300 font-bold">Port 53 / DoH</span>
            </div>
          </div>

          {/* Card 3: Current DNS Ping (Live Monitoring) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                3. Live DNS Ping
              </span>
              <span className="flex items-center gap-1 text-[9.5px] font-mono text-cyan-300 font-bold">
                <span className={`w-1.5 h-1.5 rounded-full bg-cyan-400 ${isLiveMonitoring ? 'animate-ping' : ''}`} />
                {isLiveMonitoring ? 'LIVE' : 'IDLE'}
              </span>
            </div>

            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 tracking-tight">
                {currentDns.currentPingMs ?? currentDns.averageLatencyMs}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">ms</span>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">
                avg: {currentDns.averageLatencyMs}ms
              </span>
            </div>

            {/* Live Sparkline */}
            <div className="mt-1 pt-1.5 border-t border-slate-800/80">
              <div className="flex items-end gap-1 h-5 w-full">
                {(currentDns.livePingHistory || [12, 11, 13, 12, 14, 11, 12]).map((val, idx) => {
                  const maxVal = Math.max(...(currentDns.livePingHistory || [20]), 20);
                  const barHeight = Math.max(20, Math.min(100, Math.round((val / maxVal) * 100)));
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-xs bg-cyan-500/40 hover:bg-cyan-400 transition-all"
                      style={{ height: `${barHeight}%` }}
                      title={`Sample ${idx + 1}: ${val}ms`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 4: Current DNS Jitter (Live Monitoring) & Stability */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                4. Live Jitter & Stability
              </span>
              <span className="text-[9.5px] font-mono text-emerald-400 font-bold">
                Loss: {currentDns.packetLossPercent}%
              </span>
            </div>

            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-purple-300 tracking-tight">
                ±{currentDns.currentJitterMs ?? currentDns.jitterMs}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">ms jitter</span>
            </div>

            <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-400 font-bold truncate" title={currentDns.stability}>
                {currentDns.stabilityScore ? `${currentDns.stabilityScore}% Stable` : '99.8% Optimal'}
              </span>
              <span className="text-slate-400">Rock Solid</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Bar */}
        <div className="mt-3 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              <strong>Continuous DNS Telemetry:</strong> Polling gateway socket RTT every 2.2s.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10.5px]">
            <span>Samples: <strong>{currentDns.livePingHistory?.length || 8}</strong></span>
            <span>•</span>
            <span>Stability: <strong className="text-emerald-400">{currentDns.stability}</strong></span>
          </div>
        </div>

        {/* Fastest recommendation banner if tested */}
        {fastestDns && fastestDns.latencyMs && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>
                <strong>{fastestDns.name}</strong> ({fastestDns.primaryIp}) is currently your fastest tested DNS at{' '}
                <strong className="text-emerald-400">{fastestDns.latencyMs} ms</strong>!
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase shrink-0">
              Top Recommendation
            </span>
          </div>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search DNS or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border transition-all outline-hidden ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500'
              }`}
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-2.5 py-1.5 text-xs rounded-xl border font-medium cursor-pointer outline-hidden ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="fastest">Sort: Lowest Latency</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* DNS Speed Tester List (23 Top DNS Servers) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
        {sortedList.map((dns) => {
          const isFastest = fastestDns?.id === dns.id;
          return (
            <div
              key={dns.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                isFastest
                  ? isDark
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-amber-50/80 border-amber-300'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-xl shrink-0 mt-0.5">{dns.flag || '🌐'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="font-bold text-xs sm:text-sm text-slate-100 truncate" title={dns.name}>
                        {dns.name}
                      </h5>
                      {isFastest && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Trophy className="w-2.5 h-2.5 text-amber-400" />
                          #1 Fastest
                        </span>
                      )}
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {dns.categoryLabel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {dns.provider} • <span className="text-slate-500">{dns.location}</span>
                    </p>

                    {/* IPs */}
                    <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                        {dns.primaryIp}
                      </span>
                      {dns.secondaryIp && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 text-[10.5px]">
                          {dns.secondaryIp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Latency & Test Button */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {dns.status === 'success' && dns.latencyMs !== undefined ? (
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-base font-black font-mono ${
                            dns.rating === 'elite'
                              ? 'text-emerald-400'
                              : dns.rating === 'great'
                              ? 'text-cyan-400'
                              : dns.rating === 'fair'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {dns.latencyMs}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">ms</span>
                      </div>
                      {dns.jitterMs !== undefined && (
                        <span className="text-[9.5px] font-mono text-slate-400 block">
                          ±{dns.jitterMs}ms jitter
                        </span>
                      )}
                    </div>
                  ) : dns.status === 'testing' ? (
                    <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1 animate-pulse">
                      <Activity className="w-3 h-3 animate-spin" />
                      Probing...
                    </span>
                  ) : dns.status === 'failed' ? (
                    <span className="text-[10px] font-semibold text-rose-400">Timeout</span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500">-- ms</span>
                  )}

                  <button
                    onClick={() => runSingleDnsTest(dns)}
                    disabled={dns.status === 'testing' || isTestingAll}
                    type="button"
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {dns.status === 'success' ? 'Retest' : 'Test'}
                  </button>
                </div>
              </div>

              {/* Feature Chips */}
              <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-800/60">
                {dns.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-400 border border-slate-800/80"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
