#!/usr/bin/env bun
/**
 * @file scripts/setup-appwrite-backend.ts
 * @description Appwrite provisioning for Beepin using **TablesDB** (NOT legacy Collections).
 *
 * Creates missing TablesDB tables + columns (idempotent, non-destructive).
 *
 * Usage:
 *   bun scripts/setup-appwrite-backend.ts
 *
 * Env vars (any of these names are accepted):
 *   - APPWRITE_ENDPOINT or VITE_APPWRITE_ENDPOINT
 *   - APPWRITE_PROJECT_ID or VITE_APPWRITE_PROJECT_ID
 *   - APPWRITE_API_KEY or APPWRITE_API_key
 */

import { Client, Query, TablesDB } from 'node-appwrite';
import path from 'node:path';

type ColumnType = 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'url';
type ColumnSpec = {
  key: string;
  type: ColumnType;
  array?: boolean;
  encrypt?: boolean;
  /**
   * Only applies to string columns; this is the max character count.
   * If the API rejects the size, we auto-fallback to smaller sizes.
   */
  size?: number;
};

type TableSpec = {
  name: string;
  columns: ColumnSpec[];
};

const DATABASE_ID = 'sovereign';

const TABLES_SCHEMA: Record<string, TableSpec> = {
  // --- Sovereign Ledger ---
  ledger: {
    name: 'Ledger',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'balance', type: 'float' },
      { key: 'committed', type: 'float' },
      { key: 'reserved', type: 'float' },
      { key: 'updated_at', type: 'datetime' },
    ],
  },
  transactions: {
    name: 'Transactions',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'amount', type: 'float' },
      { key: 'type', type: 'string', size: 64 },
      { key: 'reason', type: 'string', size: 8192 },
      { key: 'created_at', type: 'datetime' },
      { key: 'updated_at', type: 'datetime' },
    ],
  },
  workflows: {
    name: 'Workflows',
    columns: [{ key: 'syndicate_id', type: 'string', size: 255 }],
  },
  agents: {
    name: 'Agents',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 8192 },
      { key: 'type', type: 'string', size: 128 },
      { key: 'status', type: 'string', size: 128 },
      { key: 'position', type: 'string', size: 2048 },
      { key: 'data', type: 'string', size: 32768 },
      { key: 'output_data', type: 'string', size: 32768 },
      { key: 'metrics', type: 'string', size: 2048 },
      { key: 'needs', type: 'string', size: 2048 },
      { key: 'persona', type: 'string', size: 255 },
      { key: 'model', type: 'string', size: 255 },
      { key: 'crew_id', type: 'string', size: 255 },
    ],
  },
  rituals: {
    name: 'Rituals',
    columns: [{ key: 'syndicate_id', type: 'string', size: 255 }],
  },
  policies: {
    name: 'Policies',
    columns: [{ key: 'syndicate_id', type: 'string', size: 255 }],
  },
  audit: {
    name: 'Audit',
    columns: [{ key: 'syndicate_id', type: 'string', size: 255 }],
  },
  wsconfig: {
    name: 'WS Config',
    columns: [{ key: 'syndicate_id', type: 'string', size: 255 }],
  },

  // --- Core system tables ---
  users: {
    name: 'Users',
    columns: [
      { key: 'user_id', type: 'string', size: 255 },
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'covenant', type: 'string', size: 64 },
      { key: 'xi_balance', type: 'float' },
      { key: 'phi_balance', type: 'float' },
      { key: 'resonance_score', type: 'integer' },
      { key: 'mythos_titles', type: 'string', array: true, size: 255 },
      { key: 'tithe_rate', type: 'float' },
      { key: 'pact', type: 'string', size: 64 },
      { key: 'cogni_ops_remaining', type: 'integer' },
      { key: 'cogni_ops_limit', type: 'integer' },
      { key: 'has_onboarded', type: 'boolean' },
      { key: 'age_of_ascension', type: 'boolean' },
      { key: 'color', type: 'string', size: 32 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'mythic_status', type: 'string', size: 8192 },
    ],
  },
  syndicates: {
    name: 'Syndicates',
    columns: [
      { key: 'name', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 4096 },
      { key: 'owner_id', type: 'string', size: 255 },
      { key: 'settings', type: 'string', size: 8192 },
    ],
  },
  connections: {
    name: 'Connections',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'from_agent_id', type: 'string', size: 255 },
      { key: 'from_port_id', type: 'string', size: 255 },
      { key: 'to_agent_id', type: 'string', size: 255 },
      { key: 'to_port_id', type: 'string', size: 255 },
    ],
  },
  crews: {
    name: 'Crews',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 4096 },
      { key: 'agent_ids', type: 'string', array: true, size: 255 },
      { key: 'color', type: 'string', size: 32 },
    ],
  },
  agent_templates: {
    name: 'Agent Templates',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 8192 },
      { key: 'type', type: 'string', size: 128 },
      { key: 'persona', type: 'string', size: 255 },
      { key: 'model', type: 'string', size: 255 },
      { key: 'data', type: 'string', size: 32768 },
      { key: 'blueprint', type: 'string', size: 32768 },
    ],
  },
  workflow_versions: {
    name: 'Workflow Versions',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'timestamp', type: 'integer' },
      { key: 'name', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 8192 },
      { key: 'snapshot', type: 'string', size: 32768 },
    ],
  },
  chronicle_events: {
    name: 'Chronicle Events',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'event_type', type: 'string', size: 128 },
      { key: 'data', type: 'string', size: 32768 },
      { key: 'type', type: 'string', size: 64 },
      { key: 'source', type: 'string', size: 128 },
      { key: 'message', type: 'string', size: 8192 },
      { key: 'timestamp', type: 'integer' },
    ],
  },
  stripe_events: {
    name: 'Stripe Events',
    columns: [
      { key: 'stripe_event_id', type: 'string', size: 255 },
      { key: 'stripe_event_type', type: 'string', size: 128 },
      { key: 'stripe_created_at', type: 'datetime' },
      { key: 'payload', type: 'string', size: 32768 },
      { key: 'created_at', type: 'datetime' },
      { key: 'updated_at', type: 'datetime' },
    ],
  },

  // --- CRM Module ---
  crm_contacts: {
    name: 'CRM Contacts',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'role', type: 'string', size: 255 },
      { key: 'company', type: 'string', size: 255 },
      // NOTE: stored as string because the app currently writes "" for missing emails.
      { key: 'email', type: 'string', size: 255 },
      { key: 'last_contact', type: 'string', size: 64 },
    ],
  },
  crm_deals: {
    name: 'CRM Deals',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'company', type: 'string', size: 255 },
      { key: 'deal_name', type: 'string', size: 255 },
      { key: 'priority', type: 'string', size: 64 },
      { key: 'value', type: 'float' },
      { key: 'stage', type: 'string', size: 64 },
      { key: 'last_contact', type: 'string', size: 64 },
      { key: 'resonance', type: 'integer' },
      { key: 'strategy_json', type: 'string', size: 32768 },
    ],
  },
  crm_activities: {
    name: 'CRM Activities',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'user_name', type: 'string', size: 255 },
      { key: 'action', type: 'string', size: 64 },
      { key: 'target', type: 'string', size: 255 },
      { key: 'topic', type: 'string', size: 255 },
      { key: 'timestamp', type: 'integer' },
    ],
  },

  // --- Financial/Treasury ---
  treasury_transactions: {
    name: 'Treasury Transactions',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'amount', type: 'float' },
      { key: 'category', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 8192 },
      { key: 'created_at', type: 'datetime' },
    ],
  },
  tribute_logs: {
    name: 'Tribute Logs',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'amount', type: 'float' },
      { key: 'reason', type: 'string', size: 8192 },
      { key: 'created_at', type: 'datetime' },
    ],
  },
  pulse_profiles: {
    name: 'Pulse Profiles',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'health', type: 'float' },
      { key: 'vitality', type: 'float' },
      { key: 'momentum', type: 'float' },
      { key: 'timestamp', type: 'integer' },
    ],
  },
  global_economic_dials: {
    name: 'Global Economic Dials',
    columns: [
      { key: 'dial_name', type: 'string', size: 255 },
      { key: 'value', type: 'float' },
      { key: 'min_value', type: 'float' },
      { key: 'max_value', type: 'float' },
      { key: 'updated_at', type: 'datetime' },
    ],
  },
  pillar_of_eternity: {
    name: 'Pillar Of Eternity',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'pillar_name', type: 'string', size: 255 },
      { key: 'value', type: 'float' },
      { key: 'updated_at', type: 'datetime' },
    ],
  },

  // --- Micro Apps ---
  micro_app_modules: {
    name: 'Micro App Modules',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'position', type: 'string', size: 2048 },
      { key: 'jacks', type: 'string', size: 32768 },
      { key: 'data', type: 'string', size: 32768 },
    ],
  },
  micro_app_patches: {
    name: 'Micro App Patches',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'start_jack', type: 'string', size: 2048 },
      { key: 'end_jack', type: 'string', size: 2048 },
    ],
  },
  micro_app_drafts: {
    name: 'Micro App Drafts',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'code', type: 'string', size: 32768 },
    ],
  },
  published_micro_apps: {
    name: 'Published Micro Apps',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'description', type: 'string', size: 8192 },
      { key: 'inputs', type: 'string', size: 32768 },
      { key: 'outputs', type: 'string', size: 32768 },
      { key: 'modules', type: 'string', size: 32768 },
      { key: 'patches', type: 'string', size: 32768 },
      { key: 'timestamp', type: 'integer' },
    ],
  },

  // --- Operations & Procurement ---
  operations_tasks: {
    name: 'Operations Tasks',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'title', type: 'string', size: 255 },
      { key: 'status', type: 'string', size: 64 },
      { key: 'assignee', type: 'string', size: 255 },
      { key: 'assignee_type', type: 'string', size: 64 },
      { key: 'due_date', type: 'string', size: 64 },
      { key: 'priority', type: 'string', size: 64 },
      { key: 'location', type: 'string', size: 255 },
      { key: 'complexity', type: 'integer' },
      { key: 'estimated_hours', type: 'float' },
    ],
  },
  procurement_orders: {
    name: 'Procurement Orders',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'po_number', type: 'string', size: 255 },
      { key: 'vendor', type: 'string', size: 255 },
      { key: 'amount', type: 'float' },
      { key: 'status', type: 'string', size: 64 },
      { key: 'created_date', type: 'integer' },
    ],
  },

  // --- Admin/Integration ---
  access_keys: {
    name: 'Access Keys',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'prefix', type: 'string', size: 64 },
      { key: 'scope', type: 'string', size: 64 },
      { key: 'created_at', type: 'datetime' },
      { key: 'last_used_at', type: 'datetime' },
    ],
  },
  syndicate_integrations: {
    name: 'Syndicate Integrations',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'service_name', type: 'string', size: 255 },
      { key: 'config', type: 'string', size: 32768 },
      { key: 'enabled', type: 'boolean' },
      { key: 'created_at', type: 'datetime' },
    ],
  },
  notes: {
    name: 'Notes',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'title', type: 'string', size: 255 },
      { key: 'content', type: 'string', size: 32768 },
      { key: 'category', type: 'string', size: 64 },
      { key: 'tags', type: 'string', size: 8192 },
      { key: 'status', type: 'string', size: 64 },
      { key: 'updated_at', type: 'datetime' },
    ],
  },
  chat_messages: {
    name: 'Chat Messages',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'user_id', type: 'string', size: 255 },
      { key: 'message', type: 'string', size: 32768 },
      { key: 'source', type: 'string', size: 64 },
      { key: 'created_at', type: 'datetime' },
    ],
  },

  // --- Vault ---
  secrets: {
    name: 'Secrets',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'key', type: 'string', size: 255 },
      { key: 'value', type: 'string', size: 32768, encrypt: true },
      { key: 'created_at', type: 'datetime' },
    ],
  },
  agentcreds: {
    name: 'Agent Credentials',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'agent_id', type: 'string', size: 255 },
      { key: 'credentials', type: 'string', size: 32768, encrypt: true },
      { key: 'created_at', type: 'datetime' },
    ],
  },

  // --- Growth Engine: Email Lab (one row per syndicate_id) ---
  email_marketing_lab: {
    name: 'Email Marketing Lab',
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'template_json', type: 'string', size: 32768 },
      { key: 'segments_json', type: 'string', size: 32768 },
      { key: 'schedules_json', type: 'string', size: 32768 },
      { key: 'updated_at', type: 'datetime' },
    ],
  },
};

