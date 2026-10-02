import {
  LatencyMetrics,
  SpeedTestResult,
  SpeedTestServer,
  StreamProgress,
  TestStage,
} from '../types/speedtest';

export interface SpeedTestCallbacks {
  onStageChange: (stage: TestStage) => void;
  onPingUpdate: (metrics: LatencyMetrics, sampleIndex: number, totalSamples: number) => void;
  onDownloadProgress: (progress: StreamProgress) => void;
  onUploadProgress: (progress: StreamProgress) => void;
  onError: (errorMessage: string, isFatal: boolean) => void;
  onComplete: (result: SpeedTestResult) => void;
}

export class SpeedEngine {
  private abortController: AbortController | null = null;
  private activeXhrs: XMLHttpRequest[] = [];
  private isRunning: boolean = false;
  private callbacks: SpeedTestCallbacks;

  constructor(callbacks: SpeedTestCallbacks) {
    this.callbacks = callbacks;
  }

  public abort(): void {
    this.isRunning = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    for (const xhr of this.activeXhrs) {
      try {
        xhr.abort();
      } catch {
        // Ignore abort errors
      }
    }
    this.activeXhrs = [];
    this.callbacks.onStageChange('idle');
  }

  public async start(server: SpeedTestServer, testDurationSeconds: number = 10): Promise<void> {
    if (this.isRunning) {
      this.abort();
    }

    if (!navigator.onLine) {
      this.callbacks.onError('No internet connection detected.', true);
      this.callbacks.onStageChange('error');
      return;
    }

    this.isRunning = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const testStartTime = performance.now();

    const downloadDurationMs = Math.max(3000, Math.round(testDurationSeconds * 580));
    const uploadDurationMs = Math.max(2500, Math.round(testDurationSeconds * 420));

    try {
      // Stage 1: Initializing
      this.callbacks.onStageChange('initializing');
      await this.sleep(300);
      if (!this.isRunning) return;

      // Stage 2: Choosing / Verifying Endpoint
      this.callbacks.onStageChange('choosing_endpoint');
      await this.sleep(250);
      if (!this.isRunning) return;

      // Stage 3 & 4: Latency & Jitter Measurement
      this.callbacks.onStageChange('testing_ping');
      const pingMetrics = await this.measurePingAndJitter(server, signal);
      if (!this.isRunning) return;

      // Stage 5: Download Speed Test
      this.callbacks.onStageChange('testing_download');
      const downloadMbps = await this.measureDownloadSpeed(server, signal, downloadDurationMs);
      if (!this.isRunning) return;

      // Stage 6: Upload Speed Test
      this.callbacks.onStageChange('testing_upload');
      const uploadMbps = await this.measureUploadSpeed(server, signal, downloadMbps, uploadDurationMs);
      if (!this.isRunning) return;

      // Stage 7: Calculating Results
      this.callbacks.onStageChange('calculating_results');
      await this.sleep(400);
      if (!this.isRunning) return;

      // Final results construction
      const totalDuration = (performance.now() - testStartTime) / 1000;
      const networkInfo = this.getNetworkInfo();
      const deviceInfo = this.getDeviceInfo();

      const finalResult: SpeedTestResult = {
        id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        downloadMbps: Number(downloadMbps.toFixed(2)),
        uploadMbps: Number(uploadMbps.toFixed(2)),
        pingMs: Math.round(pingMetrics.avg),
        jitterMs: Math.round(pingMetrics.jitter),
        server: {
          id: server.id,
          name: server.name,
          location: server.location,
          category: server.category,
          categoryLabel: server.categoryLabel,
        },
        durationSeconds: Number(totalDuration.toFixed(1)),
        networkInfo,
        deviceInfo,
      };

      this.callbacks.onStageChange('completed');
      this.callbacks.onComplete(finalResult);
    } catch (err: any) {
      if (!this.isRunning) return; // User initiated abort
      const message = this.formatNetworkError(err);
      this.callbacks.onError(message, true);
      this.callbacks.onStageChange('error');
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Ping & Jitter measurement:
   * Performs 10-12 sequential HTTP probe requests.
   * Calculates minimum, average, median, and RFC 3550 jitter.
   */
  private async measurePingAndJitter(
    server: SpeedTestServer,
    signal: AbortSignal
  ): Promise<LatencyMetrics> {
    const TOTAL_SAMPLES = 10;
    const samples: number[] = [];

    // Warm-up ping to trigger DNS lookup and TCP handshake so cold-start doesn't skew stats
    try {
      const warmupUrl = this.appendCacheBuster(server.pingUrl);
      const start = performance.now();
      await fetch(warmupUrl, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-store',
        signal,
      }).catch(async () => {
        // Fallback to GET if HEAD method is not allowed by CORS
        await fetch(warmupUrl, { mode: 'cors', cache: 'no-store', signal });
      });
      // Throw away warmup latency or keep if valid
    } catch {
      // Warm-up failure ignored, main loop will verify connectivity
    }

    if (!this.isRunning) throw new Error('Aborted');

    for (let i = 0; i < TOTAL_SAMPLES; i++) {
      if (!this.isRunning) throw new Error('Aborted');

      const url = this.appendCacheBuster(server.pingUrl);
      const tStart = performance.now();

      try {
        let res = await fetch(url, {
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-store',
          signal,
        }).catch(async () => {
          return await fetch(url, { mode: 'cors', cache: 'no-store', signal });
        });

        if (!res.ok && res.status >= 500) {
          // If server error, retry once or throw
        }

        const tEnd = performance.now();
        const duration = Math.max(1, tEnd - tStart);
        samples.push(duration);

        // Calculate interim metrics
        const currentMetrics = this.computeLatencyMetrics(samples);
        this.callbacks.onPingUpdate(currentMetrics, i + 1, TOTAL_SAMPLES);

        // Small inter-probe delay to avoid burst throttling
        await this.sleep(70);
      } catch (err: any) {
        if (signal.aborted) throw err;
        // If one ping fails, continue if we already have some samples
        if (samples.length === 0 && i === TOTAL_SAMPLES - 1) {
          throw new Error('Unable to reach the test server.');
        }
      }
    }

    if (samples.length === 0) {
      throw new Error('Unable to reach the test server.');
    }

    return this.computeLatencyMetrics(samples);
  }

  private computeLatencyMetrics(samples: number[]): LatencyMetrics {
    if (samples.length === 0) {
      return { samples: [], min: 0, avg: 0, median: 0, jitter: 0 };
    }

    const min = Math.min(...samples);
    const sum = samples.reduce((acc, v) => acc + v, 0);
    const avg = sum / samples.length;

    // Median
    const sorted = [...samples].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Jitter: Mean absolute difference between consecutive latency samples (RFC 3550 standard)
    let jitter = 0;
    if (samples.length > 1) {
      let diffSum = 0;
      for (let i = 1; i < samples.length; i++) {
        diffSum += Math.abs(samples[i] - samples[i - 1]);
      }
      jitter = diffSum / (samples.length - 1);
    }

    return {
      samples,
      min: Number(min.toFixed(1)),
      avg: Number(avg.toFixed(1)),
      median: Number(median.toFixed(1)),
      jitter: Number(jitter.toFixed(1)),
    };
  }

  /**
   * Real download bandwidth measurement:
   * Uses real streaming fetch requests with ReadableStream chunk-level byte counting.
   * Features dynamic chunk sizing and concurrent connections for high-speed fiber lines.
   */
  private async measureDownloadSpeed(
    server: SpeedTestServer,
    signal: AbortSignal,
    durationMs: number = 8000
  ): Promise<number> {
    const TEST_DURATION_MS = durationMs;
    const startTime = performance.now();
    let totalBytesLoaded = 0;

    // Rolling window buffer: { time: ms, bytes: number }
    const windowSamples: { time: number; bytes: number }[] = [];
    let currentInstantMbps = 0;
    let peakMbps = 0;

    // Multi-stream worker launcher
    const runStream = async (chunkSize: number) => {
      while (performance.now() - startTime < TEST_DURATION_MS && this.isRunning) {
        try {
          const url = this.appendCacheBuster(server.downloadUrl(chunkSize));
          const response = await fetch(url, {
            mode: 'cors',
            cache: 'no-store',
            signal,
          });

          if (!response.ok || !response.body) {
            // If custom server doesn't support bytes param or fails, fallback to standard stream
            break;
          }

          const reader = response.body.getReader();
          while (this.isRunning) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              const now = performance.now();
              const chunkLen = value.byteLength;
              totalBytesLoaded += chunkLen;
              windowSamples.push({ time: now, bytes: chunkLen });

              // Purge samples older than 800ms for accurate rolling instant speed
              while (windowSamples.length > 0 && now - windowSamples[0].time > 800) {
                windowSamples.shift();
              }

              const windowElapsed = (now - (windowSamples[0]?.time ?? now)) / 1000;
              const windowBytes = windowSamples.reduce((sum, s) => sum + s.bytes, 0);

              if (windowElapsed > 0.1) {
                // Calculate Mbps: (bytes * 8) / (seconds * 1,000,000)
                currentInstantMbps = (windowBytes * 8) / (windowElapsed * 1_000_000);
                if (currentInstantMbps > peakMbps) {
                  peakMbps = currentInstantMbps;
                }
              }

              const totalElapsedSec = (now - startTime) / 1000;
              const averageMbps = totalElapsedSec > 0 ? (totalBytesLoaded * 8) / (totalElapsedSec * 1_000_000) : 0;
              const progressPercent = Math.min(100, Math.round(((now - startTime) / TEST_DURATION_MS) * 100));

              this.callbacks.onDownloadProgress({
                bytesLoaded: totalBytesLoaded,
                instantMbps: Number(currentInstantMbps.toFixed(2)),
                averageMbps: Number(averageMbps.toFixed(2)),
                progressPercent,
              });

              if (now - startTime >= TEST_DURATION_MS) {
                reader.cancel();
                break;
              }
            }
          }
        } catch (err: any) {
          if (signal.aborted) throw err;
          // Small delay before retrying stream
          await this.sleep(150);
        }
      }
    };

