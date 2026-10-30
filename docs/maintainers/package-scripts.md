# package.json scripts

```bash
cd /path/to/ratlin-gatlin
bun run dev              # BEEP_OPERATOR=1 scripts/run-appliance.ts dev
bun run start            # BEEP_OPERATOR=1 scripts/run-appliance.ts start
bun run build            # BEEP_OPERATOR=1 scripts/run-appliance.ts build
bun run install-app      # BEEP_OPERATOR=1 scripts/install-app.ts
bun run build-executable # BEEP_OPERATOR=1 scripts/build-executable.ts
bun run dev:vite         # bunx --bun vite
bun run dev:mcp          # backend/postman-mcp-server.ts
bun run preview          # bunx --bun vite preview
bun run lint             # tsc --noEmit -p tsconfig.app.json
bun run typecheck        # tsc --noEmit -p tsconfig.app.json
bun test
bun run test:watch
bun run env:automate     # scripts/env-automator.ts
bun run cast             # same as bun run dev
DOKPLOY=1 bun run cast:deploy
bun run cast:down
bun run cast:status
bash scripts/register-local-gguf-ollama.sh   # ollama:register-qwen-local
bash scripts/register-gguf-models.sh         # ollama:register-gguf-models
bun run file-janitor     # backend/fileJanitor.ts
bun run types:generate   # scripts/generate-appwrite-types.ts
bun run types:strict     # generate-appwrite-types.ts --strict
bash scripts/bootstrap-appwrite-self-hosted.sh  # appwrite:bootstrap
```
