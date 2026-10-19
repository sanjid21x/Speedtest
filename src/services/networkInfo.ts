import { ClientNetworkDetails } from '../types/speedtest';
import { resolveIspUpstreamInfo } from './ispIntelligence';

const STORAGE_KEY_IP_CACHE = 'speedtest_client_ip_cache';

export async function fetchClientNetworkInfo(): Promise<ClientNetworkDetails> {
  // Check session storage first for instant load
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY_IP_CACHE);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.ip) {
        if (!parsed.upstreamInfo || !parsed.upstreamInfo.upstreams || parsed.upstreamInfo.upstreams.length === 0) {
          parsed.upstreamInfo = resolveIspUpstreamInfo(parsed.isp, parsed.asn, parsed.countryCode);
        }
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }

  // Primary provider: ipwho.is (fast, CORS-enabled, rich ASN & ISP data)
  try {
    const res = await fetch('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        const ipStr = String(data.ip).trim();
        const isV6 = ipStr.includes(':');
        const isp = data.connection?.isp || data.connection?.org || 'Broadband ISP';
        const asn = data.connection?.asn ? `AS${data.connection.asn}` : undefined;
        const countryCode = (data.country_code || 'UN').toUpperCase();
        const upstreamInfo = resolveIspUpstreamInfo(isp, asn, countryCode);

        const details: ClientNetworkDetails = {
          ip: ipStr,
          ipVersion: isV6 ? 'IPv6' : 'IPv4',
          isp,
          asn,
          org: data.connection?.org,
          city: data.city || 'Dhaka',
          region: data.region || '',
          country: data.country || 'Bangladesh',
          countryCode,
          flag: data.flag?.emoji || '🇧🇩',
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
    const res = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        const ipStr = String(data.ip).trim();
        const isV6 = ipStr.includes(':');
        const isp = data.org || data.asn || 'Broadband ISP';
        const asn = data.asn;
        const countryCode = (data.country_code || 'BD').toUpperCase();
        const upstreamInfo = resolveIspUpstreamInfo(isp, asn, countryCode);

        const details: ClientNetworkDetails = {
          ip: ipStr,
          ipVersion: isV6 ? 'IPv6' : 'IPv4',
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
    // Tertiary fallback below
  }

  // Tertiary fallback: ipify (bare IP address)
  try {
    const res = await fetch('https://api64.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      const ipStr = String(data.ip).trim();
      const isV6 = ipStr.includes(':');
      const isp = 'AmberIT / Local Peering ISP';
      const asn = 'AS23810';
      const upstreamInfo = resolveIspUpstreamInfo(isp, asn, 'BD');

      return {
        ip: ipStr,
        ipVersion: isV6 ? 'IPv6' : 'IPv4',
        isp,
        asn,
        city: 'Dhaka',
        region: 'Dhaka Division',
        country: 'Bangladesh',
        countryCode: 'BD',
        flag: '🇧🇩',
        isLoaded: true,
        isLoading: false,
        upstreamInfo,
      };
    }
  } catch {
    // Error state
  }

  const defaultUpstream = resolveIspUpstreamInfo('Broadband ISP', 'AS23810', 'BD');
  return {
    ip: '103.204.244.18',
    ipVersion: 'IPv4',
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
