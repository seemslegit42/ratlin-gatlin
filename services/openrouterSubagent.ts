/**
 * OpenRouter `openrouter:subagent` server tool — delegate sub-tasks to a worker model.
 * @see https://openrouter.ai/docs/guides/features/server-tools/subagent
 */

import type { JsonObject } from '../types.js';
import { BEEP_CLOUD_ARCHITECT, BEEP_MODEL_GEMMA, getArchitectModelId, getSubagentWorkerModelSlug } from './llmDefaults.js';

export const SUBAGENT_TOOL_TYPE = 'openrouter:subagent';

export interface OpenRouterSubagentParameters {
  model?: string;
  instructions?: string;
  tools?: JsonObject[];
  max_tool_calls?: number;
  max_completion_tokens?: number;
  temperature?: number;
  reasoning?: JsonObject;
}

export function isOpenRouterSubagentEnabled(): boolean {
  if (process.env.OPENROUTER_SUBAGENT === '0') return false;
  if (process.env.OPENROUTER_SUBAGENT === '1') return true;
  return false;
}

/** Subagent only on architect-tier requests by default. */
export function isOpenRouterSubagentArchitectOnly(): boolean {
  return process.env.OPENROUTER_SUBAGENT_ARCHITECT_ONLY !== '0';
}

export function resolveSubagentWorkerModel(): string {
  const fromEnv =
    typeof process !== 'undefined' ? process.env.OPENROUTER_SUBAGENT_WORKER?.trim() : '';
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return getSubagentWorkerModelSlug();
}

export function resolveSubagentInstructions(): string | undefined {
  const raw =
    typeof process !== 'undefined' ? process.env.OPENROUTER_SUBAGENT_INSTRUCTIONS?.trim() : '';
  if (raw && raw.length > 0) return raw;
  return 'You are a fast, focused BEEP worker. Complete the delegated task exactly as described. Return concise, structured output.';
}

function parseOptionalInt(envKey: string): number | undefined {
  const raw = typeof process !== 'undefined' ? process.env[envKey]?.trim() : '';
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalFloat(envKey: string): number | undefined {
  const raw = typeof process !== 'undefined' ? process.env[envKey]?.trim() : '';
  if (!raw) return undefined;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

function buildSubagentWorkerNestedTools(): JsonObject[] | undefined {
  const webSearch =
    process.env.OPENROUTER_SUBAGENT_WEB_SEARCH === '1' ||
    process.env.OPENROUTER_SUBAGENT_WEB_SEARCH === 'true';
  if (!webSearch) return undefined;
  return [{ type: 'openrouter:web_search' }];
}

/** Build the OpenRouter server tool entry for mid-generation delegation. */
export function buildSubagentServerTool(
  overrides?: Partial<OpenRouterSubagentParameters>,
): JsonObject {
  const parameters: JsonObject = {
    model: overrides?.model ?? resolveSubagentWorkerModel(),
    instructions: overrides?.instructions ?? resolveSubagentInstructions(),
  };

  const nestedTools = overrides?.tools ?? buildSubagentWorkerNestedTools();
  if (nestedTools?.length) parameters.tools = nestedTools as unknown as JsonObject;

  const maxToolCalls = overrides?.max_tool_calls ?? parseOptionalInt('OPENROUTER_SUBAGENT_MAX_TOOL_CALLS');
  if (typeof maxToolCalls === 'number') parameters.max_tool_calls = maxToolCalls;

  const maxTokens =
    overrides?.max_completion_tokens ?? parseOptionalInt('OPENROUTER_SUBAGENT_MAX_COMPLETION_TOKENS');
  if (typeof maxTokens === 'number') parameters.max_completion_tokens = maxTokens;

  const temperature = overrides?.temperature ?? parseOptionalFloat('OPENROUTER_SUBAGENT_TEMPERATURE');
  if (typeof temperature === 'number') parameters.temperature = temperature;

  return {
    type: SUBAGENT_TOOL_TYPE,
    parameters,
  };
}

const ARCHITECT_ALIASES = new Set<string>([
  BEEP_MODEL_GEMMA,
  BEEP_CLOUD_ARCHITECT,
  'beep-gemma-4-12b',
]);

export function isArchitectModelAlias(alias: string): boolean {
  const trimmed = alias.trim();
  if (!trimmed) return false;
  if (ARCHITECT_ALIASES.has(trimmed)) return true;
  if (trimmed === getArchitectModelId()) return true;
  const lower = trimmed.toLowerCase();
  return lower.includes('architect') || lower.includes('beep-gemma') || lower.includes('beep-cloud-architect');
}

/** Merge client function tools with optional subagent server tool. */
export function mergeToolsWithSubagent(
  tools: JsonObject[],
  modelAlias: string,
): JsonObject[] {
  if (!isOpenRouterSubagentEnabled()) return tools;
  if (isOpenRouterSubagentArchitectOnly() && !isArchitectModelAlias(modelAlias)) return tools;

  const subagent = buildSubagentServerTool();
  const hasSubagent = tools.some((t) => t.type === SUBAGENT_TOOL_TYPE);
  if (hasSubagent) return tools;
  return [...tools, subagent];
}
