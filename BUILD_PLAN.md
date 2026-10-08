# ΛΞVON OS (Beepin) - Comprehensive Build Plan

**Generated:** March 13, 2026  
**Status:** Infrastructure phase → Feature completion phase

---

## 📊 Project Health Summary

| Category | Status | Progress |
|----------|--------|----------|
| **App Architecture** | ✅ Done | 100% |
| **Authentication** | 🟡 Partial | 60% (Account API working, User mgmt needs completion) |
| **Database Schema** | 🟡 Partial | 17% (8/47 tables created, 39 tables missing) |
| **Core Modules** | 🟡 Partial | 70% (UI built, backend integration incomplete) |
| **AI/LLM Integration** | 🟡 Partial | 50% (Ollama client done, backend server needs implementation) |
| **Real-time Features** | ✅ Done | 100% |
| **Rites System** | 🟡 Partial | 75% (Core protocol defined, UI/backend refinement needed) |
| **Economic Simulation** | 🟡 Partial | 60% (Xi/Phi economy mocked, ledger integration pending) |

---

## 🗄️ Database Completion Status

### Existing Tables (8 - ✅ Created)
| Database | Table | Status |
|----------|-------|--------|
| **sovereign** | ledger | ✅ Ready |
| sovereign | transactions | ✅ Ready |
| sovereign | workflows | ✅ Ready |
| sovereign | agents | ✅ Ready |
| sovereign | rituals | ✅ Ready |
| sovereign | policies | ✅ Ready |
| sovereign | audit | ✅ Ready (needs columns) |
| sovereign | wsconfig | ✅ Ready (empty) |
| **vault** | secrets | ✅ Ready (empty) |
| vault | agentcreds | ✅ Ready (empty) |

### Missing Tables (39 - 🔴 NOT Created)

#### Core System (7 tables) - sovereign
- `users` - User profiles + extended metadata (covenant, xi_balance, tithe_rate, etc.)
- `syndicates` - Organization/workspace records
- `connections` - Agent-to-agent relationships
- `crews` - Team/group associations
- `agent_templates` - Reusable blueprint definitions
- `workflow_versions` - Workflow history and versioning
- `chronicle_events` - System event log (audit trail)

#### CRM Module (3 tables) - sovereign
- `crm_contacts` - Lead/contact records
- `crm_deals` - Pipeline deals
- `crm_activities` - Activity log (calls, emails, etc.)

#### Financial/Treasury (5 tables) - sovereign
- `treasury_transactions` - Ledger entries for Xi/Phi flows
- `tribute_logs` - Ritual event logging (Folly, Burnout, etc.)
- `pulse_profiles` - KlepsydraService user metrics
- `global_economic_dials` - System-wide economy state
- `pillar_of_eternity` - User ascension/rite unlock status

#### Micro Apps (4 tables) - sovereign
- `micro_app_modules` - Forge module definitions
- `micro_app_patches` - Forge connection definitions
- `micro_app_drafts` - Work-in-progress modules
- `published_micro_apps` - Released micro-app packages

#### Operations & Procurement (2 tables) - sovereign
- `operations_tasks` - Mission/task tracking
- `procurement_orders` - Order management

#### Admin/Integration (3 tables) - sovereign
- `access_keys` - API key management
- `syndicate_integrations` - Third-party integrations
- `notes` - Notepad/documentation

