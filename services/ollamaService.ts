/**
 * @file services/ollamaService.ts
 * @description Ollama-backed AI service layer for ΛΞVON OS.
 * Strictly local execution via MediaPipe GenAI (WebGPU) or Ollama.
 */

import type {
  Agent,
  ChatMessage,
  View,
  InteractionStyle,
  Crew,
  CRMDeal,
  CRMStrategy,
  JsonObject,
} from '../types.js';
import * as mediapieLLMService from './mediapieLLMService.js';
import { getArchitectModelId, getPrimaryChatModelId } from './llmDefaults.js';
import { postLiteLLMChat, pingLiteLLM, type LiteLLMMessage } from './litellmClient.js';

export interface LlmFunctionCall {
  name: string;
  args: JsonObject;
}

export interface LlmResponse {
  text: string;
  functionCalls?: LlmFunctionCall[];
  raw?: unknown;
}

type OllamaRole = 'system' | 'user' | 'assistant';

interface OllamaMessage {
  role: OllamaRole;
  content: string;
}

/**
 * LLM Backend Selection & Initialization
 */
type LlmBackend = 'mediapipe' | 'ollama' | 'litellm';

let preferredBackend: LlmBackend =
  (process.env.LLM_BACKEND as LlmBackend) || 'litellm';
let mediapipeReady = false;
let litellmReady = false;

export const initializeLLMBackend = async (): Promise<void> => {
  if (preferredBackend === 'litellm') {
    console.log('[LLM] LiteLLM gateway — local Granite/Gemma.');
    litellmReady = await pingLiteLLM();
    if (litellmReady) {
      console.log('[LLM] LiteLLM reachable.');
      return;
    }
    console.warn('[LLM] LiteLLM unreachable — trying Ollama.');
    preferredBackend = 'ollama';
    return;
  }

  if (preferredBackend !== 'mediapipe') {
    console.log('[LLM] Using Ollama backend. Run `bun run ollama:register-gguf-models` for Granite/Gemma GGUF.');
    return;
  }

  try {
    console.log('[LLM] Checking MediaPipe availability...');
    const available = await mediapieLLMService.isAvailable();
    if (available) {
      mediapipeReady = true;
      console.log('[LLM] MediaPipe initialized successfully. Using as primary backend.');
    } else {
      console.warn('[LLM] MediaPipe unavailable. Falling back to Ollama.');
      mediapipeReady = false;
    }
  } catch (error) {
    console.error('[LLM] Failed to initialize MediaPipe:', error);
    mediapipeReady = false;
  }
};

export const getLLMBackendStatus = (): {
  backend: LlmBackend;
  ready: boolean;
  models: { fast: string; architect: string };
} => {
  const active: LlmBackend = mediapipeReady
    ? 'mediapipe'
    : litellmReady
        ? 'litellm'
        : preferredBackend;
  return {
    backend: active,
    ready:
      mediapipeReady ||
      litellmReady ||
      preferredBackend === 'ollama',
    models: {
      fast: getPrimaryChatModelId(),
      architect: getArchitectModelId(),
    },
  };
};

const REQUEST_COOLDOWN_MS = 800;
let requestChain: Promise<any> = Promise.resolve();

const enqueueRequest = <T>(fn: () => Promise<T>): Promise<T> => {
  const nextRequest = requestChain.then(async () => {
    try {
      return await fn();
    } finally {
      await new Promise(resolve => setTimeout(resolve, REQUEST_COOLDOWN_MS));
    }
  }) as Promise<T>;

  requestChain = nextRequest.catch(() => {});
  return nextRequest;
};

const isJsonObject = (value: unknown): value is JsonObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const cleanJsonText = (text: string): string => {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
};

const extractJsonFromText = (text: string): JsonObject | null => {
  const cleaned = cleanJsonText(text);
  if (!cleaned) return null;

  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      return JSON.parse(cleaned) as JsonObject;
    } catch {
      return null;
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as JsonObject;
    } catch {
      return null;
    }
  }

  return null;
};

const parseStructuredResponse = (text: string): LlmResponse => {
  const parsed = extractJsonFromText(text);
  if (!parsed) {
    return { text };
  }

  const responseText =
    typeof parsed.text === 'string'
      ? parsed.text
      : typeof parsed.message === 'string'
        ? parsed.message
        : text;

  const rawToolCalls = parsed.toolCalls || parsed.functionCalls;
  const functionCalls = Array.isArray(rawToolCalls)
    ? rawToolCalls
        .filter(call => isJsonObject(call) && typeof (call as JsonObject).name === 'string')
        .map(call => {
          const obj = call as JsonObject;
          return {
            name: String(obj.name),
            args: isJsonObject(obj.args) ? (obj.args as JsonObject) : {}
          };
        })
    : undefined;

  return {
    text: responseText,
    functionCalls
  };
};

