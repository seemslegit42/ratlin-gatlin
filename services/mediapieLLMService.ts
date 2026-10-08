/**
 * @file services/mediapieLLMService.ts
 * @description MediaPipe GenAI LLM service for local browser-based inference via WebGPU.
 * Provides interface compatible with ollamaService for seamless fallback switching.
 */

import type { LlmResponse } from './ollamaService.js';
import type { JsonObject } from '../types.js';

// Lazy-loaded MediaPipe API
let LlmInference: any;
let FilesetResolver: any;

// Instance cache
let llmInstance: any | null = null;
let mediapipeInitialized = false;
let initPromise: Promise<boolean> | null = null;

/**
 * Check if WebGPU is available in the browser.
 */
export const hasWebGPU = async (): Promise<boolean> => {
  try {
    const gpu = (navigator as any).gpu;
    if (!gpu) return false;
    const adapter = await gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
};

/**
 * Initialize MediaPipe GenAI runtime.
 * Must be called before generateResponse.
 */
export const initializeMediaPipe = async (): Promise<boolean> => {
  // Return cached initialization if already in progress
  if (initPromise) return initPromise;

  if (mediapipeInitialized && llmInstance) {
    return true;
  }

  initPromise = (async () => {
    try {
      console.log('[MediaPipe] Initializing GenAI runtime...');

      // Check WebGPU availability
      const gpuAvailable = await hasWebGPU();
      if (!gpuAvailable) {
        console.warn('[MediaPipe] WebGPU not available; falling back to Ollama.');
        mediapipeInitialized = false;
        return false;
      }

      // Dynamically import MediaPipe
      const mediapipe = await import('@mediapipe/tasks-genai');
      FilesetResolver = mediapipe.FilesetResolver;
      LlmInference = mediapipe.LlmInference;

      if (!LlmInference || !FilesetResolver) {
        throw new Error('MediaPipe GenAI not properly imported.');
      }

      console.log('[MediaPipe] FilesetResolver and LlmInference loaded.');

      // Resolve WASM path
      const wasmPath = process.env.MEDIAPIPE_WASM_PATH || 
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm';

      console.log(`[MediaPipe] Using WASM path: ${wasmPath}`);

      // Initialize GenAI runtime (WASM)
      const genai = await FilesetResolver.forGenAiTasks(wasmPath);

      // Get model path from env, fallback to default
      let modelPath = process.env.MEDIAPIPE_MODEL_PATH || 
        '/assets/gemma-3n-E4B-it-int4-Web.litertlm';

      // If .litertlm doesn't exist, try .task format
      if (!modelPath.endsWith('.task')) {
        // Try to detect which file actually exists in assets
        const litertlmPath = '/assets/gemma-3n-E4B-it-int4-Web.litertlm';
        const taskPath = '/assets/gemma-3n-E4B-it-int4.task';
        
        // For browser, we need to try the web-converted format first,
        // but if .task is all we have, MediaPipe might still support it
        modelPath = litertlmPath;
      }

      console.log(`[MediaPipe] Loading model from: ${modelPath}`);

      // Create LLM instance
      llmInstance = await LlmInference.createFromOptions(genai, {
        baseOptions: {
          modelAssetPath: modelPath,
        },
        maxTokens: 1024,
        topK: 40,
        temperature: 0.7,
        randomSeed: 101,
      });

      mediapipeInitialized = true;
      console.log('[MediaPipe] LLM initialized successfully.');
      return true;
    } catch (error) {
      console.error('[MediaPipe] Initialization failed:', error);
      mediapipeInitialized = false;
      llmInstance = null;
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
};

/**
 * Serialize requests to avoid concurrency issues.
 */
const REQUEST_COOLDOWN_MS = 800;
let requestChain: Promise<unknown> = Promise.resolve();

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

/**
 * Generate a response using MediaPipe LLM.
 * Supports text and streaming responses.
 */
export const generateResponse = async (
  prompt: string,
  _options?: JsonObject,
  onChunk?: (chunk: string) => void
): Promise<LlmResponse> => {
  return enqueueRequest(async () => {
    if (!mediapipeInitialized || !llmInstance) {
      throw new Error('MediaPipe LLM not initialized.');
    }

    try {
      console.log('[MediaPipe] Generating response for prompt:', prompt.slice(0, 100));

      // At this time, MediaPipe GenAI LLM Inference does not support streaming in the web API.
      // Collect full response and emit chunks if callback provided.
      let fullText = '';

      // Generate response (non-streaming for now)
      const response = await llmInstance.generateResponse(prompt);

      if (typeof response === 'string') {
        fullText = response;
      } else if (response && typeof response === 'object') {
        fullText = response.text || JSON.stringify(response);
      }

      // If callback provided, simulate streaming by chunking the response
      if (onChunk) {
        const chunkSize = Math.max(1, Math.floor(fullText.length / 10)); // 10 chunks
        for (let i = 0; i < fullText.length; i += chunkSize) {
          const chunk = fullText.slice(i, i + chunkSize);
          onChunk(chunk);
        }
      }

      console.log('[MediaPipe] Response generated successfully.');

      return {
        text: fullText,
        raw: response,
      };
    } catch (error) {
      console.error('[MediaPipe] Generation failed:', error);
      throw error;
    }
  });
};

/**
 * Determine backend availability.
 */
export const isAvailable = async (): Promise<boolean> => {
  try {
    const hasGpu = await hasWebGPU();
    if (!hasGpu) {
      console.log('[MediaPipe] WebGPU not available.');
      return false;
    }

    // Try to initialize (or reuse existing initialization)
    const initialized = await initializeMediaPipe();
    if (!initialized) {
      console.log('[MediaPipe] Initialization failed.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[MediaPipe] Availability check failed:', error);
    return false;
  }
};

/**
 * Reset MediaPipe instance (for cleanup or testing).
 */
export const reset = () => {
  llmInstance = null;
  mediapipeInitialized = false;
  initPromise = null;
  console.log('[MediaPipe] Instance reset.');
};
