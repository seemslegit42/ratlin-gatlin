# ΛΞVON DOP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Beep (ΛΞVON OS) Digital Operations Platform by provisioning data infrastructure, wiring Appwrite-backed services, implementing CEVM/AVF economic metering, and connecting existing UI modules to persistent storage.

**Architecture:** React 19 + Vite frontend with Appwrite TablesDB (`sovereign` + new `nexusflow` database) as system of record. Agent execution flows through `useWorkflowExecutor` → `ollamaService`, logging UAVs and IQI metrics to nexusflow tables. Economy layer (`xiEconomyService`, `klepsydraService`, `ritesService`) enforces CogniOps gates per CEVM. UI modules already built; this plan focuses on backend integration and metering.

**Tech Stack:** Bun, React 19, TypeScript, Appwrite TablesDB, Ollama, Framer Motion, Tailwind

**Requirements spec:** `docs/superpowers/specs/2026-06-18-beep-dop-requirements.md`

---

## Traceability Matrix (Spec → Phase)

| Spec Domain | Phase | Key Deliverables |
|-------------|-------|------------------|
| DB-5.1, DB-5.2 | 1 | `setup-appwrite-backend.ts` + `TABLES` constant |
| ECO-4.1–4.8, IQI | 2, 4 | `agentMetricsService`, economy services |
| ARCH-3.1–3.5 | 2, 3 | execution logging, conversation persistence |
| FRS services (rites, klepsydra, users) | 2 | Appwrite CRUD in services |
| Module integration (BUILD_PLAN §3) | 3 | hooks → tables |
| UX-2.1–2.4, 2.7 | 4 | Obsidian mode, Veil-Peel polish |
| E2E + docs | 5 | smoke tests, schema docs |

---

## Phase 1: Data Infrastructure (P0 — 1 day)

### Task 1: Add Nexusflow Database + 14 AI Tables to Provisioning Script

**Files:**
- Modify: `scripts/setup-appwrite-backend.ts`
- Modify: `services/appwriteClient.ts` (add `NEXUSFLOW_DATABASE_ID` + table constants)

- [ ] **Step 1: Add nexusflow table schemas**

Add after `TABLES_SCHEMA` closing brace, a second schema object:

