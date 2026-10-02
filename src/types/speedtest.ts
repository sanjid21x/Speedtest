export type TestStage =
  | 'idle'
  | 'initializing'
  | 'choosing_endpoint'
  | 'testing_ping'
  | 'testing_jitter'
  | 'testing_download'
  | 'testing_upload'
  | 'calculating_results'
  | 'completed'
  | 'error';

export type NetworkCategory =
  | 'global_cdn'
  | 'bdix'
  | 'ggc'
  | 'fna'
  | 'iig'
  | 'custom';

export type SpeedUnit = 'mbps' | 'MBps'; // 'mbps' = Megabits/s (ISP rate), 'MBps' = Megabytes/s (download rate)

export type TestDurationOption = 5 | 10 | 15 | 20 | 30;

export interface SpeedTestServer {
  id: string;
  name: string;
  location: string;
  country: string;
  countryCode: string;
  provider: string;
  category: NetworkCategory;
  categoryLabel: string;
  description: string;
  pingUrl: string;
  downloadUrl: (bytes: number) => string;
  uploadUrl: string;
  isCustom?: boolean;
  routingInfo?: string;
  flag?: string;
}

export interface LatencyMetrics {
  samples: number[];
  min: number;
  avg: number;
  median: number;
  jitter: number;
}

export interface StreamProgress {
  bytesLoaded: number;
  instantMbps: number;
  averageMbps: number;
  progressPercent: number;
}

export interface SpeedTestResult {
  id: string;
  timestamp: number;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  server: {
    id: string;
    name: string;
    location: string;
    category?: NetworkCategory;
    categoryLabel?: string;
  };
  durationSeconds: number;
  networkInfo?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  deviceInfo?: {
    browser: string;
    os: string;
  };
}

export interface RouteProbeResult {
  server: SpeedTestServer;
  pingMs: number;
  jitterMs: number;
  status: 'idle' | 'testing' | 'success' | 'failed';
  downloadMbps?: number;
  error?: string;
}

export interface ClientNetworkDetails {
  ip: string;
  ipVersion: 'IPv4' | 'IPv6';
  isp: string;
  asn?: string;
  org?: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  flag?: string;
  latitude?: number;
  longitude?: number;
  isLoaded: boolean;
  isLoading: boolean;
  error?: string;
}

export type GameCategory = 'all' | 'pubg' | 'efootball' | 'valorant' | 'cod' | 'freefire' | 'valve';

export interface GameServerEndpoint {
  id: string;
  name: string;
  game: 'pubg' | 'efootball' | 'valorant' | 'cod' | 'freefire' | 'valve';
  gameName: string;
  region: string;
  location: string;
  countryCode: string;
  pingEndpoint: string;
  bannerColor: string;
  pingMs?: number;
  jitterMs?: number;
  status: 'idle' | 'testing' | 'success' | 'failed';
  quality?: 'elite' | 'great' | 'fair' | 'poor';
}

export type ThemeMode = 'dark' | 'light' | 'system';
