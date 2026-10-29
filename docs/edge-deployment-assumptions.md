# Edge deployment assumptions (canonical)

All contributors, agents, and operators **must** assume BEEP runs on **edge / constrained** hardware unless a separate runbook explicitly overrides these assumptions.

## Reference environment

| Field | Value |
|--------|--------|
| Tier | Edge / constrained |
| Reference dev hardware | **NVIDIA Jetson Nano, 4 GB RAM** |
| Memory model | Unified (CPU + GPU share the same 4 GB pool) |
| Network default | On-prem; no dependency on public cloud for inference |

This reference device is the **baseline for capacity planning**, Compose sizing, and documentation—not an optional “low-end mode.”

## Architecture implications (policy, not runtime flags)

1. **Inference is a host tool** — llama.cpp (`llama-server`) or an optional Ollama daemon on the device. GGUF paths, quant choice, context size, and GPU layer offloading are operator concerns.
2. **Compose ships the package layer** — gateway (New API), MCP bridge, optional reverse proxy and static UI. Do not treat containerized Ollama as the default product path.
3. **Gateway is on-prem** — OpenAI-compatible API, keys, and routing live on the device. Cloud providers (e.g. OpenRouter) are **opt-in channels only**, never the default data path.
4. **Serialized LLM usage** — matches small RAM: one in-flight gateway transaction at a time in the app (`requestChain`); avoid designs that assume desktop-class parallel inference.
5. **Appwrite (BaaS)** — **self-hosted on-prem by default** (`bun run appwrite:bootstrap`, `docker-compose.sovereign.yml`). Appwrite Cloud is opt-in via env only. On 4 GB edge, Appwrite alone meets upstream minimum RAM; size the stack accordingly (see `docs/self-hosted-appwrite.md`).

## Source of truth in repo

Machine-readable contract (not imported by app logic):

- `config/deployment-profile.ts`

Agent entrypoint:

- `AGENTS.md` → **Deployment assumptions**
