/**
 * Postman API proxy + local MCP server for ΛΞVON development.
 *
 * - REST: /api/postman/*  (proxies Postman API with server-side API key)
 * - MCP:  POST /mcp       (Streamable HTTP, stateless)
 *
 * Usage: bun run dev:mcp
 * Vite proxies /api/postman and /mcp to this server (see vite.config.ts).
 */

import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Request, Response } from 'express';
import { createPostmanMcpServer } from './postman/createMcpServer.js';
import { isPostmanConfigured, loadPostmanConfig } from './postman/config.js';
import { PostmanClient } from './postman/postmanClient.js';

const PORT = Number(process.env.MCP_SERVER_PORT || 3100);
const HOST = process.env.MCP_SERVER_HOST || '0.0.0.0';

function resolveAllowedHosts(): string[] {
  const raw = process.env.MCP_ALLOWED_HOSTS?.trim();
  if (!raw || raw === '*') {
    return ['localhost', '127.0.0.1', '[::1]'];
  }
  return raw
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
}

const app = createMcpExpressApp({
  host: HOST,
  allowedHosts: resolveAllowedHosts(),
});

function json(res: Response, status: number, body: unknown): void {
  res.status(status).json(body);
}

function requireClient(res: Response): PostmanClient | null {
  const client = PostmanClient.fromEnv();
  if (!client) {
    json(res, 503, {
      error: 'Postman API key not configured',
      hint: 'Set POSTMAN_API_KEY in .env (https://postman.postman.co/settings/me/api-keys)',
    });
    return null;
  }
  return client;
}

async function handleApiError(res: Response, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  json(res, 502, { error: message });
}

/** Liveness/readiness for Docker, Dokploy, and Postman monitors. */
app.get('/health', (_req: Request, res: Response) => {
  json(res, 200, {
    status: 'ok',
    service: 'beep-postman-mcp',
    configured: isPostmanConfigured(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

/** Health and configuration status (no upstream call). */
app.get('/api/postman/health', (_req: Request, res: Response) => {
  const configured = isPostmanConfigured();
  json(res, 200, {
    status: 'ok',
    configured,
    mcpEndpoint: '/mcp',
    postmanApiBaseUrl: loadPostmanConfig()?.baseUrl ?? 'https://api.getpostman.com',
  });
});

/** Verify API key against Postman /me. */
app.get('/api/postman/me', async (_req: Request, res: Response) => {
  const client = requireClient(res);
  if (!client) return;
  try {
    const me = await client.getMe();
    json(res, 200, me);
  } catch (error) {
    await handleApiError(res, error);
  }
});

app.get('/api/postman/workspaces', async (_req: Request, res: Response) => {
  const client = requireClient(res);
  if (!client) return;
  try {
    const data = await client.listWorkspaces();
    json(res, 200, data);
  } catch (error) {
    await handleApiError(res, error);
  }
});

app.get('/api/postman/collections', async (req: Request, res: Response) => {
  const client = requireClient(res);
  if (!client) return;
  const workspaceId =
    typeof req.query.workspace === 'string' ? req.query.workspace : undefined;
  try {
    const data = await client.listCollections(workspaceId);
    json(res, 200, data);
  } catch (error) {
    await handleApiError(res, error);
  }
});

app.get('/api/postman/collections/:uid', async (req: Request, res: Response) => {
  const client = requireClient(res);
  if (!client) return;
  const uid = req.params.uid;
  if (!uid) {
    json(res, 400, { error: 'Collection UID required' });
    return;
  }
  try {
    const data = await client.getCollection(uid);
    json(res, 200, data);
  } catch (error) {
    await handleApiError(res, error);
  }
});

/** MCP Streamable HTTP (stateless, one server instance per request). */
app.post('/mcp', async (req: Request, res: Response) => {
  const client = PostmanClient.fromEnv();
  if (!client) {
    json(res, 503, {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'POSTMAN_API_KEY is not configured on the MCP server',
      },
      id: null,
    });
    return;
  }

  const server = createPostmanMcpServer(client);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    console.error('[MCP] Request failed:', error);
    if (!res.headersSent) {
      json(res, 500, {
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

app.get('/mcp', (_req: Request, res: Response) => {
  json(res, 405, {
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed. Use POST for MCP.' },
    id: null,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`[postman-mcp] Listening on http://${HOST}:${PORT}`);
  console.log(`[postman-mcp] Postman API configured: ${isPostmanConfigured()}`);
  console.log(`[postman-mcp] MCP endpoint: POST http://localhost:${PORT}/mcp`);
  console.log(`[postman-mcp] REST proxy: GET http://localhost:${PORT}/api/postman/*`);
});
