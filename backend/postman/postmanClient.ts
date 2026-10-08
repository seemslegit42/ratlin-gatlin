/**
 * Minimal Postman REST API client (https://api.getpostman.com).
 */

import type { PostmanConfig } from './config.js';
import { loadPostmanConfig } from './config.js';

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

export interface PostmanApiError {
  error: {
    name: string;
    message: string;
  };
}

export class PostmanClient {
  constructor(private readonly config: PostmanConfig) {}

  static fromEnv(): PostmanClient | null {
    const config = loadPostmanConfig();
    return config ? new PostmanClient(config) : null;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        'X-Api-Key': this.config.apiKey,
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    const body = (await response.json().catch(() => ({}))) as T | PostmanApiError;

    if (!response.ok) {
      const err = body as PostmanApiError;
      const message =
        err?.error?.message ??
        `Postman API ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return body as T;
  }

  async getMe(): Promise<{ user: { id: number; username: string; email: string } }> {
    return this.request('/me');
  }

  async listWorkspaces(): Promise<{ workspaces: PostmanWorkspace[] }> {
    return this.request('/workspaces');
  }

  async listCollections(workspaceId?: string): Promise<{ collections: PostmanCollectionSummary[] }> {
    const query = workspaceId ? `?workspace=${encodeURIComponent(workspaceId)}` : '';
    return this.request(`/collections${query}`);
  }

  async getCollection(collectionUid: string): Promise<{ collection: unknown }> {
    return this.request(`/collections/${encodeURIComponent(collectionUid)}`);
  }
}