```typescript
const NEXUSFLOW_DATABASE_ID = 'nexusflow';

const NEXUSFLOW_TABLES_SCHEMA: Record<string, TableSpec> = {
  agent_executions: {
    name: 'Agent Executions',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'agent_id', type: 'string', size: 255 },
      { key: 'workflow_id', type: 'string', size: 255 },
      { key: 'user_id', type: 'string', size: 255 },
      { key: 'status', type: 'string', size: 64 },
      { key: 'start_at', type: 'datetime' },
      { key: 'end_at', type: 'datetime' },
      { key: 'duration_ms', type: 'integer' },
      { key: 'result_json', type: 'string', size: 32768 },
      { key: 'error_msg', type: 'string', size: 8192 },
      { key: 'input_params_json', type: 'string', size: 32768 },
      { key: 'uav_value', type: 'float' },
    ],
  },
  tool_executions: {
    name: 'Tool Executions',
    columns: [
      { key: 'execution_id', type: 'string', size: 255 },
      { key: 'agent_id', type: 'string', size: 255 },
      { key: 'tool_name', type: 'string', size: 255 },
      { key: 'input_json', type: 'string', size: 32768 },
      { key: 'output_json', type: 'string', size: 32768 },
      { key: 'duration_ms', type: 'integer' },
      { key: 'error', type: 'string', size: 8192 },
      { key: 'status', type: 'string', size: 64 },
    ],
  },
  conversation_history: {
    name: 'Conversation History',
    columns: [
      { key: 'conversation_id', type: 'string', size: 255 },
      { key: 'agent_id', type: 'string', size: 255 },
      { key: 'user_id', type: 'string', size: 255 },
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'role', type: 'string', size: 64 },
      { key: 'content', type: 'string', size: 32768 },
      { key: 'timestamp', type: 'datetime' },
      { key: 'metadata_json', type: 'string', size: 8192 },
    ],
  },
  inference_logs: {
    name: 'Inference Logs',
    columns: [
      { key: 'execution_id', type: 'string', size: 255 },
      { key: 'model_name', type: 'string', size: 255 },
      { key: 'prompt_tokens', type: 'integer' },
      { key: 'completion_tokens', type: 'integer' },
      { key: 'latency_ms', type: 'integer' },
      { key: 'cost', type: 'float' },
      { key: 'temperature', type: 'float' },
      { key: 'timestamp', type: 'datetime' },
    ],
  },
  agent_metrics: {
    name: 'Agent Metrics',
    columns: [
      { key: 'agent_id', type: 'string', size: 255 },
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'metric_date', type: 'datetime' },
      { key: 'clarity_score', type: 'float' },
      { key: 'celerity_score', type: 'float' },
      { key: 'acuity_score', type: 'float' },
      { key: 'resilience_score', type: 'float' },
      { key: 'iqi_score', type: 'float' },
      { key: 'success_rate', type: 'float' },
      { key: 'error_delta', type: 'float' },
    ],
  },
  model_versions: {
    name: 'Model Versions',
    columns: [
      { key: 'model_name', type: 'string', size: 255 },
      { key: 'version', type: 'string', size: 64 },
      { key: 'provider', type: 'string', size: 128 },
      { key: 'context_window', type: 'integer' },
      { key: 'max_tokens', type: 'integer' },
      { key: 'capabilities_json', type: 'string', size: 8192 },
      { key: 'cost_per_token', type: 'float' },
      { key: 'status', type: 'string', size: 64 },
    ],
  },
  intent_classifications: {
    name: 'Intent Classifications',
    columns: [
      { key: 'conversation_id', type: 'string', size: 255 },
      { key: 'user_input', type: 'string', size: 8192 },
      { key: 'detected_intent', type: 'string', size: 255 },
      { key: 'confidence_score', type: 'float' },
      { key: 'agent_routed_to', type: 'string', size: 255 },
      { key: 'timestamp', type: 'datetime' },
    ],
  },
  agent_state_snapshots: {
    name: 'Agent State Snapshots',
    columns: [
      { key: 'agent_id', type: 'string', size: 255 },
      { key: 'memory_state_json', type: 'string', size: 32768 },
      { key: 'episodic_log', type: 'string', size: 32768 },
      { key: 'semantic_store_json', type: 'string', size: 32768 },
      { key: 'created_at', type: 'datetime' },
    ],
  },
  prompt_templates: {
    name: 'Prompt Templates',
    columns: [
      { key: 'name', type: 'string', size: 255 },
      { key: 'category', type: 'string', size: 128 },
      { key: 'template_text', type: 'string', size: 32768 },
      { key: 'variables_json', type: 'string', size: 8192 },
      { key: 'model_family', type: 'string', size: 128 },
      { key: 'version', type: 'string', size: 64 },
      { key: 'created_by', type: 'string', size: 255 },
    ],
  },
  tool_registry: {
    name: 'Tool Registry',
    columns: [
      { key: 'name', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 8192 },
      { key: 'parameters_json', type: 'string', size: 8192 },
      { key: 'function_signature', type: 'string', size: 2048 },
      { key: 'examples_json', type: 'string', size: 8192 },
      { key: 'status', type: 'string', size: 64 },
      { key: 'owner_agent', type: 'string', size: 255 },
    ],
  },
  agent_feedback: {
    name: 'Agent Feedback',
    columns: [
      { key: 'execution_id', type: 'string', size: 255 },
      { key: 'rating', type: 'integer' },
      { key: 'comment', type: 'string', size: 8192 },
      { key: 'user_id', type: 'string', size: 255 },
      { key: 'sentiment', type: 'string', size: 64 },
      { key: 'created_at', type: 'datetime' },
    ],
  },
  experiment_runs: {
    name: 'Experiment Runs',
    columns: [
      { key: 'experiment_id', type: 'string', size: 255 },
      { key: 'variant_a_agent_id', type: 'string', size: 255 },
      { key: 'variant_b_agent_id', type: 'string', size: 255 },
      { key: 'metrics_json', type: 'string', size: 8192 },
      { key: 'winner', type: 'string', size: 64 },
      { key: 'confidence', type: 'float' },
    ],
  },
  knowledge_artifacts: {
    name: 'Knowledge Artifacts',
    columns: [
      { key: 'agent_id', type: 'string', size: 255 },
      { key: 'artifact_type', type: 'string', size: 128 },
      { key: 'title', type: 'string', size: 512 },
      { key: 'content', type: 'string', size: 32768 },
      { key: 'mime_type', type: 'string', size: 128 },
      { key: 'ttl', type: 'datetime' },
      { key: 'created_at', type: 'datetime' },
    ],
  },
  llm_cache: {
    name: 'LLM Cache',
    columns: [
      { key: 'query_hash', type: 'string', size: 255 },
      { key: 'model_name', type: 'string', size: 255 },
      { key: 'cached_response', type: 'string', size: 32768 },
      { key: 'hit_count', type: 'integer' },
      { key: 'created_at', type: 'datetime' },
      { key: 'expiry_at', type: 'datetime' },
    ],
  },
};
```

