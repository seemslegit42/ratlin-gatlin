# Weaver (The Creative Forge)

Weaver is the primary graph-based workflow engine for agent and micro-app creation.

## Core Concepts
- **Nodes:** Atoms of workflow execution (LLM prompts, tool calls, branch logic).
- **Edges:** State transition flows between nodes.
- **Canvas:** The visual workspace managing node orchestration.

## Key Files
- `modules/weaver/Weaver.tsx`: The primary interface.
- `modules/weaver/WeaverCanvasCore.tsx`: The engine logic for dragging, dropping, and connecting.

## Architectural Notes
- The weaver uses a state-driven approach via `useWeaverUI.ts` for managing interaction states (dragging, connecting).
- It is designed to be highly modular—new agent types can be added via the factory pattern in `services/agentFactory.ts`.

## Maintenance
- **Breaking Changes:** Modifying the `Node` schema requires updating `weaverService.ts` and the `types.ts` registry.
