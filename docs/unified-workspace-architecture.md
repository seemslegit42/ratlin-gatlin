# Unified workspace: Live and Architect

The product surface on `/` is **one route, two perspectives**. Nothing else competes with this pair on the home workspace.

| Mode | Persona | What the user sees | Code |
|------|---------|-------------------|------|
| **Live** | Sovereign — outcomes, tasks, BEEP | Conversational shell: vitals + command stream + composer dock | `modules/main/main-view.tsx` |
| **Architect** | Architect — logic, flows, observability | Weaver orchestration canvas (graph, palette, inspector, console) | `modules/weaver/Weaver.tsx` |

## Rules

1. **Same URL** — `/` for both modes. Switching modes is not navigation; it changes lens on the same workspace (`WeaverMode` in `App.tsx`).
2. **Header toggle** — Live / Architect control is shown only on `/` (`Header` + `setMode`).
3. **Veil-Peel** — Gestures that expose logic set `WeaverMode` to `architect` (e.g. long-press on `DraggableWidget` shards, long-press on Weaver nodes). Reverse: toggle back to Live.
4. **Architect hides Live chrome** — On `/` + Architect: no floating desktop widgets, no BEEP composer dock (Weaver panels own that mode).
5. **Other routes** — Finance, CRM, etc. are separate modules opened from the command/navigation sheet. They do not replace Live or Architect; returning to `/` restores the last mode or defaults to Live via `handleNavigate('main')`.

## Types

`WeaverMode = 'live' | 'architect'` in `types.ts`.

Weaver = agent orchestration canvas (legacy name in code: Loom / `executeViaLoom`).
