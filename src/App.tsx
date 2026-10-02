/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TestStage,
  SpeedTestServer,
  SpeedTestResult,
  LatencyMetrics,
  StreamProgress,
  ThemeMode,
} from './types/speedtest';
import { SpeedEngine } from './services/speedEngine';
import { getActiveServer } from './services/servers';
import { getHistory, saveResultToHistory } from './services/history';
import { SpeedGauge } from './components/SpeedGauge';
import { ResultCard } from './components/ResultCard';
import { TestHistory } from './components/TestHistory';
import { ServerSelector } from './components/ServerSelector';
import { NetworkRouteSelector } from './components/NetworkRouteSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { SplashScreen } from './components/SplashScreen';
import {
  Activity,
  Wifi,
  WifiOff,
  AlertCircle,
  ShieldCheck,
  Zap,
  Radio,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Info,
} from 'lucide-react';

export default function App() {
  // Splash screen state (shows once on initial load)
  const [showSplash, setShowSplash] = useState(true);

  // Theme state
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('speedtest_theme_mode') as ThemeMode) || 'dark';
  });
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const activeTheme = useMemo<'dark' | 'light'>(() => {
    if (themeMode === 'system') return systemIsDark ? 'dark' : 'light';
    return themeMode;
  }, [themeMode, systemIsDark]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem('speedtest_theme_mode', themeMode);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, activeTheme]);

  // Online / Offline monitor
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Server state
  const [activeServer, setActiveServer] = useState<SpeedTestServer>(() => getActiveServer());

  // Engine state
  const [stage, setStage] = useState<TestStage>('idle');
  const [currentLiveValue, setCurrentLiveValue] = useState<number>(0);
  const [pingValue, setPingValue] = useState<number>(0);
  const [jitterValue, setJitterValue] = useState<number>(0);
  const [downloadValue, setDownloadValue] = useState<number>(0);
  const [uploadValue, setUploadValue] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed result and local history
  const [latestResult, setLatestResult] = useState<SpeedTestResult | null>(null);
  const [historyList, setHistoryList] = useState<SpeedTestResult[]>(() => getHistory());

  const engineRef = useRef<SpeedEngine | null>(null);

  // Initialize engine instance
  useEffect(() => {
    const engine = new SpeedEngine({
      onStageChange: (newStage) => {
        setStage(newStage);
        if (newStage === 'idle') {
          setCurrentLiveValue(0);
        }
      },
      onPingUpdate: (metrics: LatencyMetrics) => {
        setPingValue(Math.round(metrics.avg));
        setJitterValue(Math.round(metrics.jitter));
      },
      onDownloadProgress: (progress: StreamProgress) => {
        setCurrentLiveValue(progress.instantMbps);
        setDownloadValue(progress.averageMbps);
      },
      onUploadProgress: (progress: StreamProgress) => {
        setCurrentLiveValue(progress.instantMbps);
        setUploadValue(progress.averageMbps);
      },
      onError: (msg: string, isFatal: boolean) => {
        setErrorMessage(msg);
        if (isFatal) {
          setStage('error');
        }
      },
      onComplete: (result: SpeedTestResult) => {
        setLatestResult(result);
        saveResultToHistory(result);
        setHistoryList(getHistory());
      },
    });

    engineRef.current = engine;

    return () => {
      engine.abort();
    };
  }, []);

  const handleStart = () => {
    if (!isOnline) {
      setErrorMessage('No internet connection detected.');
      setStage('error');
      return;
    }

    setErrorMessage(null);
    setCurrentLiveValue(0);
    setPingValue(0);
    setJitterValue(0);
    setDownloadValue(0);
    setUploadValue(0);
    setLatestResult(null);

    engineRef.current?.start(activeServer);
  };

  const handleStop = () => {
    engineRef.current?.abort();
    setStage('idle');
  };

  const handleRestart = () => {
    handleStart();
  };

  const isTesting =
    stage === 'initializing' ||
    stage === 'choosing_endpoint' ||
    stage === 'testing_ping' ||
    stage === 'testing_jitter' ||
    stage === 'testing_download' ||
    stage === 'testing_upload' ||
    stage === 'calculating_results';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        activeTheme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Splash Screen on Initial Load */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Navigation Header */}
      <header
        className={`sticky top-0 z-20 w-full border-b backdrop-blur-md transition-colors ${
          activeTheme === 'dark'
            ? 'bg-slate-950/80 border-slate-800/80'
            : 'bg-white/80 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                SpeedTest
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide -mt-0.5">
                Real Network Telemetry
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Server Selector */}
            <ServerSelector
              activeServer={activeServer}
              onServerChange={setActiveServer}
              disabled={isTesting}
              theme={activeTheme}
            />

            {/* Network Online Status Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle
              mode={themeMode}
              onModeChange={setThemeMode}
              activeTheme={activeTheme}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 max-w-4xl w-full mx-auto space-y-8">
        {/* Error Notice */}
        {errorMessage && (
          <div
            className={`w-full max-w-2xl flex items-center justify-between gap-3 p-4 rounded-xl border animate-fade-in ${
              stage === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            {stage === 'error' && (
              <button
                onClick={handleRestart}
                type="button"
                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer shrink-0"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Stage Step Indicator */}
        {isTesting && (
          <div className="w-full max-w-md flex flex-col items-center gap-2 animate-fade-in">
            <div className="flex items-center justify-between w-full text-[11px] font-semibold tracking-wider uppercase text-slate-400 px-2">
              <span className={stage === 'testing_ping' || stage === 'testing_jitter' ? 'text-cyan-400 font-bold' : ''}>
                1. Latency
              </span>
              <span className={stage === 'testing_download' ? 'text-cyan-400 font-bold' : ''}>
                2. Download
              </span>
              <span className={stage === 'testing_upload' ? 'text-emerald-400 font-bold' : ''}>
                3. Upload
              </span>
              <span className={stage === 'calculating_results' ? 'text-purple-400 font-bold' : ''}>
                4. Analysis
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                style={{
                  width:
                    stage === 'initializing' || stage === 'choosing_endpoint'
                      ? '15%'
                      : stage === 'testing_ping'
                      ? '30%'
                      : stage === 'testing_jitter'
                      ? '45%'
                      : stage === 'testing_download'
                      ? '70%'
                      : stage === 'testing_upload'
                      ? '90%'
                      : '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* Network Route Selector (Global CDN, GGC, FNA, IIG, Local BDIX) */}
        <NetworkRouteSelector
          activeServer={activeServer}
          onServerSelect={setActiveServer}
          disabled={isTesting}
          theme={activeTheme}
        />

        {/* Central Speedometer Gauge */}
        <div className="w-full flex flex-col items-center">
          <SpeedGauge
            stage={stage}
            currentValue={currentLiveValue}
            downloadValue={downloadValue}
            uploadValue={uploadValue}
            pingValue={pingValue}
            jitterValue={jitterValue}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
            theme={activeTheme}
          />
        </div>

        {/* Live Metrics Quick Bar during active test */}
        {isTesting && (
          <div
            className={`w-full max-w-xl grid grid-cols-4 gap-2 p-3 rounded-xl border text-center animate-fade-in ${
              activeTheme === 'dark'
                ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <div>
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Ping</span>
              <span className="font-mono text-sm sm:text-base font-bold text-slate-100">
                {pingValue > 0 ? `${pingValue} ms` : '--'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Jitter</span>
              <span className="font-mono text-sm sm:text-base font-bold text-slate-100">
                {jitterValue > 0 ? `${jitterValue} ms` : '--'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-cyan-400">Download</span>
              <span className="font-mono text-sm sm:text-base font-bold text-cyan-400">
                {downloadValue > 0 ? `${downloadValue.toFixed(1)} M` : '--'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-emerald-400">Upload</span>
              <span className="font-mono text-sm sm:text-base font-bold text-emerald-400">
                {uploadValue > 0 ? `${uploadValue.toFixed(1)} M` : '--'}
              </span>
            </div>
          </div>
        )}

        {/* Completed Result Card */}
        {stage === 'completed' && latestResult && (
          <div className="w-full flex justify-center animate-fade-in">
            <ResultCard result={latestResult} theme={activeTheme} />
          </div>
        )}

        {/* Test History */}
        <div className="w-full flex justify-center">
          <TestHistory
            history={historyList}
            onHistoryCleared={() => setHistoryList([])}
            theme={activeTheme}
          />
        </div>

        {/* Informative Architecture & Methodology Card */}
        <section
          className={`w-full max-w-2xl rounded-2xl border p-5 sm:p-6 transition-all ${
            activeTheme === 'dark'
              ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
              : 'bg-white border-slate-200 text-slate-600 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 mb-3 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm tracking-wide uppercase">
              How This Real Speed Test Works
            </h4>
          </div>
          <div className="text-xs space-y-2 leading-relaxed text-slate-400">
            <p>
              • <strong className="text-cyan-300">Global CDN:</strong> Tests worldwide Anycast points-of-presence (Cloudflare, Fastly) for global browsing and web apps.
            </p>
            <p>
              • <strong className="text-rose-300">Google Global Cache (GGC):</strong> Tests local ISP caching appliances for YouTube, Google Drive, Play Store, and Google Workspace streaming.
            </p>
            <p>
              • <strong className="text-blue-300">Facebook Network Appliance (FNA):</strong> Tests intra-ISP Meta peering caches for Instagram Reels, Facebook HD video, and media delivery.
            </p>
            <p>
              • <strong className="text-emerald-300">Local BDIX:</strong> Measures direct domestic peering latency and bandwidth across the Bangladesh Internet Exchange (local ISP FTPs, live TV, OTT, and intra-country networks).
            </p>
            <p>
              • <strong className="text-amber-300">International Gateway (IIG):</strong> Benchmarks upstream international submarine cable transit (SMW-4, SMW-5) and cross-border ITC links.
            </p>
            <p>
              • <strong className="text-slate-200">Multi-Route Audit:</strong> Use the "Compare All 5 Routes" button above to probe latency and jitter across all peering paths simultaneously!
            </p>
          </div>
        </section>
      </main>

      {/* Website Footer with required Branding */}
      <footer
        className={`w-full border-t py-6 px-4 transition-colors ${
          activeTheme === 'dark'
            ? 'bg-slate-950 border-slate-800/60 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-tight text-slate-200">SpeedTest</span>
            <span className="text-slate-600">|</span>
            <span>Made with <span className="text-rose-500 select-none">♥</span> by Sanjid</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Static GitHub Pages Ready</span>
            <span>•</span>
            <span>CORS Edge Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
