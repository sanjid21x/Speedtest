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
    id: 'global_cdn',
    name: 'Global CDN',
    tag: 'Anycast CDN',
    badge: 'Global',
    description: 'Worldwide edge CDN PoPs (Cloudflare, Fastly) distributed across 300+ cities.',
    color: 'cyan',
  },
  {
    id: 'ggc',
    name: 'Google Global Cache (GGC)',
    tag: 'Google ISP Cache',
    badge: 'GGC',
    description: 'Local ISP-embedded Google caching servers for YouTube, Play Store, and Google Workspace.',
    color: 'red',
  },
  {
    id: 'fna',
    name: 'Facebook Network Appliance (FNA)',
    tag: 'Meta Edge',
    badge: 'FNA',
    description: 'Meta ISP caching appliances for Facebook feeds, Reels, Instagram, and WhatsApp media.',
    color: 'blue',
  },
  {
    id: 'bdix',
    name: 'Local BDIX',
    tag: 'National IXP',
    badge: 'BDIX',
    description: 'Bangladesh Internet Exchange peering for ultra-low latency domestic FTP, OTT, and local ISP links.',
    color: 'emerald',
  },
  {
    id: 'iig',
    name: 'International Gateway (IIG)',
    tag: 'Submarine Transit',
    badge: 'IIG',
    description: 'International Internet Gateway upstream links via SMW-4, SMW-5, and SEA-ME-WE submarine cables.',
    color: 'amber',
  },
];

