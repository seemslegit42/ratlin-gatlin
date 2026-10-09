# AGENTS.md

## Cursor Cloud specific instructions

### Quick Reference

| Action | Command |
|--------|---------|
| Install deps | `bun install` |
| **Founder spell (recommended)** | `bun cast` — Compose (Ollama + LiteLLM + MCP) + Vite |
| Register Granite/Gemma GGUF | `bun run ollama:register-gguf-models` |
| Cast status / teardown | `bun cast --status` · `bun cast --down` |
| CIVariant (CI) | `bun cast:deploy` or `DOKPLOY=1 bun cast --deploy` |
| Dev server (Vite only) | `bun run dev:vite` (port 3000) |
| Dev (with MCP bridge) | `bun run dev` (Vite + Postman MCP on 3100) |
| Build | `bun run build` |
| Typecheck | `bun run typecheck` |
| Tests | `bun test` |
| Compose validate | `docker compose -f docker-compose.yml -f docker-compose.dev.yml config` |
| Appwrite full push | `bash scripts/deploy-appwrite-all.sh` |
| Generate Appwrite types | `bun run types:generate` · `bun run types:strict` |

### Docker / Compose

- **Primary artifact:** `docker-compose.yml` (Ollama + LiteLLM + Postman MCP). See `docs/llm.md`.
- **Local overlay:** `docker-compose.dev.yml` exposes `:11434` and `:3100`; merged automatically by `bun cast`.
- **Docs:** `docs/deploy.md` (Dokploy + Appwrite), `docs/containers.md` (Compose primer).
- **Dokploy env template:** `.env.dokploy.example`
- **Appwrite CLI config:** `appwrite.config.json` (sites, functions, tables, buckets).

### Runtime Requirements

- **Bun** (≥1.1.0) — package manager and runtime. Install with `curl -fsSL https://bun.sh/install | bash` if missing; add `$HOME/.bun/bin` to `PATH`.
- **Docker** with Compose v2 plugin — required for `bun cast`.
- **No Node.js lockfile** — only `bun.lock` exists; always use `bun install`, never `npm`/`pnpm`/`yarn`.

### Gotchas

- **Appwrite auth required**: The app gates all routes behind Appwrite email+password authentication. Without valid Appwrite credentials (already in `.env`), you cannot reach the main dashboard views. The login page is the deepest UI reachable without a verified account.
- **Typecheck has pre-existing errors**: `bun run typecheck` reports TS errors in `GlassPane.tsx`, `Tooltip.tsx`, and `useEmailMarketingState.ts` — these are pre-existing and not caused by your changes.
- **Vite proxy**: The dev server at `:3000` proxies `/ollama` → localhost:11434 (Ollama) and `/api/postman`, `/mcp` → localhost:3100 (Postman MCP). If those backends aren't running, the proxy errors are non-blocking for UI development.
- **Production URLs**: Set `VITE_OLLAMA_URL` and `VITE_MCP_URL` in Appwrite Site env for prod; dev proxies unchanged.
- **Ollama not required for UI dev**: The AI chat features require Ollama with a registered GGUF model, but the rest of the platform works without it.
- **Build warnings**: Vite build warns about large chunks (>500KB) for `index` and `XiDashboard` — this is expected and not an error.
- **MCP health**: `GET /health` on port 3100; set `MCP_ALLOWED_HOSTS` for Traefik hostnames in production.
