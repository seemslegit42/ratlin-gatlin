# Self-hosted Appwrite (bundled with BEEP)

BEEP defaults to **on-prem BaaS**: run Appwrite on the same edge device (or a dedicated edge node), not Appwrite Cloud. Cloud remains an optional override via env only.

Official install docs: [Appwrite self-hosting installation](https://appwrite.io/docs/advanced/self-hosting/installation) (Docker installer + wizard).

## Why bundle it

- Auth, TablesDB, buckets, Sites, and Functions in `appwrite.config.json` target **your** instance.
- Data plane stays on hardware you control; aligns with `config/deployment-profile.ts`.
- One sovereign Compose merge: `docker-compose.sovereign.yml`.

## System requirements (Appwrite upstream)

Appwrite publishes minimums (same class as our Jetson Nano 4 GB reference):

| Resource | Minimum |
|----------|---------|
| CPU | 2 cores |
| RAM | 4 GB |
| Swap | 2 GB recommended |
| Docker | Compose v2 |

On a **4 GB edge device**, treat Appwrite as the **primary memory consumer**. Do not expect to run a full Appwrite stack **and** heavy local inference concurrently without swap thrash. Typical pattern:

- **Node A (4 GB):** Appwrite + New API + MCP + static UI (no containerized inference).
- **Or:** Appwrite only on device; inference on a second edge node.

Enable **2 GB swap** before install on constrained boards.

## Bootstrap (operators)

Double-click **`install-app`**. No terminal, no config files.

Maintainers only: `bun run appwrite:bootstrap` (interactive wizard on port 20080) if automatic download fails.

Wizard checklist (manual fallback):

1. **Hostname** — IP or DNS where the Console/API will live.
2. **HTTPS** — off for pure local lab; on when behind Traefik/Caddy.
3. **Database** — PostgreSQL default is fine for new installs.
4. **Workers** — on 4 GB edge, prefer default single worker container; see [worker topologies](https://appwrite.io/docs/advanced/self-hosting/configuration/topologies) before splitting queues.

Save the **secret API key** from step 2; it is shown once.

## Run merged stack

Operators: double-click **`start-app`** (or rely on login autostart). Maintainers: `docker compose -f docker-compose.sovereign.yml up -d`.

Stop Appwrite only (generated tree):

```bash
docker compose -f appwrite/docker-compose.yml stop
```

## Wire BEEP to your instance

Set in `.env` (never commit secrets):

```bash
APPWRITE_ENDPOINT=http://<hostname>/v1
VITE_APPWRITE_ENDPOINT=http://<hostname>/v1
APPWRITE_PROJECT_ID=<from-console>
APPWRITE_API_KEY=<server-key-from-wizard-or-console>
VITE_APPWRITE_PROJECT_ID=<same-project>
```

Create a project in the Console (self-hosted allows one organization; first sign-in flow per upstream docs).

Provision BEEP schema:

```bash
appwrite client --endpoint "$APPWRITE_ENDPOINT" --project-id "$APPWRITE_PROJECT_ID" --key "$APPWRITE_API_KEY"
bun scripts/setup-appwrite-backend.ts
appwrite push sites --force   # when ready
```

## SDK compatibility

This repo uses `appwrite` / `node-appwrite` from `package.json`. Pin server **2.6.x** to match the installer image unless you upgrade both server and SDK using [Appwrite’s compatibility tables](https://appwrite.io/docs/advanced/self-hosting/installation#sdk-version-compatibility).

## Git hygiene

Generated under `./appwrite/`:

- **Commit:** optional `docker-compose.yml` in private ops repos only — default **do not commit** `.env` or keys.
- **Ignored:** `appwrite/.env` (see root `.gitignore`).

## Cloud override (opt-in)

To use Appwrite Cloud instead, skip sovereign Compose and set Toronto (or other) cloud endpoints in `.env` — documented in `docs/deploy.md` as non-default.
