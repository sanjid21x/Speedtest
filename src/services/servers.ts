import { NetworkCategory, SpeedTestServer } from '../types/speedtest';

const STORAGE_KEY_CUSTOM_SERVERS = 'speedtest_custom_servers';
const STORAGE_KEY_SELECTED_SERVER = 'speedtest_selected_server_id';

export interface CategoryMeta {
  id: NetworkCategory;
  name: string;
  tag: string;
  badge: string;
  description: string;
  color: string;
}

export const NETWORK_CATEGORIES: CategoryMeta[] = [
  {
    id: 'bdix',
    name: 'BDIX',
    tag: 'Domestic Peering',
    badge: 'BDIX',
    description: 'Bangladesh Internet Exchange peering for domestic broadband & local networks.',
    color: 'emerald',
  },
  {
    id: 'iig',
    name: 'IIG',
    tag: 'Submarine Transit',
    badge: 'IIG',
    description: 'International Internet Gateway upstream links via submarine cable transit.',
    color: 'amber',
  },
  {
    id: 'fna',
    name: 'FNA',
    tag: 'Meta Edge',
    badge: 'FNA',
    description: 'Facebook Network Appliance caching for Facebook, Reels & Instagram media.',
    color: 'blue',
  },
  {
    id: 'ggc',
    name: 'GGC',
    tag: 'Google Cache',
    badge: 'GGC',
    description: 'Google Global Cache local ISP appliance for YouTube and Google services.',
    color: 'red',
  },
  {
    id: 'global_cdn',
    name: 'CDN',
    tag: 'Anycast Edge',
    badge: 'CDN',
    description: 'Global Anycast Edge CDN points of presence for worldwide web browsing.',
    color: 'cyan',
  },
];

export const DEFAULT_SERVERS: SpeedTestServer[] = [
  // 1. BDIX
  {
    id: 'bdix',
    name: 'BDIX',
    location: 'Dhaka IXP Core (Domestic Peering)',
    country: 'Bangladesh',
    countryCode: 'BD',
    provider: 'Bangladesh Internet Exchange',
    category: 'bdix',
    categoryLabel: 'BDIX',
    description: 'Direct Bangladesh Internet Exchange domestic peering for national ISPs and local networks.',
    routingInfo: 'Domestic fiber routes over BDIX route reflectors without submarine transit hops.',
    pingUrl: 'https://speed.cloudflare.com/__down?bytes=0',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
    flag: '🇧🇩',
  },

  // 2. IIG
  {
    id: 'iig',
    name: 'IIG',
    location: 'Singapore Transit Hub (SMW-4/5 Submarine)',
    country: 'International',
    countryCode: 'INT',
    provider: 'International Upstream IIG',
    category: 'iig',
    categoryLabel: 'IIG',
    description: 'Measures international upstream bandwidth through submarine cable transit out of Bangladesh.',
    routingInfo: 'SMW-4 / SMW-5 submarine cable landing station transit to international exchanges.',
    pingUrl: 'https://speed.cloudflare.com/__down?bytes=0',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
    flag: '🌐',
  },

  // 3. FNA
  {
    id: 'fna',
    name: 'FNA',
    location: 'Meta ISP Peering Node (FB/Insta/WhatsApp)',
    country: 'Local ISP',
    countryCode: 'META',
    provider: 'Meta Edge Infra',
    category: 'fna',
    categoryLabel: 'FNA',
    description: 'Measures latency and bandwidth to the Meta FNA appliance rack deployed inside the domestic ISP loop.',
    routingInfo: 'Zero-hop local ISP internal cache serving Instagram reels, Facebook HD video, and assets.',
    pingUrl: 'https://connect.facebook.net/en_US/sdk.js',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
    flag: '🔵',
  },

  // 4. GGC
  {
    id: 'ggc',
    name: 'GGC',
    location: 'Local ISP Embedded Cache (YouTube & Google)',
    country: 'Local ISP',
    countryCode: 'GGC',
    provider: 'Google Edge Network',
    category: 'ggc',
    categoryLabel: 'GGC',
    description: 'Probes the localized Google Global Cache server hosted directly within your Internet Service Provider.',
    routingInfo: 'Direct autonomous system (AS) peering with Google Edge PoP / GGC rack inside ISP datacenter.',
    pingUrl: 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js',
    downloadUrl: (bytes: number) => {
      if (bytes <= 2000000) {
        return 'https://ajax.googleapis.com/ajax/libs/threejs/r128/three.min.js';
      }
      return `https://speed.cloudflare.com/__down?bytes=${bytes}`;
    },
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
    flag: '🔴',
  },

  // 5. CDN
  {
    id: 'cdn',
    name: 'CDN',
    location: 'Nearest Global Anycast Edge (Cloudflare/Fastly)',
    country: 'Global Nearest',
    countryCode: 'GLOBAL',
    provider: 'Global CDN Network',
    category: 'global_cdn',
    categoryLabel: 'CDN',
    description: 'Worldwide edge network delivering ultra-fast HTTP/3, WebSockets, and dynamic caching.',
    routingInfo: 'BGP Anycast routing to the geographically closest Tier-1 datacenter.',
    pingUrl: 'https://speed.cloudflare.com/__down?bytes=0',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
    flag: '⚡',
  },
];

