import { describe, expect, it } from 'bun:test';
import {
  buildLlamaCliCommand,
  parseLlamaCliCommand,
  parseLlamaReplInput,
  LLAMA_CLI_PRESETS,
  type LlamaCliConfig,
} from './llamaCppService';

describe('llamaCliService - buildLlamaCliCommand', () => {
  it('builds basic HF command with model tag', () => {
    const cmd = buildLlamaCliCommand({
      modelSource: 'hf',
      model: 'unsloth/gemma-4-E4B-it-GGUF:Q4_0',
    });
    expect(cmd).toBe('llama cli -hf unsloth/gemma-4-E4B-it-GGUF:Q4_0');
  });

  it('builds basic local model command with -m flag', () => {
    const cmd = buildLlamaCliCommand({
      modelSource: 'local',
      model: 'my-model.gguf',
    });
    expect(cmd).toBe('llama cli -m my-model.gguf');
  });

  it('includes system prompt and single turn flags', () => {
    const cmd = buildLlamaCliCommand({
      modelSource: 'local',
      model: 'model.gguf',
      systemPrompt: 'You are a concise assistant that answers in bullet points.',
      singleTurn: true,
      prompt: 'Give me a baklava recipe',
    });
    expect(cmd).toContain('llama cli -m model.gguf');
    expect(cmd).toContain('-sys "You are a concise assistant that answers in bullet points."');
    expect(cmd).toContain('-st');
    expect(cmd).toContain('-p "Give me a baklava recipe"');
  });

  it('formats sampling flags with precise parameters', () => {
    const cmd = buildLlamaCliCommand({
      modelSource: 'hf',
      model: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      minP: 0.05,
      predictTokens: 512,
      repeatPenalty: 1.1,
    });
    expect(cmd).toContain('--temp 0.2');
    expect(cmd).toContain('--top-k 40');
    expect(cmd).toContain('--top-p 0.95');
    expect(cmd).toContain('--min-p 0.05');
    expect(cmd).toContain('-n 512');
    expect(cmd).toContain('--repeat-penalty 1.1');
  });

  it('formats performance and memory flags including context and cmoe', () => {
    const cmd = buildLlamaCliCommand({
      modelSource: 'local',
      model: 'model.gguf',
      contextWindow: 16384,
      cpuMoe: true,
      fitMemory: true,
      devices: 'cuda:0',
    });
    expect(cmd).toContain('-c 16384');
    expect(cmd).toContain('-cmoe');
    expect(cmd).toContain('--fit on');
    expect(cmd).toContain('-dev cuda:0');
  });

  it('handles multimodal image and audio inputs', () => {
    const cmd = buildLlamaCliCommand({
      modelSource: 'hf',
      model: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      images: ['image.png', 'chart.png'],
      audioFiles: ['/audio/sample.mp3'],
      prompt: 'Describe this image and audio',
    });
    expect(cmd).toContain('--image "image.png,chart.png"');
    expect(cmd).toContain('--audio "/audio/sample.mp3"');
    expect(cmd).toContain('-p "Describe this image and audio"');
  });

  it('handles reasoning model flags and budget', () => {
    const cmdOff = buildLlamaCliCommand({
      modelSource: 'hf',
      model: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      reasoningMode: 'off',
    });
    expect(cmdOff).toContain('-rea off');

    const cmdBudget = buildLlamaCliCommand({
      modelSource: 'local',
      model: 'model.gguf',
      reasoningBudget: 1024,
    });
    expect(cmdBudget).toContain('--reasoning-budget 1024');
  });

  it('handles speculative decoding with drafter model and spec-type', () => {
    const cmdLocal = buildLlamaCliCommand({
      modelSource: 'local',
      model: 'big-model.gguf',
      draftModel: 'small-draft-model.gguf',
      specType: 'draft-simple',
    });
    expect(cmdLocal).toContain('-m big-model.gguf');
    expect(cmdLocal).toContain('-md small-draft-model.gguf');
    expect(cmdLocal).toContain('--spec-type draft-simple');

    const cmdHf = buildLlamaCliCommand({
      modelSource: 'hf',
      model: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      hfRepoDraft: 'ggml-org/gemma-4-e4b-it-GGUF:Q4_0',
      specType: 'draft-mtp',
    });
    expect(cmdHf).toContain('-hf ggml-org/gemma-4-e4b-it-GGUF:Q4_0');
    expect(cmdHf).toContain('--hf-repo-draft ggml-org/gemma-4-e4b-it-GGUF:Q4_0');
    expect(cmdHf).toContain('--spec-type draft-mtp');
  });
});

describe('llamaCliService - parseLlamaCliCommand', () => {
  it('parses basic flags back to config object', () => {
    const raw = 'llama cli -hf unsloth/gemma-4-E4B-it-GGUF:Q4_0 --temp 0.2 --top-k 40 --top-p 0.95 -c 8192 -cmoe -rea off';
    const parsed = parseLlamaCliCommand(raw);
    expect(parsed.modelSource).toBe('hf');
    expect(parsed.model).toBe('unsloth/gemma-4-E4B-it-GGUF:Q4_0');
    expect(parsed.temperature).toBe(0.2);
    expect(parsed.topK).toBe(40);
    expect(parsed.topP).toBe(0.95);
    expect(parsed.contextWindow).toBe(8192);
    expect(parsed.cpuMoe).toBe(true);
    expect(parsed.reasoningMode).toBe('off');
  });

  it('parses local model with quotes and single turn', () => {
    const raw = 'llama cli -m "path/to/my model.gguf" -sys "Assistant" -st -p "Hello world"';
    const parsed = parseLlamaCliCommand(raw);
    expect(parsed.modelSource).toBe('local');
    expect(parsed.model).toBe('path/to/my model.gguf');
    expect(parsed.systemPrompt).toBe('Assistant');
    expect(parsed.singleTurn).toBe(true);
    expect(parsed.prompt).toBe('Hello world');
  });
});

describe('llamaCliService - parseLlamaReplInput', () => {
  it('recognizes /image REPL slash command', () => {
    const res = parseLlamaReplInput('/image screenshot.png');
    expect(res.type).toBe('image');
    expect(res.payload).toBe('screenshot.png');
  });

  it('recognizes /audio REPL slash command', () => {
    const res = parseLlamaReplInput('/audio /path/to/sample.wav');
    expect(res.type).toBe('audio');
    expect(res.payload).toBe('/path/to/sample.wav');
  });

  it('recognizes /help and /clear REPL slash commands', () => {
    expect(parseLlamaReplInput('/help').type).toBe('help');
    expect(parseLlamaReplInput('/clear').type).toBe('clear');
  });

  it('treats regular input as standard prompt text', () => {
    const res = parseLlamaReplInput('explain quantum teleportation');
    expect(res.type).toBe('text');
    expect(res.payload).toBe('explain quantum teleportation');
  });
});

describe('llamaCliService - LLAMA_CLI_PRESETS', () => {
  it('defines valid presets for Gemma 4, Granite, and Speculative Decoding', () => {
    expect(LLAMA_CLI_PRESETS.length).toBeGreaterThanOrEqual(4);
    const gemmaPreset = LLAMA_CLI_PRESETS.find(p => p.id === 'gemma-4-hf');
    expect(gemmaPreset).toBeDefined();
    expect(gemmaPreset?.config.modelSource).toBe('hf');

    const draftPreset = LLAMA_CLI_PRESETS.find(p => p.id === 'speculative-mtp');
    expect(draftPreset).toBeDefined();
    expect(draftPreset?.config.specType).toBe('draft-mtp');
  });
});
