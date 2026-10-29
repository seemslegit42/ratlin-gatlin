# Live mode (unified home)

**Live** is one of exactly two perspectives on `/`. **Architect** is the other (`modules/weaver/`).

| File | Role |
|------|------|
| `main-view.tsx` | Live shell: vitals strip + command stream |
| `MainView.tsx` | Re-export |

Composer dock mounts from `App.tsx` when `WeaverMode === 'live'` on `/`. Architect mode on the same route replaces this surface entirely.

See [Unified workspace architecture](../../docs/unified-workspace-architecture.md).
