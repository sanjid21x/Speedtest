# SpeedTest — Real Internet Speed Test

A lightweight, genuine, browser-based Internet Speed Test web application built with React, TypeScript, and Vite. Designed specifically for instant static hosting on **GitHub Pages**.

> **Branding Notice**: Made with ♥ by Sanjid

---

## 🚀 Features

- **Genuine Measurements Only**: No synthetic or randomized counter animations. All numbers are calculated from physical network byte transfers.
- **Latency & Ping Telemetry**: Multi-probe latency sampling with outlier filtering to measure true minimum, average, and median round-trip times.
- **RFC 3550 Jitter Computation**: Standard statistical mean absolute deviation between successive packet arrivals.
- **High-Precision Multi-Stream Download**: Streaming chunk transfers using `ReadableStream` and dynamic concurrency to saturate fiber broadband.
- **Hardware-Level Upload Progress**: Measures physical payload transfer bytes in real-time via `XMLHttpRequest.upload.onprogress`.
- **5 Specialized Test Routes**:
  - 🌐 **Global CDN**: Cloudflare & Fastly global Anycast edge PoPs.
  - ⚡ **Google Global Cache (GGC)**: Probes intra-ISP caching appliances for YouTube, Google Drive, and Play Store acceleration.
  - 📱 **Facebook Network Appliance (FNA)**: Meta ISP peering appliances for Instagram Reels, Facebook video, and media CDN.
  - 🚀 **Local BDIX**: Bangladesh Internet Exchange peering for domestic FTPs, local OTT, and intra-ISP bandwidth.
  - 🌍 **International Gateway (IIG)**: Submarine cable transit (SMW-4, SMW-5) and international terrestrial cable links.
- **Multi-Route Audit Matrix**: Test and compare latency and jitter across all 5 routing paths side-by-side in real time!
- **Zero-Lag Circular Speedometer**: Custom SVG gauge with non-linear logarithmic calibration (0 to 1000+ Mbps) for intuitive readability on all speed tiers.
- **Local History & Privacy**: Saves test results exclusively in your browser's `localStorage` with CSV export and zero server-side telemetry.
- **One-Click Result Sharing**: Native Web Share API with instant formatted clipboard fallback.
- **Custom Node Support**: Plug in dedicated regional speed-test servers (e.g., Dhaka, Chittagong, Sylhet, Rajshahi, or ISP edge nodes) without rewriting code.
- **Dark, Light & System Themes**: High-contrast, responsive interface optimized for smartphones, tablets, and 4K desktops.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8 with `@tailwindcss/vite`
- **Styling**: Tailwind CSS v4 with custom responsive SVG dials
- **Icons**: Lucide React
- **Deployment**: Static single-page application (SPA) deployed via GitHub Actions to GitHub Pages

---

## 🔬 How the Speed Test Works

### 1. Latency (Ping) Measurement
1. The engine sends 10 sequential lightweight HTTP probes with cache-busting timestamps (`_t=timestamp_random`).
2. An initial probe acts as a warm-up to absorb cold-start DNS resolution and TCP/TLS handshakes.
3. High-resolution timestamps (`performance.now()`) capture round-trip times (RTT) in milliseconds:
   $$\text{RTT} = t_{\text{response}} - t_{\text{request}}$$
4. The system calculates minimum, mean, and median values to ignore transient local jitter spikes.

### 2. Jitter Calculation (RFC 3550 Standard)
Jitter represents packet delay variation. It is computed as the mean absolute difference between consecutive latency samples:
$$\text{Jitter} = \frac{1}{N - 1} \sum_{i=1}^{N - 1} |D(i, i - 1)|$$
where $D(i, i-1) = \text{RTT}_i - \text{RTT}_{i-1}$.

### 3. Download Speed Measurement
1. The client requests binary data chunks from CORS-enabled high-speed CDN edges.
2. Multiple concurrent streams (2 to 3 connections) run in parallel to saturate high-throughput TCP windows.
3. Chunks are ingested via `response.body.getReader()`, counting every incoming byte in real time.
4. Instantaneous throughput is calculated over an 800ms rolling window:
   $$\text{Speed (Mbps)} = \frac{\text{Bytes Transferred} \times 8}{\text{Elapsed Seconds} \times 1,000,000}$$

### 4. Upload Speed Measurement
1. An uncompressible binary payload (non-zero entropy `Uint8Array` packed into a `Blob`) is generated in memory.
2. The payload is sent via HTTP POST to the endpoint.
3. The engine attaches an `xhr.upload.onprogress` listener to measure physical byte transfer as the browser pushes data to the network socket buffer.
4. Upload throughput is calculated live and rendered on the speedometer.

---

## 🌐 Adding Regional or Dedicated Speed-Test Servers

Browser-based speed tests rely on test endpoints supporting Cross-Origin Resource Sharing (CORS). You can easily hook in dedicated servers (e.g., Dhaka, Chittagong, Sylhet, Rajshahi, or internal ISP servers):

1. Click on the **Server Selector** dropdown in the top navigation bar.
2. Click **Add Node**.
3. Provide:
   - **Node Name**: (e.g. `Dhaka Fiber Node`)
   - **Location**: (e.g. `Dhaka, Bangladesh`)
   - **Ping Probe URL**: A lightweight CORS GET/HEAD endpoint.
   - **Download Chunk URL**: An endpoint that returns binary data supporting the `?bytes=` query parameter.
   - **Upload Endpoint**: An HTTP POST endpoint returning HTTP 200/204 with `Access-Control-Allow-Origin: *`.
4. Click **Save Node**. The node is instantly stored in your browser and ready for testing!

---

## 🚢 GitHub Pages Deployment

The repository includes a production-ready GitHub Actions workflow in `.github/workflows/deploy.yml`.

### Automated Deployment Setup:
1. Push this repository to your GitHub account (e.g., `speedtest` or `<username>.github.io`).
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow will automatically trigger on any commit to `main`, install dependencies, run `npm run build`, and deploy the static `./dist` output to your GitHub Pages URL!

---

## ⚠️ Important Browser & Network Limitations

1. **Browser Sandboxing & CORS**:
   - Modern browsers cannot perform raw ICMP pings. Latency is measured using HTTP/HTTPS request-response cycles, which includes TLS session overhead on cold connections.
   - Endpoints must send valid `Access-Control-Allow-Origin` headers.
2. **Public CDN Endpoints**:
   - Built-in default tests route to Cloudflare's Anycast Edge CDN. While this represents real CDN access speed, performance on dedicated ISP peering nodes can be even more accurate by adding a local server in the Node Selector.
3. **Browser Throttling**:
   - Running background tabs or battery-saver mode may introduce minor timing variances; keeping the tab active during tests yields maximum accuracy.

---

## 📄 License & Credits

Distributed under the Apache-2.0 License.

**SpeedTest** — Made with ♥ by Sanjid
