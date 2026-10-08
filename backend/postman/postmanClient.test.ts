import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { PostmanClient } from './postmanClient';

describe('PostmanClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ workspaces: [{ id: 'w1', name: 'Test', type: 'personal' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('listWorkspaces sends X-Api-Key header', async () => {
    const client = new PostmanClient({
      apiKey: 'PMAK-test-key',
      baseUrl: 'https://api.getpostman.com',
    });

    const result = await client.listWorkspaces();

    expect(result.workspaces).toHaveLength(1);
    expect(result.workspaces[0]?.name).toBe('Test');

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('PMAK-test-key');
  });

  test('request throws on API error body', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: { name: 'AuthError', message: 'Invalid API key' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ) as typeof fetch;

    const client = new PostmanClient({
      apiKey: 'bad',
      baseUrl: 'https://api.getpostman.com',
    });

    await expect(client.getMe()).rejects.toThrow('Invalid API key');
  });
});
