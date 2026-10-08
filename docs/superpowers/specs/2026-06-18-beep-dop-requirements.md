# ΛΞVON DOP — Consolidated Requirements (Spec Extraction)

> **Sources:** `FRS.md`, `AVF.md`, `economy.md` (CEVM), `BUILD_PLAN.md`, `README.md`, `frontend.md`  
> **Generated:** 2026-06-18  
> **Status:** Approved for planning (local specs; Notion not used)

---

## 1. Product Vision (FRS §1)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FRS-1.1 | Target Sovereign Founder cohort (2–10 person teams) | P1 | Onboarding flow captures covenant, pact, syndicate; neuro-inclusive UX defaults |
| FRS-1.2 | Emotional Middleware — agents filter toxic market feedback | P2 | Inbound support/CRM messages routed through agent before sovereign inbox |
| FRS-1.3 | Venture Anarchist transparency — gamification is opt-in, explained | P1 | Tutorial + settings disclose MMORG mechanics; no dark patterns |
| FRS-1.4 | Pre-Legal Consensus Framework for co-founder alignment | P3 | Syndicate policies table + constitutional guardrails in Aegis |

## 2. UI/UX (FRS §2, frontend.md)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| UX-2.1 | Ancient Futurism aesthetic (Roman Glass, triadic palette) | P0 | Matches `DESIGN_SYSTEM.md`; Comfortaa/Lexend/Martian Mono |
| UX-2.2 | Obsidian Mode — solid dark backgrounds, WCAG 2.2 contrast | P1 | Theme toggle; no frosted glass in Obsidian; accent glow retained |
| UX-2.3 | Component Duality + Veil-Peel (Sovereign ↔ Architect) | P1 | Long-press on Weaver shards reveals node graph in situ |
| UX-2.4 | Glasshouse Protocol — narrative observability, Gossip Log | P0 | `Simulacrum` + `GossipTicker` synthesize execution logs to narrative |
| UX-2.5 | Semantic Physics — mass/friction by financial weight | P3 | High-value actions require dwell time + haptic/audio feedback |
| UX-2.6 | 3D procedural topography for financial/system health | P2 | `SimulationLayer` maps liquidity → elevation, latency → weather |
| UX-2.7 | Sovereign's Halo HUD — tribute velocity, Aegis, Klepsydra | P1 | `VitalsHUD` shows Ξ pulse, security glyph, resource bars |
| UX-2.8 | Neuro-inclusive: Lexend body, progressive disclosure, calm tech | P0 | No placeholder-only labels; advanced config behind explicit expand |

## 3. Architecture & Agents (FRS §3, README)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| ARCH-3.1 | CoALA modular memory (working, episodic, semantic, procedural) | P1 | `agent_state_snapshots` + `conversation_history` persisted |
| ARCH-3.2 | Tri-Agentic Mind: Mainframe, Weaver Architect, optional Voice | P0 | Ollama chat + workflow scaffold from NL; voice behind flag |
| ARCH-3.3 | MCP tool connectivity for external silos | P1 | Postman MCP bridge on :3100; agent tool_registry entries |
| ARCH-3.4 | Weaver Studio — node graph, execution, versioning | P0 | Workflows persist to `workflow_versions`; execution logs to chronicle |
| ARCH-3.5 | Explainable Intelligence — auditable decision chains | P1 | `inference_logs` + Aegis verdict stored per agent run |

## 4. Economic Models (AVF + CEVM + README Ξ Economy)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| ECO-4.1 | **UAV** — Unit of Agentic Value = verifiable goal outcome | P0 | Each completed agent run emits one UAV record in `agent_executions` |
| ECO-4.2 | **V_base / V_CO** — tiered cognitive value by agent complexity | P1 | `agent_templates` carry `v_co` score; Pact tiers gate CogniOps |
| ECO-4.3 | **M_c / E_CO(t)** — compounding efficacy via RSI | P1 | `agent_metrics` stores IQI components; E_CO computed daily |
| ECO-4.4 | **G_Trust** — governance multiplier | P0 | Aegis blocks + `policies` + `audit` feed G-Score display |
| ECO-4.5 | **N_Collaborative** — A2A synergy | P2 | `connections` + crew execution logs collaboration factor Φ_A2A |
| ECO-4.6 | Ξ/Φ treasury, tithe, CogniOps metering | P0 | `treasury_transactions`, `users.cogni_ops_*`, `PACT_CONFIGS` enforced |
| ECO-4.7 | Klepsydra METRONOME — complexity modulation, chaos cards | P1 | `pulse_profiles` + `global_economic_dials` drive boon outcomes |
| ECO-4.8 | Rites of Ascension — Folly, Burnout Funeral, sigils | P1 | `pillar_of_eternity` + `tribute_logs` updated atomically |

