---
layout: article
title: Appwrite Tables & Sovereign TablesDB Architecture
description: Organize and govern high-density syndicate data with Appwrite Tables and TablesDB. Explore schemas, column types, indexing, CLI commands, and multi-language SDK integrations.
---

# Appwrite Tables: The Sovereign Data Substrate

Appwrite uses **tables** as containers of **rows**. Each table contains many rows identical in structure.
The terms *tables* and *rows* are used because the Appwrite JSON REST API resembles the intuitive, user-friendly interface of a modern document store, while harnessing relational SQL power and ACID integrity under the hood.

In **ΛΞVON OS**, the **Sovereign** database (`sovereign`) manages all 37 mission-critical tables (Ledger, Transactions, Agents, Crews, Workflows, CRM Contacts, CRM Deals, Treasury, and Micro-Apps) with row-level security and tenant isolation.

---

## 1. Quick Reference: CLI & Server Commands

| Action | Command / SDK Call | Target |
|--------|-------------------|--------|
| **Initialize Tables** | `appwrite init tables` | Pulls or generates interactive table config in `appwrite.json` |
| **Push Tables** | `appwrite push tables` | Deploys tables, columns, and indexes to Appwrite instance |
| **Pull Tables** | `appwrite pull tables` | Synchronizes remote schemas to local configuration |
| **Generate Types** | `bun run types:generate` | Automatically produces TypeScript bindings in `types/appwrite/` |
| **Batch Provision** | `bash create-tables.sh` | Idempotent bash creation script for all Sovereign tables |
| **Node / Bun SDK** | `tablesDB.createTable({ databaseId, tableId, name, columns, indexes })` | Programmatic table provisioning via Server SDK |

---

## 2. Programmatic Creation (Server SDKs)

### Server Node.js / Bun

```typescript
import { Client, TablesDB } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const tablesDB = new TablesDB(client);

// Create Sovereign Table example
const table = await tablesDB.createTable({
  databaseId: 'sovereign',
  tableId: 'syndicate_memberships',
  name: 'Syndicate Memberships',
  columns: [
    { key: 'syndicate_id', type: 'varchar', size: 36, required: true },
    { key: 'user_id', type: 'varchar', size: 36, required: true },
    { key: 'email', type: 'email', required: true },
    { key: 'role', type: 'enum', elements: ['owner', 'admin', 'operator', 'auditor'], required: true },
    { key: 'xi_allocation', type: 'float', required: false },
    { key: 'active', type: 'boolean', required: true },
    { key: 'created_at', type: 'datetime', required: false },
  ],
  indexes: [
    { key: 'idx_syndicate', type: 'key', attributes: ['syndicate_id'] },
    { key: 'idx_user_email', type: 'unique', attributes: ['user_id', 'email'] },
  ],
});
```

### Deno / Edge Runtime

```typescript
import * as sdk from "npm:node-appwrite";

const client = new sdk.Client()
  .setEndpoint('https://tor.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>')
  .setKey('<SECRET_API_KEY>');

const tablesDB = new sdk.TablesDB(client);

const result = await tablesDB.createTable({
  databaseId: 'sovereign',
  tableId: 'agents',
  name: 'Agents',
  columns: [
    { key: 'syndicate_id', type: 'varchar', size: 255, required: true },
    { key: 'name', type: 'varchar', size: 255, required: true },
    { key: 'description', type: 'mediumtext', required: false },
    { key: 'temperature', type: 'float', required: false },
    { key: 'max_tokens', type: 'integer', required: false },
    { key: 'is_active', type: 'boolean', required: true }
  ],
  indexes: [
    { key: 'idx_syndicate_agents', type: 'key', attributes: ['syndicate_id'] },
    { key: 'idx_agent_name_ft', type: 'fulltext', attributes: ['name'] }
  ]
});
```

---

## 3. Supported Column Types

Columns define row schemas and enforce data validation at the API boundary.