#### **AI & Agent Execution (14 tables) - nexusflow-db**
- `agent_executions` - Track each agent run (agent_id, workflow_id, status, start_at, end_at, result_json, error_msg)
- `tool_executions` - LLM function call log (execution_id, tool_name, input_json, output_json, duration_ms, error)
- `conversation_history` - Persist chat messages (conversation_id, agent_id, role, content, timestamp, metadata_json)
- `inference_logs` - LLM API call tracking (model, prompt_tokens, completion_tokens, latency_ms, cost, temperature)
- `agent_metrics` - Performance tracking (agent_id, clarity, celerity, acuity, resilience, iqi, period_date)
- `model_versions` - LLM model registry (model_name, version, provider, context_window, max_tokens, capabilities_json)
- `intent_classifications` - NLU intent tracking (input, detected_intent, confidence, agent_routed_to, timestamp)
- `agent_state_snapshots` - State persistence for agent memory (agent_id, memory_json, episodic_log, semantic_store, timestamp)
- `prompt_templates` - Reusable prompt library (name, category, template_text, variables_json, model_family)
- `tool_registry` - Available tools/functions (name, description, parameters_json, function_signature, examples)
- `agent_feedback` - User feedback on outputs (execution_id, rating, comment, user_id, timestamp)
- `experiment_runs` - A/B test tracking (experiment_id, variant_a_id, variant_b_id, metrics_json, winner)
- `knowledge_artifacts` - Generated outputs (agent_id, artifact_type, title, content, mime_type, created_at)
- `llm_cache` - Semantic caching for identical queries (query_hash, model, cached_response, expiry_at, hit_count)

---

## 🔧 Build Phases Breakdown

### Phase 1: Database Infrastructure (CRITICAL 🔴)
**Timeline:** 1-2 days  
**Blockers:** 25 tables must exist before backend services can function

#### 1.1 Create Core System Tables
- **users** table with columns:
  - user_id (string, pk) - Appwrite Account ID
  - syndicate_id (string, fk) - Organization reference
  - covenant (enum) - motion, matter, mind, mythos
  - xi_balance (float) - Currency balance
  - phi_balance (float) - Cosmetic currency
  - resonance_score (int) - 0-100
  - mythos_titles (array) - Array of strings
  - tithe_rate (float) - 0.01-0.10
  - pact (enum) - Apprentice, Adept, Master, Archon
  - cogni_ops_remaining (int)
  - cogni_ops_limit (int)
  - has_onboarded (boolean)
  - age_of_ascension (boolean)
  - color (string) - Hex avatar color
  - name (string) - Display name
  - created_at (datetime)
  - updated_at (datetime)

- **syndicates** table (organization data)
- **connections** table (graph relationships)
- **crews** table (team associations)
- **agent_templates** table (blueprint registry)
- **workflow_versions** table (version control)
- **chronicle_events** table (audit log)

#### 1.2 Create CRM Tables
- **crm_contacts** - Lead database
- **crm_deals** - Sales pipeline
- **crm_activities** - Action log

#### 1.3 Create Financial Tables
- **treasury_transactions** - Transaction ledger
- **tribute_logs** - Ritual event storage
- **pulse_profiles** - Klepsydra metrics
- **global_economic_dials** - Economy state snapshot
- **pillar_of_eternity** - Rite unlock tracking

#### 1.4 Create Micro App Tables
- **micro_app_modules**
- **micro_app_patches**
- **micro_app_drafts**
- **published_micro_apps**

#### 1.5 Create Operations Tables
- **operations_tasks**
- **procurement_orders**

#### 1.6 Create Admin Tables
- **access_keys**
- **syndicate_integrations**
- **notes**

#### 1.7 Create AI & Agent Execution Tables (nexusflow-db)

**Critical for agent execution tracking, LLM logging, and conversational state:**

