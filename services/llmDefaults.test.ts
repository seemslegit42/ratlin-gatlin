import { describe, it, expect, afterEach } from 'bun:test';

async function loadLlmDefaults() {
  const n = crypto.randomUUID();
  return import(`./llmDefaults.js?test=${n}`);
}

describe('llmDefaults / BEEP model resolution', () => {
  const savedEnv: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [key, val] of Object.entries(savedEnv)) {
      if (val === undefined) delete process.env[key];
      else process.env[key] = val;
    }
  });

  it('defaults to beep-granite when env unset', async () => {
    for (const key of ['DEFAULT_LLM_MODEL', 'OLLAMA_MODEL', 'BEEP_MODEL_GRANITE']) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    const mod = await loadLlmDefaults();
    expect(mod.getPrimaryChatModelId()).toBe('beep-granite');
  });

  it('prefers DEFAULT_LLM_MODEL when set', async () => {
    savedEnv.DEFAULT_LLM_MODEL = process.env.DEFAULT_LLM_MODEL;
    savedEnv.OLLAMA_MODEL = process.env.OLLAMA_MODEL;
    process.env.DEFAULT_LLM_MODEL = 'my-custom-tag';
    process.env.OLLAMA_MODEL = 'ignored';
    const mod = await loadLlmDefaults();
    expect(mod.getPrimaryChatModelId()).toBe('my-custom-tag');
  });

  it('routes architect to beep-gemma', async () => {
    savedEnv.ARCHITECT_LLM_MODEL = process.env.ARCHITECT_LLM_MODEL;
    savedEnv.BEEP_MODEL_GEMMA = process.env.BEEP_MODEL_GEMMA;
    delete process.env.ARCHITECT_LLM_MODEL;
    delete process.env.BEEP_MODEL_GEMMA;
    const mod = await loadLlmDefaults();
    expect(mod.getArchitectModelId()).toBe('beep-gemma');
  });
});