### IQI Metric Mapping (CEVM → Schema)

| IQI Component | Storage | Service |
|---------------|---------|---------|
| Task Completion Rate (R_S) | `agent_metrics.success_rate` | `services/agentMetricsService.ts` (new) |
| Depth of Reasoning (DOR) | `inference_logs` token ratio | `ollamaService` post-hook |
| Breadth of Thought (BOT) | `intent_classifications` category count | NLU router |
| Recursive Error Reduction (ΔR_E) | `agent_metrics` delta vs prior period | nightly aggregation |
| Normalized Latency (L_N) | `inference_logs.latency_ms` / baseline | `inference_logs` |
| G_Trust pillars | `policies` + `audit` + Aegis blocks | `aegisService` |

## 5. Data Layer (BUILD_PLAN — reconciled with repo)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| DB-5.1 | Sovereign TablesDB — 38 tables in `setup-appwrite-backend.ts` | P0 | **Schema defined**; provision via `bun scripts/setup-appwrite-backend.ts` |
| DB-5.2 | Nexusflow TablesDB — 14 AI/agent tables | P0 | **Missing from script** — must add |
| DB-5.3 | Multi-tenant `syndicate_id` on all rows | P0 | Enforced in services + Appwrite permissions |
| DB-5.4 | Vault encryption for secrets/agentcreds | P1 | Columns use `encrypt: true` in schema |

### Nexusflow Tables (not yet in provisioning script)

`agent_executions`, `tool_executions`, `conversation_history`, `inference_logs`, `agent_metrics`, `model_versions`, `intent_classifications`, `agent_state_snapshots`, `prompt_templates`, `tool_registry`, `agent_feedback`, `experiment_runs`, `knowledge_artifacts`, `llm_cache`

## 6. Module Integration (BUILD_PLAN §3)

| Module | Tables | Hook/Service | UI |
|--------|--------|--------------|-----|
| CRM | crm_* | `useCRMState` | `components/crm/CRMView.tsx` |
| Operations | operations_tasks | `useOperationsState` | `modules/operations/OperationsView.tsx` |
| Procurement | procurement_orders | `useProcurementState` | `components/procurement/*` |
| Finance/Treasury | treasury_*, global_economic_dials | `useTreasuryState`, `xiEconomyService` | `components/economy/*` |
| Micro-App Forge | micro_app_* | `useMicroAppForgeState` | `components/Forge.tsx` |
| Weaver | workflow_versions, agents | `useWorkflowState`, `useWorkflowExecutor` | `components/weaver/*` |
| Rites | pillar_of_eternity, tribute_logs | `useRites`, `ritesService` | `components/rites/*` |
| Security | policies, audit | `aegisService` | `modules/security/SecurityView.tsx` |
| Admin | access_keys | `useAccessKeysState` | `modules/admin/DemiurgeConsole.tsx` |

## 7. Known Gaps (codebase audit 2026-06-18)

1. **Services return mocks** — `ritesService`, `klepsydraService` have TODO stubs (not live Supabase; never wired to Appwrite).
2. **No nexusflow DB** — AI execution tables exist only in `BUILD_PLAN.md`, not in `setup-appwrite-backend.ts`.
3. **LLM server skeleton** — `backend/llm-server.ts` returns placeholder; production path is Ollama via `ollamaService`.
4. **User profile sync** — `AuthContext` does not create/fetch `users` table row on signup/login.
5. **Agent execution logging** — `useWorkflowExecutor` runs agents but does not persist to `agent_executions`.
6. **BUILD_PLAN stale** — claims 8/47 tables; script already defines 38 sovereign tables.

## 8. Critical Path (MVP)

```
DB provision (sovereign + nexusflow)
  → Appwrite service layer (rites, klepsydra, users, economy)
    → Agent execution + conversation persistence
      → Module CRUD wiring (CRM, Ops, Forge)
        → CEVM metering (IQI + CogniOps)
          → E2E rites + economy flows
```

**Estimated effort:** 7–10 engineering days (1 senior + agent assist).

## 9. Out of Scope (this plan)

- Full 3D semantic physics engine (UX-2.5) — deferred P3
- Voice Link production provider — behind feature flag
- Weaver 1.0 Next.js re-platform (`frontend.md` §I.3) — separate Weaver/IDE unification track
- Stripe live billing — mock path sufficient for MVP

---

*Linked implementation plan:* `docs/superpowers/plans/2026-06-18-beep-dop-implementation.md`
