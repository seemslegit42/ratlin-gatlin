/**
 * Postman API configuration loaded from environment.
 * API keys: https://postman.postman.co/settings/me/api-keys
 */

export interface PostmanConfig {
  apiKey: string;
  baseUrl: string;
}

const DEFAULT_BASE_URL = 'https://api.getpostman.com';

export function loadPostmanConfig(): PostmanConfig | null {
  const apiKey = process.env.POSTMAN_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const baseUrl = (process.env.POSTMAN_API_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, '');

  return { apiKey, baseUrl };
}

export function isPostmanConfigured(): boolean {
  return loadPostmanConfig() !== null;
}