type EnvMap = Record<string, string>;

function safeTrimQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

async function readDotEnv(): Promise<EnvMap> {
  const envPath = path.join(process.cwd(), '.env');
  try {
    const file = Bun.file(envPath);
    if (!(await file.exists())) return {};
    const text = await file.text();
    const out: EnvMap = {};
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const value = safeTrimQuotes(line.slice(eq + 1));
      out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function pickEnv(dotenv: EnvMap, ...keys: string[]): string {
  for (const key of keys) {
    const v = process.env[key];
    if (v && v.trim()) return v;
    const dv = dotenv[key];
    if (dv && dv.trim()) return dv;
  }
  return '';
}

function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
}

function sizesDescending(desired: number): number[] {
  const candidates = [desired, 32768, 16384, 8192, 4096, 2048, 1024, 512, 255, 128, 64];
  const unique = Array.from(new Set(candidates)).filter(n => n > 0);
  return unique.sort((a, b) => b - a);
}

function isAppwriteConflict(err: any): boolean {
  return err?.code === 409;
}

async function ensureDatabase(tablesDB: any) {
  try {
    await tablesDB.get({ databaseId: DATABASE_ID });
    console.log(`✅ TablesDB database "${DATABASE_ID}" exists`);
  } catch (err: any) {
    if (err?.code === 404) {
      await tablesDB.create({ databaseId: DATABASE_ID, name: 'Sovereign', enabled: true });
      console.log(`✅ TablesDB database "${DATABASE_ID}" created`);
      return;
    }
    throw err;
  }
}

async function listExistingTables(tablesDB: any): Promise<Set<string>> {
  const out = new Set<string>();
  const limit = 100;
  let offset = 0;
  while (true) {
    const res = await tablesDB.listTables({
      databaseId: DATABASE_ID,
      queries: [Query.limit(limit), Query.offset(offset)],
      total: false,
    });
    const tables = res?.tables || [];
    for (const t of tables) out.add(t.$id);
    if (collections.length < limit) break;
    offset += limit;
  }
  return out;
}

async function listExistingColumns(tablesDB: any, tableId: string): Promise<Set<string>> {
  const out = new Set<string>();
  const limit = 100;
  let offset = 0;
  while (true) {
    const res = await tablesDB.listColumns({
      databaseId: DATABASE_ID,
      tableId,
      queries: [Query.limit(limit), Query.offset(offset)],
      total: false,
    });
    const columns = res?.columns || [];
    for (const c of columns) out.add(c.key);
    if (columns.length < limit) break;
    offset += limit;
  }
  return out;
}

async function createStringColumnWithFallback(
  tablesDB: any,
  tableId: string,
  col: ColumnSpec
): Promise<void> {
  const desired = col.size ?? 255;
  const tries = sizesDescending(desired);
  let lastErr: any = null;

  for (const size of tries) {
    try {
      await tablesDB.createStringColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: col.key,
        size,
        required: false,
        array: !!col.array,
        encrypt: !!col.encrypt,
      });
      return;
    } catch (err: any) {
      if (isAppwriteConflict(err)) return;
      lastErr = err;
    }
  }

  throw lastErr;
}