- [ ] **Step 2: Extend provisioning loop for second database**

Refactor `main()` to call `ensureDatabase(tablesDB, DATABASE_ID, 'Sovereign')` and `provisionTables(tablesDB, DATABASE_ID, TABLES_SCHEMA)`, then repeat for nexusflow.

- [ ] **Step 3: Run provisioning**

```bash
cd /home/titan/projects/beep
bun scripts/setup-appwrite-backend.ts
```

Expected: `✅ TablesDB database "nexusflow" created` + 14 table confirmations.

- [ ] **Step 4: Export nexusflow constants in appwriteClient**

```typescript
export const NEXUSFLOW_DATABASE_ID = 'nexusflow';

export const NEXUSFLOW_TABLES = {
  AGENT_EXECUTIONS: 'agent_executions',
  TOOL_EXECUTIONS: 'tool_executions',
  CONVERSATION_HISTORY: 'conversation_history',
  INFERENCE_LOGS: 'inference_logs',
  AGENT_METRICS: 'agent_metrics',
  MODEL_VERSIONS: 'model_versions',
  INTENT_CLASSIFICATIONS: 'intent_classifications',
  AGENT_STATE_SNAPSHOTS: 'agent_state_snapshots',
  PROMPT_TEMPLATES: 'prompt_templates',
  TOOL_REGISTRY: 'tool_registry',
  AGENT_FEEDBACK: 'agent_feedback',
  EXPERIMENT_RUNS: 'experiment_runs',
  KNOWLEDGE_ARTIFACTS: 'knowledge_artifacts',
  LLM_CACHE: 'llm_cache',
} as const;
```

- [ ] **Step 5: Verify sovereign tables also provisioned**

Re-run script; expect idempotent skip messages for existing sovereign tables.

---

### Task 2: Shared Appwrite Row Helpers

**Files:**
- Create: `services/appwriteTableService.ts`
- Test: `services/appwriteTableService.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, expect, test } from 'bun:test';
import { buildRowPayload, syndicateQuery } from './appwriteTableService';

describe('appwriteTableService', () => {
  test('buildRowPayload strips undefined keys', () => {
    expect(buildRowPayload({ a: 1, b: undefined })).toEqual({ a: 1 });
  });

  test('syndicateQuery returns Query.equal', () => {
    const q = syndicateQuery('synd-1');
    expect(q).toContain('syndicate_id');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
bun test services/appwriteTableService.test.ts
```

- [ ] **Step 3: Implement minimal service**

```typescript
import { Query } from './appwriteClient';

export function buildRowPayload<T extends Record<string, unknown>>(row: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(row).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export function syndicateQuery(syndicateId: string): string {
  return Query.equal('syndicate_id', syndicateId);
}
```

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Commit** (only when user requests)

---

## Phase 2: Core Service Wiring (P0 — 2–3 days)

### Task 3: User Profile Sync on Auth

**Files:**
- Create: `services/userProfileService.ts`
- Modify: `contexts/AuthContext.tsx`

