# Appwrite TablesDB schema

Database id (`scripts/appwrite-schema.ts`):

```typescript
export const DATABASE_ID = 'sovereign';
```

Generate types and sync `appwrite.json`:

```bash
cd /path/to/ratlin-gatlin
bun run types:generate
bun run types:strict
```

Column types used in `TABLES_SCHEMA` (Appwrite TablesDB):

```text
varchar text mediumtext longtext integer bigint float boolean datetime enum ip email url relationship
```

Row security and permissions: [permissions.md](./permissions.md).

Push tables to Appwrite (CI):

```bash
export APPWRITE_ENDPOINT="..."
export APPWRITE_PROJECT_ID="..."
export APPWRITE_API_KEY="..."
appwrite client --endpoint "$APPWRITE_ENDPOINT" --project-id "$APPWRITE_PROJECT_ID" --key "$APPWRITE_API_KEY"
appwrite push tables --force
```

Or:

```bash
DOKPLOY=1 bun run cast:deploy
```
