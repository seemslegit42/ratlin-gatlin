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

/** Cloud OpenRouter alias for architect tasks */
export const BEEP_CLOUD_ARCHITECT = 'beep-cloud-architect';

/** Default worker model slug for subagent delegation */
export function getSubagentWorkerModelSlug(): string {
  if (
    typeof process !== 'undefined' &&
    typeof process.env.OPENROUTER_SUBAGENT_WORKER === 'string' &&
    process.env.OPENROUTER_SUBAGENT_WORKER.trim().length > 0
  ) {
    return process.env.OPENROUTER_SUBAGENT_WORKER.trim();
  }
  return 'google/gemma-2-9b-it:free';
}