- **agent_executions** (columns: id, agent_id, workflow_id, user_id, status, start_at, end_at, result_json, error_msg, duration_ms, input_params_json)
- **tool_executions** (columns: id, execution_id, agent_id, tool_name, input_json, output_json, duration_ms, error, status)
- **conversation_history** (columns: id, conversation_id, agent_id, user_id, role, content, timestamp, metadata_json, embedding_vector for RAG)
- **inference_logs** (columns: id, execution_id, model_name, prompt_tokens, completion_tokens, latency_ms, cost, temperature, timestamp)
- **agent_metrics** (columns: agent_id, metric_date, clarity_score, celerity_score, acuity_score, resilience_score, iqi_score, success_rate)
- **model_versions** (columns: id, model_name, version, provider, context_window, max_tokens, capabilities_json, cost_per_token, status)
- **intent_classifications** (columns: id, conversation_id, user_input, detected_intent, confidence_score, agent_routed_to, timestamp)
- **agent_state_snapshots** (columns: agent_id, snapshot_id, memory_state_json, episodic_log, semantic_store_json, created_at)
- **prompt_templates** (columns: id, name, category, template_text, variables_json, model_family, version, created_by)
- **tool_registry** (columns: id, name, description, parameters_json, function_signature, examples_json, status, owner_agent)
- **agent_feedback** (columns: id, execution_id, rating, comment, user_id, created_at, sentiment)
- **experiment_runs** (columns: id, experiment_id, variant_a_agent_id, variant_b_agent_id, metrics_json, winner, confidence)
- **knowledge_artifacts** (columns: id, agent_id, artifact_type, title, content, mime_type, embeddings, created_at, ttl)
- **llm_cache** (columns: id, query_hash, model_name, cached_response, hit_count, created_at, expiry_at)

**Tools Needed:** MCP Appwrite create_*_column functions (or direct REST API batch)

---

### Phase 2: Backend Service Completion (CRITICAL 🔴)
**Timeline:** 2-3 days  
**Depends On:** Phase 1

#### 2.1 Fix Appwrite Client Migration
- [ ] Remove all Supabase stubs from services
- [ ] Update all imports from `supabaseClient.ts` → use Appwrite APIs directly
- [ ] Replace `supabase.from('table').select()` with Appwrite Databases API calls
- [ ] Implement proper error handling + realtime subscriptions via Appwrite Realtime

**Files to Update:**
- `services/userManagementService.ts`
- `services/ritesService.ts`
- `services/klepsydraService.ts`
- `hooks/useWorkflowState.ts`
- `hooks/useCRMState.ts`
- `hooks/useOperationsState.ts`
- `hooks/useProcurementState.ts`
- `hooks/useCodexState.ts`
- `components/admin/DemiurgeConsole.tsx`

#### 2.2 Implement LLM Backend Server
**File:** `backend/llm-server.ts` (currently has TODOs)

Current stubs:
```ts
// Line 49: TODO: Implement actual model loading
// Line 73: TODO: Implement actual inference
```

Tasks:
- [ ] Load Gemma model via MediaPipe or Ollama fallback
- [ ] Implement `/inference` endpoint
- [ ] Add streaming response support
- [ ] Implement model caching + memory limits
- [ ] Add error handling + fallback logic
- [ ] Support concurrent requests with queue management

#### 2.3 Complete User Management Service
**File:** `services/userManagementService.ts`

Outstanding tasks:
- [ ] ServerSDK for Appwrite Users API integration
- [ ] Create user profile on signup (write to `users` table)
- [ ] Fetch user extended data (not just Appwrite Account)
- [ ] Sync AuthContext with database on login
- [ ] Handle profile updates (covenant, tithe_rate, etc.)
- [ ] Implement team/syndicate assignment

#### 2.4 Implement Rites Service Backend
**File:** `services/ritesService.ts`

Currently using Supabase stubs. Need to:
- [ ] Replace Supabase calls with Appwrite
- [ ] Implement `judgeFolly` - log folly events to ledger
- [ ] Implement `completeBurnoutFuneral` - finalize ascension ritual
- [ ] Sync `pillar_of_eternity` updates
- [ ] Add transaction handling for atomic operations

#### 2.5 Implement Klepsydra Service Backend
**File:** `services/klepsydraService.ts`

Tasks:
- [ ] Replace Supabase with Appwrite
- [ ] Implement pulse profile creation/fetch
- [ ] Add chaos card logic
- [ ] Sync economy state updates

#### 2.6 Implement Treasury/Economy Backend
**File:** `services/xiEconomyService.ts`

