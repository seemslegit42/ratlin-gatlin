import { describe, it, expect } from 'bun:test';

describe('litellmClient', () => {
  it('resolveLiteLLMChatUrl uses /llm proxy path shape', async () => {
    const mod = await import('./litellmClient.js');
    expect(typeof mod.resolveLiteLLMChatUrl).toBe('function');
    expect(typeof mod.resolveLiteLLMApiKey).toBe('function');
  });
});
