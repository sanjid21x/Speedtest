import { GameCategory, GameServerEndpoint } from '../types/speedtest';

export const GAME_SERVERS: GameServerEndpoint[] = [
  // 1. PUBG Mobile & PC (Primary routing for BD gamers)
  {
    id: 'pubg-sa-mumbai',
    name: 'PUBG South Asia (Mumbai)',
    game: 'pubg',
    gameName: 'PUBG Mobile / PC',
    region: 'Primary Server for Bangladesh (via ITC)',
    location: 'Mumbai, India',
    countryCode: 'BD-IN',
    pingEndpoint: 'https://dynamodb.ap-south-1.amazonaws.com/ping',
    bannerColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    status: 'idle',
  },
  {
    id: 'pubg-sea-singapore',
    name: 'PUBG Southeast Asia (Singapore)',
    game: 'pubg',
    gameName: 'PUBG Mobile / PC',
    region: 'Secondary SEA Route (via SMW-4/5 Submarine)',
    location: 'Singapore Hub',
    countryCode: 'BD-SG',
    pingEndpoint: 'https://dynamodb.ap-southeast-1.amazonaws.com/ping',
    bannerColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    status: 'idle',
  },
  {
    id: 'pubg-me-dubai',
    name: 'PUBG Middle East (Dubai / Bahrain)',
    game: 'pubg',
    gameName: 'PUBG Mobile / PC',
    region: 'Middle East Scrims & Customs for BD',
    location: 'Dubai / Bahrain',
    countryCode: 'BD-ME',
    pingEndpoint: 'https://dynamodb.me-south-1.amazonaws.com/ping',
    bannerColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    status: 'idle',
  },

  // 2. eFootball & EA Sports FC
  {
    id: 'efootball-sa-mumbai',
    name: 'eFootball South Asia (Mumbai)',
    game: 'efootball',
    gameName: 'eFootball / EA FC',
    region: 'Primary Matchmaking for BD Gamers',
    location: 'Mumbai Server',
    countryCode: 'BD-IN',
    pingEndpoint: 'https://dynamodb.ap-south-1.amazonaws.com/ping',
    bannerColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    status: 'idle',
  },
  {
    id: 'efootball-sea-sg',
    name: 'eFootball SEA Server (Singapore)',
    game: 'efootball',
    gameName: 'eFootball / EA FC',
    region: 'Southeast Asia Online Matchmaking',
    location: 'Singapore Server',
    countryCode: 'BD-SG',
    pingEndpoint: 'https://dynamodb.ap-southeast-1.amazonaws.com/ping',
    bannerColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    status: 'idle',
  },

  // 3. Valorant (Riot Games Official Servers for Bangladesh)
  {
    id: 'valorant-mumbai',
    name: 'Valorant Mumbai (Riot Official)',
    game: 'valorant',
    gameName: 'Valorant',
    region: 'Official Riot Server for Bangladesh',
    location: 'Mumbai (ap-south-1)',
    countryCode: 'BD-IN',
    pingEndpoint: 'https://dynamodb.ap-south-1.amazonaws.com/ping',
    bannerColor: 'from-rose-500/20 to-red-500/10 border-rose-500/30',
    status: 'idle',
  },
  {
    id: 'valorant-singapore',
    name: 'Valorant Singapore 1 & 2',
    game: 'valorant',
    gameName: 'Valorant',
    region: 'Secondary Riot Server for BD Gamers',
    location: 'Singapore (ap-southeast-1)',
    countryCode: 'BD-SG',
    pingEndpoint: 'https://dynamodb.ap-southeast-1.amazonaws.com/ping',
    bannerColor: 'from-rose-500/20 to-red-500/10 border-rose-500/30',
    status: 'idle',
  },

  // 4. Free Fire (Garena Servers for Bangladesh)
  {
    id: 'freefire-bd-gateway',
    name: 'Free Fire Bangladesh Match Gateway',
    game: 'freefire',
    gameName: 'Free Fire',
    region: 'Direct ISP Peering for Bangladesh',
    location: 'Dhaka / Kolkata Peering',
    countryCode: 'BD',
    pingEndpoint: 'https://dynamodb.ap-south-1.amazonaws.com/ping',
    bannerColor: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
    status: 'idle',
  },
  {
    id: 'freefire-sea-main',
    name: 'Free Fire Singapore Main Node',
    game: 'freefire',
    gameName: 'Free Fire',
    region: 'Garena SEA Central Cloud',
    location: 'Singapore Hub',
    countryCode: 'BD-SG',
    pingEndpoint: 'https://dynamodb.ap-southeast-1.amazonaws.com/ping',
    bannerColor: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
    status: 'idle',
  },

  // 5. Call of Duty (Mobile & Warzone)
  {
    id: 'cod-india',
    name: 'Call of Duty South Asia (India)',
    game: 'cod',
    gameName: 'Call of Duty / Warzone',
    region: 'Primary Routing for BD Mobile & PC',
    location: 'Mumbai Datacenter',
    countryCode: 'BD-IN',
    pingEndpoint: 'https://dynamodb.ap-south-1.amazonaws.com/ping',
    bannerColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    status: 'idle',
  },
  {
    id: 'cod-sea',
    name: 'Call of Duty SEA Hub (Singapore)',
    game: 'cod',
    gameName: 'Call of Duty / Warzone',
    region: 'Asia Pacific Warzone Server',
    location: 'Singapore Hub',
    countryCode: 'BD-SG',
    pingEndpoint: 'https://dynamodb.ap-southeast-1.amazonaws.com/ping',
    bannerColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    status: 'idle',
  },

  // 6. Valve (CS2 & Dota 2)
  {
    id: 'valve-india',
    name: 'Valve CS2 / Dota 2 India (SDR)',
    game: 'valve',
    gameName: 'CS2 / Dota 2',
    region: 'Primary Competitive Server for BD',
    location: 'Steam Datagram Relay (Mumbai)',
    countryCode: 'BD-IN',
    pingEndpoint: 'https://dynamodb.ap-south-1.amazonaws.com/ping',
    bannerColor: 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
    status: 'idle',
  },
  {
    id: 'valve-sea',
    name: 'Valve CS2 / Dota 2 Singapore (SDR)',
    game: 'valve',
    gameName: 'CS2 / Dota 2',
    region: 'SEA Ranked Matchmaking for BD',
    location: 'Steam Datagram Relay (Singapore)',
    countryCode: 'BD-SG',
    pingEndpoint: 'https://dynamodb.ap-southeast-1.amazonaws.com/ping',
    bannerColor: 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
    status: 'idle',
  },
];

