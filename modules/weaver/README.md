# Architect mode (Weaver)

**Architect** is one of exactly two perspectives on `/`. **Live** is the other (`modules/main/`).

Weaver = orchestration canvas: graph, palette, inspector, console, timeline. Shown when `WeaverMode === 'architect'` on `/` — same URL as Live, no separate portal.

Veil-Peel on nodes (`Node.tsx`, `isVeiled`) and on live shards (`DraggableWidget` → `setMode('architect')`) both enter Architect perspective.

See [Unified workspace architecture](../../docs/unified-workspace-architecture.md).
