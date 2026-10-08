import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { getPostmanHealth } from './postmanApiService';

describe('postmanApiService', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            status: 'ok',
            configured: true,
            mcpEndpoint: '/mcp',
            postmanApiBaseUrl: 'https://api.getpostman.com',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('getPostmanHealth calls proxied health route', async () => {
    const health = await getPostmanHealth();
    expect(health.configured).toBe(true);
    expect(health.mcpEndpoint).toBe('/mcp');

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('/api/postman/health');
  });
});
