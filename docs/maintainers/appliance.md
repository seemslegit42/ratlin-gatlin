# Appliance (dev / start / build)

```bash
cd /path/to/ratlin-gatlin
export BEEP_OPERATOR=1
bun run scripts/run-appliance.ts dev
bun run scripts/run-appliance.ts start
bun run scripts/run-appliance.ts build
```

Vite dev server (via appliance): port **3000**, host `0.0.0.0` (`vite.config.ts`).

```bash
# Operator status (support)
bun run scripts/operator-status.ts
```
