/**
 * @file services/crmService.ts
 * @description Syndicate-scoped CRM persistence via Appwrite TablesDB.
 * Centralizes CRUD, query shaping, and influence-graph helpers for lower latency.
 */

import { ID } from 'appwrite';
import {
  tablesDB,
  DATABASE_ID,
  TABLES,
  Query,
} from './appwriteClient.js';
import type {
  CRMDeal,
  CRMContact,
  CRMActivity,
  CRMStrategy,
  InfluenceLink,
  TableCRMDeal,
  TableCRMContact,
  TableCRMActivity,
} from '../types.js';
import { nanoid } from 'nanoid';

export const CRM_PIPELINE_STAGES = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
] as const;

export type CrmPipelineStage = (typeof CRM_PIPELINE_STAGES)[number];
export type CrmRealtimeSlice = 'deals' | 'activities' | 'contacts';

/** Open stages (exclude closed stages from weighted revenue calc). */
export const CRM_OPEN_STAGES: readonly CrmPipelineStage[] = [
  'Prospecting', 'Qualification', 'Proposal', 'Negotiation',
];

/** Closed stages displayed separately (right edge of board). */
export const CRM_CLOSED_STAGES: readonly CrmPipelineStage[] = ['Won', 'Lost'];

export const CRM_QUERY_LIMITS = {
  activities: 20,
  contacts: 50,
  deals: 200,
} as const;

const EMPTY_PIPELINE = (): Record<CrmPipelineStage, CRMDeal[]> => ({
  Prospecting: [],
  Qualification: [],
  Proposal: [],
  Negotiation: [],
  Won: [],
  Lost: [],
});

/** Base syndicate filter reused on every list query. */
export const syndicateFilter = (syndicateId: string) =>
  Query.equal('syndicate_id', syndicateId);

export const mapDBToDeal = (dbDeal: TableCRMDeal): CRMDeal => ({
  id: dbDeal.$id,
  company: dbDeal.company,
  dealName: dbDeal.deal_name,
  priority: dbDeal.priority as CRMDeal['priority'],
  value: dbDeal.value,
  lastContact: dbDeal.last_contact,
  resonance: dbDeal.resonance ?? 50,
  strategy: dbDeal.strategy_json ? (JSON.parse(dbDeal.strategy_json) as CRMStrategy) : undefined,
});

export const mapDealToDB = (
  deal: CRMDeal,
  syndicateId: string,
  stage: string,
): Partial<TableCRMDeal> => ({
  syndicate_id: syndicateId,
  company: deal.company,
  deal_name: deal.dealName,
  priority: deal.priority,
  value: deal.value,
  last_contact: deal.lastContact,
  stage,
  resonance: deal.resonance,
  strategy_json: deal.strategy ? JSON.stringify(deal.strategy) : undefined,
});

export const mapDBToActivity = (dbAct: TableCRMActivity): CRMActivity => ({
  id: dbAct.$id,
  user: dbAct.user_name,
  action: dbAct.action as CRMActivity['action'],
  target: dbAct.target,
  topic: dbAct.topic,
  timestamp: dbAct.timestamp,
  time: new Date(dbAct.timestamp).toLocaleTimeString(),
  color:
    dbAct.action === 'emailed'
      ? 'bg-pink-500'
      : dbAct.action === 'called'
        ? 'bg-blue-500'
        : 'bg-roman-aqua',
});

export const mapDBToContact = (dbCont: TableCRMContact): CRMContact => ({
  id: dbCont.$id,
  name: dbCont.name,
  role: dbCont.role,
  company: dbCont.company,
  email: dbCont.email,
  lastContact: dbCont.last_contact,
  syndicateId: dbCont.syndicate_id,
});

export const groupDealsByStage = (
  rows: TableCRMDeal[],
): Record<CrmPipelineStage, CRMDeal[]> => {
  const pipeline = EMPTY_PIPELINE();
  for (const row of rows) {
    const stage = (row.stage || 'Prospecting') as CrmPipelineStage;
    const bucket = CRM_PIPELINE_STAGES.includes(stage) ? stage : 'Prospecting';
    pipeline[bucket].push(mapDBToDeal(row));
  }
  return pipeline;
};

