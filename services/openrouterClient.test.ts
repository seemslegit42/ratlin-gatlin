import { describe, it, expect } from 'bun:test';

describe('openrouterClient', () => {
  it('exposes OpenRouter API helpers', async () => {
    const mod = await import('./openrouterClient.js');
    expect(typeof mod.resolveOpenRouterChatUrl).toBe('function');
    expect(typeof mod.resolveOpenRouterAttributionHeaders).toBe('function');
    expect(typeof mod.postOpenRouterChatWithToolLoop).toBe('function');
    expect(mod.resolveOpenRouterAttributionHeaders()['X-OpenRouter-Title']).toContain('BEEP');
  });

  it('re-exports sovereign policy helpers', async () => {
    const mod = await import('./openrouterClient.js');
    expect(typeof mod.buildOpenRouterProviderPolicy).toBe('function');
    expect(typeof mod.resolveOpenRouterRegion).toBe('function');
  });

  it('re-exports subagent helpers', async () => {
    const mod = await import('./openrouterClient.js');
    expect(typeof mod.buildSubagentServerTool).toBe('function');
    expect(typeof mod.mergeToolsWithSubagent).toBe('function');
  });
});