| Column Type | Description | Indexing & Constraints |
|-------------|-------------|-------------------------|
| `varchar` | Short text column. | Fully indexable if size < 768. Maximum 16,383 characters. |
| `text` | Medium-short text column. | Prefix indexing only. Maximum 16,383 characters. |
| `mediumtext` | Expanded text column (JSON payloads, prompts). | Prefix indexing only. Maximum 4,194,303 characters. |
| `longtext` | Massive storage column (large artifacts, raw snapshots). | Prefix indexing only. Maximum 1,073,741,823 characters. |
| `integer` | 32-bit signed integer (-2,147,483,648 to 2,147,483,647). | Fully indexable (`key`, `unique`). |
| `bigint` | 64-bit signed integer (-9.22e18 to 9.22e18). Ideal for high-precision counters, epoch timestamps, or big IDs. | Fully indexable. |
| `float` | Floating-point decimal (balances, metrics, calculations). | Fully indexable. |
| `boolean` | Boolean flag (`true` / `false`). | Fully indexable. |
| `datetime` | ISO 8601 formatted date-time string. | Fully indexable. |
| `enum` | Constrained choice from allowed string elements. | Fully indexable. |
| `ip` | Validated IPv4 and IPv6 network address. | Fully indexable. |
| `email` | Validated RFC 5322 email string. | Fully indexable (`unique`, `key`). |
| `url` | Validated HTTP/HTTPS web address (up to 2,048 chars). | Indexable. |
| `point` | Geographic point `[longitude, latitude]`. | Spatial query support. |
| `line` | Geographic line composed of an ordered list of points. | Spatial query support. |
| `polygon` | Closed geographic area with optional interior holes. | Spatial query support. |
| `relationship` | Direct relational reference to another table (`oneToOne`, `oneToMany`, `manyToMany`). | Supports cascading deletes and 2-way associations. |
| `string` | **Deprecated.** Replaced by `varchar`, `text`, `mediumtext`, or `longtext`. | Legacy compatibility fallback only. |

---

## 4. Indexing Engine

Appwrite uses indexes for fast query resolution and constraint enforcement without scanning entire tables.

| Index Type | Purpose | Best Used For |
|------------|---------|---------------|
| `key` | Plain query index | Columns filtered with `Query.equal`, `Query.greaterThan`, `Query.orderAsc`, etc. |
| `unique` | Disallow duplicate values | Unique identifiers (e.g., `email`, `slug`, compound keys). |
| `fulltext` | Text search index | Natural language searching with `Query.search()`. |

---

## 5. Sovereign Database Schema Distribution (37 Tables)

The Sovereign cluster organizes tables into 6 functional domains:

1. **Core System**: `syndicates`, `users`, `agents`, `connections`, `crews`, `workflows`, `workflow_versions`, `agent_templates`, `chronicle_events`
2. **CRM Flywheel**: `crm_contacts`, `crm_deals`, `crm_activities`
3. **Sovereign Treasury**: `ledger`, `transactions`, `treasury_transactions`, `tribute_logs`, `pulse_profiles`, `pillar_of_eternity`, `stripe_events`, `global_economic_dials`
4. **Micro-App Forge**: `micro_app_modules`, `micro_app_patches`, `micro_app_drafts`, `published_micro_apps`
5. **Security & Administrative**: `access_keys`, `syndicate_integrations`, `secrets`, `agentcreds`, `audit`, `policies`, `rituals`, `wsconfig`, `notes`, `chat_messages`
6. **Growth & Execution Engine**: `email_marketing_lab`, `operations_tasks`, `procurement_orders`

---

## 6. Type Generation Workflow

Run the deterministic Bun workflow to synchronize configuration and produce typed models:

```bash
# Generate types across all 37 tables
bun run types:generate

# Strict camelCase generation
bun run types:strict
```

Generated rows extend `Models.Row`:

```typescript
import type { Agents, Ledger, CrmContacts } from '@/types/appwrite';

function renderAgent(agent: Agents) {
  // Strongly typed Appwrite row
  console.log(`Row ID: ${agent.$id}, Agent: ${agent.name}, Type: ${agent.type}`);
}
```

---

## 7. Database Permissions & Row Security

Permissions in Appwrite define who can access rows in a table. By default, **no permissions** are granted to any users. Access is granted at two distinct levels:

1. **Table Level Permissions**: Applied to every row in the table via `$permissions`. Users granted access at the table level can access all rows.
2. **Row Level Permissions**: Applied to individual rows. Evaluated only when **Row Security** (`rowSecurity: true`) is enabled on the table.

Users do not need access at both levels to access a row; access granted at either level is sufficient.

For in-depth architectural details, SDK code examples, and security blueprints, consult the authoritative guide:
[Appwrite Database Permissions Guide](database-permissions.md)

