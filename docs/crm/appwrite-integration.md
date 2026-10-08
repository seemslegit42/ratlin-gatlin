# CRM ↔ Appwrite TablesDB Integration

This document describes how the Relationship Nexus (CRM) module talks to Appwrite, what was optimized for latency, and how to verify the integration.

## API surface

The CRM uses the **Appwrite Web SDK** (`appwrite` package) **TablesDB** API—not the legacy Databases/Documents API used in some cloud functions.

| Layer | File | Responsibility |
| --- | --- | --- |
| Client config | `services/appwriteClient.ts` | `tablesDB`, `Query`, `DATABASE_ID`, `TABLES.CRM_*` |
| Data access | `services/crmService.ts` | CRUD, query shaping, parallel reads, realtime helpers |
| React state | `hooks/useCRMState.ts` | Optimistic UI, subscriptions, orchestration |

### Tables

| Table ID | Purpose |
| --- | --- |
| `crm_contacts` | People and companies |
| `crm_deals` | Pipeline opportunities |
| `crm_activities` | Calls, emails, updates |

Every query includes `Query.equal('syndicate_id', syndicateId)` for multi-tenant isolation.

## CRUD operations

| Operation | Service function | Notes |
| --- | --- | --- |
| List snapshot | `fetchCrmSnapshot` | `Promise.all` — 3 parallel `listRows` calls |
| List slice | `fetchCrmSlice` | Refetch one table after realtime events |
| Create contact | `createCrmContact` | |
| Update contact | `updateCrmContact` | |
| Delete contact | `deleteCrmContact` | Exposed as `removeContact` in hook |
| Create deal | `createCrmDeal` | Default stage `Prospecting` |
| Update deal | `updateCrmDeal` / `updateCrmDealFull` | |
| Move stage | `moveCrmDealStage` | Kanban drag |
| Delete deal | `deleteCrmDeal` | Exposed as `removeDeal` in hook |
| Log activity | `createCrmActivity` | Optimistic prepend in hook |
| Save AI strategy | `persistDealStrategy` | Writes `strategy_json` + `resonance` |

Hook exports: `refreshCrm`, `removeContact`, `removeDeal` for manual reload and cleanup flows.

## Latency optimizations

### 1. Parallel initial load

Previously, deals → activities → contacts ran **sequentially** (3 round-trips in series).  
`fetchCrmSnapshot` runs all three `listRows` calls in **`Promise.all`**, cutting wall-clock load time toward a single slowest request.

### 2. Column projection (`Query.select`)

List queries request only fields the UI needs, reducing payload size on the wire:

- **Deals:** ids, company, deal_name, priority, value, stage, last_contact, resonance, strategy_json  
- **Activities:** ids, user_name, action, target, topic, timestamp  
- **Contacts:** ids, syndicate_id, name, role, company, email, last_contact  

### 3. Bounded result sets

| Resource | Limit |
| --- | --- |
| Activities | 20 (newest first) |
| Contacts | 50 |
| Deals | 200 |

### 4. Targeted realtime refresh

**Before:** One subscription on `tablesdb.{db}.tables.*.rows` refetched **all** CRM data on any table change anywhere in the database.

**After:**

- Three channels—one per CRM table (`crm_deals`, `crm_activities`, `crm_contacts`)
- `parseCrmRealtimeSlice` determines which slice changed
- `fetchCrmSlice` refetches **only** that slice

### 5. Influence graph O(n) grouping

Company-based influence links are built with a `Map` by company name instead of an O(n²) pairwise scan over all contacts.

### 6. Optimistic writes

Creates and activity logs update local React state immediately; failures trigger a slice or full refresh.

## Appwrite MCP note

There is **no Appwrite MCP server** in this environment. Integration follows the official **Appwrite TypeScript SDK** (TablesDB) as documented in `APPWRITE_SETUP.md` and `scripts/setup-appwrite-backend.ts`. Postman MCP is available for API exploration once authenticated.

## Testing

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun test services/crmService.test.ts
bun run typecheck
```

Unit tests cover mapping, pipeline grouping, influence links, and realtime channel parsing without a live backend.

### Manual smoke test

1. Set `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`.  
2. Run `bun run dev`, sign in, open **Relationships** (`/crm`).  
3. Create a contact and deal; confirm kanban and activity feed update.  
4. Drag a deal column; confirm stage persists after reload.  
5. Generate a tactical brief; confirm `strategy_json` appears in the deal sidebar.

## Related backend function

`backend/functions/crm-operations.ts` still uses the **legacy** `Databases.createDocument` API and a different field schema. Frontend CRM uses **TablesDB rows** directly. Align or retire the function in a follow-up if server-side CRM actions are required.

## Changelog (this iteration)

- Added `services/crmService.ts` as the single CRM data layer  
- Refactored `hooks/useCRMState.ts` to use the service  
- Parallel fetch, `Query.select`, slice-based realtime refresh, delete CRUD  
- Added `services/crmService.test.ts` and this document  