**Acceptance:** On signup/login, `users` row exists with defaults (`covenant: 'motion'`, `pact: 'Apprentice'`, `cogni_ops_limit` from `PACT_CONFIGS`).

- [ ] Fetch or create user row via `tablesDB.createRow` / `listRows` + `Query.equal('user_id', accountId)`
- [ ] Merge Appwrite Account name/email with extended profile fields
- [ ] Call from `AuthContext` after successful session restore
- [ ] Test: `services/userProfileService.test.ts` with mocked tablesDB

### Task 4: Rites Service → Appwrite

**Files:**
- Modify: `services/ritesService.ts`
- Modify: `hooks/useRites.ts`

**Acceptance:** `judgeFolly` writes `tribute_logs` row; `completeBurnoutFuneral` updates `pillar_of_eternity`; `fetchPillarState` reads from DB.

Replace each `// TODO: Migrate to Appwrite` block with `tablesDB` calls using `TABLES.PILLAR_OF_ETERNITY` and `TABLES.TRIBUTE_LOGS`.

### Task 5: Klepsydra Service → Appwrite

**Files:**
- Modify: `services/klepsydraService.ts`
- Modify: `hooks/useKlepsydra.ts`

**Acceptance:** `ensurePulseProfile` persists to `pulse_profiles`; `calculateOutcome` reads `global_economic_dials` for thresholds.

### Task 6: Xi Economy / Treasury Wiring

**Files:**
- Modify: `services/xiEconomyService.ts`
- Modify: `hooks/useTreasuryState.ts`

**Acceptance:** Treasury mutations write `treasury_transactions`; CogniOps decrement updates `users.cogni_ops_remaining`; tithe flows log to `tribute_logs`.

### Task 7: Agent Execution Logger (UAV + CEVM)

**Files:**
- Create: `services/agentExecutionService.ts`
- Modify: `hooks/useWorkflowExecutor.ts`
- Modify: `services/ollamaService.ts` (inference log hook)

**Acceptance (ECO-4.1):** Every `runAgent` completion creates `agent_executions` row with `uav_value` derived from agent template `v_co`.

```typescript
// agentExecutionService.ts — core interface
export async function startExecution(params: {
  syndicateId: string;
  agentId: string;
  workflowId?: string;
  userId: string;
  inputParams?: Record<string, unknown>;
}): Promise<string> { /* returns executionId */ }

export async function completeExecution(
  executionId: string,
  result: { status: 'success' | 'error'; resultJson?: unknown; errorMsg?: string; durationMs: number }
): Promise<void> {}
```

Wire `startExecution` at top of `runAgent`; `completeExecution` in finally block.

### Task 8: Conversation Persistence

**Files:**
- Modify: `hooks/useStreamingChat.ts` (or `components/AiChatDock.tsx`)
- Create: `services/conversationService.ts`

**Acceptance:** Each chat message → `conversation_history` row; reopening chat loads last N messages by `conversation_id`.

---

## Phase 3: Module Integration (P1 — 1–2 days)

### Task 9: CRM Module Persistence

**Files:** `hooks/useCRMState.ts`, `components/crm/CRMView.tsx`

- [ ] CRUD contacts → `crm_contacts`
- [ ] Deals pipeline → `crm_deals`
- [ ] Activity log → `crm_activities`
- [ ] Realtime subscription on deal updates

### Task 10: Operations + Procurement

**Files:** `hooks/useOperationsState.ts`, `hooks/useProcurementState.ts`

- [ ] Task CRUD → `operations_tasks`
- [ ] PO tracking → `procurement_orders`

### Task 11: Micro-App Forge Sync

**Files:** `hooks/useMicroAppForgeState.ts`, `services/microAppForgeService.ts`

- [ ] Modules/patches/drafts/published → respective tables

### Task 12: Workflow Versioning

**Files:** `hooks/useWorkflowState.ts`, `services/workflowService.ts`

- [ ] Save graph snapshots → `workflow_versions` on publish
- [ ] Load version history in Weaver timeline panel

---

## Phase 4: CEVM Metering & Feature Completion (P1 — 2 days)

### Task 13: Agent Metrics / IQI Aggregation

