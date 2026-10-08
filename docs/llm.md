# BEEP LLM stack — Granite + Gemma via LiteLLM

Enterprise inference for your GGUF models in `/home/titan/projects/gguf`:

| Model | File | LiteLLM alias | Role |
|-------|------|---------------|------|
| IBM Granite 4.1 3B Q8 | `granite-4.1-3b-UD-Q8_K_XL.gguf` | `beep-granite` | Mainframe chat, fast agents |
| Gemma 4 12B Q5 | `Gemma-4-12B-OBLITERATED.i1-Q5_K_M.gguf` | `beep-gemma` | Weaver architect, workflow synthesis |

## Architecture

```
Browser → LiteLLM (:4000, OpenAI /v1/chat/completions)
            ├── beep-granite  → Ollama / granite GGUF
            ├── beep-gemma    → Ollama / Gemma GGUF
            ├── beep-cloud-fast      → OpenRouter
            └── beep-cloud-architect → OpenRouter
         (health checks, retries, local ↔ cloud fallbacks)
```

GGUF files are served by **Ollama**. LiteLLM is the **gateway**. **OpenRouter** is the cloud tier when local models are unavailable or for cloud-only mode.

## OpenRouter (cloud + Sovereign AI)

Per [OpenRouter quickstart](https://openrouter.ai/docs/quickstart) and [Sovereign AI](https://openrouter.ai/docs/guides/features/sovereign-ai):

```bash
OPENROUTER_API_KEY=sk-or-v1-...        # LiteLLM container / dev .env only — never VITE_
OPENROUTER_REGION=eu                   # enterprise EU in-region routing
OPENROUTER_API_BASE=https://eu.openrouter.ai/api/v1
OPENROUTER_SOVEREIGN=1
OPENROUTER_ZDR=1                       # zero data retention
OPENROUTER_DENY_DATA_COLLECTION=1    # provider.data_collection: deny
OPENROUTER_NATIVE_TOOLS=1              # mainframe uses OpenRouter tools API
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=BEEP Command — ΛΞV & Co.
OPENROUTER_MODEL_FAST=meta-llama/llama-3.3-70b-instruct
OPENROUTER_MODEL_ARCHITECT=meta-llama/llama-3.3-70b-instruct
LLM_CLOUD_FALLBACK=1                    # 0 = disable cloud escape hatch
```

EU-eligible models: [openrouter.ai/models?region=eu](https://openrouter.ai/models?region=eu) or `GET https://eu.openrouter.ai/api/v1/models`.

### Native tool calling

When `OPENROUTER_NATIVE_TOOLS=1`, mainframe chat sends `tools` / `tool_calls` per [OpenRouter tool calling](https://openrouter.ai/docs/guides/features/tool-calling) instead of JSON-in-prompt parsing. Cockpit tools: `navigate`, `showWidget`.

| Mode | When |
|------|------|
| `LLM_BACKEND=litellm` | Local Granite/Gemma + OpenRouter via LiteLLM fallbacks (default) |
| `LLM_BACKEND=openrouter` | Cloud-only — dev uses Vite `/openrouter` proxy (key server-side) |

Dev proxy targets `https://eu.openrouter.ai` when `OPENROUTER_REGION=eu`.

### Subagent server tool (beta)

When `OPENROUTER_SUBAGENT=1`, architect-tier OpenRouter requests include `openrouter:subagent` so the parent model can delegate focused sub-tasks to a cheaper worker model mid-generation. See [Subagent server tool](https://openrouter.ai/docs/guides/features/server-tools/subagent).

```bash
OPENROUTER_SUBAGENT=1
OPENROUTER_SUBAGENT_ARCHITECT_ONLY=1          # default — only beep-gemma / architect paths
OPENROUTER_SUBAGENT_WORKER=~google/gemma-2-9b-it:free
# OPENROUTER_SUBAGENT_WEB_SEARCH=1            # worker may use openrouter:web_search
```

Subagent runs server-side on OpenRouter — it applies when traffic hits OpenRouter directly (`LLM_BACKEND=openrouter`) or via cloud fallback on architect models. Local LiteLLM → Ollama paths do not execute server tools.

## Local setup

```bash
# 1. Register GGUF in host Ollama (one time)
cd beep
bun run ollama:register-gguf-models

# 2. Start stack (Ollama + LiteLLM + MCP)
bun cast

# 3. Dev UI
# Vite proxies /llm → LiteLLM :4000
```

## Environment

```bash
LLM_BACKEND=litellm
DEFAULT_LLM_MODEL=beep-granite
BEEP_MODEL_GEMMA=beep-gemma
LITELLM_BASE_URL=http://localhost:4000
LITELLM_API_KEY=sk-beep-local
GGUF_HOST_PATH=../gguf
```

Production (Appwrite Sites): set `VITE_LITELLM_URL=https://llm.yourdomain.com`.

## Robustness

- LiteLLM: 3 retries, health-check routing, Granite ↔ Gemma ↔ OpenRouter fallbacks
- Ollama: 20G memory limit, 2 parallel slots, both models pre-registered on boot
- Frontend: serialized requests (`enqueueRequest`), abort support, architect model for `runWorkflowSynthesizer`

## Verify

```bash
curl -s http://localhost:4000/health/liveliness
curl -s http://localhost:11434/api/tags
bun cast --status
```
