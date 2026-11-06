# ISP Info Simplification & Interactive Backend Connection Route Visualizer

A streamlined refinement of the speed test interface that renames the network identity section to **"ISP Info"**, cleans the route category dashboard down to minimal single labels (**BDIX**, **IIG**, **FNA**, **GGC**, **CDN**), removes redundant test badges, and adds an interactive hop-by-hop backend connection route visualizer with an expandable drawer inside the ISP Info card.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and are fully incorporated:
> - **Visualization Format**: Interactive hop-by-hop node diagram displaying IP addresses, device/router types (Client Device, Local Gateway Router, Intra-ISP Optical Switch, Subsea Landing Terminal, Main Server), and estimated hop latencies.
> - **Placement & Interaction**: Positioned directly inside the **"ISP Info"** card with an expandable arrow toggle button.

- **Confirmed Decision 1**: Rename "Network Identity & Dual-Stack Connectivity" to **"ISP Info"** with clean subtitle and zero duplicate text.
- **Confirmed Decision 2**: Remove the "100% Real Test" text badge from the route selector dashboard.
- **Confirmed Decision 3**: Remove sub-tags ("Domestic Peering", "Submarine Transit", etc.) from category buttons, leaving only **BDIX**, **IIG**, **FNA**, **GGC**, and **CDN**.
- **Confirmed Decision 4**: Provide a dynamic hop-by-hop topology route trace matching the active test server and detected ISP upstream path.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Provides a clean, modern network diagnosis experience.
  - Simplifies the route selection tabs to crisp, distraction-free labels.
  - Gives network engineers, gamers, and everyday users full transparency into how their data packets traverse their local LAN, ISP aggregation cores, regional IXPs, submarine cables (SMW-4, SMW-5, i2i), and destination speed test daemons.
- **Target Audience**: Gamers, broadband subscribers, sysadmins, and network enthusiasts benchmarking Bangladesh (BDIX) and international gateway (IIG) routes.
- **Key Value**: Eliminates visual clutter while providing deep, educational packet route transparency through a single expandable interaction.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Viewing ISP Info**:
   - The user scrolls down from the digital meter to the network details section, now cleanly labeled **"ISP Info"**.
   - The header displays the client's city, country, and ISP with clear IPv4 and IPv6 connectivity status boxes.
2. **Expanding Backend Connection Route**:
   - An expandable arrow button titled **"View Backend Connection Route"** sits at the base of the ISP Info card.
   - Clicking the arrow smoothly expands an interactive hop-by-hop traceroute diagram.
3. **Inspecting Route Hops**:
   - Each hop node is rendered with its device role icon (Laptop/Phone, Home Gateway Router, ISP Distribution Switch, National BDIX / IIG Landing Switch, Anycast/Speed Daemon).
   - Hops show the simulated IP (e.g. `192.168.1.1` ➔ ISP CGNAT / Public IP ➔ BDIX Core ➔ Destination Server IP), hostname, device type, and incremental latency (+0.5ms, +2ms, +15ms, etc.).
4. **Selecting Test Routes**:
   - The category selector above the ISP card displays minimal, high-contrast segmented buttons: **BDIX**, **IIG**, **FNA**, **GGC**, and **CDN**.
   - No distracting extra sub-labels or "100% real test" promotional badges.

### Visual Styling & Theme

- **Palette**: Dark slate canvas (`#020617`), hairline borders (`border-slate-800`), cyan primary accents (`#06b6d4`), amber gateway highlights (`#f59e0b`), and purple IPv6 badges (`#a855f7`).
- **Typography**: Display titles in `Plus Jakarta Sans`, tabular network telemetry and IP addresses in `JetBrains Mono` (`font-mono tabular-nums`).
- **Nodes & Connectors**: Hop nodes rendered with glowing status rings and animated connection lines indicating packet flow direction.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dynamic Route Calculation Based on Active Server Category**:
  - *Chosen Approach*: The hop-by-hop route dynamically adapts when the user selects different route categories (e.g. BDIX routes stay domestic within Dhaka/Chittagong optical rings; IIG routes route through Kuakata/Cox's Bazar submarine landing stations to Singapore/Mumbai/London; GGC routes hit local edge caches).
  - *Why*: Gives authentic, educational network insight tailored to the active destination rather than a static dummy list.
- **Decision 2: Expandable Drawer inside ISP Info**:
  - *Chosen Approach*: Collapse by default with an arrow trigger (`ChevronDown` / `ChevronUp`), keeping the main dashboard compact and distraction-free while offering deep diagnostic depth on demand.
  - *Why*: Adheres to the user's preference and prevents vertical layout bloat.
- **Decision 3: Zero-Pill Minimalist Category Buttons**:
  - *Chosen Approach*: Replace multi-line buttons containing redundant tag pills with single-line, clean segmented controls (`BDIX`, `IIG`, `FNA`, `GGC`, `CDN`).
  - *Why*: Directly satisfies the prompt instruction ("Keep only BDIX text no extra title for test catagory dashboard, apply for all").

---

## 4. Technical Architecture & Component Structure

### Component Hierarchy & Interaction Flow

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - clientNetwork, activeServer, ipProtocol states      │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     NetworkRouteSelector      │ │      ClientNetworkCard        │
│  - Clean Buttons:             │ │  - Renamed: "ISP Info"        │
│    [BDIX] [IIG] [FNA]         │ │  - Dual-Stack IPv4 / IPv6     │
│    [GGC] [CDN]                │ │  - ISP & Location             │
│  - Removed "100% real test"   │ │  - Expandable Arrow Drawer:   │
└───────────────────────────────┘ │    ┌────────────────────────┐ │
                                  │    │ Backend Route Nodes    │ │
                                  │    │ Hop 1: Client Device   │ │
                                  │    │ Hop 2: Local Gateway   │ │
                                  │    │ Hop 3: ISP Aggregator  │ │
                                  │    │ Hop 4: IXP / Subsea    │ │
                                  │    │ Hop 5: Main Server     │ │
                                  │    └────────────────────────┘ │
                                  └───────────────────────────────┘
```

### Data Model for Route Hops

```typescript
export interface RouteHopNode {
  hopNumber: number;
  label: string;
  deviceType: 'client' | 'gateway' | 'cgnat_proxy' | 'isp_core' | 'submarine_landing' | 'ixp_peering' | 'main_server';
  ipAddress: string;
  hostname?: string;
  asn?: string;
  latencyDeltaMs: number;
  cumulativeLatencyMs: number;
  location: string;
  isMainServer?: boolean;
}
```

### Implementation Checklist

1. **`src/components/ClientNetworkCard.tsx`**:
   - Change heading from "Network Identity & Dual-Stack Connectivity" to **"ISP Info"**.
   - Add expandable toggle button with arrow (`ChevronDown` / `ChevronUp`) labeled **"Backend Connection Route Details"**.
   - Create interactive node visualizer rendering each hop with IP, router type, cumulative ping, and connection lines.
2. **`src/components/NetworkRouteSelector.tsx`**:
   - Remove "100% Real Test" badge.
   - Clean category buttons to show only the title: `BDIX`, `IIG`, `FNA`, `GGC`, `CDN`.
3. **`src/services/ispIntelligence.ts`**:
   - Add helper `generateBackendRouteHops(server, clientNetwork, ipProtocol)` to compute authentic hop sequences based on the detected ISP, upstream carrier, and active server target.
4. **Verification**:
   - Execute `lint_applet` and `compile_applet`.
   - Verify interactive toggle, theme adaptability (dark/light), and clean layout.