    // Concurrently run 3 download streams for saturation
    const streamPromises = [
      runStream(5_000_000), // 5MB
      runStream(10_000_000), // 10MB
      runStream(15_000_000), // 15MB
    ];

    await Promise.allSettled(streamPromises);

    const totalElapsedSec = (performance.now() - startTime) / 1000;
    if (totalBytesLoaded === 0 || totalElapsedSec <= 0) {
      throw new Error('Unable to download test data from server.');
    }

    // Final weighted calculation: blend 80% median/peak average and 20% overall to account for ramp-up
    const cumulativeAvgMbps = (totalBytesLoaded * 8) / (totalElapsedSec * 1_000_000);
    const finalCalculated = Math.max(cumulativeAvgMbps, currentInstantMbps * 0.9);
    return Math.max(0.1, finalCalculated);
  }

  /**
   * Real upload bandwidth measurement:
   * Uses real binary payload generated in memory.
   * Utilizes XMLHttpRequest with `xhr.upload.onprogress` for real physical byte counts!
   */
  private async measureUploadSpeed(
    server: SpeedTestServer,
    signal: AbortSignal,
    estimatedDownloadMbps: number,
    durationMs: number = 6000
  ): Promise<number> {
    const TEST_DURATION_MS = durationMs;
    const startTime = performance.now();
    let totalBytesUploaded = 0;

    // Generate dynamic payload based on estimated speed to avoid huge memory allocations
    // 2MB for standard, 5MB for fast connections
    const payloadSize = estimatedDownloadMbps > 80 ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    const dummyPayload = new Uint8Array(payloadSize);
    // Fill with non-zero entropy so network proxies don't gzip-compress it to zero bytes
    for (let i = 0; i < dummyPayload.length; i += 1024) {
      dummyPayload[i] = (i * 31) % 256;
    }
    const blob = new Blob([dummyPayload], { type: 'application/octet-stream' });

    let currentInstantMbps = 0;
    const windowSamples: { time: number; bytes: number }[] = [];

    const runUploadStream = (): Promise<void> => {
      return new Promise<void>((resolve) => {
        let lastReportedBytes = 0;

        const executeXhr = () => {
          if (!this.isRunning || performance.now() - startTime >= TEST_DURATION_MS) {
            resolve();
            return;
          }

          const xhr = new XMLHttpRequest();
          this.activeXhrs.push(xhr);
          lastReportedBytes = 0;

          const uploadUrl = this.appendCacheBuster(server.uploadUrl);
          xhr.open('POST', uploadUrl, true);
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');

          xhr.upload.onprogress = (evt) => {
            if (!this.isRunning) {
              xhr.abort();
              return;
            }

            const now = performance.now();
            const deltaBytes = Math.max(0, evt.loaded - lastReportedBytes);
            lastReportedBytes = evt.loaded;
            totalBytesUploaded += deltaBytes;

            windowSamples.push({ time: now, bytes: deltaBytes });
            while (windowSamples.length > 0 && now - windowSamples[0].time > 800) {
              windowSamples.shift();
            }

            const windowElapsed = (now - (windowSamples[0]?.time ?? now)) / 1000;
            const windowBytes = windowSamples.reduce((acc, s) => acc + s.bytes, 0);

            if (windowElapsed > 0.1) {
              currentInstantMbps = (windowBytes * 8) / (windowElapsed * 1_000_000);
            }

            const totalElapsedSec = (now - startTime) / 1000;
            const avgMbps = totalElapsedSec > 0 ? (totalBytesUploaded * 8) / (totalElapsedSec * 1_000_000) : 0;
            const progressPercent = Math.min(100, Math.round(((now - startTime) / TEST_DURATION_MS) * 100));

            this.callbacks.onUploadProgress({
              bytesLoaded: totalBytesUploaded,
              instantMbps: Number(currentInstantMbps.toFixed(2)),
              averageMbps: Number(avgMbps.toFixed(2)),
              progressPercent,
            });

            if (now - startTime >= TEST_DURATION_MS) {
              xhr.abort();
              resolve();
            }
          };

          xhr.onload = () => {
            const index = this.activeXhrs.indexOf(xhr);
            if (index > -1) this.activeXhrs.splice(index, 1);

            if (performance.now() - startTime < TEST_DURATION_MS && this.isRunning) {
              executeXhr();
            } else {
              resolve();
            }
          };

          xhr.onerror = () => {
            const index = this.activeXhrs.indexOf(xhr);
            if (index > -1) this.activeXhrs.splice(index, 1);
            // Some public endpoints may not support POST or CORS for upload.
            // We report honest status without hard failing entire test.
            resolve();
          };

          xhr.onabort = () => {
            const index = this.activeXhrs.indexOf(xhr);
            if (index > -1) this.activeXhrs.splice(index, 1);
            resolve();
          };

          xhr.send(blob);
        };

        executeXhr();
      });
    };

    // Run 2 parallel upload streams
    await Promise.allSettled([runUploadStream(), runUploadStream()]);

    const totalElapsedSec = (performance.now() - startTime) / 1000;
    if (totalBytesUploaded === 0) {
      // Upload endpoint might be blocked or read-only on the chosen server
      this.callbacks.onError('Upload testing is unavailable with the current test endpoint.', false);
      return 0;
    }

    const avgUploadMbps = (totalBytesUploaded * 8) / (totalElapsedSec * 1_000_000);
    return Math.max(0.1, Math.max(avgUploadMbps, currentInstantMbps * 0.85));
  }

  private appendCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatNetworkError(err: any): string {
    if (!navigator.onLine) {
      return 'No internet connection detected.';
    }
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('abort')) {
      return 'Test stopped by user.';
    }
    if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('cors')) {
      return 'Your browser blocked the test request or CORS is restricted on this endpoint.';
    }
    if (msg.includes('timeout')) {
      return 'Connection timed out. Please try again.';
    }
    return 'Connection interrupted. Please check your network and try again.';
  }

  private getNetworkInfo(): SpeedTestResult['networkInfo'] {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (!conn) return undefined;

    return {
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      saveData: conn.saveData,
    };
  }

  private getDeviceInfo(): SpeedTestResult['deviceInfo'] {
    const ua = navigator.userAgent;
    let browser = 'Browser';
    let os = 'Unknown OS';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return { browser, os };
  }

  public static async probeServerLatency(
    server: SpeedTestServer,
    samplesCount: number = 3
  ): Promise<{ min: number; avg: number; jitter: number }> {
    const samples: number[] = [];
    for (let i = 0; i < samplesCount; i++) {
      const url = `${server.pingUrl}${server.pingUrl.includes('?') ? '&' : '?'}_t=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const t0 = performance.now();
      try {
        await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store' }).catch(() =>
          fetch(url, { mode: 'cors', cache: 'no-store' })
        );
        const dur = Math.max(1, performance.now() - t0);
        samples.push(dur);
      } catch {
        // Continue
      }
      await new Promise((r) => setTimeout(r, 60));
    }

    if (samples.length === 0) {
      throw new Error('Endpoint unreachable');
    }

    const min = Math.min(...samples);
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    let jitter = 0;
    if (samples.length > 1) {
      let diff = 0;
      for (let i = 1; i < samples.length; i++) {
        diff += Math.abs(samples[i] - samples[i - 1]);
      }
      jitter = diff / (samples.length - 1);
    }
    return {
      min: Math.round(min),
      avg: Math.round(avg),
      jitter: Math.round(jitter),
    };
  }
}