Tasks:
- [ ] Wire ledger writes to `treasury_transactions` table
- [ ] Aggregate economic dials from `transactions` table
- [ ] Implement tithe calculation → `tribute_logs`
- [ ] Sync CogniOps metering with `users` table

#### 2.7 Implement Agent Execution Backend
**Files:** `services/agentFactory.ts`, `hooks/useWorkflowExecutor.ts`

Tasks:
- [ ] Log agent execution start/end → `agent_executions`
- [ ] Track tool/function calls → `tool_executions`
- [ ] Persist conversation history → `conversation_history`
- [ ] Log LLM inference metrics → `inference_logs`
- [ ] Calculate agent performance scores → `agent_metrics`
- [ ] Cache semantic queries → `llm_cache`
- [ ] Store agent state snapshots → `agent_state_snapshots`
- [ ] Track NLU intent classification → `intent_classifications`
- [ ] Manage prompt template registry → `prompt_templates`
- [ ] Register available tools → `tool_registry`

#### 2.8 Implement Conversation Persistence
**Files:** `hooks/useStreamingChat.ts`, `services/ollamaService.ts`

Tasks:
- [ ] Save each chat message to `conversation_history`
- [ ] Implement RAG with embeddings from `conversation_history`
- [ ] Load conversation context on chat reopening
- [ ] Implement conversation search/retrieval
- [ ] Clean up old conversations (TTL/archival)

---

### Phase 3: Module Integration (HIGH 🟠)
**Timeline:** 1-2 days  
**Depends On:** Phase 1 & 2

#### 3.1 CRM Module
**File:** `modules/crm/CRMView.tsx`

Tasks:
- [ ] Connect CRM state to `crm_contacts` table
- [ ] Implement deal CRUD → `crm_deals`
- [ ] Implement activity logging → `crm_activities`
- [ ] Add real-time deal pipeline sync
- [ ] Implement tactical strategy AI calls (via Ollama)

#### 3.2 Operations Module
**File:** `modules/operations/OperationsView.tsx`

Tasks:
- [ ] Connect task state to `operations_tasks` table
- [ ] Implement task CRUD (create, update, mark done)
- [ ] Add assigned agent support
- [ ] Implement battle drills logic
- [ ] Add OEE (Overall Equipment Effectiveness) calculations

#### 3.3 Micro App Forge
**File:** `components/MicroAppForgeView.tsx` + hooks

Tasks:
- [ ] Sync modules to `micro_app_modules` table
- [ ] Sync patches to `micro_app_patches` table
- [ ] Implement publish flow → `published_micro_apps`
- [ ] Add module marketplace/discovery
- [ ] Implement module versioning

#### 3.4 Procurement Module
**File:** `modules/procurement/ProcurementView.tsx`

Tasks:
- [ ] Connect order state to `procurement_orders` table
- [ ] Implement order creation/tracking
- [ ] Add supplier management
- [ ] Implement approval workflows

#### 3.5 Finance Module
**File:** `modules/finance/FinanceView.tsx`

Tasks:
- [ ] Wire ledger queries to `treasury_transactions`
- [ ] Implement cash flow visualizations
- [ ] Add invoice management
- [ ] Sync global economic dials

---

### Phase 4: Feature Completion (MEDIUM 🟡)
**Timeline:** 2-3 days
**Depends On:** Phases 1-3

#### 4.1 Weaver Studio Backend
- [ ] Persist workflows to `workflow_versions` table
- [ ] Implement workflow execution → ledger logging
- [ ] Add agent instantiation from `agent_templates`
- [ ] Implement dependency resolution + topological sort
- [ ] Add error recovery + retry logic

#### 4.2 Rites System Completion
- [ ] Implement Folly Interdiction UI → backend sync
- [ ] Implement Burnout Funeral full flow
- [ ] Add ascension unlock logic
- [ ] UI for earned sigils display
- [ ] Achievement tracking

