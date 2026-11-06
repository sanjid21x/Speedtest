import {
  IspUpstreamInfo,
  NetworkCategory,
  BackendRouteHop,
  ClientNetworkDetails,
  SpeedTestServer,
  IpTestProtocol,
} from '../types/speedtest';

export interface KnownIspProfile {
  asnList: string[];
  nameKeywords: string[];
  upstreams: string[];
  routeChannels: string[];
  totalBandwidth: string;
}

export const KNOWN_ISP_PROFILES: KnownIspProfile[] = [
  {
    asnList: ['AS23810'],
    nameKeywords: ['amber', 'amberit', 'amber it'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Tata Communications Global (AS6453)',
    ],
    routeChannels: [
      'BDIX National IXP Core (100G Peering Ring)',
      'Google GGC & Meta FNA In-Rack Caches',
      'SMW-4 & SMW-5 Submarine Optical Fiber',
      'Benapole-Petrapole ITC Terrestrial Link',
    ],
    totalBandwidth: '~380 Gbps Core Backbone Capacity',
  },
  {
    asnList: ['AS58715'],
    nameKeywords: ['carnival', 'systems solutions', 'ssl'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Mango Teleservices IIG (AS24389)',
    ],
    routeChannels: [
      'BDIX National Peering Fabric (100G)',
      'Direct YouTube 4K GGC Appliance Rack',
      'Meta FNA Video & Reels Edge Cluster',
      'Dual Submarine IIG Landing Transit',
    ],
    totalBandwidth: '~420 Gbps Total Network Capacity',
  },
  {
    asnList: ['AS17494'],
    nameKeywords: ['link3', 'link-3', 'link three'],
    upstreams: [
      'Summit Communications (AS58682)',
      'Fiber@Home Ltd (AS45788)',
      'Novocom Limited (AS58700)',
      'Bharti Airtel Global (AS9498)',
    ],
    routeChannels: [
      'BDIX Direct Core Optical Interconnect',
      'GGC Google Cache & Meta FNA Edge Appliances',
      'SEA-ME-WE 4 & 5 Submarine Optical Gateway',
      'Terrestrial ITC Backup Cross-Border Link',
    ],
    totalBandwidth: '~550 Gbps Core Backbone Capacity',
  },
  {
    asnList: ['AS24389'],
    nameKeywords: ['grameenphone', 'gp', 'telenor'],
    upstreams: [
      'Telenor Global Carrier (AS6730)',
      'Bharti Airtel Global (AS9498)',
      'Tata Communications (AS6453)',
      'Summit Communications (AS58682)',
    ],
    routeChannels: [
      'Nationwide High-Speed BDIX Peering Ring',
      'Google GGC Multi-Node Edge Distribution',
      'Meta FNA Distributed Appliance Core',
      'Tier-1 Global International Internet Gateway (IIG)',
    ],
    totalBandwidth: '~1.4 Tbps Aggregated Core Backbone',
  },
  {
    asnList: ['AS132060'],
    nameKeywords: ['banglalink', 'veon'],
    upstreams: [
      'Summit Communications (AS58682)',
      'Fiber@Home Ltd (AS45788)',
      'VEON Global Backbone (AS43513)',
    ],
    routeChannels: [
      'BDIX National Metro Peering Loop',
      'GGC YouTube Video Cache Appliance',
      'Meta FNA Video Streaming Cluster',
      'Submarine Gateway SMW-5 Transit',
    ],
    totalBandwidth: '~850 Gbps Core Network Capacity',
  },
  {
    asnList: ['AS132061'],
    nameKeywords: ['robi', 'airtel bd', 'axiom'],
    upstreams: [
      'Summit Communications (AS58682)',
      'Fiber@Home Ltd (AS45788)',
      'Axiata Global Carrier (AS4637)',
    ],
    routeChannels: [
      'BDIX Direct Domestic Peering Ring',
      'Google GGC In-Network Edge Node',
      'Meta FNA Facebook CDN Rack',
      'International Submarine Gateway Route',
    ],
    totalBandwidth: '~920 Gbps Aggregated Transit Capacity',
  },
  {
    asnList: ['AS63959'],
    nameKeywords: ['dot internet', 'dot', 'dotinternet'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Novocom Limited (AS58700)',
    ],
    routeChannels: [
      'BDIX Gigabit Peering Switch',
      'GGC Google Global Cache (10G Direct)',
      'Meta FNA Appliance Rack (10G)',
      'IIG International Optical Gateway',
    ],
    totalBandwidth: '~210 Gbps Aggregated Capacity',
  },
  {
    asnList: ['AS133661'],
    nameKeywords: ['triangle', 'triangle services'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Level3/Lumen IIG Transit (AS3356)',
    ],
    routeChannels: [
      'BDIX Peering Exchange Port',
      'Local GGC / FNA Dedicated Cache Farm',
      'Submarine International Transit',
    ],
    totalBandwidth: '~160 Gbps Core Backbone',
  },
  {
    asnList: ['AS136971'],
    nameKeywords: ['mazeda', 'mazeda networks'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Mango Teleservices IIG (AS24389)',
    ],
    routeChannels: [
      'BDIX Domestic Exchange Port',
      'GGC Local ISP Video Cache Node',
      'Meta FNA Edge Content Server',
      'International Submarine IIG Route',
    ],
    totalBandwidth: '~180 Gbps Backbone Capacity',
  },
  {
    asnList: ['AS9230'],
    nameKeywords: ['bdcom', 'bdcom online'],
    upstreams: [
      'Summit Communications (AS58682)',
      'Fiber@Home Ltd (AS45788)',
      'Tata Communications (AS6453)',
    ],
    routeChannels: [
      'BDIX Pioneer Domestic Peering Fabric',
      'GGC Google YouTube Edge Appliance',
      'FNA Facebook Fastlane Delivery',
      'International Gateway Dual Landing Transit',
    ],
    totalBandwidth: '~290 Gbps Total Backbone',
  },
  {
    asnList: ['AS131883'],
    nameKeywords: ['samonline', 'sam online'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Novocom IIG (AS58700)',
    ],
    routeChannels: [
      'BDIX Exchange Port Connection',
      'Google GGC & Meta FNA Appliance Racks',
      'Dual Submarine Gateway Interconnect',
    ],
    totalBandwidth: '~175 Gbps Core Capacity',
  },
  {
    asnList: ['AS136965'],
    nameKeywords: ['ks network', 'ksnetwork'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Mango Teleservices IIG (AS24389)',
    ],
    routeChannels: [
      'BDIX Direct Peering Fabric',
      'GGC YouTube 4K Local Appliance',
      'Meta FNA In-Network Server Node',
      'IIG International Fiber Link',
    ],
    totalBandwidth: '~130 Gbps Backbone Capacity',
  },
  {
    asnList: ['AS135594'],
    nameKeywords: ['antaranga', 'antaranga dot com'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Novocom Limited (AS58700)',
    ],
    routeChannels: [
      'BDIX Peering Ring (Mohakhali)',
      'GGC Video Cache Cluster',
      'Meta FNA Content Delivery Cluster',
      'International Submarine Transit',
    ],
    totalBandwidth: '~140 Gbps Core Capacity',
  },
  {
    asnList: ['AS38766'],
    nameKeywords: ['adn telecom', 'adn'],
    upstreams: [
      'Summit Communications (AS58682)',
      'Fiber@Home Ltd (AS45788)',
      'Tata Communications (AS6453)',
    ],
    routeChannels: [
      'BDIX Domestic Exchange Core',
      'GGC / FNA Enterprise Cache Nodes',
      'Submarine SMW-4/5 Gateway Transit',
    ],
    totalBandwidth: '~240 Gbps Core Backbone',
  },
  {
    asnList: ['AS23689'],
    nameKeywords: ['bracnet', 'brac net'],
    upstreams: [
      'Fiber@Home Ltd (AS45788)',
      'Summit Communications (AS58682)',
      'Novocom Limited (AS58700)',
    ],
    routeChannels: [
      'BDIX Peering Switch Port',
      'GGC Edge CDN Cache Rack',
      'Submarine Cable SMW-4/5 Links',
    ],
    totalBandwidth: '~150 Gbps Core Backbone',
  },
  {
    asnList: ['AS24560'],
    nameKeywords: ['btcl', 'bangladesh telecommunications', 'telecom company'],
    upstreams: [
      'Bharti Airtel Global (AS9498)',
      'Tata Communications (AS6453)',
      'Telecom Italia Sparkle (AS6762)',
    ],
    routeChannels: [
      'BDIX Primary National Peering Node (BTCL Datacenter)',
      'National Optical Backbone (Trans-Country Fiber)',
      'Direct Submarine Cable Landing Station (Cox’s Bazar & Kuakata)',
      'ITC Cross-Border Terrestrial Transit',
    ],
    totalBandwidth: '~1.8 Tbps National Transit Backbone',
  },
];

