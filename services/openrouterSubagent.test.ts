import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

describe('openrouterSubagent', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('builds subagent server tool with worker model', async () => {
    process.env.OPENROUTER_SUBAGENT_WORKER = '~google/gemma-2-9b-it:free';
    const mod = await import('./openrouterSubagent.js');
    const tool = mod.buildSubagentServerTool();
    expect(tool.type).toBe('openrouter:subagent');
    const params = tool.parameters as { model: string; instructions: string };
    expect(params.model).toBe('~google/gemma-2-9b-it:free');
    expect(params.instructions).toContain('BEEP worker');
  });

  it('merges subagent only for architect aliases when architect-only', async () => {
    process.env.OPENROUTER_SUBAGENT = '1';
    process.env.OPENROUTER_SUBAGENT_ARCHITECT_ONLY = '1';
    const mod = await import('./openrouterSubagent.js');

    const architectTools = mod.mergeToolsWithSubagent([], 'beep-gemma');
    expect(architectTools).toHaveLength(1);
    expect(architectTools[0].type).toBe('openrouter:subagent');

    const fastTools = mod.mergeToolsWithSubagent([], 'beep-granite');
    expect(fastTools).toHaveLength(0);
  });

  it('includes web_search nested tool when enabled', async () => {
    process.env.OPENROUTER_SUBAGENT = '1';
    process.env.OPENROUTER_SUBAGENT_WEB_SEARCH = '1';
    const mod = await import('./openrouterSubagent.js');
    const tool = mod.buildSubagentServerTool();
    const params = tool.parameters as { tools: Array<{ type: string }> };
    expect(params.tools?.[0]?.type).toBe('openrouter:web_search');
  });
});