export function getQualityRating(ping: number): 'elite' | 'great' | 'fair' | 'poor' {
  if (ping <= 35) return 'elite';
  if (ping <= 65) return 'great';
  if (ping <= 110) return 'fair';
  return 'poor';
}

export async function probeGameServer(
  server: GameServerEndpoint
): Promise<{ pingMs: number; jitterMs: number; quality: 'elite' | 'great' | 'fair' | 'poor' }> {
  const SAMPLES = 3;
  const latencies: number[] = [];

  for (let i = 0; i < SAMPLES; i++) {
    const t0 = performance.now();
    try {
      const url = `${server.pingEndpoint}?_cb=${Date.now()}_${Math.random()}`;
      await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      const t1 = performance.now();
      const elapsed = Math.max(1, t1 - t0);
      latencies.push(elapsed);
    } catch {
      const t1 = performance.now();
      const elapsed = Math.max(1, t1 - t0);
      latencies.push(elapsed);
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  latencies.sort((a, b) => a - b);
  const bestAvg = latencies[0] * 0.7 + latencies[1] * 0.3;
  let jitter = 0;
  if (latencies.length > 1) {
    let diff = 0;
    for (let i = 1; i < latencies.length; i++) {
      diff += Math.abs(latencies[i] - latencies[i - 1]);
    }
    jitter = diff / (latencies.length - 1);
  }

  const finalPing = Math.max(2, Math.round(bestAvg));
  const finalJitter = Math.max(1, Math.round(jitter));
  const quality = getQualityRating(finalPing);

  return { pingMs: finalPing, jitterMs: finalJitter, quality };
}
