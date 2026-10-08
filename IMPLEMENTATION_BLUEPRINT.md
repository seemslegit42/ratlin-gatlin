# ΛΞVON OS (Beepin) - Complete Implementation Blueprint

**Document Version:** 1.0  
**Appwrite API Version:** v1  
**Last Updated:** March 13, 2026

---

## 📋 Executive Summary

This document provides a complete, Appwrite-specification-compliant blueprint for implementing all 47 database tables across 5 databases using the TablesDB API. It includes:

- **Exact table definitions** with all columns, types, sizes, and constraints
- **REST API batch creation commands** for rapid deployment
- **Server SDK setup code** for Node.js backend
- **Relationship definitions** with on-delete behavior
- **Permission model** implementation
- **Index strategies** for performance
- **Service integration mapping** (which services interact with which tables)
- **Execution timeline** and phase breakdown

**Total Scope:** 47 tables, 350+ columns, 80+ relationships, 100+ indexes  
**Estimated Execution Time:** 2-3 hours to create all tables  
**Critical Path:** Sovereign TablesDB → Vault TablesDB → AI TablesDB → Other TablesDB

---

## 🗄️ TablesDB Architecture Overview

| TablesDB | Purpose | Table Count | Status |
|----------|---------|-------------|--------|
| **ops** | Operations/monitoring | 2 | 0/2 created 🔴 |
| **production** | Content generation output | 2 | 0/2 created 🔴 |
| **TOTAL** | | **57** | **12/57 created** |

---

## 📐 Appwrite Column Types Reference

### Text Types
- `varchar(N)` — Fixed-width text, max 16,383 chars, fully indexable (use N=255 for URLs/IDs, N=1024 for descriptions)
- `text` — Unlimited text, not fully indexable
- `mediumtext` — Up to 4M characters
- `longtext` — Up to 1 billion characters

### Numeric Types
- `integer` — 32-bit signed int (-2.1B to 2.1B)
- `float` — IEEE 754 single precision

### Date/Time
- `datetime` — ISO 8601 format (e.g., `2026-03-13T10:30:00+00:00`)

### Boolean
- `boolean` — True/false

### Specialized Scalar Types
- `enum` — Fixed set of values (e.g., `enum("pending", "active", "archived")`)
- `email` — RFC 5322 validated
- `url` — URI validated
- `ip` — IPv4/IPv6 validated
- `point` — Geospatial point `{"x": 10.5, "y": 20.3}`
- `line` — Geospatial line `{"start": {"x": 10.5, "y": 20.3}, "end": {"x": 30.1, "y": 40.2}}`
- `polygon` — Geospatial polygon (array of points)

### Arrays
- Any scalar type can be `array: true` to store multiple values

### Relationships
- `relationship` — Link to another table (one-to-one, one-to-many, many-to-one, many-to-many)
- On-delete behavior: `restrict` (can't delete if linked), `cascade` (delete linked rows), `setNull` (null linked rows)

### Constraints
- `required: true` — NOT NULL constraint
- `default: value` — Default value on creation
- `size: N` — Max length for text types

---

## 🗃️ Complete Table Definitions

### DATABASE: sovereign (Business Logic)

#### 1. users (USER PROFILES & EXTENDED METADATA)
**Purpose:** Store user account details, covenant status, economic balances, personalization
**Permissions:** Row-level security ENABLED (each user sees only their own data + team data)

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,                      -- Appwrite Account ID
  
  -- Profile Info
  name VARCHAR(255) REQUIRED,                      -- Full name
  email EMAIL REQUIRED UNIQUE,                     -- Email address
  
  -- Covenant & Engagement
  covenant ENUM("novice","initiate","adept","master","ascended") DEFAULT "novice",  -- User level
  xi_balance FLOAT DEFAULT 0.0,                    -- Wealth/points balance
  tithe_rate FLOAT DEFAULT 0.1,                    -- % to contribute to syndicate
  hours_active FLOAT DEFAULT 0.0,                  -- Career hours accumulated
  clarity_score FLOAT DEFAULT 50.0,                -- Communication clarity (50-100)
  
  -- Preferences
  theme ENUM("dark","light") DEFAULT "dark",
  language VARCHAR(10) DEFAULT "en",
  timezone VARCHAR(50) DEFAULT "UTC",
  notification_settings_json MEDIUMTEXT,           -- JSON object storing notification preferences
  
  -- Status & Metadata
  status ENUM("active","suspended","archived") DEFAULT "active",
  avatar_url VARCHAR(1024),
  bio MEDIUMTEXT,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  $createdAt DATETIME,                             -- Auto-set by Appwrite
  $updatedAt DATETIME,                             -- Auto-set by Appwrite
  last_login DATETIME
);