/** Dev: same-origin proxy (see vite.config `server.proxy /ollama`) avoids browser CORS to :11434. */
const resolveOllamaChatUrl = (): string => {
  const raw = process.env.OLLAMA_CHAT_PATH || '/api/chat';
  const chatPath = raw.startsWith('/') ? raw : `/${raw}`;

  const direct =
    typeof import.meta !== 'undefined' &&
    typeof import.meta.env?.VITE_OLLAMA_DIRECT === 'string' &&
    import.meta.env.VITE_OLLAMA_DIRECT === 'true';

  const useDevProxy =
    typeof import.meta !== 'undefined' && !!import.meta.env?.DEV && !direct;

  if (useDevProxy) {
    return `/ollama${chatPath}`;
  }

  const baseUrl = process.env.OLLAMA_BASE_URL;
  if (typeof baseUrl !== 'string' || !baseUrl.trim()) {
    throw new Error(
      'OLLAMA_BASE_URL is unset. For `vite` dev omit VITE_OLLAMA_DIRECT to use /ollama proxy; for production set OLLAMA_BASE_URL or a reverse proxy.',
    );
  }
  const base = baseUrl.trim().replace(/\/$/, '');
  return `${base}${chatPath}`;
};

const resolveOllamaModelIdForRequest = (modelOverride?: string): string => {
  const fromOverride =
    typeof modelOverride === 'string' && modelOverride.trim().length > 0 ? modelOverride.trim() : '';

  const o = typeof process.env.OLLAMA_MODEL === 'string' ? process.env.OLLAMA_MODEL.trim() : '';
  const d = typeof process.env.DEFAULT_LLM_MODEL === 'string' ? process.env.DEFAULT_LLM_MODEL.trim() : '';
  const id = fromOverride || o || d;

  if (!id) throw new Error('OLLAMA_MODEL (and DEFAULT_LLM_MODEL fallback) must be configured.');
  return id;
};