#### 4.3 Security Module
- [ ] Implement policy CRUD
- [ ] Add compliance checks → `policies` table
- [ ] Implement audit log viewer (from `audit` table)
- [ ] Add constitutional principles enforcement

#### 4.4 Admin Console
- [ ] **DemiurgeConsole** - implement tool execution
  - User creation tool
  - Grant currency tool
  - Policy enforcement tool
  - System diagnostics tool
- [ ] Implement actual backend function calls (not just UI)
- [ ] Add audit trail for admin actions

#### 4.5 Vault & Secrets Management
- [ ] Implement secret CRUD → `secrets` table
- [ ] Add encryption for sensitive data
- [ ] Agent credentials storage → `agentcreds`
- [ ] Access control layer

---

### Phase 5: Testing & Polish (LOW 🟢)
**Timeline:** 1-2 days

#### 5.1 End-to-End Testing
- [ ] User signup → profile creation → first workflow
- [ ] CRM lead creation → conversion flow
- [ ] Rites protocol (Folly → Burnout → Ascension)
- [ ] Economy state transitions (Xi/Phi flows)
- [ ] Multi-user concurrent operations

#### 5.2 Performance Optimization
- [ ] Database query optimization (index creation)
- [ ] Caching layer for economy snapshots
- [ ] Batch operations for ledger writes
- [ ] Frontend render performance

#### 5.3 Error Handling & Recovery
- [ ] Network failure handling
- [ ] Stale state recovery
- [ ] Transaction rollback on errors
- [ ] User-friendly error messages

#### 5.4 Documentation
- [ ] API documentation
- [ ] Database schema documentation
- [ ] User onboarding guide
- [ ] Admin playbooks

---

## 🎯 Critical Path (Minimum Viable Product)

**To get the app fully functional:**

1. **Phase 1 (Database)** → All 47 tables must exist (emphasis on `agent_executions`, `tool_executions`, `conversation_history` for AI)
2. **Phase 2.1 (Appwrite Migration)** → Remove Supabase, wire Appwrite
3. **Phase 2.2 (LLM Server)** → Backend inference working
4. **Phase 2.7 (Agent Execution)** → Agent runs logged to database
5. **Phase 2.8 (Conversation Persistence)** → Chat history persisted
6. **Phase 3.1-3.3 (Core Modules)** → CRM, Ops, Forge operational
7. **Phase 4.1 (Weaver)** → Workflows executable with metrics tracked

**Estimated Total Time:** 7-10 days (up from 5-7 due to AI infrastructure)

---

## 🚀 Quick Wins (Can do in parallel)

- [ ] Create all 25 database tables (use MCP or REST API batch)
- [ ] Update service imports (find-replace Supabase → Appwrite)
- [ ] Implement LLM backend stub calls
- [ ] Wire admin console to actual backend functions
- [ ] Add missing database columns to existing tables

---

## ⚠️ Known Blockers

1. **MCP Tool Limitations** - `create_table` not available, must use REST API directly
2. **Supabase Stubs** - Most services reference deprecated Supabase client
3. **LLM Backend** - Node.js server needs model loading implementation
4. **Real-time Sync** - Need to migrate Supabase Broadcast → Appwrite Realtime
5. **Transaction Handling** - Complex operations need atomic transactions (Appwrite has this, need to implement)

---

## 📋 File-by-File Checklist

### Services (Backend Logic)
- [ ] `services/appwriteClient.ts` - ✅ Done
- [ ] `services/userManagementService.ts` - 🟡 Remove Supabase stubs
- [ ] `services/ritesService.ts` - 🟡 Replace Supabase calls
- [ ] `services/klepsydraService.ts` - 🟡 Replace Supabase calls
- [ ] `services/xiEconomyService.ts` - 🟡 Wire to `treasury_transactions`
- [ ] `services/ollamaService.ts` - ✅ Done
- [ ] `backend/llm-server.ts` - 🔴 TODO implementations
- [ ] `services/agentFactory.ts` - 🟡 Add `agent_templates` queries

