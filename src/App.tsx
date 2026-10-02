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
  SpeedUnit,
  TestDurationOption,
  ClientNetworkDetails,
} from './types/speedtest';
import { SpeedEngine } from './services/speedEngine';
import { getActiveServer } from './services/servers';
import { getHistory, saveResultToHistory } from './services/history';
import { fetchClientNetworkInfo } from './services/networkInfo';
import { SpeedGauge } from './components/SpeedGauge';
import { ResultCard } from './components/ResultCard';
import { TestHistory } from './components/TestHistory';
import { ServerSelector } from './components/ServerSelector';
import { NetworkRouteSelector } from './components/NetworkRouteSelector';
import { ClientNetworkCard } from './components/ClientNetworkCard';
import { GamePingTester } from './components/GamePingTester';
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
  Gauge,
  Gamepad2,
  Globe,
  Sparkles,
} from 'lucide-react';
import { formatSpeedValue, getUnitLabel } from './services/unitHelper';

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

  // Speed Unit state: 'mbps' (Mbps) or 'MBps' (MB/s)
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(() => {
    return (localStorage.getItem('speedtest_unit') as SpeedUnit) || 'mbps';
  });

  const toggleSpeedUnit = () => {
    const nextUnit: SpeedUnit = speedUnit === 'mbps' ? 'MBps' : 'mbps';
    setSpeedUnit(nextUnit);
    localStorage.setItem('speedtest_unit', nextUnit);
  };

  // Test Duration state (seconds)
  const [testDuration, setTestDuration] = useState<TestDurationOption>(() => {
    const saved = localStorage.getItem('speedtest_duration');
    return saved ? (Number(saved) as TestDurationOption) : 10;
  });

  const handleDurationChange = (dur: TestDurationOption) => {
    setTestDuration(dur);
    localStorage.setItem('speedtest_duration', String(dur));
  };

  // Client Network & IP state
  const [clientNetwork, setClientNetwork] = useState<ClientNetworkDetails>({
    ip: 'Detecting...',
    ipVersion: 'IPv4',
    isp: 'Detecting ISP...',
    city: 'Detecting',
    region: '',
    country: 'Online',
    countryCode: 'NET',
    flag: '🌐',
    isLoaded: false,
    isLoading: true,
  });

  const loadNetworkDetails = async () => {
    setClientNetwork((prev) => ({ ...prev, isLoading: true }));
    const details = await fetchClientNetworkInfo();
    setClientNetwork(details);
  };

  useEffect(() => {
    loadNetworkDetails();
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

    engineRef.current?.start(activeServer, testDuration);
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
          ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white'
          : 'bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white'
      }`}
    >
      {/* Splash Screen on Initial Load */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Navigation Header */}
      <header
        className={`sticky top-0 z-30 w-full border-b backdrop-blur-xl transition-colors ${
          activeTheme === 'dark'
            ? 'bg-slate-950/85 border-slate-800/80 shadow-lg shadow-black/20'
            : 'bg-white/90 border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name: Speed Test by Sanjid */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-white/20">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Speed Test by Sanjid
              </h1>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest hidden sm:inline">
                PRO
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Server Selector */}
            <ServerSelector
              activeServer={activeServer}
              onServerChange={setActiveServer}
              disabled={isTesting}
              theme={activeTheme}
            />

            {/* Network Online Status Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                isOnline
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
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
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-4 sm:py-6 max-w-4xl w-full mx-auto space-y-5">
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

        {/* 1st: Speed Test Meter (Car Speedometer Instrument Cluster) */}
        <div className="w-full flex flex-col items-center">
          <SpeedGauge
            stage={stage}
            currentValue={currentLiveValue}
            downloadValue={downloadValue}
            uploadValue={uploadValue}
            pingValue={pingValue}
            jitterValue={jitterValue}
            unit={speedUnit}
            onToggleUnit={toggleSpeedUnit}
            duration={testDuration}
            onChangeDuration={handleDurationChange}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
            theme={activeTheme}
          />
        </div>

        {/* Stage Step Indicator (Visible when testing) */}
        {isTesting && (
          <div className="w-full max-w-md flex flex-col items-center gap-2 animate-fade-in">
            <div className="flex items-center justify-between w-full text-[11px] font-semibold tracking-wider uppercase text-slate-400 px-2">
              <span className={stage === 'testing_ping' || stage === 'testing_jitter' ? 'text-red-400 font-bold' : ''}>
                1. Latency
              </span>
              <span className={stage === 'testing_download' ? 'text-cyan-400 font-bold' : ''}>
                2. Download
              </span>
              <span className={stage === 'testing_upload' ? 'text-amber-400 font-bold' : ''}>
                3. Upload
              </span>
              <span className={stage === 'calculating_results' ? 'text-purple-400 font-bold' : ''}>
                4. Analysis
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 transition-all duration-300"
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

        {/* Live Metrics Quick Bar during active test */}
        {isTesting && (
          <div
            className={`w-full max-w-xl grid grid-cols-4 gap-2 p-3 rounded-2xl border text-center animate-fade-in ${
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
                {jitterValue > 0 ? `±${jitterValue} ms` : '--'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-cyan-400">Download</span>
              <span className="font-mono text-sm sm:text-base font-bold text-cyan-400">
                {downloadValue > 0 ? `${formatSpeedValue(downloadValue, speedUnit, 1)} ${getUnitLabel(speedUnit)}` : '--'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-red-400">Upload</span>
              <span className="font-mono text-sm sm:text-base font-bold text-red-400">
                {uploadValue > 0 ? `${formatSpeedValue(uploadValue, speedUnit, 1)} ${getUnitLabel(speedUnit)}` : '--'}
              </span>
            </div>
          </div>
        )}

        {/* 2nd: Test Server Selection (BDIX, GGC, FNA, IIG, Global CDN) */}
        <div className="w-full flex justify-center">
          <NetworkRouteSelector
            activeServer={activeServer}
            onServerSelect={setActiveServer}
            disabled={isTesting}
            theme={activeTheme}
          />
        </div>

        {/* 3rd: Network Identity Box (ISP Name, Public IP, IPv4/IPv6, Location) */}
        <div className="w-full max-w-2xl">
          <ClientNetworkCard
            networkInfo={clientNetwork}
            onRefresh={loadNetworkDetails}
            theme={activeTheme}
          />
        </div>



        {/* Completed Result Card */}
        {stage === 'completed' && latestResult && (
          <div className="w-full flex justify-center animate-fade-in">
            <ResultCard result={latestResult} unit={speedUnit} theme={activeTheme} />
          </div>
        )}

        {/* Dedicated Game Ping Tester Section (PUBG, eFootball, Valorant, CoD, Free Fire, Valve) */}
        <div className="w-full max-w-2xl">
          <GamePingTester theme={activeTheme} />
        </div>

        {/* Test History */}
        <div className="w-full flex justify-center">
          <TestHistory
            history={historyList}
            unit={speedUnit}
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
              Speed Test by Sanjid • Multi-Path Architecture
            </h4>
          </div>
          <div className="text-xs space-y-2 leading-relaxed text-slate-400">
            <p>
              • <strong className="text-cyan-300">Global Anycast CDN:</strong> Tests worldwide Anycast points-of-presence (Cloudflare, Fastly) for global web browsing and streaming.
            </p>
            <p>
              • <strong className="text-emerald-300">Local BDIX (Bangladesh):</strong> Measures direct domestic peering latency and bandwidth across Dhaka & Chittagong IXP cores, AmberIT, Carnival, and Link3 without submarine cable hops.
            </p>
            <p>
              • <strong className="text-rose-300">Google Global Cache (GGC):</strong> Tests local ISP caching appliances for YouTube 4K, Google Play, and Google Workspace.
            </p>
            <p>
              • <strong className="text-blue-300">Facebook Network Appliance (FNA):</strong> Tests intra-ISP Meta peering caches for Instagram Reels, Facebook HD video, and WhatsApp media.
            </p>
            <p>
              • <strong className="text-amber-300">International Gateway (IIG):</strong> Benchmarks international upstream submarine cable transit (SMW-4, SMW-5) and cross-border ITC links.
            </p>
            <p>
              • <strong className="text-purple-300">Esports Game Radar:</strong> Live multi-region TCP-syn ping & jitter telemetry for PUBG Mobile, eFootball, Valorant, Call of Duty, Free Fire, and Valve servers.
            </p>
          </div>
        </section>
      </main>

      {/* Website Footer with Branding */}
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
            <span className="font-bold tracking-tight text-slate-200">Speed Test by Sanjid</span>
            <span className="text-slate-600">|</span>
            <span>Created by Sanjid</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Dynamic Duration Control</span>
            <span>•</span>
            <span>Mbps / MBps Switcher</span>
            <span>•</span>
            <span>Game Ping Radar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
