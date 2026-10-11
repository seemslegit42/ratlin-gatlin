/**
 * OpenRouter API Client
 */

import type { JsonObject, JsonValue } from '../types.js';

export interface OpenRouterMessage {
  role: string;
  content: string;
}

export interface OpenRouterChatOptions {
  tools?: JsonObject[];
  tool_choice?: string | JsonObject;
  parallel_tool_calls?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterFunctionCall {
  name: string;
  args: JsonObject;
}

export interface OpenRouterChatResult {
  text: string;
  functionCalls?: OpenRouterFunctionCall[];
  raw?: unknown;
}

export function isOpenRouterConfigured(): boolean {
  const key = typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY : '';
  return typeof key === 'string' && key.trim().length > 0;
}

export async function pingOpenRouter(): Promise<boolean> {
  if (!isOpenRouterConfigured()) return false;
  try {
    const key = process.env.OPENROUTER_API_KEY;
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function postOpenRouterChat(
  messages: OpenRouterMessage[],
  model: string,
  options?: OpenRouterChatOptions,
  abortSignal?: AbortSignal,
): Promise<OpenRouterChatResult> {
  const apiKey = typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY : '';
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const payload: JsonObject = {
    model,
    messages: messages as unknown as JsonValue,
    ...(options?.tools ? { tools: options.tools } : {}),
    ...(options?.tool_choice ? { tool_choice: options.tool_choice } : {}),
    ...(typeof options?.temperature === 'number' ? { temperature: options.temperature } : {}),
    ...(typeof options?.max_tokens === 'number' ? { max_tokens: options.max_tokens } : {}),
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://aevon.cloud',
      'X-Title': 'AEVON OS',
    },
    body: JSON.stringify(payload),
    signal: abortSignal,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const choice = data.choices?.[0];
  const message = choice?.message;
  const text = message?.content || '';

  const rawToolCalls = message?.tool_calls;
  let functionCalls: OpenRouterFunctionCall[] | undefined;

  if (Array.isArray(rawToolCalls) && rawToolCalls.length > 0) {
    functionCalls = rawToolCalls.map((tc: any) => {
      let argsObj: JsonObject = {};
      if (typeof tc.function?.arguments === 'string') {
        try {
          argsObj = JSON.parse(tc.function.arguments);
        } catch {
          argsObj = {};
        }
      } else if (typeof tc.function?.arguments === 'object' && tc.function?.arguments !== null) {
        argsObj = tc.function.arguments;
      }
      return {
        name: tc.function?.name || '',
        args: argsObj,
      };
    });
  }

  return {
    text,
    functionCalls,
    raw: data,
  };
}
