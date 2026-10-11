/**
 * @file services/llamaCppService.ts
 * @description Integration layer for llama.cpp (llama-server) running local GGUF models via OpenAI-compatible endpoints.
 */

import type { JsonObject } from '../types.js';

export type LlamaCppMessagePart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
  | { type: 'audio_url'; audio_url: { url: string } };

export interface LlamaCppMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | LlamaCppMessagePart[];
}

export interface LlamaCppChatOptions {
  temperature?: number;
  max_tokens?: number;
  stop?: string[];
  tools?: JsonObject[];
  top_k?: number;
  top_p?: number;
  min_p?: number;
  repeat_penalty?: number;
  reasoning_budget?: number;
}

export const resolveLlamaCppEndpoint = (): string => {
  const custom = typeof process !== 'undefined' ? process.env.VITE_LLAMACPP_URL || process.env.LLAMACPP_URL : undefined;
  if (custom && custom.trim()) return custom.trim();
  return 'http://localhost:8080';
};

export async function pingLlamaCpp(): Promise<boolean> {
  try {
    const endpoint = resolveLlamaCppEndpoint();
    const res = await fetch(`${endpoint}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    try {
      const endpoint = resolveLlamaCppEndpoint();
      const res = await fetch(`${endpoint}/v1/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export async function postLlamaCppChat(
  messages: LlamaCppMessage[],
  model: string = 'llama-3',
  options?: LlamaCppChatOptions,
  abortSignal?: AbortSignal,
): Promise<{ text: string; raw?: any }> {
  const endpoint = resolveLlamaCppEndpoint();
  const response = await fetch(`${endpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
      ...(options?.stop ? { stop: options.stop } : {}),
      ...(options?.tools ? { tools: options.tools } : {}),
      ...(options?.top_k ? { top_k: options.top_k } : {}),
      ...(options?.top_p ? { top_p: options.top_p } : {}),
      ...(options?.min_p ? { min_p: options.min_p } : {}),
      ...(options?.repeat_penalty ? { repeat_penalty: options.repeat_penalty } : {}),
      ...(options?.reasoning_budget ? { reasoning_budget: options.reasoning_budget } : {}),
    }),
    signal: abortSignal,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`llama.cpp chat error (${response.status}): ${errText}`);
  }

  const data = await response.json() as any;
  const choice = data.choices?.[0];
  const text = choice?.message?.content || data.content || '';
  return { text, raw: data };
}

// ─── Llama CLI Configuration & Command Generator ────────────────────────────

export interface LlamaCliConfig {
  modelSource: 'hf' | 'local';
  model: string;
  systemPrompt?: string;
  singleTurn?: boolean;
  prompt?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  minP?: number;
  predictTokens?: number;
  repeatPenalty?: number;
  contextWindow?: number;
  cpuMoe?: boolean;
  fitMemory?: boolean;
  listDevices?: boolean;
  devices?: string;
  images?: string[];
  audioFiles?: string[];
  reasoningMode?: 'on' | 'off';
  reasoningBudget?: number;
  draftModel?: string;
  specType?: 'draft-simple' | 'draft-mtp' | 'draft-eagle3' | 'none';
  hfRepoDraft?: string;
  extraArgs?: string[];
}

export function buildLlamaCliCommand(config: LlamaCliConfig): string {
  const parts: string[] = ['llama', 'cli'];

  // Model source
  if (config.modelSource === 'hf') {
    parts.push('-hf', config.model);
  } else {
    const formattedModel = config.model.includes(' ') ? `"${config.model}"` : config.model;
    parts.push('-m', formattedModel);
  }

  // System prompt
  if (config.systemPrompt && config.systemPrompt.trim()) {
    parts.push('-sys', `"${config.systemPrompt.trim()}"`);
  }

  // Single turn execution
  if (config.singleTurn) {
    parts.push('-st');
  }

  // Multimodal attachments
  if (config.images && config.images.length > 0) {
    const imgList = config.images.map(s => s.trim()).filter(Boolean).join(',');
    parts.push('--image', `"${imgList}"`);
  }
  if (config.audioFiles && config.audioFiles.length > 0) {
    const audioList = config.audioFiles.map(s => s.trim()).filter(Boolean).join(',');
    parts.push('--audio', `"${audioList}"`);
  }

  // Prompt (for one-off execution)
  if (config.prompt && config.prompt.trim()) {
    parts.push('-p', `"${config.prompt.trim()}"`);
  }

  // Sampling parameters
  if (config.temperature !== undefined) {
    parts.push('--temp', String(config.temperature));
  }
  if (config.topK !== undefined) {
    parts.push('--top-k', String(config.topK));
  }
  if (config.topP !== undefined) {
    parts.push('--top-p', String(config.topP));
  }
  if (config.minP !== undefined) {
    parts.push('--min-p', String(config.minP));
  }
  if (config.predictTokens !== undefined) {
    parts.push('-n', String(config.predictTokens));
  }
  if (config.repeatPenalty !== undefined) {
    parts.push('--repeat-penalty', String(config.repeatPenalty));
  }

  // Performance & Memory
  if (config.contextWindow !== undefined) {
    parts.push('-c', String(config.contextWindow));
  }
  if (config.cpuMoe) {
    parts.push('-cmoe');
  }
  if (config.fitMemory !== undefined) {
    parts.push('--fit', config.fitMemory ? 'on' : 'off');
  }
  if (config.listDevices) {
    parts.push('--list-devices');
  }
  if (config.devices) {
    parts.push('-dev', config.devices);
  }

  // Reasoning models
  if (config.reasoningMode !== undefined) {
    parts.push('-rea', config.reasoningMode);
  }
  if (config.reasoningBudget !== undefined) {
    parts.push('--reasoning-budget', String(config.reasoningBudget));
  }

  // Speculative decoding
  if (config.draftModel) {
    parts.push('-md', config.draftModel.includes(' ') ? `"${config.draftModel}"` : config.draftModel);
  }
  if (config.hfRepoDraft) {
    parts.push('--hf-repo-draft', config.hfRepoDraft);
  }
  if (config.specType && config.specType !== 'none') {
    parts.push('--spec-type', config.specType);
  }

  // Additional custom arguments
  if (config.extraArgs && config.extraArgs.length > 0) {
    parts.push(...config.extraArgs);
  }

  return parts.join(' ');
}

export function parseLlamaCliCommand(cmd: string): Partial<LlamaCliConfig> {
  const result: Partial<LlamaCliConfig> = {};
  if (!cmd || !cmd.trim()) return result;

  // Regex-based argument token matching respecting quotes
  const matches = cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  
  for (let i = 0; i < matches.length; i++) {
    const rawToken = matches[i];
    const token = rawToken.replace(/^["']|["']$/g, '');
    const nextToken = matches[i + 1] ? matches[i + 1].replace(/^["']|["']$/g, '') : undefined;

    if (token === '-hf' && nextToken) {
      result.modelSource = 'hf';
      result.model = nextToken;
      i++;
    } else if (token === '-m' && nextToken) {
      result.modelSource = 'local';
      result.model = nextToken;
      i++;
    } else if (token === '-sys' && nextToken) {
      result.systemPrompt = nextToken;
      i++;
    } else if (token === '-st') {
      result.singleTurn = true;
    } else if (token === '-p' && nextToken) {
      result.prompt = nextToken;
      i++;
    } else if (token === '--temp' && nextToken) {
      result.temperature = parseFloat(nextToken);
      i++;
    } else if (token === '--top-k' && nextToken) {
      result.topK = parseInt(nextToken, 10);
      i++;
    } else if (token === '--top-p' && nextToken) {
      result.topP = parseFloat(nextToken);
      i++;
    } else if (token === '--min-p' && nextToken) {
      result.minP = parseFloat(nextToken);
      i++;
    } else if ((token === '-n' || token === '--predict') && nextToken) {
      result.predictTokens = parseInt(nextToken, 10);
      i++;
    } else if (token === '--repeat-penalty' && nextToken) {
      result.repeatPenalty = parseFloat(nextToken);
      i++;
    } else if (token === '-c' && nextToken) {
      result.contextWindow = parseInt(nextToken, 10);
      i++;
    } else if (token === '-cmoe') {
      result.cpuMoe = true;
    } else if (token === '--fit' && nextToken) {
      result.fitMemory = nextToken === 'on';
      i++;
    } else if (token === '--list-devices') {
      result.listDevices = true;
    } else if (token === '-dev' && nextToken) {
      result.devices = nextToken;
      i++;
    } else if (token === '--image' && nextToken) {
      result.images = nextToken.split(',').map(s => s.trim()).filter(Boolean);
      i++;
    } else if (token === '--audio' && nextToken) {
      result.audioFiles = nextToken.split(',').map(s => s.trim()).filter(Boolean);
      i++;
    } else if (token === '-rea' && nextToken) {
      result.reasoningMode = nextToken === 'off' ? 'off' : 'on';
      i++;
    } else if (token === '--reasoning-budget' && nextToken) {
      result.reasoningBudget = parseInt(nextToken, 10);
      i++;
    } else if (token === '-md' && nextToken) {
      result.draftModel = nextToken;
      i++;
    } else if (token === '--hf-repo-draft' && nextToken) {
      result.hfRepoDraft = nextToken;
      i++;
    } else if (token === '--spec-type' && nextToken) {
      result.specType = nextToken as any;
      i++;
    }
  }

  return result;
}

export interface LlamaReplAction {
  type: 'text' | 'image' | 'audio' | 'help' | 'clear' | 'exit';
  payload: string;
}

export function parseLlamaReplInput(line: string): LlamaReplAction {
  const trimmed = line.trim();
  if (trimmed.startsWith('/image')) {
    return { type: 'image', payload: trimmed.slice(6).trim() };
  }
  if (trimmed.startsWith('/audio')) {
    return { type: 'audio', payload: trimmed.slice(6).trim() };
  }
  if (trimmed === '/help' || trimmed === '/h') {
    return { type: 'help', payload: '' };
  }
  if (trimmed === '/clear' || trimmed === '/cls') {
    return { type: 'clear', payload: '' };
  }
  if (trimmed === '/exit' || trimmed === '/quit' || trimmed === ':q') {
    return { type: 'exit', payload: '' };
  }
  return { type: 'text', payload: trimmed };
}

export interface LlamaCliPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  config: LlamaCliConfig;
}

export const LLAMA_CLI_PRESETS: LlamaCliPreset[] = [
  {
    id: 'gemma-4-hf',
    name: 'Gemma 4 E4B (Hugging Face Hub)',
    badge: 'HF · Q4_0',
    description: 'Direct download & run Gemma 4 E4B instruction-tuned GGUF with multimodal vision/audio support.',
    config: {
      modelSource: 'hf',
      model: 'unsloth/gemma-4-E4B-it-GGUF:Q4_0',
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      minP: 0.05,
      predictTokens: -1,
      repeatPenalty: 1.0,
      contextWindow: 8192,
      fitMemory: true,
    },
  },
  {
    id: 'granite-3b-local',
    name: 'IBM Granite 4.1 3B (Local GGUF)',
    badge: 'Local · Q8_K_XL',
    description: 'Ultra-fast low-latency local mainframe assistant running directly from disk.',
    config: {
      modelSource: 'local',
      model: 'granite-4.1-3b-UD-Q8_K_XL.gguf',
      temperature: 0.1,
      topK: 40,
      topP: 0.9,
      predictTokens: 2048,
      repeatPenalty: 1.05,
      fitMemory: true,
    },
  },
  {
    id: 'gemma-12b-architect',
    name: 'Gemma 4 12B Weaver Architect (MoE + 16k)',
    badge: 'MoE · 16k ctx',
    description: 'High-capacity workflow synthesis model with CPU MoE offloading (-cmoe) and 16k context window.',
    config: {
      modelSource: 'local',
      model: 'Gemma-4-12B-OBLITERATED.i1-Q5_K_M.gguf',
      contextWindow: 16384,
      cpuMoe: true,
      fitMemory: true,
      temperature: 0.7,
      topP: 0.95,
    },
  },
  {
    id: 'speculative-mtp',
    name: 'Speculative Decoding (MTP Draft)',
    badge: 'MTP · 2x Speed',
    description: 'High-speed speculative inference pairing main Gemma 4 model with MTP draft assistant.',
    config: {
      modelSource: 'hf',
      model: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      hfRepoDraft: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      specType: 'draft-mtp',
      temperature: 0.4,
      topP: 0.9,
      fitMemory: true,
    },
  },
  {
    id: 'reasoning-capped',
    name: 'Gemma Thinking (1024 Token Cap)',
    badge: 'Reasoning · Budget 1024',
    description: 'Deep reasoning model with thinking enabled and bounded to 1024 reasoning tokens.',
    config: {
      modelSource: 'hf',
      model: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      reasoningMode: 'on',
      reasoningBudget: 1024,
      temperature: 0.6,
      topK: 40,
      topP: 0.95,
    },
  },
];