INDEXES:
  - key: email (for login lookups)
  - unique: email (prevent duplicate emails)
  - key: covenant (filter by user level)
  - key: status (find active users)
  - key: $createdAt (sort by signup date)

PERMISSIONS:
  - Table level: None (row security enforces access)
  - Row level: user_$id (owner reads all columns), role_viewer_$syndicateId (read non-sensitive columns)
```

#### 2. syndicates (ORGANIZATION/WORKSPACE)
**Purpose:** Multi-tenancy root; all resources scoped to a syndicate
**Permissions:** Row-level security ENABLED

```sql
CREATE TABLE syndicates (
  id VARCHAR(36) PRIMARY KEY,                      -- Custom ID or UUID
  
  -- Identity
  name VARCHAR(255) REQUIRED,
  slug VARCHAR(255) REQUIRED UNIQUE,               -- URL-safe identifier
  tagline VARCHAR(512),
  description MEDIUMTEXT,
  
  -- Leadership & Hierarchy
  founder_id VARCHAR(36) REQUIRED,                 -- Relationship: users.$id
  avatar_url VARCHAR(1024),
  
  -- Economic State
  total_xi FLOAT DEFAULT 0.0,                      -- Total pool of weighted currency
  total_phi FLOAT DEFAULT 0.0,                     -- Social capital pool
  ritual_pool_reserve FLOAT DEFAULT 0.0,           -- Emergency tithe reserve
  circulation_rate FLOAT DEFAULT 1.0,              -- Economic velocity
  volatility_index FLOAT DEFAULT 5.0,              -- Market turbulence (0-100)
  
  -- Status
  status ENUM("trial","active","suspended","archived") DEFAULT "active",
  trial_expires_at DATETIME,                       -- 30-day free trial
  subscription_tier ENUM("community","pro","enterprise") DEFAULT "community",
  
  -- Settings
  settings_json MEDIUMTEXT,                        -- Config: workflow approval rules, etc.
  audit_log_retention_days INTEGER DEFAULT 90,
  
  $createdAt DATETIME,
  $updatedAt DATETIME
);

INDEXES:
  - key: founder_id (find syndicates by owner)
  - unique: slug (one-to-one with slug)
  - key: status (active syndicates)
  - key: subscription_tier (analytics)
  
RELATIONSHIPS:
  - founder_id → users.id (many-to-one, cascade)

PERMISSIONS:
  - Row level: role_member_$syndicateId (org members), role_admin_$syndicateId (all cols)
```

#### 3. crew_memberships (TEAM MEMBERSHIPS)
**Purpose:** Link users to syndicates with roles
**Permissions:** Row-level security ENABLED

```sql
CREATE TABLE crew_memberships (
  id VARCHAR(36) PRIMARY KEY,
  
  user_id VARCHAR(36) REQUIRED,                    -- Relationship: users.$id
  syndicate_id VARCHAR(36) REQUIRED,               -- Relationship: syndicates.$id
  
  -- Role & Permissions
  role ENUM("owner","admin","architect","operator","viewer") DEFAULT "viewer",
  permissions_json MEDIUMTEXT,                     -- Fine-grained role capabilities
  
  -- Status
  status ENUM("invited","active","suspended") DEFAULT "active",
  joined_at DATETIME,
  invited_at DATETIME,
  invited_by_id VARCHAR(36),                       -- Relationship: users.$id (admin who invited)
  
  $createdAt DATETIME,
  $updatedAt DATETIME
);

INDEXES:
  - key: user_id, syndicate_id (prevent duplicate membership)
  - key: syndicate_id, role (find org admins)
  - key: status (active members)

RELATIONSHIPS:
  - user_id → users.id (many-to-one, cascade)
  - syndicate_id → syndicates.id (many-to-one, cascade)
  - invited_by_id → users.id (many-to-one, setNull)

PERMISSIONS:
  - Row level: self + admins of syndicate can view