export function resolveIspUpstreamInfo(
  ispName: string = '',
  asn: string = '',
  orgName: string = '',
  countryCode: string = ''
): IspUpstreamInfo {
  const normIsp = ispName.toLowerCase();
  const normAsn = asn.toUpperCase().trim();
  const normOrg = orgName.toLowerCase();

  // Match known profile
  for (const profile of KNOWN_ISP_PROFILES) {
    const asnMatch = profile.asnList.some((a) => normAsn === a || normAsn.includes(a));
    const nameMatch = profile.nameKeywords.some(
      (kw) => normIsp.includes(kw) || normOrg.includes(kw)
    );
    if (asnMatch || nameMatch) {
      return {
        ispName: ispName || profile.nameKeywords[0].toUpperCase(),
        asn: asn || profile.asnList[0],
        upstreams: profile.upstreams,
        count: profile.upstreams.length,
        routeChannels: profile.routeChannels,
        totalBandwidth: profile.totalBandwidth,
      };
    }
  }

  // Fallback for Bangladesh ISPs
  const isBd = countryCode.toUpperCase() === 'BD' || normIsp.includes('bangladesh') || normOrg.includes('bangladesh');
  if (isBd) {
    return {
      ispName: ispName || 'Bangladeshi Broadband ISP',
      asn: asn || 'AS-LOCAL',
      upstreams: [
        'Fiber@Home Ltd (AS45788)',
        'Summit Communications (AS58682)',
        'Bharti Airtel Global (AS9498)',
      ],
      count: 3,
      routeChannels: [
        'BDIX National IXP Core Peering Fabric',
        'Google GGC & Meta FNA In-Rack Caches',
        'SEA-ME-WE-4 / SEA-ME-WE-5 Submarine Fiber',
        'ITC Terrestrial Border Transit Links',
      ],
      totalBandwidth: '~250+ Gbps Backbone Capacity',
    };
  }

  // Fallback for global ISPs
  return {
    ispName: ispName || 'Broadband ISP',
    asn: asn || 'AS-GLOBAL',
    upstreams: [
      'Tier-1 Global Transit Backbone',
      'Direct Anycast CDN Interconnect',
      'Regional Internet Exchange Point (IXP)',
    ],
    count: 3,
    routeChannels: [
      'Regional IXP Peering Fabric',
      'Edge CDN Anycast Points of Presence',
      'Global Tier-1 Fiber Backbone',
    ],
    totalBandwidth: '~100+ Gbps Core Network',
  };
}

