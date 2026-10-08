/**
 * MCP server exposing Postman API operations as tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PostmanClient } from './postmanClient.js';

export function createPostmanMcpServer(client: PostmanClient): McpServer {
  const server = new McpServer(
    {
      name: 'aevon-postman-bridge',
      version: '1.0.0',
    },
    {
      capabilities: { logging: {} },
      instructions:
        'Bridge to the Postman API. Use list_workspaces and list_collections to discover APIs. Requires POSTMAN_API_KEY on the host.',
    },
  );

  server.registerTool(
    'postman_health',
    {
      description: 'Verify Postman API connectivity and return the authenticated user.',
      inputSchema: {},
    },
    async () => {
      const me = await client.getMe();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                status: 'ok',
                user: me.user,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    'postman_list_workspaces',
    {
      description: 'List Postman workspaces accessible to the API key.',
      inputSchema: {},
    },
    async () => {
      const { workspaces } = await client.listWorkspaces();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ workspaces }, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    'postman_list_collections',
    {
      description: 'List Postman collections, optionally filtered by workspace ID.',
      inputSchema: {
        workspaceId: z
          .string()
          .optional()
          .describe('Postman workspace ID to scope collections'),
      },
    },
    async ({ workspaceId }) => {
      const { collections } = await client.listCollections(workspaceId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ collections }, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    'postman_get_collection',
    {
      description: 'Fetch full collection detail by UID.',
      inputSchema: {
        collectionUid: z.string().describe('Postman collection UID'),
      },
    },
    async ({ collectionUid }) => {
      const result = await client.getCollection(collectionUid);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  return server;
}
