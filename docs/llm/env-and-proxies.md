# LLM environment and dev proxies

Defaults from `vite.config.ts` and `services/llmDefaults.ts`:

```bash
export LLM_BACKEND=litellm
export LITELLM_PROXY_TARGET=http://127.0.0.1:4000
export LITELLM_API_KEY=sk-beep-local
export DEFAULT_LLM_MODEL=beep-granite
export BEEP_MODEL_GRANITE=beep-granite
export BEEP_MODEL_GEMMA=beep-gemma
export ARCHITECT_LLM_MODEL=beep-gemma
export OLLAMA_PROXY_TARGET=http://127.0.0.1:11434
export MCP_SERVER_PROXY_TARGET=http://127.0.0.1:3100
export LLM_CLOUD_FALLBACK=1
```

OpenRouter (server-side only — never `VITE_`):

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
export OPENROUTER_REGION=global
export OPENROUTER_SITE_URL=http://localhost:3000
export OPENROUTER_APP_NAME="BEEP Command — ΛΞV & Co."
export OPENROUTER_NATIVE_TOOLS=1
export OPENROUTER_MODEL_FAST=meta-llama/llama-3.3-70b-instruct
export OPENROUTER_MODEL_ARCHITECT=meta-llama/llama-3.3-70b-instruct
```

Vite dev proxies (browser → local services):

```text
/llm        → LITELLM_PROXY_TARGET
/ollama     → OLLAMA_PROXY_TARGET
/openrouter → openrouter.ai or eu.openrouter.ai (OPENROUTER_REGION)
/mcp        → MCP_SERVER_PROXY_TARGET
/api/postman → MCP_SERVER_PROXY_TARGET
```

```bash
# MCP bridge alone
bun run dev:mcp
curl -sS http://127.0.0.1:${MCP_SERVER_PORT:-3100}/health || true
```

Register local GGUF models with Ollama:

```bash
cd /path/to/ratlin-gatlin
bun run ollama:register-gguf-models
bun run ollama:register-qwen-local
```

Smoke test LiteLLM (when stack is up):

```bash
curl -sS http://127.0.0.1:4000/v1/models | head
curl -sS http://127.0.0.1:3000/llm/v1/models | head
```