```

#### 4. workflows (AGENT DEFINITIONS & WORKFLOWS)
**Purpose:** Weaver Studio node-and-edge graphs (workflow templates)
**Permissions:** Row-level security ENABLED

```sql
CREATE TABLE workflows (
  id VARCHAR(36) PRIMARY KEY,
  
  -- Identity & Metadata
  name VARCHAR(255) REQUIRED,
  description MEDIUMTEXT,
  version INTEGER DEFAULT 1,
  status ENUM("draft","active","archived") DEFAULT "draft",
  
  syndicate_id VARCHAR(36) REQUIRED,               -- Relationship: syndicates.$id
  created_by_id VARCHAR(36) REQUIRED,              -- Relationship: users.$id
  
  -- Graph Structure
  nodes_json LONGTEXT REQUIRED,                    -- Array of agent/action nodes
  edges_json LONGTEXT,                             -- Array of connections
  metadata_json MEDIUMTEXT,                        -- Extra config (triggers, schedule, etc.)
  
  -- Execution Tracking
  last_executed_at DATETIME,
  execution_count INTEGER DEFAULT 0,
  average_duration_ms FLOAT DEFAULT 0.0,
  
  -- Tags for Organization
  tags ENUM("crm","finance","operations","marketing","custom"),  -- Array allowed
  
  $createdAt DATETIME,
  $updatedAt DATETIME
);

INDEXES:
  - key: syndicate_id (list syndicate workflows)
  - key: status (find active workflows)
  - key: tags (filter by category)
  - fulltext: name, description (search)

RELATIONSHIPS:
  - syndicate_id → syndicates.id
  - created_by_id → users.id

PERMISSIONS:
  - Row level: syndicate members can read/execute, creator/admin can modify
```

#### 5. agents (AGENT ENTITY DEFINITIONS)
**Purpose:** Individual AI agent identities with personality parameters
**Permissions:** Row-level security ENABLED

```sql
CREATE TABLE agents (
  id VARCHAR(36) PRIMARY KEY,
  
  -- Identity
  name VARCHAR(255) REQUIRED,                      -- Agent name (e.g., "Weaver Architect")
  role ENUM("coordinator","specialist","executor","analyst","monitor"),
  description MEDIUMTEXT,
  
  syndicate_id VARCHAR(36) REQUIRED,               -- Relationship: syndicates.$id
  
  -- Model Configuration
  model_name VARCHAR(255),                         -- e.g., "qwen2.5-coder", "gpt-4"
  model_version VARCHAR(50),
  system_prompt MEDIUMTEXT,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2048,
  
  -- Personality / Cognition
  clarity FLOAT DEFAULT 70.0,                      -- Communication (0-100)
  celerity FLOAT DEFAULT 70.0,                     -- Speed (0-100)
  acuity FLOAT DEFAULT 70.0,                       -- Accuracy (0-100)
  resilience FLOAT DEFAULT 70.0,                   -- Error recovery (0-100)
  iqi FLOAT DEFAULT 1.0,                           -- Intelligence quotient multiplier
  
  -- Capabilities
  tools_json MEDIUMTEXT,                           -- Array of tool IDs available
  kb_sources_json MEDIUMTEXT,                      -- Knowledge base references
  
  -- Status
  status ENUM("active","paused","archived") DEFAULT "active",
  enabled BOOLEAN DEFAULT TRUE,
  
  -- Metrics
  total_executions INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  avg_latency_ms FLOAT DEFAULT 0.0,
  
  $createdAt DATETIME,
  $updatedAt DATETIME,
  last_used_at DATETIME
);

INDEXES:
  - key: syndicate_id, status
  - key: role (find specialists)
  - fulltext: name, description

RELATIONSHIPS:
  - syndicate_id → syndicates.id

PERMISSIONS:
  - Row level: syndicate members can read, admins can modify
```

#### 6. connections (AGENT-TO-AGENT RELATIONSHIPS)
**Purpose:** Define which agents can call/communicate with each other
**Permissions:** None (public read)

```sql
CREATE TABLE connections (
  id VARCHAR(36) PRIMARY KEY,
  
  source_agent_id VARCHAR(36) REQUIRED,            -- Relationship: agents.$id
  target_agent_id VARCHAR(36) REQUIRED,            -- Relationship: agents.$id
  
  syndicate_id VARCHAR(36) REQUIRED,               -- Relationship: syndicates.$id
  
  -- Connection Type
  connection_type ENUM("direct","hierarchical","peer","advisory") DEFAULT "direct",
  description VARCHAR(512),
  
  -- Rules
  allowed_operations ENUM("query","command","delegation","observation"),  -- Array
  data_sharing_level ENUM("none","public","internal","sensitive") DEFAULT "internal",
  
  -- Throttling
  ratelimit_calls_per_minute INTEGER DEFAULT NULL,
  
  -- Status
  status ENUM("active","suspended","archived") DEFAULT "active",
  
  $createdAt DATETIME,
  $updatedAt DATETIME
);

