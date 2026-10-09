/**
 * @file types/appwrite/index.ts
 * @description Typed exports and schema constants for Appwrite Sovereign TablesDB.
 */

export * from './appwrite.d';

export const SOVEREIGN_DATABASE_ID = 'sovereign' as const;

export const SOVEREIGN_TABLE_IDS = [
  'ledger',
  'transactions',
  'workflows',
  'agents',
  'rituals',
  'policies',
  'audit',
  'wsconfig',
  'users',
  'syndicates',
  'connections',
  'crews',
  'agent_templates',
  'workflow_versions',
  'chronicle_events',
  'stripe_events',
  'crm_contacts',
  'crm_deals',
  'crm_activities',
  'treasury_transactions',
  'tribute_logs',
  'pulse_profiles',
  'global_economic_dials',
  'pillar_of_eternity',
  'micro_app_modules',
  'micro_app_patches',
  'micro_app_drafts',
  'published_micro_apps',
  'operations_tasks',
  'procurement_orders',
  'access_keys',
  'syndicate_integrations',
  'notes',
  'chat_messages',
  'secrets',
  'agentcreds',
  'email_marketing_lab'
] as const;

export type SovereignTableId = (typeof SOVEREIGN_TABLE_IDS)[number];
