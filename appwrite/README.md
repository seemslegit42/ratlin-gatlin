# Self-hosted Appwrite (generated)

This directory is populated by the **official Appwrite Docker installer** — not checked into git until you run bootstrap locally.

## Bootstrap (once)

From repo root:

```bash
bun run appwrite:bootstrap
```

Open **http://localhost:20080**, complete the wizard, then:

```bash
docker compose -f docker-compose.sovereign.yml config   # validate merge
docker compose -f docker-compose.sovereign.yml up -d      # Appwrite + BEEP auxiliary stack
```

See [docs/self-hosted-appwrite.md](../docs/self-hosted-appwrite.md) for edge RAM notes and SDK alignment.

**Do not commit** `appwrite/.env` or secrets from the wizard.
