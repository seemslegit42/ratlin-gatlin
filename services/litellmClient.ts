/**
 * LiteLLM OpenAI-compatible client — enterprise gateway for GGUF models.
 * Dev: Vite proxies `/llm` → LiteLLM. Prod: `VITE_LITELLM_URL` or Appwrite env.
 */

import type { JsonObject } from '../types.js';

export type LiteLLMRole = 'system' | 'user' | 'assistant';

export interface LiteLLMMessage {
  role: LiteLLMRole;
  content: string;
}

export interface LiteLLMChatResult {
  text: string;
  model: string;
  raw: unknown;
}

const resolveLiteLLMBaseUrl = (): string => {
  const direct =
    typeof import.meta !== 'undefined' &&
    typeof import.meta.env?.VITE_LITELLM_DIRECT === 'string' &&
    import.meta.env.VITE_LITELLM_DIRECT === 'true';

  const useDevProxy =
    typeof import.meta !== 'undefined' && !!import.meta.env?.DEV && !direct;

  if (useDevProxy) {
    return '/llm';
  }

  const fromVite =
    typeof process !== 'undefined' && typeof process.env.VITE_LITELLM_URL === 'string'
      ? process.env.VITE_LITELLM_URL.trim()
      : '';

  const fromEnv =
    typeof process !== 'undefined' && typeof process.env.LITELLM_BASE_URL === 'string'
      ? process.env.LITELLM_BASE_URL.trim()
      : '';

  const base = fromVite || fromEnv;
  if (!base) {
    throw new Error(
      'LITELLM_BASE_URL unset. In dev, omit VITE_LITELLM_DIRECT to use /llm proxy; in prod set VITE_LITELLM_URL.',
    );
  }
  return base.replace(/\/$/, '');
};

export const resolveLiteLLMChatUrl = (): string => {
  return `${resolveLiteLLMBaseUrl()}/v1/chat/completions`;
};

export const resolveLiteLLMApiKey = (): string => {
  const key =
    (typeof process !== 'undefined' && process.env.LITELLM_API_KEY?.trim()) ||
    (typeof process !== 'undefined' && process.env.LITELLM_MASTER_KEY?.trim()) ||
    'sk-beep-local';
  return key;
};

/** Probe LiteLLM readiness (models list). */
export const pingLiteLLM = async (): Promise<boolean> => {
  try {
    const base = resolveLiteLLMBaseUrl();
    const res = await fetch(`${base}/v1/models`, {
      headers: { Authorization: `Bearer ${resolveLiteLLMApiKey()}` },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const postLiteLLMChat = async (
  messages: LiteLLMMessage[],
  model: string,
  options?: JsonObject,
  abortSignal?: AbortSignal,
): Promise<LiteLLMChatResult> => {
  const url = resolveLiteLLMChatUrl();
  const body = {
    model,
    messages,
    stream: false,
    ...(options && typeof options === 'object'
      ? {
          ...(typeof options.temperature === 'number' ? { temperature: options.temperature } : {}),
          ...(typeof options.top_p === 'number' ? { top_p: options.top_p } : {}),
          ...(typeof options.max_tokens === 'number' ? { max_tokens: options.max_tokens } : {}),
        }
      : {}),
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resolveLiteLLMApiKey()}`,
    },
    body: JSON.stringify(body),
    signal: abortSignal,
  });

  const rawText = await resp.text();
  if (!resp.ok) {
    throw new Error(`LiteLLM chat failed (${resp.status}): ${rawText.slice(0, 400)}`);
  }

  let data: {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
    error?: { message?: string };
  };

  try {
    data = JSON.parse(rawText) as typeof data;
  } catch {
    throw new Error(`LiteLLM returned non-JSON: ${rawText.slice(0, 200)}`);
  }

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const text = data.choices?.[0]?.message?.content ?? '';
  return {
    text,
    model: data.model ?? model,
    raw: data,
  };
};
