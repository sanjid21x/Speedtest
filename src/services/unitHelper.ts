import { SpeedUnit } from '../types/speedtest';

export function convertSpeed(mbps: number, unit: SpeedUnit): number {
  if (unit === 'MBps') {
    return mbps / 8;
  }
  return mbps;
}

export function formatSpeedValue(mbps: number, unit: SpeedUnit, decimals: number = 2): string {
  const val = convertSpeed(mbps, unit);
  if (val <= 0) return '0.00';
  return val.toFixed(decimals);
}

export function getUnitLabel(unit: SpeedUnit): string {
  return unit === 'MBps' ? 'MB/s' : 'Mbps';
}

export function getUnitDescription(unit: SpeedUnit): string {
  return unit === 'MBps'
    ? 'Megabytes per second (Real file download rate e.g. Steam, IDM, Torrents)'
    : 'Megabits per second (Standard ISP advertised bandwidth tier)';
}
