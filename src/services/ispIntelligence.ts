import { IspUpstreamInfo, NetworkCategory } from '../types/speedtest';

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
