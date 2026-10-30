# Appwrite permission strings

From `scripts/appwrite-schema.ts` (`AppwritePermission`, `AppwriteRole`):

```typescript
import { AppwritePermission, AppwriteRole } from '../scripts/appwrite-schema';

AppwritePermission.read(AppwriteRole.users()); // read("users")
AppwritePermission.update(AppwriteRole.user('usr_123')); // update("user:usr_123")
AppwritePermission.delete(AppwriteRole.team('syn_alpha')); // delete("team:syn_alpha")
```

Row security on sovereign tables (schema excerpt):

```typescript
// scripts/appwrite-schema.ts — TABLES_SCHEMA.users
rowSecurity: true,
permissions: [AppwritePermission.read(AppwriteRole.users())],
```

Regenerate CLI tables payload:

```bash
cd /path/to/ratlin-gatlin
bun run types:generate
```

Cross-reference: [tables.md](./tables.md).