export function getRouteChannelInfo(category: NetworkCategory): {
  channelName: string;
  tag: string;
  description: string;
} {
  switch (category) {
    case 'bdix':
      return {
        channelName: 'BDIX Domestic Peering Fabric',
        tag: 'Domestic Peering',
        description: 'Routes traffic domestically inside Bangladesh through BDIX exchange switches. Zero international submarine hops.',
      };
    case 'ggc':
      return {
        channelName: 'Google Global Cache (GGC)',
        tag: 'Google AS15169',
        description: 'Direct in-rack cache appliance hosted inside local ISP networks for YouTube 4K & Google Cloud services.',
      };
    case 'fna':
      return {
        channelName: 'Facebook Network Appliance (FNA)',
        tag: 'Meta AS32934',
        description: 'In-network appliance deployed inside local ISP infrastructure for Meta Reels, Facebook & Instagram media delivery.',
      };
    case 'global_cdn':
      return {
        channelName: 'Global Anycast Edge CDN',
        tag: 'Anycast Edge',
        description: 'Connects to Cloudflare & Fastly global Anycast Points of Presence for worldwide content delivery.',
      };
    case 'iig':
    default:
      return {
        channelName: 'International Internet Gateway (IIG)',
        tag: 'Submarine Transit',
        description: 'Traverses international submarine fiber cables (SMW-4, SMW-5) and ITC terrestrial links for worldwide internet transit.',
      };
  }
}