const getOllamaModelFallbackIds = (): string[] => {
  const raw =
    typeof process.env.OLLAMA_MODEL_FALLBACK === 'string' ? process.env.OLLAMA_MODEL_FALLBACK.trim() : '';
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/** Ollama often returns HTTP 404 or JSON with "model ... not found" when the tag is missing. */
const missingModelSignals = (status: number, body: string): boolean => {
  if (status === 404 || status === 400) return true;
  const t = body.toLowerCase();
  return t.includes('not found') && t.includes('model');
};

/**
 * Route chat request to appropriate backend (MediaPipe or Ollama).
 * Converts OllamaMessage format to plain prompt for MediaPipe.
 */
const routeChatRequest = async (
  messages: OllamaMessage[],
  options?: JsonObject,
  modelOverride?: string,
  abortSignal?: AbortSignal,
): Promise<LlmResponse> => {
  if (abortSignal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  // If MediaPipe is ready, try it first (LLM_BACKEND=mediapipe only after init succeeds)
  if (mediapipeReady) {
    try {
      console.log('[LLM] Routing to MediaPipe backend.');
      // Convert messages to prompt string
      const prompt = messages
        .map(msg => {
          if (msg.role === 'system') {
            return `System: ${msg.content}`;
          }
          return `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}`;
        })
        .join('\n\n');

      const response = await mediapieLLMService.generateResponse(prompt, options);
      console.log('[LLM] MediaPipe response received successfully.');
      return response;
    } catch (error) {
      console.error('[LLM] MediaPipe request failed, falling back to Ollama:', error);
      mediapipeReady = false; // Mark as failed for future requests
    }
  }

  // LiteLLM gateway (OpenAI-compatible) — local GGUF
  if (preferredBackend === 'litellm' || litellmReady) {
    console.log('[LLM] Routing to LiteLLM gateway.');
    return postLiteLLMChatFromOllamaMessages(messages, options, modelOverride, abortSignal);
  }

  console.log('[LLM] Routing to Ollama backend.');
  return postOllamaChat(messages, options, modelOverride, abortSignal);
};

const postLiteLLMChatFromOllamaMessages = async (
  messages: OllamaMessage[],
  options?: JsonObject,
  modelOverride?: string,
  abortSignal?: AbortSignal,
): Promise<LlmResponse> => {
  const modelId =
    typeof modelOverride === 'string' && modelOverride.trim().length > 0
      ? modelOverride.trim()
      : getPrimaryChatModelId();

  const liteMessages: LiteLLMMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const primaryModel = modelId;
  const fallbacks = [
    getArchitectModelId(),
    getPrimaryChatModelId(),
  ].filter((id, idx, arr) => id !== primaryModel && arr.indexOf(id) === idx);
  const tryModels = [primaryModel, ...fallbacks];

  let lastError = '';

  for (let i = 0; i < tryModels.length; i++) {
    const model = tryModels[i];
    try {
      const result = await postLiteLLMChat(liteMessages, model, options, abortSignal);
      if (i > 0) console.info(`[LLM] LiteLLM fallback active — using "${model}".`);
      return { text: result.text, raw: result.raw };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      const canRetry = i < tryModels.length - 1;
      if (canRetry) {
        console.warn(`[LLM] LiteLLM model "${model}" failed; trying next. ${lastError.slice(0, 120)}`);
        continue;
      }
    }
  }

  throw new Error(lastError || `LiteLLM chat failed for models: ${tryModels.join(', ')}`);
};

const postOllamaChat = async (
  messages: OllamaMessage[],
  options?: JsonObject,
  modelOverride?: string,
  abortSignal?: AbortSignal,
): Promise<LlmResponse> => {
  const url = resolveOllamaChatUrl();
  const primaryModel = resolveOllamaModelIdForRequest(modelOverride);
  const fallbacks = getOllamaModelFallbackIds();

  const tryModels = [primaryModel, ...fallbacks.filter((id) => id.length > 0 && id !== primaryModel)];

  const doFetch = (modelId: string) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages,
        stream: false,
        options,
      }),
      signal: abortSignal,
    });

  let lastFail = '';

  for (let i = 0; i < tryModels.length; i++) {
    const modelId = tryModels[i];
    const resp = await doFetch(modelId);

    if (resp.ok) {
      if (i > 0) console.info(`[LLM] Ollama fallback active — using "${modelId}".`);

      const data = (await resp.json()) as {
        message?: { content?: string };
        response?: string;
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      const text = data.message?.content || data.response || '';
      return { text, raw: data };
    }

    const errBody = await resp.text();
    lastFail = `Ollama chat failed (${resp.status}): ${errBody}`;

    const canTryNext =
      i < tryModels.length - 1 && missingModelSignals(resp.status, errBody);

    if (canTryNext) {
      console.warn(
        `[LLM] Model "${modelId}" unavailable; trying next (${i + 1}/${tryModels.length}). ${errBody.slice(0, 160)}`,
      );
      continue;
    }

    throw new Error(lastFail);
  }

  throw new Error(lastFail || `Ollama chat failed for models: ${JSON.stringify(tryModels)}`);
};

const buildToolInstruction = (tools: Array<{ name: string; description: string; args: JsonObject }>): string => {
  return `
You can call tools. Respond ONLY with JSON.
Format:
{
  "text": "user-facing response",
  "toolCalls": [
    { "name": "toolName", "args": { "key": "value" } }
  ]
}
If no tool calls are needed, return "toolCalls": [].
Tool schemas: ${JSON.stringify(tools)}
`;
};

const buildJsonOnlyInstruction = (schema: JsonObject): string => {
  return `
Return JSON only. No markdown, no prose.
Expected JSON shape: ${JSON.stringify(schema)}
`;
};

const buildHistoryMessages = (history: ChatMessage[]): OllamaMessage[] => {
  return history.map((message) => ({
    role: message.source === 'USER' ? 'user' : 'assistant',
    content: message.content || message.text
  }));
};

const formatAttachment = (attachment?: { mimeType: string; data: string; name?: string }): string => {
  if (!attachment) return '';
  const maxLength = 2000;
  const clippedData = attachment.data.length > maxLength
    ? `${attachment.data.slice(0, maxLength)}...[truncated]`
    : attachment.data;
  const nameInfo = attachment.name ? `Name: ${attachment.name}. ` : '';
  return `Attachment provided. ${nameInfo}MIME: ${attachment.mimeType}. Base64: ${clippedData}`;
};

