/**
 * OpenRouter Sovereign AI policy — EU in-region routing, ZDR, data collection controls.
 * @see https://openrouter.ai/docs/guides/features/sovereign-ai
 */

import type { JsonObject } from '../types.js';

export type OpenRouterRegion = 'global' | 'eu';

/** EU enterprise routing: https://eu.openrouter.ai */
export function resolveOpenRouterRegion(): OpenRouterRegion {
  const raw =
    typeof process !== 'undefined' ? process.env.OPENROUTER_REGION?.trim().toLowerCase() : '';
  return raw === 'eu' ? 'eu' : 'global';
}

export function resolveOpenRouterApiOrigin(): string {
  return resolveOpenRouterRegion() === 'eu'
    ? 'https://eu.openrouter.ai/api/v1'
    : 'https://openrouter.ai/api/v1';
}

/**
 * Provider policy for sovereign deployments (ZDR + deny data collection).
 * Pass as `provider` on chat completion requests.
 */
export function buildOpenRouterProviderPolicy(): JsonObject | undefined {
  const zdrEnabled =
    process.env.OPENROUTER_ZDR === '1' ||
    process.env.OPENROUTER_ZDR === 'true' ||
    process.env.OPENROUTER_SOVEREIGN === '1';

  const denyCollection = process.env.OPENROUTER_DENY_DATA_COLLECTION !== '0';

  const provider: JsonObject = {};
  if (zdrEnabled) provider.zdr = true;
  if (denyCollection) provider.data_collection = 'deny';

  return Object.keys(provider).length > 0 ? provider : undefined;
}

export function isOpenRouterNativeToolsEnabled(): boolean {
  if (process.env.OPENROUTER_NATIVE_TOOLS === '0') return false;
  if (process.env.OPENROUTER_NATIVE_TOOLS === '1') return true;
  const backend =
    typeof process !== 'undefined' ? process.env.LLM_BACKEND?.trim().toLowerCase() : '';
  return backend === 'openrouter';
}
