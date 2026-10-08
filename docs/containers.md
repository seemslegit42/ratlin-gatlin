# BEEP containers primer

Quick reference for the **BEEP Dominion** Docker Compose stack.

## What runs in Compose

| Service | Image | Role |
|---------|-------|------|
| `ollama` | `ollama/ollama` | GGUF inference (Granite + Gemma) |
| `litellm` | `ghcr.io/berriai/litellm` | OpenAI gateway, retries, fallbacks |
| `postman-mcp` | `Dockerfile.mcp` | Postman API bridge + MCP over HTTP |

**Not in Compose (Phase 1):** Appwrite — hosted on Appwrite Cloud and deployed via CLI.

## Files

| File | Use |
|------|-----|
| `docker-compose.yml` | Production / Dokploy |
| `docker-compose.dev.yml` | Local port overlay (`11434`, `3100`) — merged by `bun cast` only |
| `Dockerfile.mcp` | Multi-stage Bun Alpine MCP server |
| `docker/ollama/entrypoint.sh` | Start Ollama, wait for API, register Modelfile if GGUF present |

## Networks & volumes

- **Network:** `beep_internal` — services talk on internal DNS (`ollama`, `postman-mcp`).
- **Volumes:**
  - `beep_ollama_models` — model weights (survives container recreate)
  - `beep_mcp_logs` — MCP log directory

## Health checks

| Endpoint | Expected |
|----------|----------|
| Ollama | `GET /api/tags` or `ollama list` |
| MCP | `GET /health` → `{ "status": "ok", ... }` |

Compose ordering: `postman-mcp` waits until `ollama` is healthy.

## Resource limits (defaults)

| Service | CPU | Memory |
|---------|-----|--------|
| Ollama | 4.0 | 8G |
| MCP | 1.0 | 512M |

Override via env: `OLLAMA_CPU_LIMIT`, `OLLAMA_MEMORY_LIMIT`, etc.

## Manual commands (escape hatch)

```bash
# Validate manifests
docker compose -f docker-compose.yml -f docker-compose.dev.yml config

# Dev stack (same as cast, without Vite)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --wait

# Production config only
docker compose -f docker-compose.yml up --build --wait

# Logs
docker compose logs -f ollama postman-mcp

# Teardown
docker compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans
```

## Security notes

- Never commit `.env` with real keys; use Dokploy UI or CI secrets.
- Set `OLLAMA_ORIGINS` to your Appwrite Site origin in production (not `*`).
- Set `MCP_ALLOWED_HOSTS` to the Traefik hostname serving MCP.
- `POSTMAN_API_KEY` is server-side only (MCP container env).

## Phase 2 (deferred)

Self-hosted Appwrite: see plan `docker-compose.sovereign.yml` / `EVOLUTION.md` when sovereignty requirements change.
