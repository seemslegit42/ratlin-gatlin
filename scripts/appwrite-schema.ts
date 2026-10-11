/**
 * @file scripts/appwrite-schema.ts
 * @description Authoritative Sovereign TablesDB schema definition for Appwrite.
 * Pure TypeScript object schema without runtime SDK dependencies.
 */

export type ColumnType =
  | 'string' // Deprecated in Appwrite Tables, mapped to varchar/text
  | 'varchar'
  | 'text'
  | 'mediumtext'
  | 'longtext'
  | 'integer'
  | 'bigint'
  | 'float'
  | 'boolean'
  | 'datetime'
  | 'enum'
  | 'ip'
  | 'email'
  | 'url'
  | 'point'
  | 'line'
  | 'polygon'
  | 'relationship';

export type ColumnSpec = {
  key: string;
  type: ColumnType;
  array?: boolean;
  encrypt?: boolean;
  /**
   * Only applies to varchar/text columns; max character count.
   */
  size?: number;
  required?: boolean;
  default?: any;
  elements?: string[];
  relatedTableId?: string;
  relationType?: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  twoWay?: boolean;
  twoWayKey?: string;
  onDelete?: 'cascade' | 'restrict' | 'setNull';
  description?: string;
};

export type TableSpec = {
  name: string;
  columns: ColumnSpec[];
  rowSecurity?: boolean;
  permissions?: string[];
};

export const AppwriteRole = {
  any: () => 'any',
  users: () => 'users',
  user: (id: string) => `user:${id}`,
  team: (id: string, role?: string) => role ? `team:${id}/${role}` : `team:${id}`,
  member: (id: string) => `member:${id}`,
  label: (key: string) => `label:${key}`,
};

export const AppwritePermission = {
  read: (role: string) => `read("${role}")`,
  create: (role: string) => `create("${role}")`,
  update: (role: string) => `update("${role}")`,
  delete: (role: string) => `delete("${role}")`,
};

export const DATABASE_ID = 'sovereign';

export const TABLES_SCHEMA: Record<string, TableSpec> = {
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
    rowSecurity: true,
    permissions: [AppwritePermission.read(AppwriteRole.users())],
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
    rowSecurity: true,
    columns: [
      { key: 'syndicate_id', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255 },
      { key: 'role', type: 'string', size: 255 },
      { key: 'company', type: 'string', size: 255 },
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
    rowSecurity: true,
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
