/**
 * OpenRouter client — unified API with Sovereign AI + tool calling support.
 * @see https://openrouter.ai/docs/quickstart
 * @see https://openrouter.ai/docs/guides/features/sovereign-ai
 * @see https://openrouter.ai/docs/guides/features/tool-calling
 */

import type { JsonObject, JsonValue } from '../types.js';
import {
  buildOpenRouterProviderPolicy,
  resolveOpenRouterApiOrigin,
  resolveOpenRouterRegion,
} from './openrouterPolicy.js';
import { parseOpenRouterToolCalls } from './openrouterTools.js';

export interface OpenRouterToolCallResult {
  name: string;
  args: JsonObject;
}

export type OpenRouterRole = 'system' | 'user' | 'assistant' | 'tool';

export interface OpenRouterMessage {
  role: OpenRouterRole;
  content?: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
  name?: string;
}

export interface OpenRouterChatResult {
  text: string;
  model: string;
  functionCalls?: OpenRouterToolCallResult[];
  finishReason?: string;
  raw: unknown;
}

export interface OpenRouterChatOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  tools?: JsonObject[];
  tool_choice?: JsonObject | string;
  parallel_tool_calls?: boolean;
  provider?: JsonObject;
}

export { resolveOpenRouterRegion, resolveOpenRouterApiOrigin, buildOpenRouterProviderPolicy };
export {
  buildSubagentServerTool,
  mergeToolsWithSubagent,
  isOpenRouterSubagentEnabled,
  isArchitectModelAlias,
} from './openrouterSubagent.js';

/** Resolve API base — dev proxy keeps keys server-side. */
export const resolveOpenRouterBaseUrl = (): string => {
  const direct =
    typeof import.meta !== 'undefined' &&
    typeof import.meta.env?.VITE_OPENROUTER_DIRECT === 'string' &&
    import.meta.env.VITE_OPENROUTER_DIRECT === 'true';

  const useDevProxy =
    typeof import.meta !== 'undefined' && !!import.meta.env?.DEV && !direct;

  if (useDevProxy) {
    return '/openrouter/api/v1';
  }

  const fromVite =
    typeof process !== 'undefined' && typeof process.env.VITE_OPENROUTER_URL === 'string'
      ? process.env.VITE_OPENROUTER_URL.trim()
      : '';

  if (fromVite) {
    return fromVite.replace(/\/$/, '');
  }

  return resolveOpenRouterApiOrigin();
};

export const resolveOpenRouterChatUrl = (): string =>
  `${resolveOpenRouterBaseUrl()}/chat/completions`;

export const resolveOpenRouterApiKey = (): string => {
  const key =
    typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY?.trim() : '';
  return key ?? '';
};

export const resolveOpenRouterAttributionHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const referer =
    (typeof process !== 'undefined' && process.env.OPENROUTER_SITE_URL?.trim()) ||
    (typeof process !== 'undefined' && process.env.VITE_APP_URL?.trim()) ||
    '';
  const title =
    (typeof process !== 'undefined' && process.env.OPENROUTER_APP_NAME?.trim()) ||
    'BEEP Command — ΛΞV & Co.';

  if (referer) headers['HTTP-Referer'] = referer;
  if (title) headers['X-OpenRouter-Title'] = title;
  return headers;
};

export const isOpenRouterConfigured = (): boolean => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return true;
  }
  return resolveOpenRouterApiKey().length > 0;
};