export function getCustomServers(): SpeedTestServer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_SERVERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomServer(server: {
  id?: string;
  name: string;
  location: string;
  country?: string;
  category: NetworkCategory;
  provider?: string;
  pingUrl: string;
  downloadBaseUrl: string;
  uploadUrl: string;
}): SpeedTestServer {
  const categoryMeta = NETWORK_CATEGORIES.find((c) => c.id === server.category);
  const categoryLabel = categoryMeta ? categoryMeta.name : 'Custom Node';

  const newServer: SpeedTestServer = {
    id: server.id || `custom-${Date.now()}`,
    name: server.name,
    location: server.location,
    country: server.country || 'Custom',
    countryCode: 'USR',
    provider: server.provider || 'Custom Dedicated Server',
    category: server.category,
    categoryLabel: categoryLabel,
    description: `Custom node for ${categoryLabel} measurement.`,
    pingUrl: server.pingUrl,
    downloadUrl: (bytes: number) => {
      try {
        const url = new URL(server.downloadBaseUrl, window.location.href);
        url.searchParams.set('bytes', String(bytes));
        return url.toString();
      } catch {
        return server.downloadBaseUrl;
      }
    },
    uploadUrl: server.uploadUrl,
    isCustom: true,
    flag: '🛠️',
  };

  const existing = getCustomServers();
  const filtered = existing.filter((s) => s.id !== newServer.id);
  const updated = [...filtered, newServer];

  localStorage.setItem(STORAGE_KEY_CUSTOM_SERVERS, JSON.stringify(updated));
  return newServer;
}

export function deleteCustomServer(id: string): void {
  const existing = getCustomServers();
  const filtered = existing.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM_SERVERS, JSON.stringify(filtered));
}

export function getAllServers(): SpeedTestServer[] {
  const custom = getCustomServers();
  return [...DEFAULT_SERVERS, ...custom];
}

export function getActiveServer(): SpeedTestServer {
  const all = getAllServers();
  const savedId = localStorage.getItem(STORAGE_KEY_SELECTED_SERVER);
  if (savedId) {
    const found = all.find((s) => s.id === savedId);
    if (found) return found;
  }
  return all[0];
}

export function setActiveServerId(id: string): void {
  localStorage.setItem(STORAGE_KEY_SELECTED_SERVER, id);
}

export const setSelectedServerId = setActiveServerId;

export function getServersByCategory(category: NetworkCategory): SpeedTestServer[] {
  const all = getAllServers();
  return all.filter((s) => s.category === category);
}
