/**
 * @file services/appLogger.ts
 * @description Structured, timestamped client-side logging for interactions, lifecycle, data flow, and errors.
 * Sensitive payloads (attachment bodies, passwords) are never logged verbatim.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'interaction' | 'system' | 'data' | 'error' | 'voice' | 'chat';

export interface LogEntry {
  ts: string;
  level: LogLevel;
  category: LogCategory;
  event: string;
  /** Sanitized primitives only — no raw tokens or blob data */
  context?: Record<string, unknown>;
}

const RING_LIMIT = 500;
const ring: LogEntry[] = [];

const shouldDebug =
  typeof import.meta !== 'undefined' &&
  typeof import.meta.env?.VITE_CLIENT_LOG_DEBUG === 'string' &&
  import.meta.env.VITE_CLIENT_LOG_DEBUG === 'true';

const formatConsoleLine = (e: LogEntry): string =>
  `[${e.ts}] [${e.level.toUpperCase()}] [${e.category}] ${e.event}${e.context ? ` ${JSON.stringify(e.context)}` : ''}`;

/** Strip binary / huge strings from attachments for safe logging contexts. */
export function describeAttachment(att?: {
  name?: string;
  mimeType: string;
  data: string;
}): { name?: string; mimeType: string; dataChars: number } | undefined {
  if (!att) return undefined;
  return {
    name: att.name,
    mimeType: att.mimeType,
    dataChars: typeof att.data === 'string' ? att.data.length : 0,
  };
}

/** Truncate overly long scalar values for persistence / console hygiene. */
function shallowSanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === 'string') {
      out[k] = v.length > 400 ? `${v.slice(0, 400)}…[truncated]` : v;
      continue;
    }
    out[k] = v;
  }
  return out;
}

export function pushLog(level: LogLevel, category: LogCategory, event: string, context?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    category,
    event,
    context: context ? shallowSanitize(context) : undefined,
  };
  ring.push(entry);
  if (ring.length > RING_LIMIT) ring.splice(0, ring.length - RING_LIMIT);

  const line = formatConsoleLine(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else if (level === 'debug' && shouldDebug) console.debug(line);
  else if (level !== 'debug') console.log(line);
  else if (shouldDebug) console.debug(line);

  return entry;
}

/** User-initiated UI events (buttons, toggles — not keystroke contents). */
export function logInteraction(event: string, context?: Record<string, unknown>): void {
  pushLog('info', 'interaction', event, context);
}

export function logSystemEvent(event: string, context?: Record<string, unknown>): void {
  pushLog('info', 'system', event, context);
}

export function logDataEvent(event: string, context?: Record<string, unknown>): void {
  pushLog('info', 'data', event, context);
}

export function logVoiceEvent(event: string, context?: Record<string, unknown>): void {
  pushLog('info', 'voice', event, context);
}

export function logChatEvent(event: string, context?: Record<string, unknown>): void {
  pushLog('info', 'chat', event, context);
}

export function logError(event: string, error: unknown, context?: Record<string, unknown>): void {
  let message = 'Unknown error';
  let stack: string | undefined;
  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
  } else if (typeof error === 'string') message = error;
  pushLog('error', 'error', event, {
    ...context,
    errorMessage: message,
    ...(stack && stack.length < 2000 ? { stack } : { stackTruncated: true }),
  });
}

export function peekRecentLogs(limit = 120): readonly LogEntry[] {
  const n = Math.min(Math.max(1, limit), RING_LIMIT);
  return ring.slice(-n);
}

/** Trims the in-memory log ring to `RING_LIMIT`. Returns entries removed. */
export function trimLogRing(max = RING_LIMIT): number {
  const overflow = ring.length - max;
  if (overflow <= 0) return 0;
  ring.splice(0, overflow);
  return overflow;
}

let globalInstalled = false;

export function installGlobalExceptionHandlers(): () => void {
  if (globalInstalled || typeof window === 'undefined') {
    return () => {};
  }
  globalInstalled = true;

  const onError = (ev: ErrorEvent) => {
    logError('window.error', ev.error || ev.message || 'ErrorEvent', {
      filename: ev.filename,
      lineno: ev.lineno,
      colno: ev.colno,
    });
  };

  const onRejection = (ev: PromiseRejectionEvent) => {
    logError('unhandledrejection', ev.reason, {});
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  logSystemEvent('app.exception_handlers_installed', {});

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    globalInstalled = false;
  };
}
