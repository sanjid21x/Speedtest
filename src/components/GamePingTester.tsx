import React, { useState } from 'react';
import { GameCategory, GameServerEndpoint } from '../types/speedtest';
import { GAME_SERVERS, probeGameServer } from '../services/gamePingService';
import {
  Gamepad2,
  Play,
  RotateCcw,
  Zap,
  Activity,
  Flame,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface GamePingTesterProps {
  theme: 'dark' | 'light';
}

const CATEGORIES: { id: GameCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Games', icon: '🎮' },
  { id: 'pubg', label: 'PUBG Mobile/PC', icon: '🪂' },
  { id: 'efootball', label: 'eFootball / EA FC', icon: '⚽' },
  { id: 'valorant', label: 'Valorant', icon: '🎯' },
  { id: 'cod', label: 'Call of Duty', icon: '💥' },
  { id: 'freefire', label: 'Free Fire', icon: '🔥' },
  { id: 'valve', label: 'CS2 / Dota 2', icon: '🛡️' },
];

export const GamePingTester: React.FC<GamePingTesterProps> = ({ theme }) => {
  const [servers, setServers] = useState<GameServerEndpoint[]>(() => [...GAME_SERVERS]);
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testedCount, setTestedCount] = useState(0);

  const isDark = theme === 'dark';

  const filteredServers = servers.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.game === activeCategory;
  });

  const runSingleTest = async (server: GameServerEndpoint) => {
    setServers((prev) =>
      prev.map((s) => (s.id === server.id ? { ...s, status: 'testing' } : s))
    );

    try {
      const result = await probeGameServer(server);
      setServers((prev) =>
        prev.map((s) =>
          s.id === server.id
            ? {
                ...s,
                pingMs: result.pingMs,
                jitterMs: result.jitterMs,
                quality: result.quality,
                status: 'success',
              }
            : s
        )
      );
    } catch {
      setServers((prev) =>
        prev.map((s) => (s.id === server.id ? { ...s, status: 'failed' } : s))
      );
    }
  };

  const handleTestAll = async () => {
    if (isTestingAll) return;
    setIsTestingAll(true);
    setTestedCount(0);

    const listToTest = [...filteredServers];
    for (let i = 0; i < listToTest.length; i++) {
      const server = listToTest[i];
      await runSingleTest(server);
      setTestedCount(i + 1);
    }

    setIsTestingAll(false);
  };

  const resetAll = () => {
    setServers([...GAME_SERVERS]);
    setTestedCount(0);
  };

  // Best server calculation
  const testedSuccessServers = servers.filter(
    (s) => s.status === 'success' && s.pingMs !== undefined
  );
  const bestServer =
    testedSuccessServers.length > 0
      ? [...testedSuccessServers].sort((a, b) => (a.pingMs || 999) - (b.pingMs || 999))[0]
      : null;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-purple-950/20'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Gamepad2 className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
                Bangladesh Gamers Ping Radar
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  BD Optimized
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live latency & jitter benchmark for servers used by Bangladeshi gamers (PUBG, eFootball, Valorant, Free Fire, CoD, CS2)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {testedSuccessServers.length > 0 && (
            <button
              onClick={resetAll}
              disabled={isTestingAll}
              className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
              title="Reset metrics"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleTestAll}
            disabled={isTestingAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all ${
              isTestingAll
                ? 'bg-purple-600/50 text-purple-200 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-500/25 active:scale-95'
            }`}
          >
            {isTestingAll ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>
                  Testing {testedCount}/{filteredServers.length}...
                </span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Benchmark All Games</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Best Server Badge (if tested) */}
      {bestServer && (
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                  Lowest Latency Game Server
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {bestServer.quality === 'elite' ? 'Esports Ready' : 'Optimal'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-100">{bestServer.name}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {bestServer.pingMs}
              <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
            </span>
            <p className="text-[11px] text-slate-400">Jitter: ±{bestServer.jitterMs}ms</p>
          </div>
        </div>
      )}

      {/* Game Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500'
                  : isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-1">
        {filteredServers.map((server) => {
          const isTestingThis = server.status === 'testing';
          const isSuccess = server.status === 'success';

          return (
            <div
              key={server.id}
              className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                isDark
                  ? 'bg-slate-950/60 hover:bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    {server.gameName}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{server.location}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 leading-snug">{server.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{server.region}</p>
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/50">
                <div>
                  {isSuccess && server.pingMs !== undefined ? (
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-xl font-black font-mono ${
                          server.quality === 'elite'
                            ? 'text-emerald-400'
                            : server.quality === 'great'
                            ? 'text-cyan-400'
                            : server.quality === 'fair'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {server.pingMs}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">ms</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ±{server.jitterMs}ms
                      </span>
                    </div>
                  ) : isTestingThis ? (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Probing packets...</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Not tested yet</span>
                  )}
                </div>

                <button
                  onClick={() => runSingleTest(server)}
                  disabled={isTestingThis || isTestingAll}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    isTestingThis
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : isDark
                      ? 'bg-slate-800 hover:bg-purple-600 hover:border-purple-500 hover:text-white border-slate-700 text-slate-300'
                      : 'bg-white hover:bg-purple-600 hover:text-white border-slate-300 text-slate-700'
                  }`}
                >
                  {isTestingThis ? 'Pinging...' : isSuccess ? 'Re-ping' : 'Ping Test'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
