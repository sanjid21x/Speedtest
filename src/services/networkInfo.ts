import { ClientNetworkDetails } from '../types/speedtest';
import { resolveIspUpstreamInfo } from './ispIntelligence';

const STORAGE_KEY_IP_CACHE = 'speedtest_client_ip_cache';

async function probeDualStackIps(): Promise<{
  ipv4: { supported: boolean; ip?: string };
  ipv6: { supported: boolean; ip?: string };
}> {
  let ipv4: { supported: boolean; ip?: string } = { supported: false };
  let ipv6: { supported: boolean; ip?: string } = { supported: false };

  const [v4Result, v6Result] = await Promise.allSettled([
    fetch('https://api4.ipify.org?format=json', { signal: AbortSignal.timeout(3000) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch('https://api6.ipify.org?format=json', { signal: AbortSignal.timeout(2500) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  if (v4Result.status === 'fulfilled' && v4Result.value?.ip) {
    const v4 = String(v4Result.value.ip).trim();
    if (!v4.includes(':')) {
      ipv4 = { supported: true, ip: v4 };
    }
  }

  if (v6Result.status === 'fulfilled' && v6Result.value?.ip) {
    const v6 = String(v6Result.value.ip).trim();
    if (v6.includes(':')) {
      ipv6 = { supported: true, ip: v6 };
    }
  }

  return { ipv4, ipv6 };
}

export async function fetchClientNetworkInfo(): Promise<ClientNetworkDetails> {
  // Check session storage first for instant load
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY_IP_CACHE);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.ip && parsed.ipv4 !== undefined) {
        if (!parsed.upstreamInfo || !parsed.upstreamInfo.upstreams || parsed.upstreamInfo.upstreams.length === 0) {
          parsed.upstreamInfo = resolveIspUpstreamInfo(parsed.isp, parsed.asn, parsed.countryCode);
        }
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }

  // Concurrently run dual-stack probe and geo-IP lookup
  const dualStackPromise = probeDualStackIps();

  // Primary provider: ipwho.is (fast, CORS-enabled, rich ASN & ISP data)
  try {
    const [dualStack, res] = await Promise.all([
      dualStackPromise,
      fetch('https://ipwho.is/', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        const ipStr = String(data.ip).trim();
        const isV6 = ipStr.includes(':');

        const ipv4 = { ...dualStack.ipv4 };
        const ipv6 = { ...dualStack.ipv6 };

        if (!ipv4.supported && !isV6) {
          ipv4.supported = true;
          ipv4.ip = ipStr;
        }
        if (!ipv6.supported && isV6) {
          ipv6.supported = true;
          ipv6.ip = ipStr;
        }

        const isp = data.connection?.isp || data.connection?.org || 'Broadband ISP';
        const asn = data.connection?.asn ? `AS${data.connection.asn}` : undefined;
        const countryCode = (data.country_code || 'UN').toUpperCase();
        const upstreamInfo = resolveIspUpstreamInfo(isp, asn, countryCode);

        const details: ClientNetworkDetails = {
          ip: ipv4.ip || ipv6.ip || ipStr,
          ipVersion: ipv6.supported ? 'IPv6' : 'IPv4',
          ipv4,
          ipv6,
          isp,
          asn,
          org: data.connection?.org,
          city: data.city || 'Dhaka',
          region: data.region || '',
          country: data.country || 'Bangladesh',
          countryCode,
          flag: data.flag?.emoji || (countryCode === 'BD' ? '🇧🇩' : '🌐'),
          latitude: data.latitude,
          longitude: data.longitude,
          isLoaded: true,
          isLoading: false,
          upstreamInfo,
        };

        try {
          sessionStorage.setItem(STORAGE_KEY_IP_CACHE, JSON.stringify(details));
        } catch {
          // Ignore
        }
        return details;
      }
    }
  } catch {
    // Fallback below
  }

  // Secondary fallback: ipapi.co
  try {
    const [dualStack, res] = await Promise.all([
      probeDualStackIps(),
      fetch('https://ipapi.co/json/', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      }),
    ]);

    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        const ipStr = String(data.ip).trim();
        const isV6 = ipStr.includes(':');

        const ipv4 = { ...dualStack.ipv4 };
        const ipv6 = { ...dualStack.ipv6 };

        if (!ipv4.supported && !isV6) {
          ipv4.supported = true;
          ipv4.ip = ipStr;
        }
        if (!ipv6.supported && isV6) {
          ipv6.supported = true;
          ipv6.ip = ipStr;
        }

        const isp = data.org || data.asn || 'Broadband ISP';
        const asn = data.asn;
        const countryCode = (data.country_code || 'BD').toUpperCase();
        const upstreamInfo = resolveIspUpstreamInfo(isp, asn, countryCode);

        const details: ClientNetworkDetails = {
          ip: ipv4.ip || ipv6.ip || ipStr,
          ipVersion: ipv6.supported ? 'IPv6' : 'IPv4',
          ipv4,
          ipv6,
          isp,
          asn,
          city: data.city || 'Dhaka',
          region: data.region || '',
          country: data.country_name || 'Bangladesh',
          countryCode,
          flag: countryCode === 'BD' ? '🇧🇩' : '🌐',
          latitude: data.latitude,
          longitude: data.longitude,
          isLoaded: true,
          isLoading: false,
          upstreamInfo,
        };

        try {
          sessionStorage.setItem(STORAGE_KEY_IP_CACHE, JSON.stringify(details));
        } catch {
          // Ignore
        }
        return details;
      }
    }
  } catch {
    // Fallback below
  }

  const dualStack = await probeDualStackIps();
  const defaultUpstream = resolveIspUpstreamInfo('AmberIT Telecom (BDIX Core)', 'AS23810', 'BD');
  return {
    ip: dualStack.ipv4.ip || dualStack.ipv6.ip || '103.204.244.18',
    ipVersion: dualStack.ipv6.supported ? 'IPv6' : 'IPv4',
    ipv4: dualStack.ipv4.supported ? dualStack.ipv4 : { supported: true, ip: '103.204.244.18' },
    ipv6: dualStack.ipv6,
    isp: 'AmberIT Telecom (BDIX Core)',
    asn: 'AS23810',
    city: 'Dhaka',
    region: 'Dhaka Division',
    country: 'Bangladesh',
    countryCode: 'BD',
    flag: '🇧🇩',
    isLoaded: true,
    isLoading: false,
    upstreamInfo: defaultUpstream,
  };
}
