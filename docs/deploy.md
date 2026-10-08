# BEEP deployment runbook

Enterprise SaaS split: **Appwrite Cloud** hosts the SPA + serverless; **Dokploy** runs the auxiliary Compose stack (Ollama + Postman MCP).

## Architecture

| Layer | Host | Artifact |
|-------|------|----------|
| Command UI | Appwrite Sites | `dist/` from `bun run build` |
| Functions / Tables / Buckets | Appwrite Cloud | `appwrite.config.json` |
| AI + MCP | Dokploy Compose | `docker-compose.yml` |

## Founder local dev

```bash
cd beep
bun install
bun cast          # compose up --wait + Vite :3000
```

Modes:

| Command | Purpose |
|---------|---------|
| `bun cast` | Dev: Ollama + MCP + Vite |
| `bun cast --status` | Health + `docker compose ps` |
| `bun cast --down` | Tear down stack |
| `DOKPLOY=1 bun cast --deploy` | CI pipeline (tests → Appwrite push → Docker build) |

## Appwrite (Sites + backend)

1. Create/locate project in [Appwrite Console](https://cloud.appwrite.io).
2. Set CI secrets: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`.
3. Configure Site env vars in Console (build-time for `VITE_*`):
   - `VITE_APPWRITE_*` — existing client config
   - `VITE_OLLAMA_URL` — e.g. `https://ollama.yourdomain.com`
   - `VITE_MCP_URL` — e.g. `https://mcp.yourdomain.com`
4. Deploy:

```bash
bash scripts/deploy-appwrite-all.sh
# or: appwrite push sites --force (after client + build)
```

Non-interactive CI client:

```bash
appwrite client --endpoint "$APPWRITE_ENDPOINT" --project-id "$APPWRITE_PROJECT_ID" --key "$APPWRITE_API_KEY"
appwrite push tables --force
appwrite push buckets --force
appwrite push functions --force
appwrite push sites --force
```

## Dokploy (Compose)

1. New Compose project → Git source (this repo).
2. Compose file: `docker-compose.yml` (do **not** merge `docker-compose.dev.yml` in prod).
3. Paste env from [`.env.dokploy.example`](../.env.dokploy.example).
4. Traefik routes (recommended):
   - `ollama.yourdomain.com` → `beep-ollama:11434` (restrict with auth / IP allowlist)
   - `mcp.yourdomain.com` → `beep-postman-mcp:3100`
5. Set `MCP_ALLOWED_HOSTS=mcp.yourdomain.com` and `OLLAMA_ORIGINS=https://your-site.appwrite.io`.
6. Volumes: `beep_ollama_models`, `beep_mcp_logs` persist across redeploys.

### CI → Dokploy redeploy

After `docker push`, trigger redeploy:

```bash
curl -X POST "$DOKPLOY_HOST/api/compose.redeploy" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $DOKPLOY_API_KEY" \
  -d "{\"composeId\":\"$DOKPLOY_COMPOSE_ID\"}"
```

Or use OneDev job `deploy-dokploy` in `.onedev-buildspec.yml`.

## Verification checklist

- [ ] `docker compose -f docker-compose.yml config -q`
- [ ] `curl -f http://127.0.0.1:3100/health` (dev overlay)
- [ ] Appwrite Site loads login; HashRouter routes work
- [ ] Production `VITE_OLLAMA_URL` / `VITE_MCP_URL` reach Traefik backends
- [ ] Model survives `docker compose down` / `up` (named volume)

## Rollback

| Component | Action |
|-----------|--------|
| Site | Redeploy previous Appwrite deployment in Console |
| Functions | `appwrite push functions` from previous git tag |
| Compose | Dokploy → redeploy previous image tag (`BEEP_MCP_IMAGE`) |

---

ΛΞV & Co. — BEEP Dominion