export function generateBackendRouteHops(
  server?: SpeedTestServer,
  clientNetwork?: ClientNetworkDetails,
  ipProtocol: IpTestProtocol = 'ipv4'
): BackendRouteHop[] {
  const isV6 = ipProtocol === 'ipv6';
  const isV4toV6 = ipProtocol === 'ipv4_to_ipv6';
  const isV6toV4 = ipProtocol === 'ipv6_to_ipv4';

  const clientIpv4 = clientNetwork?.ipv4?.ip || (clientNetwork?.ip && !clientNetwork.ip.includes(':') ? clientNetwork.ip : '103.145.118.10');
  const clientIpv6 = clientNetwork?.ipv6?.ip || (clientNetwork?.ip && clientNetwork.ip.includes(':') ? clientNetwork.ip : '2400:1a00:b030::21');
  const city = clientNetwork?.city || 'Dhaka';
  const isp = clientNetwork?.isp || 'Broadband ISP';
  const asn = clientNetwork?.asn || 'AS-Local';

  const srvName = server?.name || 'Speed Test Core Server';
  const srvCategory = server?.category || 'bdix';
  const targetIp = isV6
    ? (server?.ipv6Address || '2404:6800:4003:c00::64')
    : (server?.ipv4Address || server?.ipAddress || '103.77.188.20');
  const srvLocation = server?.location || `${city}, Bangladesh`;
  const cable = server?.cableSystem || 'Domestic Optical Fiber';
  const dist = server?.distanceKm || 15;

  const hops: BackendRouteHop[] = [];

  // Hop 1: Client Host Terminal
  hops.push({
    hop: 1,
    name: 'Client Terminal / Browser Socket',
    deviceType: 'client',
    roleLabel: isV6 ? 'Host IPv6 Interface' : 'Host IPv4 Interface',
    ip: isV6 ? '::1 / Host Socket' : '192.168.1.105 (Local DHCP)',
    latencyEstMs: 0.2,
    location: `${city} (User Premises)`,
    notes: 'Local hardware TCP stack binding',
  });

  // Hop 2: Customer Premises Gateway / ONT
  hops.push({
    hop: 2,
    name: 'Customer Wi-Fi / GPON ONT Gateway',
    deviceType: 'lan_router',
    roleLabel: 'LAN Default Gateway',
    ip: isV6 ? 'fe80::1 (Link-Local Gateway)' : '192.168.1.1 (Gateway)',
    latencyEstMs: 1.2,
    location: `${city} (Home/Office)`,
    notes: 'Zero-drop local optical/Ethernet gateway',
  });

  // Hop 3: ISP BNG / CGNAT Proxy Gateway
  if (isV4toV6) {
    hops.push({
      hop: 3,
      name: 'Stateful NAT64 / DNS64 CGNAT Gateway',
      deviceType: 'cgnat_proxy',
      roleLabel: 'NAT64 Stateful Translation Proxy',
      ip: '64:ff9b::100.64.1.1',
      asn,
      latencyEstMs: 7.5,
      location: `${city} ISP Edge Datacenter`,
      notes: 'State table translation (IPv4 packet wrapped into IPv6 header)',
    });
  } else if (isV6toV4) {
    hops.push({
      hop: 3,
      name: '464XLAT CLAT / PLAT Border Router',
      deviceType: 'cgnat_proxy',
      roleLabel: 'SIIT / PLAT Dual-Stack Translator',
      ip: '100.64.0.1 (Carrier-Grade PLAT)',
      asn,
      latencyEstMs: 5.8,
      location: `${city} Carrier Core`,
      notes: 'RFC 6877 client-to-provider stateless address translation',
    });
  } else {
    hops.push({
      hop: 3,
      name: `${isp} Edge Aggregation Router (BNG)`,
      deviceType: 'isp_core',
      roleLabel: 'Broadband Network Gateway (BNG)',
      ip: isV6 ? '2400:1a00:b000::1' : '100.64.32.1 (ISP Metro Aggregator)',
      asn,
      latencyEstMs: 3.8,
      location: `${city} Metro Aggregation Ring`,
      notes: 'Optical distribution loop & PPPoE/IPoE termination',
    });
  }

  // Hop 4: ISP Core Optical Distribution Core
  hops.push({
    hop: 4,
    name: `${isp} Core Optical Backbone Switch`,
    deviceType: 'isp_core',
    roleLabel: 'Intra-ISP Core Transit Ring',
    ip: isV6 ? clientIpv6 : clientIpv4,
    asn,
    latencyEstMs: 5.2,
    location: `${city} Tier-3 Datacenter`,
    notes: 'Direct 100G DWDM optical backbone interconnect',
  });

  // Hop 5: Route Peering / Submarine Cable / Cache Core
  if (srvCategory === 'bdix') {
    hops.push({
      hop: 5,
      name: 'BDIX National IXP Core Peering Switch',
      deviceType: 'ixp_switch',
      roleLabel: 'Domestic Peering Fabric (AS38258)',
      ip: '103.77.188.1 (BDIX Dhaka Core)',
      asn: 'AS38258',
      latencyEstMs: 6.8,
      location: 'Dhaka National IXP Core, Bangladesh',
      notes: 'Zero subsea hop • National optical cross-connect ring',
    });
  } else if (srvCategory === 'ggc') {
    hops.push({
      hop: 5,
      name: `Google Edge Peering Interconnect (${server?.name || 'GGC Appliance'})`,
      deviceType: 'ixp_switch',
      roleLabel: 'Google In-Rack Cache Fabric (AS15169)',
      ip: '172.217.160.1 (Google Edge Cache)',
      asn: 'AS15169',
      latencyEstMs: 5.9,
      location: `${city} Local Edge`,
      notes: 'Direct peering for YouTube 4K & Google Cloud services',
    });
  } else if (srvCategory === 'fna') {
    hops.push({
      hop: 5,
      name: `Meta Direct Peering Appliance (${server?.name || 'FNA Cache'})`,
      deviceType: 'ixp_switch',
      roleLabel: 'Meta Edge Appliance Fabric (AS32934)',
      ip: '157.240.239.1 (Meta Edge Cluster)',
      asn: 'AS32934',
      latencyEstMs: 5.6,
      location: `${city} Local Edge`,
      notes: 'Direct peering for Instagram Reels & Facebook Video',
    });
  } else if (srvCategory === 'global_cdn') {
    hops.push({
      hop: 5,
      name: 'Cloudflare / Global Anycast Border Gateway',
      deviceType: 'ixp_switch',
      roleLabel: 'Anycast Border Router (AS13335)',
      ip: '172.67.74.1 (Anycast POP)',
      asn: 'AS13335',
      latencyEstMs: 8.2,
      location: `${city} / Regional Anycast POP`,
      notes: 'BGP Anycast routing to closest continental edge',
    });
  } else {
    // IIG: Submarine cable landing gateway
    hops.push({
      hop: 5,
      name: `Submarine Cable Landing Terminal (${cable})`,
      deviceType: 'landing_station',
      roleLabel: 'IIG International Gateway Terminal',
      ip: '182.16.155.1 (BSCCL Kuakata/Cox Landing Station)',
      asn: 'AS24389',
      latencyEstMs: 14.5,
      location: 'Kuakata / Cox\'s Bazar Landing Terminal',
      notes: `${cable} • Subsea fiber amplifier & high-voltage optical repeater`,
    });

    if (dist > 500) {
      hops.push({
        hop: 6,
        name: `International Subsea Carrier Gateway (${srvLocation})`,
        deviceType: 'transit_carrier',
        roleLabel: 'Tier-1 Submarine Carrier Backbone',
        ip: '180.87.12.33 (Equinix / SingTel / Tata Transit)',
        asn: 'AS6453 / AS9498',
        latencyEstMs: Math.max(26, Math.round(dist * 0.025)),
        location: srvLocation,
        notes: `Intercontinental subsea transit hop (~${dist.toLocaleString()} km)`,
      });
    }
  }

  // Final Hop: Destination Main Server
  const finalHopIndex = hops.length + 1;
  const finalLatency = dist > 100 ? Math.round((dist * 1.35 * 2) / 204) + 6 : 8;

  hops.push({
    hop: finalHopIndex,
    name: srvName,
    deviceType: 'destination_server',
    roleLabel: 'Main Target Speed Test Server Socket',
    ip: targetIp,
    asn: server?.provider?.match(/AS\d+/)?.[0] || 'AS-Target',
    latencyEstMs: finalLatency,
    location: srvLocation,
    notes: `${server?.transitDetails || 'Direct Wire Socket Benchmark Daemon'}`,
    isMainServer: true,
  });

  return hops;
}