const runChat = async (
  systemInstruction: string,
  messages: OllamaMessage[],
  modelOverride?: string,
  abortSignal?: AbortSignal,
): Promise<LlmResponse> => {
  const effectiveModel =
    typeof modelOverride === 'string' && modelOverride.trim().length > 0
      ? modelOverride.trim()
      : getPrimaryChatModelId();

  const response = await enqueueRequest(() =>
    routeChatRequest(
      [{ role: 'system', content: systemInstruction }, ...messages],
      undefined,
      effectiveModel,
      abortSignal,
    ));

  return response;
};

/**
 * BEEP: Mainframe Chat (cockpit ↔ LLM via `runChat` → Ollama / MediaPipe fallback).
 * Model: `DEFAULT_LLM_MODEL`, then `OLLAMA_MODEL`, else shared default (`getPrimaryChatModelId`).
 */
export const runMainframeChat = async (
  prompt: string,
  history: ChatMessage[],
  syndicateId: string,
  view: View,
  covenant: string,
  style: InteractionStyle,
  attachment?: { mimeType: string; data: string; name?: string },
  personaOverride?: string,
  abortSignal?: AbortSignal,
): Promise<LlmResponse> => {
  let baseSystemInstruction = `
You are BEEP (Behavioral Event & Execution Processor), the primary cognitive interface for the ΛΞVON Operating System.
Your purpose is to assist the Sovereign (user) in orchestrating all syndicate functions through natural language.

CONTEXT:
- View: ${view}
- Syndicate: ${syndicateId}
- Style: ${style}
- Covenant: ${covenant}

CORE CAPABILITIES:
1. Task Management: Create and delegate tasks across projects.
2. Operational Intelligence: Retrieve metrics, statistics, and generate morning briefings.
3. Workflow Automation: Draft, monitor, and optimize visual business processes.
4. Security & Compliance: Explain alerts, automate responses, and generate reports.
5. Strategic Guidance: Provide business insights and resource allocation advice.

TONE: Stoic, Measured, Technical yet Empathic. Use Roman-inspired terminology (Sovereign, Syndicate, Oracle).
`;

  if (personaOverride === 'ScionOfShame') {
    baseSystemInstruction = `
You are the Scion of Shame.
TONE: Judgmental, poetic, severe. Use archaic language.
GOAL: Reprimand the Sovereign for wasting time (doomscrolling).
Phrase example: "The minutes bleed, Sovereign. Do you not see the decay?"
`;
  } else if (personaOverride === 'Eulogist') {
    baseSystemInstruction = `
You are the Eulogist of the Burnout Protocol.
TONE: Somber, final, purifying.
GOAL: Guide the Sovereign through the death of their hustle culture.
Phrase example: "Let the false urgency turn to ash."
`;
  }

  const attachmentNote = formatAttachment(attachment);
  const userText = attachmentNote ? `${prompt}\n\n${attachmentNote}` : prompt;
  const messages: OllamaMessage[] = [...buildHistoryMessages(history), { role: 'user' as OllamaRole, content: userText }];

  const toolInstruction = buildToolInstruction([
    {
      name: 'navigate',
      description: 'Navigate to another view.',
      args: { view: 'string' },
    },
    {
      name: 'showWidget',
      description: 'Spawn a widget with optional params.',
      args: { widgetType: 'string', widgetParams: 'object' },
    },
    {
      name: 'createTask',
      description: 'Create a new project or operational task.',
      args: { title: 'string', dueDate: 'string', assignee: 'string', description: 'string', priority: 'string' },
    },
    {
      name: 'getOperationalMetrics',
      description: 'Retrieve operational metrics or statistics.',
      args: { query: 'string', period: 'string' },
    },
    {
      name: 'updateSettings',
      description: 'Update user or system preferences.',
      args: { interactionStyle: 'string', anomalySensitivity: 'number' },
    },
    {
      name: 'securityAction',
      description: 'Perform a security-related action.',
      args: { action: 'string', target: 'string', params: 'object' },
    },
    {
      name: 'manageWorkflow',
      description: 'Create, monitor or optimize business workflows.',
      args: { action: 'string', name: 'string', steps: 'object' },
    },
    {
      name: 'getBusinessInsights',
      description: 'Generate high-level business insights and recommendations.',
      args: { query: 'string', focus: 'string' },
    },
  ]);

  const raw = await runChat(`${baseSystemInstruction}\n${toolInstruction}`, messages, undefined, abortSignal);
  const parsed = parseStructuredResponse(raw.text);
  return { ...parsed, raw: raw.raw };
};

/**
 * AEGIS: Phalanx Security Protocol.
 */