/** O(n) influence links: contacts at the same company. */
export const buildInfluenceLinks = (contacts: CRMContact[]): InfluenceLink[] => {
  const byCompany = new Map<string, CRMContact[]>();
  for (const contact of contacts) {
    const key = contact.company.trim().toLowerCase();
    if (!key) continue;
    const group = byCompany.get(key) ?? [];
    group.push(contact);
    byCompany.set(key, group);
  }

  const links: InfluenceLink[] = [];
  for (const group of byCompany.values()) {
    if (group.length < 2) continue;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        links.push({
          id: nanoid(),
          sourceId: group[i].id,
          targetId: group[j].id,
          strength: 0.8,
        });
      }
    }
  }
  return links;
};

export interface CrmSnapshot {
  pipeline: Record<CrmPipelineStage, CRMDeal[]>;
  activities: CRMActivity[];
  contacts: CRMContact[];
  influenceLinks: InfluenceLink[];
}

async function listSyndicateRows<T>(
  tableId: string,
  syndicateId: string,
  queries: string[],
): Promise<T[]> {
  const response = await tablesDB.listRows(DATABASE_ID, tableId, [
    syndicateFilter(syndicateId),
    ...queries,
  ]);
  return response.documents as unknown as T[];
}

export async function fetchCrmDeals(syndicateId: string): Promise<Record<CrmPipelineStage, CRMDeal[]>> {
  const rows = await listSyndicateRows<TableCRMDeal>(TABLES.CRM_DEALS, syndicateId, [
    Query.select([
      '$id',
      'syndicate_id',
      'company',
      'deal_name',
      'priority',
      'value',
      'stage',
      'last_contact',
      'resonance',
      'strategy_json',
    ]),
    Query.limit(CRM_QUERY_LIMITS.deals),
  ]);
  return groupDealsByStage(rows);
}

export async function fetchCrmActivities(syndicateId: string): Promise<CRMActivity[]> {
  const rows = await listSyndicateRows<TableCRMActivity>(TABLES.CRM_ACTIVITIES, syndicateId, [
    Query.select(['$id', 'user_name', 'action', 'target', 'topic', 'timestamp']),
    Query.orderDesc('timestamp'),
    Query.limit(CRM_QUERY_LIMITS.activities),
  ]);
  return rows.map(mapDBToActivity);
}

export async function fetchCrmContacts(syndicateId: string): Promise<CRMContact[]> {
  const rows = await listSyndicateRows<TableCRMContact>(TABLES.CRM_CONTACTS, syndicateId, [
    Query.select(['$id', 'syndicate_id', 'name', 'role', 'company', 'email', 'last_contact']),
    Query.limit(CRM_QUERY_LIMITS.contacts),
  ]);
  return rows.map(mapDBToContact);
}

/** Parallel load of deals, activities, and contacts (3 round-trips, not 3 sequential). */
export async function fetchCrmSnapshot(syndicateId: string): Promise<CrmSnapshot> {
  const [pipeline, activities, contacts] = await Promise.all([
    fetchCrmDeals(syndicateId),
    fetchCrmActivities(syndicateId),
    fetchCrmContacts(syndicateId),
  ]);
  return {
    pipeline,
    activities,
    contacts,
    influenceLinks: buildInfluenceLinks(contacts),
  };
}

export async function fetchCrmSlice(
  syndicateId: string,
  slice: CrmRealtimeSlice,
): Promise<Partial<CrmSnapshot>> {
  switch (slice) {
    case 'deals': {
      const pipeline = await fetchCrmDeals(syndicateId);
      return { pipeline };
    }
    case 'activities': {
      const activities = await fetchCrmActivities(syndicateId);
      return { activities };
    }
    case 'contacts': {
      const contacts = await fetchCrmContacts(syndicateId);
      return {
        contacts,
        influenceLinks: buildInfluenceLinks(contacts),
      };
    }
    default:
      return {};
  }
}

