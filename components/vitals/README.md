# Vitals UI

Small, read-only presentation components for at-a-glance operational metrics.

| File | Responsibility |
|------|----------------|
| `vitals-strip.tsx` | Top-of-shell summary (velocity waveform, disruption index, project status). Non-interactive. |

Expanded pod widgets used by floating desktop widgets live in `components/vitalshud/`. User-facing labels and themes are applied at the shell layer, not in these modules.