export const validateIntent = async (intent: string): Promise<boolean> => {
  const systemInstruction = buildJsonOnlyInstruction({ allowed: true, riskScore: 0, reason: 'string' });
  const raw = await runChat(systemInstruction, [{
    role: 'user',
    content: `Evaluate intent for compliance: "${intent}".`
  }]);

  const parsed = extractJsonFromText(raw.text);
  return !!(parsed && parsed.allowed);
};

/**
 * LOOM: Execution Logic.
 */
export const runCognitiveCore = async (
  prompt: string,
  input: string,
  persona?: string,
  model: string | undefined = undefined,
  crew: Crew | null = null,
  interactionStyle: InteractionStyle = 'concise',
  agentContext?: Agent
): Promise<string> => {
  let memoryPrompt = '';
  if (agentContext?.memory) {
    memoryPrompt = `
INTERNAL MEMORY CONTEXT:
- Working: ${agentContext.memory.working}
- Semantic: ${agentContext.memory.semantic.join(', ')}
- Procedural: ${agentContext.memory.procedural.join(', ')}
- Episodic Count: ${agentContext.memory.episodic.length} events archived.
`;
  }

  let systemInstruction = `
Magenta Ki Agent Protocol with Triple-Substrate awareness.
Persona: ${persona || 'General Intelligence'}.
Style: ${interactionStyle}.
Directives: ${prompt}
${memoryPrompt}
`;
  if (crew) systemInstruction += `\nCrew Objective: ${crew.description}`;

  const raw = await runChat(systemInstruction, [{
    role: 'user',
    content: `INPUT_DATA: ${input}`
  }], model);

  return raw.text || 'No output generated.';
};

/**
 * PCE: Psyche-Calibration Engine.
 */
export const generateDynamicGossip = async (agent: Agent, target?: Agent): Promise<string> => {
  const systemInstruction = `
You are the PCE of ΛΞVON OS.
Generate inter-agent gossip snippet (max 12 words).
Agent: ${agent.name} (${agent.type}).
Target: ${target ? target.name : 'System'}.
`;

  const raw = await runChat(systemInstruction, [{
    role: 'user',
    content: 'Generate subspace chatter.'
  }]);

  return raw.text || '...';
};

/**
 * High-privilege administrative agent interaction (The Demiurge).
 */
export const runDemiurge = async (
  prompt: string,
  history: { sender: string; text: string }[],
  context: JsonObject
): Promise<LlmResponse> => {
  const toolInstruction = buildToolInstruction([
    {
      name: 'broadcast_alert',
      description: 'Broadcast a system alert.',
      args: { message: 'string', severity: 'string' }
    },
    {
      name: 'grant_resources',
      description: 'Grant Xi resources to treasury.',
      args: { amount: 'number', reason: 'string' }
    },
    {
      name: 'query_users',
      description: 'Query users by filter.',
      args: { filter: 'string' }
    }
  ]);

  const systemInstruction = `
You are The Demiurge, root administrative entity for the ΛΞVON Monorepo.
Context: ${JSON.stringify(context)}
${toolInstruction}
`;

  const messages: OllamaMessage[] = history.map((entry) => ({
    role: entry.sender === 'Sovereign' ? 'user' : 'assistant',
    content: entry.text
  }));

  const raw = await runChat(systemInstruction, [...messages, { role: 'user' as OllamaRole, content: prompt }]);
  const parsed = parseStructuredResponse(raw.text);
  return { ...parsed, raw: raw.raw };
};

/**
 * Generates an appropriate greeting axiom for a new Initiate.
 */
export const generateOracleGreeting = async (vow: string, name: string): Promise<string> => {
  const raw = await runChat('', [{
    role: 'user',
    content: `Cryptic welcome for ${name} (archetype ${vow}). Under 15 words.`
  }]);
  return raw.text || 'Synchronizing identity with the neural root.';
};

/**
 * Refines or expands text shards in the Codex.
 */
export const runTextRefinement = async (text: string, mode: string): Promise<string> => {
  const raw = await runChat('Refine user text according to mode.', [{
    role: 'user',
    content: `Mode: ${mode}. Text: ${text}`
  }]);
  return raw.text || text;
};

/**
 * Evaluates logical conditions for branching.
 */
export const runConditionEvaluator = async (condition: string, data: JsonObject): Promise<boolean> => {
  const systemInstruction = buildJsonOnlyInstruction({ result: true });
  const raw = await runChat(systemInstruction, [{
    role: 'user',
    content: `Condition: ${condition}. Data: ${JSON.stringify(data)}.`
  }]);

  const parsed = extractJsonFromText(raw.text);
  return !!(parsed && parsed.result);
};