### Hooks (State Management)
- [ ] `hooks/useWorkflowState.ts` - 🟡 Migrate Supabase → Appwrite
- [ ] `hooks/useCRMState.ts` - 🟡 Wire to CRM tables
- [ ] `hooks/useOperationsState.ts` - 🟡 Wire to `operations_tasks`
- [ ] `hooks/useProcurementState.ts` - Need to create
- [ ] `hooks/useCodexState.ts` - May need adjustment
- [ ] `hooks/useRites.ts` - 🟡 Wire to `pillar_of_eternity`
- [ ] `hooks/useKlepsydra.ts` - 🟡 Wire to `pulse_profiles`

### Components (UI)
- [ ] `modules/crm/CRMView.tsx` - 🟡 Connect state to UI
- [ ] `modules/operations/OperationsView.tsx` - 🟡 Connect state
- [ ] `modules/finance/FinanceView.tsx` - 🟡 Wire economy data
- [ ] `components/admin/DemiurgeConsole.tsx` - 🟡 Implement actual backend calls
- [ ] `components/MicroAppForgeView.tsx` - 🟡 Sync to database
- [ ] `modules/vault/VaultView.tsx` - 🔴 Create/wire

### Database
- [ ] 39 missing tables - 🔴 CREATE TABLE (MCP or REST API)
  - 7 core system + 3 CRM + 5 financial + 4 micro-apps + 2 ops + 3 admin = **24 tables in sovereign**
  - 14 AI/agent execution tables = **14 tables in nexusflow-db**
  - 1 encryption secrets table = **in vault**

---

## 🤖 AI & Agent Infrastructure Dependencies

**This is the hidden complexity:** The app's agent execution engine (Weaver Studio, Simulacrum, DemiurgeConsole) requires comprehensive logging/tracking to function:

### Execution Tracking
- Every agent run must log to `agent_executions` for audit trail + performance metrics
- Every tool/function call must log to `tool_executions` for debugging + cost tracking
- LLM inference calls must log to `inference_logs` for token counting + cost calculation

### Conversational Continuity
- Chat messages MUST persist to `conversation_history` for context window management + RAG
- Conversation history enables long-running agents to remember previous interactions
- Without persistence, each agent interaction is stateless

### Performance Monitoring
- `agent_metrics` tracks agent health (clarity, celerity, acuity, resilience, IQI)
- `agent_feedback` enables continuous improvement feedback loops
- `experiment_runs` enables A/B testing different agent configurations

### Knowledge Management
- `knowledge_artifacts` stores generated outputs (strategies, analyses, code)
- `llm_cache` prevents duplicate LLM calls for identical semantic queries
- `prompt_templates` enables prompt engineering + versioning
- `tool_registry` provides discoverable tools/functions for agents

### Without these tables, the system cannot:
- ❌ Track agent performance over time
- ❌ Provide conversation context to agents
- ❌ Audit agent decisions for compliance
- ❌ Calculate accurate metering/billing
- ❌ Debug agent failures
- ❌ Optimize prompts with A/B testing

---



- All user data scoped by `syndicate_id` (multi-tenant isolation)
- Row-level security enabled on sensitive tables
- Audit trail in `audit` / `chronicle_events` tables
- Encrypted secrets in `vault.secrets` table
- API keys in `access_keys` table with rotation policy

---

## 📞 Next Steps

1. **Confirm Database Strategy** - Use MCP tool batch or REST API with credentials?
2. **Assign Phase 1 to Agent** - Create all 25 tables
3. **Parallel: Phase 2.1** - Migrate services off Supabase
4. **Parallel: Phase 2.2** - Implement LLM backend
5. **Integration Testing** - Full end-to-end workflow validation

---

*Last Updated: March 13, 2026*  
*Maintainer: GitHub Copilot*  
*Status: Ready for execution*
