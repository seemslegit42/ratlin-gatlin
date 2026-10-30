# Cast (compose + Vite) and CI deploy

```bash
cd /path/to/ratlin-gatlin
bun install
bun run cast              # dev: appliance + compose + Vite :3000
bun run cast:status
bun run cast:down
DOKPLOY=1 bun run cast:deploy
```

```bash
# Underlying script
bun run scripts/cast.ts --status
bun run scripts/cast.ts --down
DOKPLOY=1 bun run scripts/cast.ts --deploy
```

Auxiliary services only (no sovereign merge):

```bash
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.dev.yml up -d
```

Appwrite Cloud deploy env (CI):

```bash
export APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
export APPWRITE_PROJECT_ID="..."
export APPWRITE_API_KEY="..."
bun run build
# Push site + functions per appwrite.config.json (project-specific)
```