export async function createCrmActivity(
  syndicateId: string,
  currentUserName: string,
  action: CRMActivity['action'],
  target: string,
  topic: string,
  rowId: string = ID.unique(),
): Promise<TableCRMActivity> {
  const payload = {
    syndicate_id: syndicateId,
    user_name: currentUserName,
    action,
    target,
    topic,
    timestamp: Date.now(),
  };
  const row = await tablesDB.createRow(
    DATABASE_ID,
    TABLES.CRM_ACTIVITIES,
    rowId,
    payload,
  );
  return { $id: rowId, ...payload } as TableCRMActivity;
}

export async function createCrmContact(
  syndicateId: string,
  contact: Omit<CRMContact, 'id'>,
  rowId: string = ID.unique(),
): Promise<TableCRMContact> {
  const payload = {
    syndicate_id: syndicateId,
    name: contact.name,
    role: contact.role,
    company: contact.company,
    email: contact.email ?? '',
    last_contact: contact.lastContact ?? new Date().toISOString().split('T')[0],
  };
  await tablesDB.createRow(DATABASE_ID, TABLES.CRM_CONTACTS, rowId, payload);
  return { $id: rowId, ...payload };
}

export async function updateCrmContact(
  contactId: string,
  patch: Partial<Omit<TableCRMContact, '$id'>>,
): Promise<void> {
  await tablesDB.updateRow(DATABASE_ID, TABLES.CRM_CONTACTS, contactId, patch);
}

export async function deleteCrmContact(contactId: string): Promise<void> {
  await tablesDB.deleteRow(DATABASE_ID, TABLES.CRM_CONTACTS, contactId);
}

export async function createCrmDeal(
  syndicateId: string,
  deal: Omit<CRMDeal, 'id'>,
  stage: CrmPipelineStage = 'Prospecting',
  rowId: string = ID.unique(),
): Promise<TableCRMDeal> {
  const payload = {
    syndicate_id: syndicateId,
    company: deal.company,
    deal_name: deal.dealName,
    priority: deal.priority,
    value: deal.value,
    stage,
    last_contact: deal.lastContact ?? new Date().toISOString().split('T')[0],
    resonance: deal.resonance ?? 50,
  };
  await tablesDB.createRow(DATABASE_ID, TABLES.CRM_DEALS, rowId, payload);
  return { $id: rowId, ...payload } as TableCRMDeal;
}

export async function updateCrmDeal(
  dealId: string,
  patch: Partial<TableCRMDeal>,
): Promise<void> {
  await tablesDB.updateRow(DATABASE_ID, TABLES.CRM_DEALS, dealId, patch);
}

export async function updateCrmDealFull(
  deal: CRMDeal,
  syndicateId: string,
  stage: string,
): Promise<void> {
  await updateCrmDeal(deal.id.toString(), mapDealToDB(deal, syndicateId, stage));
}

export async function moveCrmDealStage(
  dealId: string,
  targetStage: CrmPipelineStage,
): Promise<void> {
  await updateCrmDeal(dealId, { stage: targetStage });
}

export async function persistDealStrategy(
  dealId: string,
  strategy: CRMStrategy,
): Promise<void> {
  await updateCrmDeal(dealId, {
    strategy_json: JSON.stringify(strategy),
    resonance: strategy.resonance,
  });
}

export async function deleteCrmDeal(dealId: string): Promise<void> {
  await tablesDB.deleteRow(DATABASE_ID, TABLES.CRM_DEALS, dealId);
}

/** Narrow realtime channels (CRM tables only, not the full database). */
export const getCrmRealtimeChannels = (): string[] =>
  [TABLES.CRM_DEALS, TABLES.CRM_ACTIVITIES, TABLES.CRM_CONTACTS].map(
    (table) => `databases.${DATABASE_ID}.collections.${table}.documents`,
  );

export const parseCrmRealtimeSlice = (events: string[]): CrmRealtimeSlice | null => {
  if (events.some((e) => e.includes(TABLES.CRM_DEALS))) return 'deals';
  if (events.some((e) => e.includes(TABLES.CRM_ACTIVITIES))) return 'activities';
  if (events.some((e) => e.includes(TABLES.CRM_CONTACTS))) return 'contacts';
  return null;
};