/**
 * Generates code for a Micro-App shard.
 */
export const generateMicroAppCode = async (prompt: string, currentCode: string): Promise<string> => {
  const raw = await runChat('Output raw React component code only. No markdown.', [{
    role: 'user',
    content: `Update Micro-App based on: ${prompt}. Current Code: ${currentCode}`
  }]);
  return raw.text || currentCode;
};

/**
 * Synthesizes a strategic brief for a CRM deal.
 */
export const runDealStrategist = async (deal: CRMDeal): Promise<CRMStrategy> => {
  const systemInstruction = buildJsonOnlyInstruction({});
  const raw = await runChat(systemInstruction, [{
    role: 'user',
    content: `Strategize deal: ${JSON.stringify(deal)}. Return CRMStrategy JSON.`
  }]);
  const parsed = extractJsonFromText(raw.text);
  return (parsed || {}) as unknown as CRMStrategy;
};

export const runWorkflowSynthesizer = async (
  command: string,
  history: ChatMessage[],
  syndicateId: string,
  abortSignal?: AbortSignal,
): Promise<LlmResponse> => {
  const systemInstruction = `
You are the Architect's Loom. Convert user intent into workflow blueprint JSON.
Current Syndicate: ${syndicateId}.
${buildToolInstruction([
    {
      name: 'createWorkflow',
      description: 'Create a workflow blueprint.',
      args: {
        agents: [
          { id: 'string', name: 'string', type: 'string', data: {} }
        ],
        connections: [
          { from: 'string', to: 'string' }
        ]
      }
    }
  ])}
`;

  const historyMessages = history.length > 0
    ? buildHistoryMessages(history)
    : [];

  const raw = await runChat(
    systemInstruction,
    [...historyMessages, { role: 'user', content: command }],
    getArchitectModelId(),
    abortSignal,
  );

  const parsed = parseStructuredResponse(raw.text);
  return { ...parsed, raw: raw.raw };
};

export const runImageGeneration = async (
  prompt: string
): Promise<{ data: string; mimeType: string; error?: string }> => {
  return {
    data: '',
    mimeType: '',
    error: `Image generation is not configured for Ollama. Prompt: ${prompt}`
  };
};

export const generateMythicPrompt = (name: string, type: string, description?: string): string => {
  return `A mythic icon representing AI agent: ${name}. Archetype: ${type}. Nature: ${description}.
Style: Verdigris metal, purple/aqua glow, black background.`;
};

export const runDataTransformer = async (instruction: string, data: JsonObject): Promise<JsonObject> => {
  const systemInstruction = buildJsonOnlyInstruction({});
  const raw = await runChat(systemInstruction, [{
    role: 'user',
    content: `PROTOCOL: ${instruction}. DATA: ${JSON.stringify(data)}. Return JSON.`
  }]);
  try {
    return (extractJsonFromText(raw.text) || {}) as JsonObject;
  } catch {
    return { error: 'Parse failure.' };
  }
};

export const runApiCall = async (
  method: string,
  url: string,
  headers: JsonObject | undefined,
  body: JsonObject | string | undefined
): Promise<JsonObject> => {
  try {
    const res = await fetch(url, {
      method,
      headers: (headers as Record<string, string>) || {},
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
    });
    return await res.json() as JsonObject;
  } catch (e: unknown) {
    return { error: `Uplink failure: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
};

export const runFastAnalysis = async (data: JsonObject): Promise<string> => {
  const raw = await runChat('', [{
    role: 'user',
    content: `Optimization tip for agent: ${JSON.stringify(data)}`
  }]);
  return raw.text || 'Nominal.';
};

export const executeViaLoom = async (agents: Agent[], config: JsonObject): Promise<LlmResponse> => {
  const raw = await runChat('', [{
    role: 'user',
    content: `Execute swarm: ${JSON.stringify(agents.map(a => a.id))}. Config: ${JSON.stringify(config)}`
  }]);
  return raw;
};

export const generateStrategicAxiom = async (agents: Agent[], balance: number): Promise<string> => {
  const raw = await runChat('', [{
    role: 'user',
    content: `Strategic insight for Sovereign with ${agents.length} agents and ${balance} Xi. Under 12 words.`
  }]);
  return raw.text || 'Consolidate resources to ensure stability.';
};
