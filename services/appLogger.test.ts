import { describe, it, expect, spyOn, afterEach } from 'bun:test';
import { describeAttachment, peekRecentLogs, pushLog, logInteraction } from './appLogger.js';

describe('appLogger', () => {
  const mocks: Array<ReturnType<typeof spyOn>> = [];

  afterEach(() => {
    mocks.splice(0).forEach((m) => m.mockRestore());
  });

  it('describeAttachment never returns raw payload', () => {
    const d = describeAttachment({
      name: 'secret.doc',
      mimeType: 'application/octet-stream',
      data: 'x'.repeat(10_000),
    });
    expect(d).toEqual({
      name: 'secret.doc',
      mimeType: 'application/octet-stream',
      dataChars: 10_000,
    });
    expect(JSON.stringify(d)).not.toContain('xxxx');
  });

  it('pushLog truncates long string context fields', () => {
    mocks.push(spyOn(console, 'error').mockImplementation(() => {}));
    const long = 'a'.repeat(500);
    pushLog('error', 'chat', 'test.long_context', { note: long });
    const last = peekRecentLogs(120).find((x) => x.event === 'test.long_context');
    expect(last?.context?.note).toBeTruthy();
    expect(String(last?.context?.note).length).toBeLessThan(450);
    expect(String(last?.context?.note)).toContain('[truncated]');
  });

  it('logInteraction emits entries with timestamps', () => {
    mocks.push(spyOn(console, 'log').mockImplementation(() => {}));
    logInteraction('identity.login_attempt', { mode: 'login' });
    const e = peekRecentLogs(120).find((x) => x.event === 'identity.login_attempt');
    expect(e?.event).toBe('identity.login_attempt');
    expect(e?.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(e?.category).toBe('interaction');
  });
});
