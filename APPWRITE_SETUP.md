# Appwrite Backend Setup Guide for Beepin

## Overview
Beepin uses **Appwrite** as its Backend-as-a-Service (BaaS) platform for:
- **Authentication** — Multi-tenant user identity & session management
- **Database** — Relational data storage with row-level security
- **Storage** — File uploads (avatars, documents, media)
- **Functions** — Serverless backend logic (workflow execution, CRM ops, treasury)
- **Realtime** — WebSocket subscriptions for live multiplayer sync

## Quick Start

### 1. Create Appwrite Account & Project
- Go to [cloud.appwrite.io](https://cloud.appwrite.io)
- Sign up and create a new project
- Note your **Project ID**
- Generate an **API Key** (Dashboard → Settings → API Keys)

### 2. Set Environment Variables
```bash
# .env (at root of repo)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
DATABASE_ID=sovereign
STRIPE_SECRET_KEY=sk_test_your_secret_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key_here
VITE_USE_MOCK_STRIPE=false
VITE_DEFAULT_SYNDICATE_ID=your_default_syndicate_id
```

### 3. Run Backend Setup Script
```bash
bun scripts/setup-appwrite-backend.ts
```

This will:
- ✅ Create the **Sovereign** database
- ✅ Create all tables with proper schemas
- ✅ Create storage buckets (avatars, documents, media)
- ✅ Verify connectivity

### 4. Deploy Functions (Optional)
Using Appwrite CLI:
```bash
npm install -g appwrite
appwrite login
appwrite deploy function --all
```

Or use the `appwrite.json` configuration file for declarative deployment.

## Architecture

### Database Schema (`sovereign`)

#### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `agents` | AI agents in workflows | syndicate_id, name, type, config |
| `connections` | Data flow between agents | source_agent_id, target_agent_id |
| `crews` | Groups of agents | agent_ids |
| `workflows` | Orchestration configs | agents, connections |
| `chronicle_events` | Audit log | event_type, data, timestamp |

#### CRM Module
| Table | Purpose |
|-------|---------|
| `crm_contacts` | People & companies |
| `crm_deals` | Sales opportunities |
| `crm_activities` | Calls, emails, meetings |

#### Financial/Treasury
| Table | Purpose |
|-------|---------|
| `ledger` | Account balance & reserves |
| `transactions` | Debit/credit history |
| `stripe_events` | Stripe webhook event ledger (idempotency/audit) |
| `tribute_logs` | Ceremonial payments |
| `pulse_profiles` | Economic health metrics |
| `pillar_of_eternity` | Long-term economic tracking |

#### Micro Apps
| Table | Purpose |
|-------|---------|
| `micro_app_modules` | Visual programming blocks |
| `micro_app_patches` | Connections between modules |
| `micro_app_drafts` | Code workspace |
| `published_micro_apps` | Deployed micro-applications |

#### Admin/System
| Table | Purpose |
|-------|---------|
| `access_keys` | API keys for integrations |
| `syndicate_integrations` | Third-party service configs |
| `notes` | Codex knowledge base |
| `chat_messages` | Conversation history |
| `email_marketing_lab` | Growth Engine Email Lab (template, segments, schedules JSON per syndicate) |

### Storage Buckets

| Bucket | Purpose | Security |
|--------|---------|----------|
| `avatars` | Agent/user avatars | Public |
| `documents` | PDFs, reports | Private (file-level) |
| `media` | Images, videos | Public |

### Backend Functions and Contracts

#### 1. `process-workflow` 
Executes a complete workflow:
- Fetches workflow agents
- Executes in topological order
- Manages data flow between agents
- Logs execution to chronicle

**Trigger**: API call or scheduled event
**Runtime**: Node.js 18+
**Timeout**: 60 seconds
**Request Body**:
```json
{
  "workflowId": "workflow_doc_id",
  "syndicateId": "tenant_id",
  "inputData": {}
}
```
**Response**:
- Success: `{ success: true, workflowId, executionLog, finalContext }`
- Error: `{ success: false, error: { type, code, message, details? } }`

#### 2. `crm-operations`
Handles CRM business logic:
- Create deals, contacts, activities
- Validate relationships
- Trigger notifications

**Actions**: `create_deal`, `create_contact`, `create_activity`
**Request Body**:
```json
{
  "action": "create_deal",
  "syndicateId": "tenant_id",
  "data": {}
}
```
**Response**:
- Success: `{ success: true, action, result }`
- Error: `{ success: false, error: { type, code, message, details? } }`

#### 3. `treasury-operations`
Manages financial transactions:
- Record transactions (debit/credit)
- Update ledger balance
- Log tributes

**Actions**: `record_transaction`, `log_tribute`
**Request Body**:
```json
{
  "action": "record_transaction",
  "syndicateId": "tenant_id",
  "data": {
    "amount": 1250,
    "type": "credit",
    "reason": "Invoice payment",
    "idempotencyKey": "optional_stable_key"
  }
}
```
**Response**:
- Success: `{ success: true, action, result }`
- Error: `{ success: false, error: { type, code, message, details? } }`

#### 4. `stripe-create-payment-intent`
Creates Stripe PaymentIntent on the server:
- Requires authenticated caller context
- Returns `clientSecret` and `paymentIntentId`

#### 5. `stripe-webhook-handler`
Processes Stripe webhook events:
- Verifies Stripe signature (`stripe-signature`)
- Handles `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
- Stores canonical event entries for reconciliation

#### 6. `stripe-connect-onboarding` (optional)
Creates Stripe Connect account onboarding link for a connected account.

### Function Environment Contract

Required by all core functions:
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `DATABASE_ID`

Required by Stripe functions:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (webhook handler only)

Optional:
- `WORKFLOW_EXECUTOR_MODE` (`stub` default)

### Stripe Schema Migration Notes (Focused Follow-Up)

These changes are required to fully support the newly added Stripe cloud functions:

1. `stripe_events` table must exist with:
   - `stripe_event_id` (string)
   - `stripe_event_type` (string)
   - `stripe_created_at` (datetime)
   - `payload` (string/text)
   - `created_at` (datetime)
   - `updated_at` (datetime)
2. `transactions` table should include `updated_at` (datetime) because treasury + webhook paths write it.
3. `chronicle_events` should include `event_type` and `data` columns because `process-workflow` writes those keys.

Run `bun scripts/setup-appwrite-backend.ts` after pulling latest changes to apply non-destructive table/column creation.

### Error Taxonomy

All functions should return:
```json
{
  "success": false,
  "error": {
    "type": "validation | auth | system",
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Multi-Tenancy

All data is scoped to `syndicate_id`:
```typescript
// Every query includes this filter
Query.equal('syndicate_id', syndicateId)
```

This ensures users only see their own data, even if they're on a shared backend.

## Row-Level Security

Enable Row-Level Security (RLS) in your collections to enforce fine-grained permissions:

1. In Appwrite Dashboard → Collections → [Collection Name]
2. Enable "Row-level permissions"
3. Set document-level access rules

Example:
```typescript
// Only creator + syndicate admins can read/write
permissions: ['read("role:syndicate_admin")', 'write("role:syndicate_admin")']
```

## API Key Security

**Frontend (VITE_*)**: Use public/restricted keys that can only read specific data
**Backend/Functions**: Use private API key with full database access

Restrict API Key permissions in Dashboard → Settings → API Keys → [Key] → Scopes

## Realtime Subscriptions

Beepin uses Appwrite Broadcast for real-time multiplayer features:

```typescript
// Example: Subscribe to agent changes
import { realtime } from '@/services/appwriteClient.js';

const subscription = realtime
  .subscribe('room:' + syndicateId)
  .on('agent_updated', (payload) => {
    setAgents(prev => prev.map(a => a.$id === payload.$id ? payload : a));
  });
```

## Deployment

### Self-Hosted Appwrite
```bash
docker run -d \
  -e _APP_ENV=production \
  -e _APP_DATABASE_POSTGRES=postgres://user:pass@host:5432/appwrite \
  -p 80:80 \
  -p 443:443 \
  appwrite/appwrite:latest
```

Set `APPWRITE_ENDPOINT=https://your-domain.com/v1`

### Appwrite Cloud
No setup needed—just use `https://cloud.appwrite.io/v1` as endpoint.

## Troubleshooting

### Connection Errors
```
Error: Failed to connect to Appwrite
```
✅ Check `APPWRITE_ENDPOINT` and `APPWRITE_PROJECT_ID` in `.env`
✅ Verify API key has correct permissions
✅ Ensure your IP isn't blocked by Appwrite Cloud firewall

### 401 Unauthorized
```
Error: User (JWT) has no access to this action
```
✅ Check API key is still valid (Dashboard → Settings → API Keys)
✅ Verify key has "Database", "Storage", "Functions" scopes
✅ For frontend: Use only public scopes

### Functions Not Deploying
```
Error: Deployment failed
```
✅ Ensure runtime matches function language (node-18.0 for TypeScript)
✅ Check function entrypoint is `default` (or correct export name)
✅ Verify `.env` vars are set during build: `APPWRITE_API_KEY`, `APPWRITE_PROJECT_ID`

## Monitoring & Debugging

### View Function Logs
```bash
appwrite logs function --functionId=process-workflow
```

### Test API Calls
```bash
curl -X POST https://cloud.appwrite.io/v1/functions/process-workflow/executions \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "test", "syndicateId": "123"}'
```

### Function Smoke Test Matrix

| Function ID | Minimal Test Payload | Expected Success Signal |
|---|---|---|
| `process-workflow` | `{"workflowId":"test","syndicateId":"tenant"}` | `success=true` or validation/auth error envelope |
| `crm-operations` | `{"action":"create_contact","syndicateId":"tenant","data":{"name":"Test","email":"t@example.com"}}` | contact doc created and `success=true` |
| `treasury-operations` | `{"action":"record_transaction","syndicateId":"tenant","data":{"amount":100,"type":"credit","reason":"smoke"}}` | transaction + ledger update |
| `stripe-create-payment-intent` | `{"syndicateId":"tenant","amount":1000,"currency":"usd"}` | `clientSecret` present |
| `stripe-webhook-handler` | Stripe CLI webhook forward | `received=true` and event id logged |
| `stripe-connect-onboarding` | `{"connectedAccountId":"acct_...","refreshUrl":"https://...","returnUrl":"https://..."}` | `onboardingUrl` present |

### Post-Deploy Verification Checklist

1. `appwrite functions list` shows all expected function IDs enabled.
2. Latest deployment status is `ready` for each function.
3. Execution logs are visible and include request correlation details.
4. Stripe webhook endpoint verifies signatures in test mode.
5. Treasury updates reconcile with successful Stripe payment events.

### Monitor Database Usage
Dashboard → Databases → Sovereign → Metrics

## Next Steps

1. ✅ Run setup script
2. ✅ Verify tables in Dashboard
3. ✅ Test database operations: `bun dev`
4. ✅ Deploy functions: `appwrite deploy function --all`
5. ✅ Enable Row-Level Security for production
6. ✅ Set up backup/disaster recovery plan

## Resources

- [Appwrite Docs](https://appwrite.io/docs)
- [Appwrite SDK Reference](https://appwrite.io/docs/references/cloud/client-web)
- [Beepin Architecture](./ARCHITECTURE.md)
- [Database Schema](./schema.sql)
