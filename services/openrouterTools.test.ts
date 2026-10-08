import { describe, it, expect } from 'bun:test';
import {
  MAINFRAME_TOOL_DEFINITIONS,
  toOpenRouterTools,
  parseOpenRouterToolCalls,
} from './openrouterTools.js';

describe('openrouterTools', () => {
  it('converts BEEP tool defs to OpenRouter tools schema', () => {
    const tools = toOpenRouterTools(MAINFRAME_TOOL_DEFINITIONS);
    expect(tools).toHaveLength(2);
    expect(tools[0].type).toBe('function');
    const fn = tools[0].function as { name: string; parameters: { required: string[] } };
    expect(fn.name).toBe('navigate');
    expect(fn.parameters.required).toContain('view');
  });

  it('parses tool_calls from OpenRouter response', () => {
    const calls = parseOpenRouterToolCalls([
      {
        id: 'call_abc',
        type: 'function',
        function: {
          name: 'navigate',
          arguments: '{"view":"dashboard"}',
        },
      },
    ]);
    expect(calls).toEqual([{ name: 'navigate', args: { view: 'dashboard' } }]);
  });

  it('returns undefined for empty or invalid tool_calls', () => {
    expect(parseOpenRouterToolCalls(undefined)).toBeUndefined();
    expect(parseOpenRouterToolCalls([])).toBeUndefined();
  });
});
