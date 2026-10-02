import { ClientNetworkDetails } from '../types/speedtest';

const STORAGE_KEY_IP_CACHE = 'speedtest_client_ip_cache';

export async function fetchClientNetworkInfo(): Promise<ClientNetworkDetails> {
  // Check session storage first for instant load
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY_IP_CACHE);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.ip) {
        // Return cached but proceed to revalidate in background
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
        const details: ClientNetworkDetails = {
          ip: ipStr,
          ipVersion: isV6 ? 'IPv6' : 'IPv4',
          isp: data.connection?.isp || data.connection?.org || 'Broadband ISP',
          asn: data.connection?.asn ? `AS${data.connection.asn}` : undefined,
          org: data.connection?.org,
          city: data.city || 'Local Hub',
          region: data.region || '',
          country: data.country || 'Global',
          countryCode: (data.country_code || 'UN').toUpperCase(),
          flag: data.flag?.emoji || '🌐',
          latitude: data.latitude,
          longitude: data.longitude,
          isLoaded: true,
          isLoading: false,
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
        const details: ClientNetworkDetails = {
          ip: ipStr,
          ipVersion: isV6 ? 'IPv6' : 'IPv4',
          isp: data.org || data.asn || 'Internet Provider',
          asn: data.asn,
          city: data.city || 'Local',
          region: data.region || '',
          country: data.country_name || 'Global',
          countryCode: (data.country_code || 'UN').toUpperCase(),
          flag: '🌐',
          latitude: data.latitude,
          longitude: data.longitude,
          isLoaded: true,
          isLoading: false,
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
      return {
        ip: ipStr,
        ipVersion: isV6 ? 'IPv6' : 'IPv4',
        isp: 'Local Internet Service Provider',
        city: 'Nearby',
        region: '',
        country: 'Connected',
        countryCode: 'NET',
        flag: '🌐',
        isLoaded: true,
        isLoading: false,
      };
    }
  } catch {
    // Error state
  }

  return {
    ip: 'Unknown IP',
    ipVersion: 'IPv4',
    isp: 'Detected Network Gateway',
    city: 'Local',
    region: '',
    country: 'Online',
    countryCode: 'NET',
    flag: '🌐',
    isLoaded: false,
    isLoading: false,
    error: 'Could not fetch external IP details',
  };
}
