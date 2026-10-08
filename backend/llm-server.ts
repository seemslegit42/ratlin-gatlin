/**
 * @file backend/llm-server.ts
 * @description Local LLM inference backend for Beepin.
 * Converted from Bun.serve to Express for Node.js 22 compatibility.
 */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.LLM_SERVER_PORT || 3001;
const MODEL_PATH = process.env.MODEL_PATH || './assets/gemma-3n-E4B-it-int4.task';

console.log('[LLM Server] Starting local inference backend...');
console.log(`[LLM Server] Model: ${MODEL_PATH}`);
console.log(`[LLM Server] Port: ${PORT}`);

let model: any = null;

const initializeModel = async () => {
  try {
    console.log('[LLM Server] Loading model (STUB)...');
    // Actual model loading logic would go here
    model = { loaded: true }; 
    console.log('[LLM Server] Model loaded successfully (STUB).');
  } catch (error) {
    console.error('[LLM Server] Failed to load model:', error);
    process.exit(1);
  }
};

const generateResponse = async (prompt: string): Promise<string> => {
  if (!model) {
    throw new Error('Model not initialized.');
  }
  console.log('[LLM Server] Generating response (STUB) for prompt:', prompt.slice(0, 100));
  return `[MODEL NOT CONFIGURED] Received prompt: ${prompt.slice(0, 50)}...`;
};

// Health check
app.get(['/health', '/api/tags'], (_req, res) => {
  res.json({ status: 'ok', models: ['gemma-3n-E4B-it'] });
});

// Chat endpoint (Ollama-compatible)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], prompt: bodyPrompt } = req.body;
    
    let prompt = bodyPrompt || '';
    if (messages.length > 0 && !prompt) {
      const lastMessage = messages[messages.length - 1];
      prompt = lastMessage?.content || '';
    }

    if (!prompt) {
      res.status(400).json({ error: 'No prompt provided' });
      return;
    }

    const text = await generateResponse(prompt);

    res.json({
      model: 'gemma-3n-E4B-it',
      message: { role: 'assistant', content: text },
      done: true,
    });
  } catch (error) {
    console.error('[LLM Server] Request failed:', error);
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`[LLM Server] Listening on http://localhost:${PORT}`);
  initializeModel();
});

export default app;