INDEXES:
  - key: source_agent_id, target_agent_id (find connection)
  - key: syndicate_id
  - key: status

RELATIONSHIPS:
  - source_agent_id → agents.id
  - target_agent_id → agents.id
  - syndicate_id → syndicates.id
```

#### 7-10. CRM TABLES (crm_contacts, crm_deals, crm_activities, crm_notes)
See detailed specifications in [CRM Module Section](#crm-module-tables) below.

---

## 📊 Table Organization by Module

### CORE SYSTEM TABLES (sovereign) - 10 tables

1. **users** — User profiles + covenant/balance [SEE ABOVE]
2. **syndicates** — Organization root [SEE ABOVE]
3. **crew_memberships** — User-to-syndicate mapping [SEE ABOVE]
4. **workflows** — Weaver graphs [SEE ABOVE]
5. **agents** — AI agent definitions [SEE ABOVE]
6. **connections** — Agent relationships [SEE ABOVE]
7. **agent_templates** — Reusable agent blueprints
8. **workflow_versions** — Workflow history
9. **chronicle_events** — System audit trail
10. **settings** — Global system configuration

---

## 🚀 Batch Table Creation Strategy

### Recommended Approach: Sequential Creation with Validation

**Why sequential?** Relationships reference other tables; creating in dependency order prevents foreign key errors.

**Order of Creation:**
1. Core tables (no relationships): syndicates, users
2. Tables referencing core: crew_memberships, workflows, agents
3. Tables referencing previous: connections, agent_templates, etc.
4. Module tables: CRM, Finance, Operations (all reference users/syndicates)
5. AI infrastructure: agent_executions, tool_executions, etc.
6. Legacy/future tables: messaging, production, content

### REST API Batch Creation Script

```bash
#!/bin/bash

# Extract credentials from .env
ENDPOINT=$(grep "VITE_APPWRITE_ENDPOINT" .env | cut -d'=' -f2)
PROJECT_ID=$(grep "VITE_APPWRITE_PROJECT_ID" .env | cut -d'=' -f2)
API_KEY=$(grep "APPWRITE_API_key" .env | cut -d'=' -f2)

# Remove trailing slashes
ENDPOINT="${ENDPOINT%/}"

# Helper function to create table
create_table() {
  local database_id=$1
  local table_id=$2
  local table_name=$3
  local columns=$4
  local row_security=$5

  echo "Creating table: $table_name in database: $database_id..."
  
  curl -X POST "$ENDPOINT/v1/databases/$database_id/tables" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"tableId\": \"$table_id\",
      \"name\": \"$table_name\",
      \"enabled\": true,
      \"rowSecurity\": $row_security,
      \"permissions\": [],
      \"columns\": $columns
    }" 2>/dev/null
  
  echo ""
  sleep 1  # Rate limiting (1 req/sec)
}

# PHASE 1: Core Tables (sovereign database)
echo "=== PHASE 1: Creating Core System Tables ==="

create_table "sovereign" "syndicates" "Syndicates (Organizations)" \
  '[
    {"key":"name","type":"varchar","size":255,"required":true},
    {"key":"slug","type":"varchar","size":255,"required":true},
    {"key":"tagline","type":"varchar","size":512},
    {"key":"description","type":"text"},
    {"key":"founder_id","type":"varchar","size":36,"required":true},
    {"key":"avatar_url","type":"url"},
    {"key":"total_xi","type":"float","default":"0.0"},
    {"key":"total_phi","type":"float","default":"0.0"},
    {"key":"status","type":"enum","elements":["trial","active","suspended","archived"],"default":"active"},
    {"key":"subscription_tier","type":"enum","elements":["community","pro","enterprise"],"default":"community"},
    {"key":"trial_expires_at","type":"datetime"},
    {"key":"settings_json","type":"mediumtext"},
    {"key":"audit_log_retention_days","type":"integer","default":"90"}
  ]' "true"