**Files:**
- Create: `services/agentMetricsService.ts`
- Modify: `components/economy/XiDashboard.tsx`

**Acceptance:** Nightly or on-demand aggregation computes `iqi_score` from R_S, DOR, BOT, ΔR_E per CEVM Table 1.

### Task 14: G_Trust Scorecard UI

**Files:** `modules/security/SecurityView.tsx`, `services/aegisService.ts`

- [ ] Surface policy compliance %, audit event count, Aegis block rate
- [ ] Display as `G_Trust` multiplier on Xi Dashboard

### Task 15: Obsidian Mode Theme

**Files:** `contexts/ThemeContext.tsx` (or settings), `DESIGN_SYSTEM.md`

- [ ] Toggle replaces `backdrop-blur` glass with solid `#0a0a0f` surfaces
- [ ] Retain accent glow tokens

### Task 16: Demiurge Console Backend Calls

**Files:** `modules/admin/DemiurgeConsole.tsx`, `services/backendFunctionService.ts`

- [ ] Wire grant-currency, create-user, policy-enforce tools to real service calls
- [ ] Log admin actions → `audit` + `chronicle_events`

### Task 17: Weaver Veil-Peel Interaction

**Files:** `components/weaver/*`, `modules/weaver/hooks/useWeaverUI.ts`

- [ ] Long-press gesture toggles Live ↔ Architect mode per FRS §2.4
- [ ] Depth-of-field dim on canvas background

---

## Phase 5: Verification & Documentation (P2 — 1 day)

### Task 18: E2E Smoke Tests

**Files:**
- Create: `tests/e2e/dop-smoke.test.ts`

Scenarios:
1. Signup → user row created with CogniOps limit
2. Run single Weaver agent → `agent_executions` row exists
3. Folly rite → `tribute_logs` entry
4. CRM contact create → persists across reload

```bash
bun test tests/e2e/dop-smoke.test.ts
```

### Task 19: Update BUILD_PLAN.md

Reconcile table counts, mark completed items, link to this plan.

### Task 20: Schema Documentation

**Files:** `APPWRITE_SETUP.md`, `docs/superpowers/specs/2026-06-18-beep-dop-requirements.md`

Add nexusflow section + IQI field mapping.

---

## Parallel Quick Wins (any phase)

| Win | Command / File | Time |
|-----|----------------|------|
| Provision all sovereign tables | `bun scripts/setup-appwrite-backend.ts` | 15 min |
| Env check | Verify `.env` has `VITE_APPWRITE_*` + `APPWRITE_API_KEY` | 5 min |
| Ollama smoke | `bun run dev:vite` → login → send chat message | 10 min |
| Remove stale Supabase refs in docs | `BUILD_PLAN.md` §2.1 file list audit | 20 min |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Appwrite TablesDB API rate limits | Slow provisioning | Idempotent script; run off-hours |
| No server SDK in browser for user mgmt | Profile sync blocked | Client-side `tablesDB` for profile CRUD; reserve `userManagementService` for admin functions |
| Ollama unavailable in CI | Tests flake | Mock `ollamaService` in unit tests; E2E optional |
| CEVM formulas underspecified | Wrong IQI weights | Start with equal weights; calibrate in Phase 4 |

---

## Success Criteria

- [ ] All 52 tables provisioned (38 sovereign + 14 nexusflow)
- [ ] Zero `// TODO: Migrate to Appwrite` in `ritesService`, `klepsydraService`
- [ ] Agent run → `agent_executions` + `inference_logs` rows
- [ ] Chat history survives page reload
- [ ] CRM/Ops/Forge CRUD persists to Appwrite
- [ ] Xi Dashboard shows live treasury + IQI scores
- [ ] `bun test` green for new service tests

---

## Execution Options

**Plan saved.** Two execution paths:

1. **Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks
2. **Inline Execution** — Implement tasks in this session with checkpoints

**Suggested start order:** Task 1 (nexusflow schema) → Task 2 (helpers) → Task 7 (execution logger) → Task 3 (user profile).

---

*Plan version: 1.0 | 2026-06-18 | Maintainer: Forge*
