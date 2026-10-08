/**
 * Browser-facing Postman integration via Vite-proxied REST routes.
 * API keys stay on the MCP/Postman backend; the UI only calls same-origin /api/postman.
 */

export interface PostmanHealthStatus {
  status: string;
  configured: boolean;
  mcpEndpoint: string;
  postmanApiBaseUrl: string;
}

export interface PostmanWorkspace {
  id: string;
  name: string;
  type: string;
}

export interface PostmanCollectionSummary {
  id: string;
  name: string;
  uid?: string;
}

const API_PREFIX = '/api/postman';

async function postmanFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body?.error ?? `Postman API error ${response.status}`);
  }

  return body;
}

export async function getPostmanHealth(): Promise<PostmanHealthStatus> {
  return postmanFetch<PostmanHealthStatus>('/health');
}

export async function verifyPostmanConnection(): Promise<{
  user: { id: number; username: string; email: string };
}> {
  return postmanFetch('/me');
}

export async function listPostmanWorkspaces(): Promise<{ workspaces: PostmanWorkspace[] }> {
  return postmanFetch('/workspaces');
}

export async function listPostmanCollections(
  workspaceId?: string,
): Promise<{ collections: PostmanCollectionSummary[] }> {
  const query = workspaceId ? `?workspace=${encodeURIComponent(workspaceId)}` : '';
  return postmanFetch(`/collections${query}`);
}

export async function getPostmanCollection(
  collectionUid: string,
): Promise<{ collection: unknown }> {
  return postmanFetch(`/collections/${encodeURIComponent(collectionUid)}`);
}
