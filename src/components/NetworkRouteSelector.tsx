import React, { useState } from 'react';
import { NetworkCategory, SpeedTestServer } from '../types/speedtest';
import {
  NETWORK_CATEGORIES,
  getServersByCategory,
  setSelectedServerId,
} from '../services/servers';
import { SpeedEngine } from '../services/speedEngine';
import {
  Globe,
  Youtube,
  Radio,
  Share2,
  Zap,
  Server,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface NetworkRouteSelectorProps {
  activeServer: SpeedTestServer;
  onServerSelect: (server: SpeedTestServer) => void;
  disabled: boolean;
  theme: 'dark' | 'light';
}

export const NetworkRouteSelector: React.FC<NetworkRouteSelectorProps> = ({
  activeServer,
  onServerSelect,
  disabled,
  theme,
}) => {
  const [showMultiProbe, setShowMultiProbe] = useState(false);
  const [probeResults, setProbeResults] = useState<{
    [serverId: string]: { ping: number; jitter: number; status: 'pending' | 'success' | 'failed' };
  }>({});
  const [isProbing, setIsProbing] = useState(false);

  const handleCategorySelect = (category: NetworkCategory) => {
    if (disabled) return;
    const categoryServers = getServersByCategory(category);
    if (categoryServers.length > 0) {
      // Pick the first server of that category
      setSelectedServerId(categoryServers[0].id);
      onServerSelect(categoryServers[0]);
    }
  };

  const getCategoryIcon = (cat: NetworkCategory) => {
    switch (cat) {
      case 'global_cdn':
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
      case 'ggc':
        return <Youtube className="w-3.5 h-3.5 text-rose-400" />;
      case 'fna':
        return <Share2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'bdix':
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'iig':
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Server className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const runAllRoutesProbe = async () => {
    setIsProbing(true);
    const initial: typeof probeResults = {};
    NETWORK_CATEGORIES.forEach((c) => {
      const srvs = getServersByCategory(c.id);
      if (srvs[0]) {
        initial[srvs[0].id] = { ping: 0, jitter: 0, status: 'pending' };
      }
    });
    setProbeResults(initial);

    for (const cat of NETWORK_CATEGORIES) {
      const srvs = getServersByCategory(cat.id);
      const srv = srvs[0];
      if (!srv) continue;

      try {
        const metrics = await SpeedEngine.probeServerLatency(srv, 3);
        setProbeResults((prev) => ({
          ...prev,
          [srv.id]: { ping: metrics.avg, jitter: metrics.jitter, status: 'success' },
        }));
      } catch {
        setProbeResults((prev) => ({
          ...prev,
          [srv.id]: { ping: 0, jitter: 0, status: 'failed' },
        }));
      }
    }
    setIsProbing(false);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-3">
      {/* Route Mode Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        {NETWORK_CATEGORIES.map((cat) => {
          const isSelected = activeServer.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              disabled={disabled}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Route Info Bar with Multi-Route Audit trigger */}
      <div
        className={`w-full max-w-2xl px-4 py-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-cyan-400">
            {getCategoryIcon(activeServer.category)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">{activeServer.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                {activeServer.categoryLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{activeServer.description}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowMultiProbe(!showMultiProbe);
            if (!showMultiProbe && Object.keys(probeResults).length === 0) {
              runAllRoutesProbe();
            }
          }}
          type="button"
          disabled={disabled}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Activity className="w-3 h-3" />
          <span>{showMultiProbe ? 'Hide Route Audit' : 'Compare All 5 Routes'}</span>
        </button>
      </div>

      {/* Multi-Route Latency Audit Matrix */}
      {showMultiProbe && (
        <div
          className={`w-full max-w-2xl p-4 rounded-xl border animate-fade-in ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-cyan-500/30 text-slate-200'
              : 'bg-slate-50 border-cyan-200 text-slate-800 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Multi-Route Latency & Peering Audit
              </h4>
            </div>
            <button
              onClick={runAllRoutesProbe}
              disabled={isProbing}
              type="button"
              className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{isProbing ? 'Probing...' : 'Re-test All'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/40 mt-2">
            {NETWORK_CATEGORIES.map((cat) => {
              const srvs = getServersByCategory(cat.id);
              const srv = srvs[0];
              if (!srv) return null;
              const res = probeResults[srv.id];
              const isCurrent = activeServer.id === srv.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (!disabled) {
                      setSelectedServerId(srv.id);
                      onServerSelect(srv);
                    }
                  }}
                  className={`py-2.5 px-2 flex items-center justify-between gap-3 text-xs rounded-lg cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-cyan-500/10'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {getCategoryIcon(cat.id)}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">{cat.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{cat.tag}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    {res?.status === 'pending' && (
                      <span className="text-slate-500 text-[11px] animate-pulse">Testing...</span>
                    )}
                    {res?.status === 'failed' && (
                      <span className="text-rose-400 text-[11px]">Unreachable</span>
                    )}
                    {res?.status === 'success' && (
                      <>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Latency</span>
                          <span className="font-bold text-cyan-400">{res.ping} ms</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Jitter</span>
                          <span className="font-semibold text-purple-400">{res.jitter} ms</span>
                        </div>
                      </>
                    )}
                    {!res && (
                      <span className="text-slate-500 text-[11px]">Ready</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/40 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Click any route above to switch active speed-test engine</span>
            <span className="text-cyan-400 font-mono">BDIX &bull; GGC &bull; FNA &bull; IIG &bull; CDN</span>
          </div>
        </div>
      )}
    </div>
  );
};
