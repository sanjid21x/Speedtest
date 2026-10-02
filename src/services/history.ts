import { SpeedTestResult } from '../types/speedtest';

const STORAGE_KEY_HISTORY = 'speedtest_results_history';

export function getHistory(): SpeedTestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveResultToHistory(result: SpeedTestResult): void {
  try {
    const current = getHistory();
    // Keep up to 50 recent tests
    const updated = [result, ...current.filter((item) => item.id !== result.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save speed test result to localStorage', err);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (err) {
    console.error('Failed to clear history', err);
  }
}

export function exportHistoryAsCSV(history: SpeedTestResult[]): void {
  if (history.length === 0) return;

  const headers = ['Date', 'Time', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Server', 'Location'];
  const rows = history.map((item) => {
    const d = new Date(item.timestamp);
    const dateStr = d.toLocaleDateString();
    const timeStr = d.toLocaleTimeString();
    return [
      dateStr,
      timeStr,
      item.downloadMbps,
      item.uploadMbps,
      item.pingMs,
      item.jitterMs,
      `"${item.server.name.replace(/"/g, '""')}"`,
      `"${item.server.location.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `speedtest_history_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