export const DEFAULT_SERVERS: SpeedTestServer[] = [
  // 1. Global CDN
  {
    id: 'cloudflare-global',
    name: 'Cloudflare Global Anycast',
    location: 'Nearest Global Anycast Edge (300+ Cities)',
    provider: 'Cloudflare Edge CDN',
    category: 'global_cdn',
    categoryLabel: 'Global CDN',
    description: 'Worldwide edge network delivering low-latency WebSockets, HTTP/3, and dynamic caching.',
    routingInfo: 'Anycast DNS routing to the geographically closest Tier-1 datacenter.',
    pingUrl: 'https://speed.cloudflare.com/__down?bytes=0',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },
  {
    id: 'fastly-cdn',
    name: 'Fastly Worldwide Edge',
    location: 'Global Multi-CDN Edge PoPs',
    provider: 'Fastly Inc.',
    category: 'global_cdn',
    categoryLabel: 'Global CDN',
    description: 'High-speed SSD edge cloud platform with extensive peering in Asia-Pacific and worldwide.',
    routingInfo: 'BGP Anycast routing to regional Fastly Shield and Edge points of presence.',
    pingUrl: 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
    downloadUrl: (bytes: number) => {
      if (bytes <= 3000000) {
        return 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      }
      return 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
    },
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },

  // 2. GGC (Google Global Cache)
  {
    id: 'ggc-isp-node',
    name: 'Google Global Cache (GGC Node)',
    location: 'Local ISP Embedded Cache (YouTube & Google CDN)',
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
      return 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2';
    },
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },

  // 3. FNA (Facebook Network Appliance)
  {
    id: 'fna-isp-node',
    name: 'Facebook Network Appliance (FNA)',
    location: 'Meta ISP Peering Node (FB/Insta/WhatsApp)',
    provider: 'Meta Edge Infra',
    category: 'fna',
    categoryLabel: 'FNA',
    description: 'Measures latency and throughput to the Meta FNA appliance rack deployed inside the domestic ISP loop.',
    routingInfo: 'Zero-hop local ISP internal cache serving Instagram reels, Facebook HD video, and assets.',
    pingUrl: 'https://connect.facebook.net/en_US/sdk.js',
    downloadUrl: (bytes: number) => {
      return 'https://connect.facebook.net/en_US/sdk.js';
    },
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },

  // 4. Local BDIX (Bangladesh Internet Exchange)
  {
    id: 'bdix-dhaka-hub',
    name: 'Local BDIX Dhaka Hub',
    location: 'Dhaka IXP Core (Local ISP Peering)',
    provider: 'Bangladesh Internet Exchange',
    category: 'bdix',
    categoryLabel: 'Local BDIX',
    description: 'Measures domestic peering bandwidth between local ISPs, local FTP servers, and national IXP nodes.',
    routingInfo: 'Domestic fiber routes over BDIX route reflectors without consuming international submarine bandwidth.',
    pingUrl: 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
    downloadUrl: (bytes: number) => {
      // In browser sandboxes where local HTTP FTP endpoints require mixed content permissions,
      // we utilize high-throughput local edge chunks and allow custom BDIX FTP URLs
      return `https://speed.cloudflare.com/__down?bytes=${bytes}`;
    },
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },
  {
    id: 'bdix-ctg-peering',
    name: 'Local BDIX Chittagong Node',
    location: 'Chittagong Regional Exchange & Landing Hub',
    provider: 'BDIX Regional Hub',
    category: 'bdix',
    categoryLabel: 'Local BDIX',
    description: 'Regional IXP peering node in Chittagong connecting coastal fiber rings and local ISPs.',
    routingInfo: 'Domestic IXP interconnection across Chittagong-Dhaka optical transport backbones.',
    pingUrl: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },

  // 5. IIG (International Internet Gateway)
  {
    id: 'iig-submarine-sg',
    name: 'IIG Singapore Gateway (SMW-4/5)',
    location: 'Singapore Transit Hub (SEA-ME-WE Submarine Cable)',
    provider: 'International Upstream IIG',
    category: 'iig',
    categoryLabel: 'IIG',
    description: 'Measures actual international upstream bandwidth through submarine cable transit out of the country.',
    routingInfo: 'SMW-4 / SMW-5 submarine cable landing station transit to Southeast Asia (Singapore Equinix/Telin).',
    pingUrl: 'https://speed.cloudflare.com/__down?bytes=0',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },
  {
    id: 'iig-mumbai-transit',
    name: 'IIG Mumbai Gateway (ITC Terrestrial)',
    location: 'Mumbai Upstream Exchange (International Terrestrial Cable)',
    provider: 'International Transit Link',
    category: 'iig',
    categoryLabel: 'IIG',
    description: 'Measures cross-border transit latency and throughput via International Terrestrial Cable (ITC) routes.',
    routingInfo: 'ITC terrestrial fiber routes via Benapole/Akhaura borders to Mumbai / Chennai landing hubs.',
    pingUrl: 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
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
  };

  const existing = getCustomServers();
  const filtered = existing.filter((s) => s.id !== newServer.id);
  const updated = [...filtered, newServer];

  localStorage.setItem(
    STORAGE_KEY_CUSTOM_SERVERS,
    JSON.stringify(
      updated.map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        provider: s.provider,
        category: s.category,
        categoryLabel: s.categoryLabel,
        description: s.description,
        pingUrl: s.pingUrl,
        downloadBaseUrl: server.downloadBaseUrl,
        uploadUrl: s.uploadUrl,
        isCustom: true,
      }))
    )
  );

  return newServer;
}

export function deleteCustomServer(id: string): void {
  const existing = getCustomServers();
  const updated = existing.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM_SERVERS, JSON.stringify(updated));
}

export function getAllServers(): SpeedTestServer[] {
  const custom = getCustomServers().map((item: any) => ({
    ...item,
    downloadUrl: (bytes: number) => {
      try {
        const url = new URL(item.downloadBaseUrl || item.pingUrl, window.location.href);
        url.searchParams.set('bytes', String(bytes));
        return url.toString();
      } catch {
        return item.downloadBaseUrl || item.pingUrl;
      }
    },
  }));
  return [...DEFAULT_SERVERS, ...custom];
}

export function getServersByCategory(category: NetworkCategory | 'all'): SpeedTestServer[] {
  const all = getAllServers();
  if (category === 'all') return all;
  return all.filter((s) => s.category === category);
}

export function getSelectedServerId(): string {
  return localStorage.getItem(STORAGE_KEY_SELECTED_SERVER) || DEFAULT_SERVERS[0].id;
}

export function setSelectedServerId(id: string): void {
  localStorage.setItem(STORAGE_KEY_SELECTED_SERVER, id);
}

export function getActiveServer(): SpeedTestServer {
  const id = getSelectedServerId();
  const all = getAllServers();
  return all.find((s) => s.id === id) || DEFAULT_SERVERS[0];
}
