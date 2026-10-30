# Appwrite bootstrap and sovereign stack

```bash
cd /path/to/ratlin-gatlin
bun run appwrite:bootstrap
# Wizard: http://localhost:20080 (APPWRITE_WIZARD_PORT)
# Writes compose under ./appwrite/
```

```bash
# After wizard — merged BEEP + Appwrite stack
docker compose -f docker-compose.sovereign.yml up -d
docker compose -f docker-compose.sovereign.yml ps
docker compose -f docker-compose.sovereign.yml down
```

```bash
# Client env (browser reads VITE_*; server reads unprefixed)
export APPWRITE_ENDPOINT="https://your-host/v1"
export VITE_APPWRITE_ENDPOINT="$APPWRITE_ENDPOINT"
export APPWRITE_PROJECT_ID="your-project-id"
export VITE_APPWRITE_PROJECT_ID="$APPWRITE_PROJECT_ID"
export APPWRITE_API_KEY="your-secret-key"
```

Default endpoint resolution when env is empty (`vite.config.ts` / `services/appwriteClient.ts`):

```bash
# Toronto cloud fallback used in dev when no custom endpoint is set
echo "https://tor.cloud.appwrite.io/v1"
```

CI push (via `scripts/cast.ts`):

```bash
export APPWRITE_ENDPOINT="..."
export APPWRITE_PROJECT_ID="..."
export APPWRITE_API_KEY="..."
DOKPLOY=1 bun run cast:deploy
# Runs: appwrite push tables|buckets|functions|sites --force
```
