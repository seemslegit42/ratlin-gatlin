# Appwrite schema and TypeScript types

```bash
cd /path/to/ratlin-gatlin
bun run types:generate
bun run types:strict
```

```bash
# Direct invocation
bun run scripts/generate-appwrite-types.ts --language ts --output ./types/appwrite
bun run scripts/generate-appwrite-types.ts --strict
```

Schema source: `scripts/appwrite-schema.ts` (`TABLES_SCHEMA`, `DATABASE_ID`).

Output directory: `types/appwrite/` (generated; do not hand-edit).
