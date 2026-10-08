/**
 * BEEP model catalog — LiteLLM aliases backed by GGUF via Ollama.
 * Granite 4.1 3B: fast mainframe chat. Gemma 4 12B: Weaver architect.
 */

/** LiteLLM alias → Ollama tag for IBM Granite 4.1 3B Q8 */
export const BEEP_MODEL_GRANITE = 'beep-granite';

/** LiteLLM alias → Ollama tag for Gemma 4 12B Q5 (architect / workflow) */
export const BEEP_MODEL_GEMMA = 'beep-gemma';

/** Default when no env override — fast Granite path */
export const DEFAULT_AGENT_LLM_MODEL: string =
  typeof process !== 'undefined' &&
  typeof process.env.DEFAULT_LLM_MODEL === 'string' &&
  process.env.DEFAULT_LLM_MODEL.length > 0
    ? process.env.DEFAULT_LLM_MODEL
    : BEEP_MODEL_GRANITE;

/** BEEP command stream and shared chat helpers use this unless a caller passes an override. */
export function getPrimaryChatModelId(): string {
  if (
    typeof process !== 'undefined' &&
    typeof process.env.DEFAULT_LLM_MODEL === 'string' &&
    process.env.DEFAULT_LLM_MODEL.trim().length > 0
  ) {
    return process.env.DEFAULT_LLM_MODEL.trim();
  }
  if (
    typeof process !== 'undefined' &&
    typeof process.env.BEEP_MODEL_GRANITE === 'string' &&
    process.env.BEEP_MODEL_GRANITE.trim().length > 0
  ) {
    return process.env.BEEP_MODEL_GRANITE.trim();
  }
  if (
    typeof process !== 'undefined' &&
    typeof process.env.OLLAMA_MODEL === 'string' &&
    process.env.OLLAMA_MODEL.trim().length > 0
  ) {
    return process.env.OLLAMA_MODEL.trim();
  }
  return DEFAULT_AGENT_LLM_MODEL;
}

/** LiteLLM cloud fallback aliases (OpenRouter via gateway config). */
export const BEEP_CLOUD_FAST = 'beep-cloud-fast';
export const BEEP_CLOUD_ARCHITECT = 'beep-cloud-architect';

/** OpenRouter model slug for fast cloud fallback when local Granite unavailable. */
export function getCloudFastModelSlug(): string {
  const env =
    typeof process !== 'undefined' ? process.env.OPENROUTER_MODEL_FAST?.trim() : '';
  if (env && env.length > 0) return env;
  const region =
    typeof process !== 'undefined' ? process.env.OPENROUTER_REGION?.trim().toLowerCase() : '';
  return region === 'eu' ? 'meta-llama/llama-3.3-70b-instruct' : 'google/gemma-2-9b-it:free';
}

/** OpenRouter model slug for architect cloud fallback when local Gemma unavailable. */
export function getCloudArchitectModelSlug(): string {
  const env =
    typeof process !== 'undefined' ? process.env.OPENROUTER_MODEL_ARCHITECT?.trim() : '';
  if (env && env.length > 0) return env;
  const region =
    typeof process !== 'undefined' ? process.env.OPENROUTER_REGION?.trim().toLowerCase() : '';
  return region === 'eu' ? 'meta-llama/llama-3.3-70b-instruct' : 'google/gemma-2-27b-it';
}

/** Worker model for openrouter:subagent delegation — fast/cheap tier. */
export function getSubagentWorkerModelSlug(): string {
  const env =
    typeof process !== 'undefined' ? process.env.OPENROUTER_SUBAGENT_WORKER?.trim() : '';
  if (env && env.length > 0) return env;
  const region =
    typeof process !== 'undefined' ? process.env.OPENROUTER_REGION?.trim().toLowerCase() : '';
  return region === 'eu'
    ? '~meta-llama/llama-3.3-70b-instruct'
    : '~google/gemma-2-9b-it:free';
}

/** Resolve OpenRouter slug from a BEEP local/cloud alias. */
export function resolveOpenRouterModelForAlias(alias: string): string {
  const architectIds = new Set([
    BEEP_MODEL_GEMMA,
    BEEP_CLOUD_ARCHITECT,
    'beep-gemma-4-12b',
  ]);
  if (architectIds.has(alias)) {
    return getCloudArchitectModelSlug();
  }
  if (alias === BEEP_CLOUD_FAST || alias.startsWith('beep-cloud')) {
    return getCloudFastModelSlug();
  }
  return getCloudFastModelSlug();
}

/** Weaver workflow synthesis and architect-mode agents — Gemma 12B. */
export function getArchitectModelId(): string {
  if (
    typeof process !== 'undefined' &&
    typeof process.env.BEEP_MODEL_GEMMA === 'string' &&
    process.env.BEEP_MODEL_GEMMA.trim().length > 0
  ) {
    return process.env.BEEP_MODEL_GEMMA.trim();
  }
  if (
    typeof process !== 'undefined' &&
    typeof process.env.ARCHITECT_LLM_MODEL === 'string' &&
    process.env.ARCHITECT_LLM_MODEL.trim().length > 0
  ) {
    return process.env.ARCHITECT_LLM_MODEL.trim();
  }
  return BEEP_MODEL_GEMMA;
}
