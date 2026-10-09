# Appwrite Type Generation Guide

The Appwrite CLI provides automated type generation from your database schema in `appwrite.json` and `appwrite.config.json`. This gives full end-to-end type safety across all Sovereign database tables and columns.

---

## 1. Quick Start

Run the automated type generator script via Bun:

```bash
# Generate TypeScript definitions for all 37 Sovereign tables
bun run types:generate

# Alternative alias
bun run types:appwrite

# Generate with strict language naming conventions (e.g. camelCase)
bun run types:strict
```

This script:
1. Synchronizes `appwrite.config.json` and `appwrite.json` with all 37 Sovereign TablesDB schemas.
2. Invokes `bunx appwrite-cli types --language ts ./types/appwrite`.
3. Falls back gracefully to the deterministic schema generator if offline or airgapped.
4. Generates `types/appwrite/appwrite.d.ts` and typed barrel exports in `types/appwrite/index.ts`.

---

## 2. Using Appwrite CLI Directly

If you have the Appwrite CLI installed globally or via `bunx`:

```bash
# Pull latest tables from Appwrite Cloud / Self-hosted instance
appwrite pull tables

# Generate TypeScript types
appwrite types --language ts ./types/appwrite

# Generate types in other supported languages
appwrite types --language swift ./types/swift
appwrite types --language kotlin ./types/kotlin
appwrite types --language dart ./types/dart
appwrite types --language js ./types/js
appwrite types --language php ./types/php
appwrite types --language java ./types/java
```

### Command Options

| Option | Shorthand | Description | Default |
|--------|-----------|-------------|---------|
| `--language` | `-l` | Target language (`auto`, `ts`, `js`, `php`, `kotlin`, `swift`, `java`, `dart`, `cs`) | `auto` |
| `--strict` | `-s` | Convert column keys to language idiomatic casing (e.g. `syndicate_id` &rarr; `syndicateId`) | `false` |
| `--config-file` | - | Explicit path to config file (default: nearest `appwrite.config.json`) | `appwrite.config.json` |

---

## 3. Consuming Generated Types

Import generated models directly into your services and components:

```typescript
import type {
  Ledger,
  Agents,
  CrmContacts,
  CrmDeals,
  Users,
  SOVEREIGN_DATABASE_ID,
  SovereignTableId
} from '@/types/appwrite';

// Example: strongly-typed row handling
function processAgentRow(agent: Agents) {
  console.log(`Agent ID: ${agent.$id}, Name: ${agent.name}, Type: ${agent.type}`);
}
```

Every generated model extends `Models.Row`, providing standard Appwrite metadata properties:
- `$id`: string
- `$createdAt`: string
- `$updatedAt`: string
- `$permissions`: string[]
- `$databaseId`: string
- `$tableId`: string

---

## 4. Architecture & Synchronization

- **Authoritative Schema**: `scripts/appwrite-schema.ts`
- **Config Sync Targets**: `appwrite.config.json` and `appwrite.json`
- **Output Artifacts**: `types/appwrite/appwrite.d.ts` and `types/appwrite/index.ts`
- **Automated Verification**: `services/appwriteTypes.test.ts` (tested against all 37 tables)
