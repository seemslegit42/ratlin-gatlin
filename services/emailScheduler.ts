/**
 * Scheduling helpers: recurrence expansion and send-time optimization heuristics.
 * See docs/email-marketing/scheduling-architecture.md.
 */

import type {
  CampaignPerformanceSnapshot,
  CampaignScheduleConfig,
  ScheduleOccurrence,
  SendTimeOptimizationMode,
} from './emailCampaignTypes.js';

function parseLocalDateTime(isoLocal: string, timeZone: string): Date {
  if (!isoLocal) return new Date(NaN);
  const [datePart, timePart] = isoLocal.split('T');
  if (!datePart || !timePart) return new Date(NaN);
  const [y, mo, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  if ([y, mo, d, hh, mm].some((n) => Number.isNaN(n))) return new Date(NaN);
  const utcGuess = Date.UTC(y!, mo! - 1, d!, hh!, mm ?? 0, 0, 0);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const probe = new Date(utcGuess);
  const parts = Object.fromEntries(
    fmt.formatToParts(probe).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  const displayed = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    0,
    0,
  );
  return new Date(utcGuess + (utcGuess - displayed));
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function addMonthsAnchor(d: Date, months: number): Date {
  const x = new Date(d);
  const day = x.getUTCDate();
  x.setUTCMonth(x.getUTCMonth() + months);
  if (x.getUTCDate() < day) x.setUTCDate(0);
  return x;
}

function applySto(mode: SendTimeOptimizationMode, instant: Date): { instant: Date; stoAdjusted: boolean } {
  if (mode === 'off') return { instant, stoAdjusted: false };
  const out = new Date(instant);
  if (mode === 'engagement') {
    out.setUTCHours(14, 0, 0, 0);
    return { instant: out, stoAdjusted: true };
  }
  out.setUTCHours(9, 30, 0, 0);
  return { instant: out, stoAdjusted: true };
}

export function expandScheduleOccurrences(config: CampaignScheduleConfig, limit = 8): ScheduleOccurrence[] {
  const start = parseLocalDateTime(config.startLocal, config.timeZone);
  if (Number.isNaN(start.getTime())) return [];

  const out: ScheduleOccurrence[] = [];
  if (config.mode === 'once') {
    const { instant, stoAdjusted } = applySto(config.sto, start);
    out.push({
      instant,
      label: instant.toLocaleString('en-US', { timeZone: config.timeZone }),
      stoAdjusted,
    });
    return out;
  }

  let cursor = new Date(start);
  for (let i = 0; i < limit; i++) {
    const { instant, stoAdjusted } = applySto(config.sto, cursor);
    out.push({
      instant,
      label: instant.toLocaleString('en-US', { timeZone: config.timeZone }),
      stoAdjusted,
    });
    if (config.recurring === 'daily') cursor = addDays(cursor, 1);
    else if (config.recurring === 'weekly') cursor = addDays(cursor, 7);
    else if (config.recurring === 'monthly') cursor = addMonthsAnchor(cursor, 1);
    else cursor = addDays(cursor, 7);
  }
  return out;
}

export function syntheticPerformanceSnapshot(schedule: CampaignScheduleConfig): CampaignPerformanceSnapshot {
  const seed = schedule.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const sends = 800 + (seed % 400);
  const delivered = Math.round(sends * 0.985);
  const opens = Math.round(delivered * (0.22 + (seed % 12) / 100));
  const clicks = Math.round(opens * (0.18 + (seed % 8) / 100));
  const unsubscribes = Math.max(1, Math.round(sends * 0.002));
  return {
    campaignId: schedule.id,
    sends,
    delivered,
    opens,
    clicks,
    unsubscribes,
    openRate: opens / Math.max(1, delivered),
    clickRate: clicks / Math.max(1, delivered),
    confidence: 0.42,
  };
}