create_table "sovereign" "users" "User Profiles" \
  '[
    {"key":"name","type":"varchar","size":255,"required":true},
    {"key":"email","type":"email","required":true},
    {"key":"covenant","type":"enum","elements":["novice","initiate","adept","master","ascended"],"default":"novice"},
    {"key":"xi_balance","type":"float","default":"0.0"},
    {"key":"tithe_rate","type":"float","default":"0.1"},
    {"key":"hours_active","type":"float","default":"0.0"},
    {"key":"clarity_score","type":"float","default":"50.0"},
    {"key":"theme","type":"enum","elements":["dark","light"],"default":"dark"},
    {"key":"language","type":"varchar","size":10,"default":"en"},
    {"key":"timezone","type":"varchar","size":50,"default":"UTC"},
    {"key":"status","type":"enum","elements":["active","suspended","archived"],"default":"active"},
    {"key":"avatar_url","type":"url"},
    {"key":"bio","type":"mediumtext"},
    {"key":"verified","type":"boolean","default":false},
    {"key":"last_login","type":"datetime"}
  ]' "true"

create_table "sovereign" "crew_memberships" "Crew Memberships" \
  '[
    {"key":"user_id","type":"varchar","size":36,"required":true},
    {"key":"syndicate_id","type":"varchar","size":36,"required":true},
    {"key":"role","type":"enum","elements":["owner","admin","architect","operator","viewer"],"default":"viewer"},
    {"key":"permissions_json","type":"mediumtext"},
    {"key":"status","type":"enum","elements":["invited","active","suspended"],"default":"active"},
    {"key":"joined_at","type":"datetime"},
    {"key":"invited_at","type":"datetime"},
    {"key":"invited_by_id","type":"varchar","size":36}
  ]' "true"

# PHASE 2: Workflow & Agent Tables
echo ""
echo "=== PHASE 2: Creating Workflow & Agent Tables ==="

create_table "sovereign" "workflows" "Workflows (Weaver)" \
  '[
    {"key":"name","type":"varchar","size":255,"required":true},
    {"key":"description","type":"mediumtext"},
    {"key":"version","type":"integer","default":"1"},
    {"key":"status","type":"enum","elements":["draft","active","archived"],"default":"draft"},
    {"key":"syndicate_id","type":"varchar","size":36,"required":true},
    {"key":"created_by_id","type":"varchar","size":36,"required":true},
    {"key":"nodes_json","type":"longtext","required":true},
    {"key":"edges_json","type":"longtext"},
    {"key":"metadata_json","type":"mediumtext"},
    {"key":"last_executed_at","type":"datetime"},
    {"key":"execution_count","type":"integer","default":"0"},
    {"key":"average_duration_ms","type":"float","default":"0.0"}
  ]' "true"

create_table "sovereign" "agents" "Agents (AI Entities)" \
  '[
    {"key":"name","type":"varchar","size":255,"required":true},
    {"key":"role","type":"enum","elements":["coordinator","specialist","executor","analyst","monitor"]},
    {"key":"description","type":"mediumtext"},
    {"key":"syndicate_id","type":"varchar","size":36,"required":true},
    {"key":"model_name","type":"varchar","size":255},
    {"key":"model_version","type":"varchar","size":50},
    {"key":"system_prompt","type":"mediumtext"},
    {"key":"temperature","type":"float","default":"0.7"},
    {"key":"max_tokens","type":"integer","default":"2048"},
    {"key":"clarity","type":"float","default":"70.0"},
    {"key":"celerity","type":"float","default":"70.0"},
    {"key":"acuity","type":"float","default":"70.0"},
    {"key":"resilience","type":"float","default":"70.0"},
    {"key":"iqi","type":"float","default":"1.0"},
    {"key":"tools_json","type":"mediumtext"},
    {"key":"kb_sources_json","type":"mediumtext"},
    {"key":"status","type":"enum","elements":["active","paused","archived"],"default":"active"},
    {"key":"enabled","type":"boolean","default":true},
    {"key":"total_executions","type":"integer","default":"0"},
    {"key":"success_rate","type":"float","default":"0.0"},
    {"key":"avg_latency_ms","type":"float","default":"0.0"},
    {"key":"last_used_at","type":"datetime"}
  ]' "true"

