/**
 * OpenRouter native tool calling — schema conversion + response parsing.
 * @see https://openrouter.ai/docs/guides/features/tool-calling
 */

import type { JsonObject } from '../types.js';

export interface ParsedToolCall {
  name: string;
  args: JsonObject;
}

export interface BeepToolDefinition {
  name: string;
  description: string;
  args: JsonObject;
}

/** BEEP mainframe cockpit tools (navigate, showWidget). */
export const MAINFRAME_TOOL_DEFINITIONS: BeepToolDefinition[] = [
  {
    name: 'navigate',
    description: 'Navigate to another view in ΛΞVON OS.',
    args: { view: 'string' },
  },
  {
    name: 'showWidget',
    description: 'Spawn a widget with optional parameters.',
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
    description: 'Update user or system preferences (interaction style, anomaly sensitivity).',
    args: { interactionStyle: 'string', anomalySensitivity: 'number' },
  },
  {
    name: 'securityAction',
    description: 'Perform a security-related action (isolate device, generate report, configure feed).',
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
];

const jsonSchemaType = (hint: unknown): string => {
  if (typeof hint === 'string') return hint === 'object' ? 'object' : 'string';
  return 'string';
};

/** Convert BEEP tool defs to OpenRouter `tools` array. */
export function toOpenRouterTools(defs: BeepToolDefinition[]): JsonObject[] {
  return defs.map((tool) => {
    const properties: JsonObject = {};
    const required: string[] = [];

    for (const [key, hint] of Object.entries(tool.args)) {
      const type = jsonSchemaType(hint);
      properties[key] = {
        type,
        description: `${key} parameter for ${tool.name}`,
        ...(type === 'object' ? { additionalProperties: true } : {}),
      };
      required.push(key);
    }

    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties,
          required,
        },
      },
    };
  });
}

export function parseOpenRouterToolCalls(rawCalls: unknown): ParsedToolCall[] | undefined {
  if (!Array.isArray(rawCalls)) return undefined;

  const calls: ParsedToolCall[] = [];
  for (const call of rawCalls) {
    if (!call || typeof call !== 'object') continue;
    const fn = (call as JsonObject).function as JsonObject | undefined;
    const name = typeof fn?.name === 'string' ? fn.name : '';
    if (!name) continue;

    let args: JsonObject = {};
    const argRaw = fn?.arguments;
    if (typeof argRaw === 'string' && argRaw.trim()) {
      try {
        const parsed = JSON.parse(argRaw) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          args = parsed as JsonObject;
        }
      } catch {
        args = { raw: argRaw };
      }
    } else if (argRaw && typeof argRaw === 'object' && !Array.isArray(argRaw)) {
      args = argRaw as JsonObject;
    }

    calls.push({ name, args });
  }

  return calls.length ? calls : undefined;
}
