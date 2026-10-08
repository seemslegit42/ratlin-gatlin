import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

describe('openrouterPolicy', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('defaults to global API origin', async () => {
    delete process.env.OPENROUTER_REGION;
    const mod = await import('./openrouterPolicy.js');
    expect(mod.resolveOpenRouterRegion()).toBe('global');
    expect(mod.resolveOpenRouterApiOrigin()).toBe('https://openrouter.ai/api/v1');
  });

  it('routes to EU origin when OPENROUTER_REGION=eu', async () => {
    process.env.OPENROUTER_REGION = 'eu';
    const mod = await import('./openrouterPolicy.js');
    expect(mod.resolveOpenRouterRegion()).toBe('eu');
    expect(mod.resolveOpenRouterApiOrigin()).toBe('https://eu.openrouter.ai/api/v1');
  });

  it('builds sovereign provider policy with ZDR and deny data collection', async () => {
    process.env.OPENROUTER_ZDR = '1';
    process.env.OPENROUTER_DENY_DATA_COLLECTION = '1';
    const mod = await import('./openrouterPolicy.js');
    expect(mod.buildOpenRouterProviderPolicy()).toEqual({
      zdr: true,
      data_collection: 'deny',
    });
  });

  it('enables native tools when OPENROUTER_NATIVE_TOOLS=1', async () => {
    process.env.OPENROUTER_NATIVE_TOOLS = '1';
    process.env.LLM_BACKEND = 'litellm';
    const mod = await import('./openrouterPolicy.js');
    expect(mod.isOpenRouterNativeToolsEnabled()).toBe(true);
  });
});