async function ensureColumn(tablesDB: any, tableId: string, col: ColumnSpec) {
  switch (col.type) {
    case 'string':
      await createStringColumnWithFallback(tablesDB, tableId, col);
      return;
    case 'integer':
      await tablesDB.createIntegerColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: col.key,
        required: false,
        min: null,
        max: null,
        default: null,
        array: !!col.array,
      });
      return;
    case 'float':
      await tablesDB.createFloatColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: col.key,
        required: false,
        min: null,
        max: null,
        default: null,
        array: !!col.array,
      });
      return;
    case 'boolean':
      await tablesDB.createBooleanColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: col.key,
        required: false,
        default: false,
        array: !!col.array,
      });
      return;
    case 'datetime':
      await tablesDB.createDatetimeColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: col.key,
        required: false,
        default: '',
        array: !!col.array,
      });
      return;
    case 'url':
      await tablesDB.createUrlColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: col.key,
        required: false,
        default: 'https://example.com',
        array: !!col.array,
      });
      return;
    default:
      throw new Error(`Unsupported column type: ${(col as any).type}`);
  }
}

async function setupBackend() {
  console.log('🚀 Beepin Appwrite TablesDB Setup\n');

  const dotenv = await readDotEnv();
  const endpointRaw = pickEnv(dotenv, 'APPWRITE_ENDPOINT', 'VITE_APPWRITE_ENDPOINT');
  const projectId = pickEnv(dotenv, 'APPWRITE_PROJECT_ID', 'VITE_APPWRITE_PROJECT_ID');
  const apiKey = pickEnv(dotenv, 'APPWRITE_API_KEY', 'APPWRITE_API_key');

  const endpoint = normalizeEndpoint(endpointRaw || '');

  if (!endpointRaw || !projectId || !apiKey) {
    console.error('❌ Missing Appwrite credentials. Provide:');
    console.error('   - APPWRITE_ENDPOINT (or VITE_APPWRITE_ENDPOINT)');
    console.error('   - APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID)');
    console.error('   - APPWRITE_API_KEY (or APPWRITE_API_key)');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const tablesDB = new TablesDB(client);

  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`🏢 Project: ${projectId}`);
  console.log(`🗄️  Database: ${DATABASE_ID}\n`);

  await ensureDatabase(tablesDB);

  console.log('\n📋 Ensuring collections...');
  let createdTables = 0;
  let existingTables = await listExistingTables(tablesDB);

  for (const [tableId, schema] of Object.entries(TABLES_SCHEMA)) {
    if (existingTables.has(tableId)) {
      console.log(`   ✓ ${tableId} (exists)`);
      continue;
    }

    try {
      await tablesDB.createTable({
        databaseId: DATABASE_ID,
        tableId,
        name: schema.name,
        permissions: [],
        rowSecurity: false,
        enabled: true,
      });
      createdTables++;
      console.log(`   + ${tableId} (created)`);
      existingTables.add(tableId);
    } catch (err: any) {
      if (isAppwriteConflict(err)) {
        console.log(`   ✓ ${tableId} (exists)`);
        existingTables.add(tableId);
      } else {
        console.log(`   ✗ ${tableId} (failed: ${err?.message || String(err)})`);
      }
    }
  }

  console.log(`\n✅ Tables ensured (created: ${createdTables})`);

  console.log('\n🧱 Ensuring columns...');
  let createdColumns = 0;
  let skippedColumns = 0;

  for (const [tableId, schema] of Object.entries(TABLES_SCHEMA)) {
    if (!existingTables.has(tableId)) {
      console.log(`   ! ${tableId} (skipped; table missing)`);
      continue;
    }

    const existingCols = await listExistingColumns(tablesDB, tableId);
    for (const col of schema.columns) {
      if (existingCols.has(col.key)) {
        skippedColumns++;
        continue;
      }

      try {
        await ensureColumn(tablesDB, tableId, col);
        createdColumns++;
        console.log(`   + ${tableId}.${col.key} (${col.type})`);
      } catch (err: any) {
        if (isAppwriteConflict(err)) {
          skippedColumns++;
          continue;
        }
        console.log(`   ✗ ${tableId}.${col.key} (failed: ${err?.message || String(err)})`);
      }
    }
  }

  console.log(`\n✅ Columns ensured (created: ${createdColumns}, skipped: ${skippedColumns})`);

  const finalTables = await listExistingTables(tablesDB);
  const missing = Object.keys(TABLES_SCHEMA).filter(t => !finalTables.has(t));
  if (missing.length) {
    console.log(`\n⚠️  Missing tables after run (${missing.length}): ${missing.join(', ')}`);
    process.exit(2);
  }

  console.log('\n🎉 TablesDB provisioning complete.');
}

setupBackend().catch(err => {
  console.error('❌ Setup failed:', err?.message || err);
  process.exit(1);
});
