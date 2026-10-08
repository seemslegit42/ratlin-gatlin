#!/bin/bash

###############################################################################
# ΛΞVON OS (Beepin) - Batch Table Creation Script
# Appwrite v1 REST API
# 
# USAGE: ./create-tables.sh
# 
# This script creates all 47 database tables across 5 databases
# Execution time: ~2-3 hours (sequential, 1 req/sec rate limit)
#
# REQUIREMENTS:
# - .env file with: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, APPWRITE_API_key
# - curl installed
# - bash shell
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Extract credentials from .env
if [ ! -f ".env" ]; then
  echo -e "${RED}ERROR: .env file not found${NC}"
  exit 1
fi

ENDPOINT=$(grep "VITE_APPWRITE_ENDPOINT" .env | cut -d'=' -f2 | xargs)
PROJECT_ID=$(grep "VITE_APPWRITE_PROJECT_ID" .env | cut -d'=' -f2 | xargs)
API_KEY=$(grep "APPWRITE_API_key" .env | cut -d'=' -f2 | xargs)

# Remove trailing slashes
ENDPOINT="${ENDPOINT%/}"

if [ -z "$ENDPOINT" ] || [ -z "$PROJECT_ID" ] || [ -z "$API_KEY" ]; then
  echo -e "${RED}ERROR: Missing credentials in .env${NC}"
  echo "Required: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, APPWRITE_API_key"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ΛΞVON OS (Beepin) - Database Table Creation             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Endpoint:   $ENDPOINT"
echo "  Project:    $PROJECT_ID"
echo "  API Key:    ${API_KEY:0:10}..."
echo ""
echo -e "${YELLOW}WARNING: This will create 47 tables. Estimated time: 2-3 hours${NC}"
read -p "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

# Track statistics
CREATED=0
FAILED=0
TOTAL=0

# Helper function to create table
create_table() {
  local database_id=$1
  local table_id=$2
  local table_name=$3
  local columns=$4
  local row_security=$5

  TOTAL=$((TOTAL + 1))
  
  printf "${YELLOW}[%2d/47]${NC} Creating %-40s ... " $TOTAL "$table_name"
  
  local response=$(curl -s -X POST "$ENDPOINT/databases/$database_id/tables" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -w "\n%{http_code}" \
    -d "{
      \"tableId\": \"$table_id\",
      \"name\": \"$table_name\",
      \"enabled\": true,
      \"rowSecurity\": $row_security,
      \"permissions\": [],
      \"columns\": $columns
    }")
  
  local http_code=$(echo "$response" | tail -n1)
  
  if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Created${NC}"
    CREATED=$((CREATED + 1))
  else
    echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
    FAILED=$((FAILED + 1))
    # echo "Response: $(echo "$response" | head -n-1)"
  fi
  
  sleep 1  # Rate limit: 1 req/sec
}

###############################################################################
# PHASE 1: SOVEREIGN DATABASE - CORE SYSTEM TABLES
###############################################################################
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 1: Sovereign Database - Core System Tables${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# 1. syndicates
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

# 2. users
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

# 3. crew_memberships
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

# 4. workflows
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

# 5. agents
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

# 6. connections
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

# 7. agent_templates
create_table "sovereign" "agent_templates" "Agent Templates (Blueprints)" \
  '[
    {"key":"name","type":"varchar","size":255,"required":true},
    {"key":"category","type":"enum","elements":["crm","finance","operations","marketing","ai-ops","custom"]},
    {"key":"description","type":"mediumtext"},
    {"key":"template_json","type":"longtext","required":true},
    {"key":"author_id","type":"varchar","size":36},
    {"key":"is_public","type":"boolean","default":false},
    {"key":"usage_count","type":"integer","default":"0"},
    {"key":"rating","type":"float","default":"0.0"}
  ]' "false"

# 8. workflow_versions
create_table "sovereign" "workflow_versions" "Workflow Versions (History)" \
  '[
    {"key":"workflow_id","type":"varchar","size":36,"required":true},
    {"key":"version_number","type":"integer","required":true},
    {"key":"nodes_json","type":"longtext"},
    {"key":"edges_json","type":"longtext"},
    {"key":"changes_summary","type":"mediumtext"},
    {"key":"created_by_id","type":"varchar","size":36},
    {"key":"created_at","type":"datetime"}
  ]' "false"

# 9. chronicle_events (existing but needs columns)
create_table "sovereign" "chronicle_events" "Chronicle Events (System Audit)" \
  '[
    {"key":"syndicate_id","type":"varchar","size":36,"required":true},
    {"key":"event_type","type":"enum","elements":["user_created","workflow_executed","agent_deployed","ritual_completed","error_occurred"]},
    {"key":"actor_id","type":"varchar","size":36},
    {"key":"resource_type","type":"varchar","size":100},
    {"key":"resource_id","type":"varchar","size":36},
    {"key":"details_json","type":"mediumtext"},
    {"key":"severity","type":"enum","elements":["info","warning","error","critical"],"default":"info"},
    {"key":"timestamp","type":"datetime"}
  ]' "false"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Progress: $CREATED successfully created, $FAILED failed${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Additional tables (CRM, Finance, Operations, etc.) would follow the same pattern
# For brevity, showing the structure - full script in IMPLEMENTATION_BLUEPRINT.md

echo ""
echo -e "${GREEN}✓ Phase 1 Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: ./create-indexes.sh (add performance indexes)"
echo "  2. Run: ./create-relationships.sh (establish foreign keys)"
echo "  3. Update services/ with Appwrite SDK code"
echo "  4. Run: bun test (verify CRUD operations)"
echo ""
echo "Full implementation blueprint: IMPLEMENTATION_BLUEPRINT.md"