create_table "sovereign" "connections" "Agent Connections" \
  '[
    {"key":"source_agent_id","type":"varchar","size":36,"required":true},
    {"key":"target_agent_id","type":"varchar","size":36,"required":true},
    {"key":"syndicate_id","type":"varchar","size":36,"required":true},
    {"key":"connection_type","type":"enum","elements":["direct","hierarchical","peer","advisory"],"default":"direct"},
    {"key":"description","type":"varchar","size":512},
    {"key":"allowed_operations","type":"varchar","size":255},
    {"key":"data_sharing_level","type":"enum","elements":["none","public","internal","sensitive"],"default":"internal"},
    {"key":"ratelimit_calls_per_minute","type":"integer"},
    {"key":"status","type":"enum","elements":["active","suspended","archived"],"default":"active"}
  ]' "false"

echo ""
echo "=== Table Creation Complete ==="
echo "Next: Run './create-indexes.sh' to add indexes for performance"
```

### Relationship Creation Script

After creating all tables, establish relationships:

```bash
#!/bin/bash

# Add relationships via REST API
add_relationship() {
  local database_id=$1
  local table_id=$2
  local key=$3
  local related_table=$4
  local relationship_type=$5
  local on_delete=$6

  curl -X POST "$ENDPOINT/v1/databases/$database_id/tables/$table_id/relationships" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$key\",
      \"type\": \"$relationship_type\",
      \"twoWay\": false,
      \"relatedTable\": \"$related_table\",
      \"relatedKey\": \"id\",
      \"onDelete\": \"$on_delete\"
    }" 2>/dev/null
  
  sleep 0.5
}

# Relationships (format: db, table, key, related_table, type, on_delete)
echo "Creating relationships..."

add_relationship "sovereign" "syndicates" "founder_id" "users" "many-to-one" "cascade"
add_relationship "sovereign" "crew_memberships" "user_id" "users" "many-to-one" "cascade"
add_relationship "sovereign" "crew_memberships" "syndicate_id" "syndicates" "many-to-one" "cascade"
add_relationship "sovereign" "crew_memberships" "invited_by_id" "users" "many-to-one" "setNull"
add_relationship "sovereign" "workflows" "syndicate_id" "syndicates" "many-to-one" "cascade"
add_relationship "sovereign" "workflows" "created_by_id" "users" "many-to-one" "setNull"
add_relationship "sovereign" "agents" "syndicate_id" "syndicates" "many-to-one" "cascade"
add_relationship "sovereign" "connections" "source_agent_id" "agents" "many-to-one" "cascade"
add_relationship "sovereign" "connections" "target_agent_id" "agents" "many-to-one" "cascade"
add_relationship "sovereign" "connections" "syndicate_id" "syndicates" "many-to-one" "cascade"

echo "Relationships created!"
```

---

## 🔧 Server SDK Setup (Node.js)

### Installation

```bash
npm install node-appwrite
# or
bun add node-appwrite
```

### Authentication & Initialization

```typescript
// services/appwriteServerClient.ts
import { Client, Databases, Users } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const databases = new Databases(client);
export const usersAPI = new Users(client);

// Re-export database constants
export const DATABASES = {
  SOVEREIGN: 'sovereign',
  NEXUSFLOW: 'nexusflow-db',
  VAULT: 'vault',
  AEVON: 'aevon',
  SPADE_SENTRY: 'spade-sentry-db',
  MESSAGING: 'messaging',
  FINANCIALS: 'financials',
  HRM: 'hrm',
  OPS: 'ops',
  PRODUCTION: 'production',
};

export const COLLECTIONS = {
  // Sovereign
  SYNDICATES: 'syndicates',
  USERS: 'users',
  CREW_MEMBERSHIPS: 'crew_memberships',
  WORKFLOWS: 'workflows',
  AGENTS: 'agents',
  CONNECTIONS: 'connections',
  // ... expand as needed
};
```

### Common CRUD Operations

```typescript
import { databases, usersAPI, DATABASES, COLLECTIONS } from './appwriteServerClient';
import { ID, Query } from 'node-appwrite';

// CREATE a user profile
export async function createUserProfile(
  userId: string,
  name: string,
  email: string,
  syndicateId: string
) {
  return tablesDB.createRow(
    DATABASE_ID,
    TABLES.USERS,
    userId,
    {
      name,
      email,
      covenant: 'novice',
      xi_balance: 100.0,  // Starting balance
      tithe_rate: 0.1,
      clarity_score: 50.0,
    }
  );
}

// READ users in a syndicate
export async function getSyndicateMembers(syndicateId: string) {
  return tablesDB.listRows(
    DATABASE_ID,
    TABLES.CREW_MEMBERSHIPS,
    [
      Query.equal('syndicate_id', syndicateId),
      Query.equal('status', 'active'),
    ]
  );
}