export const pingOpenRouter = async (): Promise<boolean> => {
  try {
    const headers: Record<string, string> = { ...resolveOpenRouterAttributionHeaders() };
    const key = resolveOpenRouterApiKey();
    if (key) headers.Authorization = `Bearer ${key}`;

    const res = await fetch(`${resolveOpenRouterBaseUrl()}/models`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
};

function buildRequestBody(
  messages: OpenRouterMessage[],
  model: string,
  options?: OpenRouterChatOptions,
): JsonObject {
  const provider = options?.provider ?? buildOpenRouterProviderPolicy();

  const body: JsonObject = {
    model,
    messages: messages as unknown as JsonValue,
    stream: false,
  };

  if (typeof options?.temperature === 'number') body.temperature = options.temperature;
  if (typeof options?.top_p === 'number') body.top_p = options.top_p;
  if (typeof options?.max_tokens === 'number') body.max_tokens = options.max_tokens;
  if (options?.tools?.length) body.tools = options.tools;
  if (options?.tool_choice !== undefined) body.tool_choice = options.tool_choice;
  if (typeof options?.parallel_tool_calls === 'boolean') {
    body.parallel_tool_calls = options.parallel_tool_calls;
  }
  if (provider) body.provider = provider;

  return body;
}

export const postOpenRouterChat = async (
  messages: OpenRouterMessage[],
  model: string,
  options?: OpenRouterChatOptions,
  abortSignal?: AbortSignal,
): Promise<OpenRouterChatResult> => {
  const url = resolveOpenRouterChatUrl();
  const body = buildRequestBody(messages, model, options);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...resolveOpenRouterAttributionHeaders(),
  };

  const key = resolveOpenRouterApiKey();
  if (key) headers.Authorization = `Bearer ${key}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: abortSignal,
  });

  const rawText = await resp.text();
  if (!resp.ok) {
    throw new Error(`OpenRouter chat failed (${resp.status}): ${rawText.slice(0, 400)}`);
  }

  let data: {
    choices?: Array<{
      message?: {
        content?: string | null;
        tool_calls?: unknown;
      };
      finish_reason?: string;
    }>;
    model?: string;
    error?: { message?: string };
  };

  try {
    data = JSON.parse(rawText) as typeof data;
  } catch {
    throw new Error(`OpenRouter returned non-JSON: ${rawText.slice(0, 200)}`);
  }

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const choice = data.choices?.[0];
  const message = choice?.message;
  const text = message?.content ?? '';
  const functionCalls = parseOpenRouterToolCalls(message?.tool_calls);

  return {
    text,
    model: data.model ?? model,
    functionCalls,
    finishReason: choice?.finish_reason,
    raw: data,
  };
};

/** Agentic loop — execute tool round-trips until model returns text (max iterations). */
export const postOpenRouterChatWithToolLoop = async (
  initialMessages: OpenRouterMessage[],
  model: string,
  tools: JsonObject[],
  executeTool: (name: string, args: JsonObject) => Promise<JsonObject | string>,
  options?: OpenRouterChatOptions,
  abortSignal?: AbortSignal,
  maxIterations = 8,
): Promise<OpenRouterChatResult> => {
  const messages = [...initialMessages];
  const chatOptions: OpenRouterChatOptions = {
    ...options,
    tools,
    tool_choice: options?.tool_choice ?? 'auto',
  };

  let lastResult: OpenRouterChatResult | null = null;

  for (let i = 0; i < maxIterations; i += 1) {
    if (abortSignal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    lastResult = await postOpenRouterChat(messages, model, chatOptions, abortSignal);

    if (!lastResult.functionCalls?.length) {
      return lastResult;
    }

    const rawChoice = (lastResult.raw as JsonObject)?.choices as JsonObject[] | undefined;
    const assistantMessage = rawChoice?.[0]?.message;
    if (assistantMessage && typeof assistantMessage === 'object' && !Array.isArray(assistantMessage)) {
      messages.push(assistantMessage as unknown as OpenRouterMessage);
    } else {
      messages.push({ role: 'assistant', content: lastResult.text || '' });
    }

    for (let t = 0; t < lastResult.functionCalls.length; t += 1) {
      const call = lastResult.functionCalls[t];
      const toolCalls = (assistantMessage as JsonObject | undefined)?.tool_calls as
        | JsonObject[]
        | undefined;
      const callId =
        typeof toolCalls?.[t]?.id === 'string' ? (toolCalls[t].id as string) : `call_${t}`;

      const toolResult = await executeTool(call.name, call.args);
      messages.push({
        role: 'tool',
        tool_call_id: callId,
        name: call.name,
        content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
      });
    }
  }

  if (lastResult) return lastResult;
  throw new Error('OpenRouter tool loop produced no result');
};
