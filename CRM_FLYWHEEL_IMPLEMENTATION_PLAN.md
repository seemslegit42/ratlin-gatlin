# CRM + Flywheel Implementation Plan

## Scope
Translate `CRM.md` and `flywheel.md` into actionable requirements, then map those requirements to the cloud function foundation already implemented (`process-workflow`, `crm-operations`, `treasury-operations`, `stripe-create-payment-intent`, `stripe-webhook-handler`, `stripe-connect-onboarding`).

## Actionable Requirements (Extracted)

### 1) Tenant Isolation and Governance
- Enforce strict `syndicate_id` scoping on all CRM and treasury writes.
- Require explicit role/capability checks for high-risk operations.
- Persist immutable event trails for all autonomous actions.

### 2) Safe-Write Contracts for Agentic CRM
- AI/agent enrichment writes must go to staging fields first.
- Persist confidence + evidence metadata with each recommendation.
- Apply auto-commit only above threshold; otherwise queue review.

### 3) CRM Operational Automation
- Support deterministic CRM actions (contact/deal/activity CRUD) via function calls.
- Add relationship validation and domain-level schema validation before writes.
- Add change-feed logging for post-fact analysis and model improvement.

### 4) Treasury and Stripe Financial Rails
- Server-side payment creation only (never client-generated secrets).
- Webhook-signature verification and idempotent event ingestion.
- Payment events must reconcile into treasury transactions and ledger snapshots.

### 5) Flywheel Telemetry and Continuous Improvement
- Capture structured execution telemetry from workflow and CRM paths.
- Persist failure taxonomies for MAPE-style monitor/analyze loops.
- Create a schema path for synthetic/test scenario labels and evaluation outcomes.

## Mapping to Existing Cloud Functions

### Already Covered
- `process-workflow`
  - Workflow execution envelope + tenant ownership validation + non-blocking chronicle logging.
- `crm-operations`
  - Action dispatch with payload validation and normalized timestamps.
- `treasury-operations`
  - Canonical query usage, amount/type validation, idempotency key support.
- `stripe-create-payment-intent`
  - Server-side intent creation with authenticated context guard.
- `stripe-webhook-handler`
  - Signature verification + event persistence + treasury transaction write.
- `stripe-connect-onboarding`
  - Optional Connect onboarding link flow.

### Gaps to Implement Next
- Add explicit RBAC policy checks to each action (currently request-shape validation exists, policy engine is not yet wired).
- Add safe-write staging tables/columns (`ai_*`) for CRM enrichment.
- Add reconciliation state fields for webhook lifecycle (`processed_at`, `reconciled`, `reconciliation_note`).
- Add flywheel/evaluation tables to track model routing outcomes, confidence drift, and replay cohorts.

## Build Plan (Phased)

### Phase A — Data Contract Completion
1. Finalize table contracts for:
   - `stripe_events`
   - `transactions.updated_at`
   - `chronicle_events.event_type` + `chronicle_events.data`
2. Add staging-field schema for AI safe-write:
   - `crm_contacts.ai_industry`
   - `crm_contacts.ai_confidence_score`
   - `crm_contacts.ai_evidence_url`
3. Document contract in setup guide and schema notes.

### Phase B — Capability Enforcement
1. Introduce capability guard middleware/helper for all function entrypoints.
2. Add action-level policy map:
   - CRM create/update operations
   - Treasury mutation operations
   - Stripe operations
3. Return standardized authorization errors for denied capabilities.

### Phase C — Operational Reconciliation
1. Extend `stripe-webhook-handler` to persist reconciliation state.
2. Add dedupe guardrails for retry storms and out-of-order webhooks.
3. Add treasury consistency checker (daily invariant pass).

### Phase D — Flywheel Instrumentation
1. Add structured telemetry envelope to workflow/CRM/treasury results.
2. Persist model/agent outcome tags (success, fail, fallback, escalation).
3. Add baseline dashboards/queries for:
   - failure mode distribution
   - webhook-to-ledger latency
   - CRM action success rate by operation type

### Phase E — Release Strategy
1. Keep Stripe live path behind `VITE_USE_MOCK_STRIPE=false` rollout flag.
2. Enable internal tenant cohort first.
3. Verify reconciliation and error-rate SLOs before global rollout.

## Acceptance Criteria
- Cloud function writes match provisioned table schema with no runtime column errors.
- Stripe webhook events are idempotent and treasury-reconciled.
- CRM writes are policy-gated and produce structured audit events.
- Flywheel telemetry exists for every workflow and CRM action path.