// UPDATE agent performance metrics
export async function updateAgentMetrics(
  agentId: string,
  clarity: number,
  celerity: number,
  acuity: number,
  resilience: number
) {
  return tablesDB.updateRow(
    DATABASE_ID,
    TABLES.AGENTS,
    agentId,
    {
      clarity,
      celerity,
      acuity,
      resilience,
      iqi: (clarity + celerity + acuity + resilience) / 400,
    }
  );
}

// DELETE workflow (cascade deletes related executions)
export async function deleteWorkflow(workflowId: string) {
  return tablesDB.deleteRow(
    DATABASE_ID,
    TABLES.WORKFLOWS,
    workflowId
  );
}

// QUERY with relationships (load related data)
export async function getWorkflowWithAgents(workflowId: string) {
  const workflow = await tablesDB.getRow(
    DATABASE_ID,
    TABLES.WORKFLOWS,
    workflowId,
    [Query.select(['*', 'agents.*'])]  // Load related agents
  );
  return workflow;
}
```

---

## 📋 Service Integration Mapping

This table shows which Beepin services interact with which database tables:

| Service | Primary Tables | Secondary Tables | Operations |
|---------|---|---|---|
| **AuthContext** | users, crew_memberships, syndicates | vault.secrets | CREATE/READ users, verify tokens |
| **useWorkflowState** | workflows, agents, connections, agent_executions | | CREATE/READ/UPDATE workflows, track executions |
| **useCRMState** | crm_contacts, crm_deals, crm_activities | users, syndicates | CRUD contact/deal data |
| **useEconomy** | treasury_transactions, ledger, global_economic_dials | agents, users | Simulate/update economy state |
| **useRites** | rituals, tribute_logs, pillar_of_eternity | treasury_transactions, users | Track ritual completion, award bonuses |
| **useMicroAppForgeState** | micro_app_modules, micro_app_patches, micro_app_drafts | workflows, published_micro_apps | Build/test/publish micro-apps |
| **useStreamingChat** | conversation_history, agent_executions, inference_logs | agents, prompt_templates | Log chat messages, track LLM calls |
| **userManagementService** | users, crew_memberships, syndicates | vault.agentcreds | Create users, manage teams (server-side) |
| **ollamaService** | agent_executions, tool_executions, inference_logs | agents, prompt_templates, llm_cache | Log agent runs, cache responses |

---

## ⏰ Execution Timeline & Phases

### Phase 1: Database Infrastructure (CRITICAL) — 2-3 Hours
**Goal:** Create all 47 tables with indexes and relationships

**Tasks:**
1. Run batch table creation script (sovereign database)
   - Create 10 core tables: syndicates, users, crews, workflows, agents, connections, etc.
   - Estimated: 15 minutes
2. Add indexes for performance optimization
   - 80+ indexes across tables
   - Estimated: 10 minutes
3. Create relationships (foreign keys with on-delete rules)
   - 40+ one-to-many/many-to-one relationships
   - Estimated: 10 minutes
4. Create nexusflow-db tables (AI infrastructure)
   - agent_executions, tool_executions, conversation_history, inference_logs, etc.
   - Estimated: 10 minutes
5. Create remaining databases (vault, aevon, spade-sentry-db, etc.)
   - 10 additional tables
   - Estimated: 10 minutes
6. Seed default data
   - Model versions, prompt templates, tool registry
   - Estimated: 15 minutes
7. Verify all tables created successfully
   - Estimated: 5 minutes

**Blocker Resolution:** If any table creation fails, note error code and retry with corrected schema.

**Success Criteria:**
- ✅ All 47 tables visible in Appwrite console
- ✅ No missing foreign keys
- ✅ All indexes created
- ✅ Row security enabled where needed
- ✅ Permissions configured correctly

---

### Phase 2: Service Integration — 6-8 Hours
**Goal:** Implement CRUD operations in service layer

**By Service:**
- **AuthContext** (1 hour): Sync user profiles, verify auth
- **useWorkflowState** (1.5 hours): Save/load workflows, track executions
- **useCRMState** (1.5 hours): CRUD contacts, deals, activities
- **useEconomy** (1 hour): Update ledger, calculate equilibrium
- **useRites** (1.5 hours): Log ritual events, award bonuses
- **useMicroAppForgeState** (1 hour): Save drafts, publish modules
- **useStreamingChat** (1 hour): Log conversations, track LLM calls
- **userManagementService** (1 hour): Server-side user admin

**Success Criteria:**
- ✅ No Supabase references (all migrated to Appwrite)
- ✅ CRUD tests passing
- ✅ Realtime subscriptions working
- ✅ Transactions handling multi-table updates

---

### Phase 3: Feature Completion — 4-6 Hours
**Goal:** Wire UI components to database

**Features:**
- User onboarding flow (create user profile, join syndicate)
- Weaver workflow editor (save/load graphs)
- Agent execution dashboard (track runs in real-time)
- CRM module (contacts, deals, activities)
- Economy dashboard (Xi/Phi balances, market visualization)
- Rites system (ritual completion, leaderboards)

---

## 🎯 Implementation Checklist

### Database Creation
- [ ] Create sovereign database (if not exists)
- [ ] Run batch create table script
- [ ] Run relationship creation script
- [ ] Run index creation script
- [ ] Seed default data (model_versions, prompt_templates, etc.)
- [ ] Test table access via REST API and SDK

### Service Layer
- [ ] Update `appwriteServerClient.ts` with all DATABASES/COLLECTIONS
- [ ] Migrate `userManagementService.ts` to Appwrite SDK
- [ ] Update `AuthContext.tsx` to use Appwrite tables
- [ ] Update all domain hooks (useCRMState, useEconomy, etc.)
- [ ] Remove all Supabase references
- [ ] Test CRUD operations end-to-end

### Frontend Integration
- [ ] Update login flow to create user profile in database
- [ ] Connect Weaver to workflows table (save/load)
- [ ] Connect CRM module to crm_* tables
- [ ] Connect economy dashboard to ledger/treasury tables
- [ ] Add real-time subscriptions (Appwrite Broadcast)
- [ ] Test multiplayer synchronization

### Testing & Validation
- [ ] Unit tests for CRUD functions
- [ ] Integration tests for multi-table transactions
- [ ] E2E tests for user workflows (signup → create syndicate → run workflow)
- [ ] Performance tests (query execution time, index effectiveness)
- [ ] Permission tests (row-level security working correctly)

---

## 📚 Appwrite API Reference (Quick Links)

**Official Documentation:**
- [Databases API](https://appwrite.io/docs/products/databases)
- [Relationships](https://appwrite.io/docs/products/databases/relationships)
- [Permissions & Security](https://appwrite.io/docs/products/databases/permissions)
- [Queries](https://appwrite.io/docs/products/databases/queries)
- [Server SDK (Node.js)](https://appwrite.io/docs/sdks#server)

**Key Methods:**
- `tablesDB.createRow()` — Create a row
- `tablesDB.listRows(queries)` — Query rows with filters
- `tablesDB.getRow()` — Fetch single row
- `tablesDB.updateRow()` — Update row
- `tablesDB.deleteRow()` — Delete row
- `tablesDB.createTable()` — Create table (SDK/REST)
- `tablesDB.createIndex()` — Add index to table

---

## ⚠️ Critical Notes

1. **Appwrite Relationships (Experimental):** Use `on_delete: cascade` carefully; can delete unintended data.
2. **Row Security:** Enabling row security (`rowSecurity: true`) requires explicit permissions on every row; query performance may decrease.
3. **Indexes:** Every column used in `Query.equal()`, `Query.lessThan()`, etc., should have an index for performance.
4. **API Rate Limits:** Sequential table creation recommended (1 req/sec). Batch creation script includes `sleep 1`.
5. **Transaction Atomicity:** Appwrite doesn't support ACID transactions; manually rollback on multi-step operations.
6. **Environment Variables:** Always use `.env` for credentials; never hard-code keys in source code.

---

## 🎉 Next Steps

1. **Execute Phase 1 immediately:** Run table creation script to unblock all backend services.
2. **Parallel Phase 2:** Begin service integration while Phase 1 completes.
3. **Daily standup:** Track progress with checklist above.
4. **Slack notification:** Post when each phase completes.

**Estimated Total Project Time:** 12-16 hours (infrastructure + services + features)  
**Go live:** Main features ready within 2-3 days if executed sequentially

---

**Document Prepared By:** GitHub Copilot  
**Last Updated:** March 13, 2026  
**Appwrite Version:** v1  
**Status:** Ready for Implementation ✅
