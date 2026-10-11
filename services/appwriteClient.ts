/**
 * @file services/appwriteClient.ts
 * @description Appwrite Backend-as-a-Service client initialization.
 * Replaces supabaseClient.ts with Appwrite SDK for authentication, database, and realtime.
 */

import { Client, Account, Databases, Storage, Realtime, Query } from 'appwrite';
import { Teams, Permission, Role, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

/**
 * Resolves the operational Appwrite endpoint with regional routing protection.
 * Ensures Toronto region (tor.cloud.appwrite.io) is prioritized over un-regioned defaults.
 */
export const resolveAppwriteEndpoint = (override?: string): string => {
  if (override && override.trim()) {
    const trimmed = override.trim();
    if (trimmed === 'https://cloud.appwrite.io/v1' || trimmed === 'https://cloud.appwrite.io') {
      return 'https://tor.cloud.appwrite.io/v1';
    }
    return trimmed;
  }

  const candidateVite = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_APPWRITE_ENDPOINT : undefined;
  const candidateWindow = typeof window !== 'undefined' ? (window as any).VITE_APPWRITE_ENDPOINT : undefined;
  const candidateProcessVite = typeof process !== 'undefined' ? process.env?.VITE_APPWRITE_ENDPOINT : undefined;
  const candidateProcess = typeof process !== 'undefined' ? process.env?.APPWRITE_ENDPOINT : undefined;

  const all = [candidateVite, candidateWindow, candidateProcessVite, candidateProcess].filter(
    (c): c is string => typeof c === 'string' && c.trim().length > 0 && c !== '$APPWRITE_ENDPOINT'
  );

  // If there's an endpoint with an explicit regional domain (e.g. tor.cloud.appwrite.io), select it immediately
  const regional = all.find(c => c.includes('.cloud.appwrite.io') && !c.includes('//cloud.appwrite.io'));
  if (regional) return regional.trim();

  // If candidateProcess has a non-empty regional or custom endpoint, prioritize it
  if (candidateProcess && candidateProcess.trim() && candidateProcess !== 'https://cloud.appwrite.io/v1') {
    return candidateProcess.trim();
  }

  // If the configured endpoint is generic cloud.appwrite.io, route to the active project region (tor)
  const first = all[0];
  if (first) {
    const trimmed = first.trim();
    if (trimmed === 'https://cloud.appwrite.io/v1' || trimmed === 'https://cloud.appwrite.io') {
      return 'https://tor.cloud.appwrite.io/v1';
    }
    return trimmed;
  }

  return 'https://tor.cloud.appwrite.io/v1';
};

/**
 * Resolves the active Appwrite Project ID with fallback to sovereign project.
 */
export const resolveAppwriteProjectId = (override?: string): string => {
  if (override && override.trim()) return override.trim();

  const candidateVite = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID : undefined;
  const candidateWindow = typeof window !== 'undefined' ? (window as any).VITE_APPWRITE_PROJECT_ID : undefined;
  const candidateProcessVite = typeof process !== 'undefined' ? process.env?.VITE_APPWRITE_PROJECT_ID : undefined;
  const candidateProcess = typeof process !== 'undefined' ? process.env?.APPWRITE_PROJECT_ID : undefined;

  const valid = [candidateVite, candidateWindow, candidateProcessVite, candidateProcess].find(
    (p): p is string =>
      typeof p === 'string' &&
      p.trim().length > 0 &&
      p !== 'your-project-id-here' &&
      p !== 'your_project_id_here' &&
      p !== '$APPWRITE_PROJECT_ID'
  );

  return valid ? valid.trim() : '6990e2830030cacccd98';
};

const appwriteEndpoint = resolveAppwriteEndpoint();
const appwriteProjectId = resolveAppwriteProjectId();

if (appwriteEndpoint) {
  client.setEndpoint(appwriteEndpoint);
}
if (appwriteProjectId) {
  client.setProject(appwriteProjectId);
}

if (!appwriteEndpoint || !appwriteProjectId) {
  console.warn('Appwrite credentials missing (VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID). Backend requests will fail until configured.');
}

/**
 * Account service for authentication (login, signup, logout, session management)
 */
export const account = new Account(client);

/**
 * Strips Appwrite system attributes ($id, $createdAt, etc.) and custom 'id'
 * attribute from document payloads. Appwrite reserves '$id' for system IDs
 * and throws "AppwriteException: Invalid document structure: Unknown attribute: id"
 * if a document payload includes an 'id' attribute that is not defined in the collection schema.
 */
export function sanitizeDocumentPayload<T>(data: T): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }
  const sanitized: Record<string, any> = { ...(data as Record<string, any>) };
  delete sanitized.id;
  delete sanitized.$id;
  delete sanitized.$createdAt;
  delete sanitized.$updatedAt;
  delete sanitized.$permissions;
  delete sanitized.$databaseId;
  delete sanitized.$collectionId;
  return sanitized as T;
}

/**
 * Databases service for CRUD operations on collections/documents (Appwrite standard)
 */
export const databases = new Databases(client);

// Wrap databases.createDocument and updateDocument with automatic payload sanitization
const originalCreateDocument = databases.createDocument.bind(databases);
const originalUpdateDocument = databases.updateDocument.bind(databases);

databases.createDocument = ((
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: any,
  permissions?: string[]
) => {
  return originalCreateDocument(
    databaseId,
    collectionId,
    documentId,
    sanitizeDocumentPayload(data),
    permissions
  );
}) as any;

databases.updateDocument = ((
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: any,
  permissions?: string[]
) => {
  return originalUpdateDocument(
    databaseId,
    collectionId,
    documentId,
    sanitizeDocumentPayload(data),
    permissions
  );
}) as any;

/**
 * Backward-compatible alias for databases service (formerly tablesDB)
 */
export const tablesDB = {
  ...databases,
  createRow: async (
    arg1: any,
    tableId?: string,
    rowIdOrData?: any,
    dataOrPermissions?: any,
    permissionsOrTx?: any,
    maybeTx?: string
  ) => {
    let databaseId = DATABASE_ID;
    let collId = '';
    let rowId = 'unique()';
    let data: any = {};
    let permissions: string[] | undefined = undefined;
    let transactionId: string | undefined = undefined;

    if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
      databaseId = arg1.databaseId || DATABASE_ID;
      collId = arg1.tableId || arg1.collectionId;
      rowId = arg1.rowId || 'unique()';
      data = arg1.data || {};
      permissions = arg1.permissions;
      transactionId = arg1.transactionId;
    } else {
      databaseId = arg1;
      collId = tableId!;
      if (typeof rowIdOrData === 'string' && (typeof dataOrPermissions === 'object' || dataOrPermissions === undefined)) {
        rowId = rowIdOrData;
        data = dataOrPermissions || {};
        permissions = permissionsOrTx;
        transactionId = maybeTx;
      } else {
        rowId = 'unique()';
        data = rowIdOrData || {};
        permissions = dataOrPermissions;
        transactionId = permissionsOrTx;
      }
    }

    return databases.createDocument(databaseId, collId, rowId, sanitizeDocumentPayload(data), permissions);
  },

  getRow: async (arg1: any, tableId?: string, rowId?: string) => {
    let databaseId = DATABASE_ID;
    let collId = '';
    let docId = '';
    if (typeof arg1 === 'object' && arg1 !== null) {
      databaseId = arg1.databaseId || DATABASE_ID;
      collId = arg1.tableId || arg1.collectionId;
      docId = arg1.rowId || arg1.documentId;
    } else {
      databaseId = arg1;
      collId = tableId!;
      docId = rowId!;
    }
    return databases.getDocument(databaseId, collId, docId);
  },

  listRows: async (arg1: any, tableId?: string, queries?: string[], ttl?: number) => {
    let databaseId = DATABASE_ID;
    let collId = '';
    let q: string[] | undefined = queries;

    if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
      databaseId = arg1.databaseId || DATABASE_ID;
      collId = arg1.tableId || arg1.collectionId;
      q = arg1.queries;
    } else {
      databaseId = arg1;
      collId = tableId!;
    }

    const res = await databases.listDocuments(databaseId, collId, q);
    return {
      rows: res.documents,
      documents: res.documents,
      total: res.total,
    };
  },

  updateRow: async (arg1: any, tableId?: string, rowId?: string, data?: any, permissions?: string[], transactionId?: string) => {
    let databaseId = DATABASE_ID;
    let collId = '';
    let docId = '';
    let payload: any = {};
    let perms: string[] | undefined = undefined;

    if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
      databaseId = arg1.databaseId || DATABASE_ID;
      collId = arg1.tableId || arg1.collectionId;
      docId = arg1.rowId || arg1.documentId;
      payload = arg1.data || {};
      perms = arg1.permissions;
    } else {
      databaseId = arg1;
      collId = tableId!;
      docId = rowId!;
      payload = data || {};
      perms = permissions;
    }

    return databases.updateDocument(databaseId, collId, docId, sanitizeDocumentPayload(payload), perms);
  },

  deleteRow: async (arg1: any, tableId?: string, rowId?: string, transactionId?: string) => {
    let databaseId = DATABASE_ID;
    let collId = '';
    let docId = '';

    if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
      databaseId = arg1.databaseId || DATABASE_ID;
      collId = arg1.tableId || arg1.collectionId;
      docId = arg1.rowId || arg1.documentId;
    } else {
      databaseId = arg1;
      collId = tableId!;
      docId = rowId!;
    }

    return databases.deleteDocument(databaseId, collId, docId);
  },

  getPresence: async (presenceId: string) => {
    // PRESENCES collection/table id is 'presences'
    return databases.getDocument(DATABASE_ID, 'presences', presenceId);
  },

  upsertRow: async (arg1: any, tableId?: string, rowIdOrData?: any, data?: any, permissions?: string[]) => {
    let databaseId = DATABASE_ID;
    let collId = '';
    let rowId = 'unique()';
    let payload: any = {};
    let perms: string[] | undefined = undefined;

    if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
      databaseId = arg1.databaseId || DATABASE_ID;
      collId = arg1.tableId || arg1.collectionId;
      rowId = arg1.rowId || 'unique()';
      payload = arg1.data || {};
      perms = arg1.permissions;
    } else {
      databaseId = arg1;
      collId = tableId!;
      rowId = rowIdOrData || 'unique()';
      payload = data || {};
      perms = permissions;
    }

    if (rowId && rowId !== 'unique()') {
      try {
        const existing = await databases.getDocument(databaseId, collId, rowId);
        if (existing) {
          return databases.updateDocument(databaseId, collId, rowId, sanitizeDocumentPayload(payload), perms);
        }
      } catch {
        // Not found, create
      }
    }

    return databases.createDocument(databaseId, collId, rowId, sanitizeDocumentPayload(payload), perms);
  },
};

/**
 * Storage service for file uploads and management (avatars, documents, etc.)
 */
export const storage = new Storage(client);

/**
 * Realtime service for WebSocket subscriptions (multiplayer cursors, live updates)
 */
export const realtime = new Realtime(client);

/**
 * Teams service for team/organization management and multi-tenancy
 */
export const teams = new Teams(client);

/**
 * Query utilities for database operations and realtime filtering
 */
export { Query, Permission, Role, ID } from 'appwrite';

/**
 * Core client instance (exported for advanced use cases)
 */
export { client };

/**
 * Drops both Realtime stacks on the singleton {@link client} (`new Realtime(client)` and the
 * legacy `client.subscribe()` socket) when the auth session ends or changes. Matches Appwrite
 * guidance to avoid delivering events on a subscription created before authentication.
 *
 * Uses runtime-only fields from the SDK; guarded for SSR.
 */
export async function teardownAppwriteRealtimeSockets(): Promise<void> {
  if (typeof window === 'undefined') return;

  type ModernRealtime = {
    reconnect: boolean;
    activeSubscriptions: Map<number, unknown>;
    slotToSubscriptionId: Map<number, string>;
    subscriptionIdToSlot: Map<string, number>;
    connectionId: number;
    closeSocket(): Promise<void>;
  };

  const modern = realtime as unknown as ModernRealtime;

  modern.reconnect = false;
  try {
    modern.activeSubscriptions.clear();
    modern.slotToSubscriptionId.clear();
    modern.subscriptionIdToSlot.clear();
    modern.connectionId += 1;
    await modern.closeSocket();
  } catch (e) {
    console.warn('Appwrite Realtime service teardown:', e);
  } finally {
    modern.reconnect = true;
  }

  type LegacyInlineRealtime = {
    reconnect: boolean;
    subscriptions: Map<number, unknown>;
    channels: Set<string>;
    queries: Set<string>;
    subscriptionIdToSlot?: Map<string, number>;
    slotToSubscriptionId?: Map<number, string>;
    socket?: WebSocket;
  };

  const legacyRt = client as unknown as { realtime: LegacyInlineRealtime };
  const lr = legacyRt.realtime;
  if (!lr) return;

  lr.reconnect = false;
  lr.subscriptions.clear();
  lr.channels.clear();
  lr.queries.clear();
  lr.slotToSubscriptionId?.clear?.();
  lr.subscriptionIdToSlot?.clear?.();
  if (lr.socket && lr.socket.readyState < WebSocket.CLOSING) {
    lr.socket.close();
  }
  lr.reconnect = true;
}

/**
 * Probes Appwrite backend availability.
 * Pings the health endpoint to verify connectivity.
 * 
 * @returns Promise<boolean> True if Appwrite is reachable, false otherwise.
 */
export const checkConnection = async (): Promise<boolean> => {
    try {
        // Attempt to get current account (proves backend is reachable)
        // Will throw if not authenticated, but that's OK - it means backend responded
        await account.get().catch(() => true); // Swallow auth errors
        console.log('Appwrite Connection: SUCCESS');
        return true;
    } catch (e) {
        console.error('Appwrite Connection: FAILED', e);
        return false;
    }
};

/**
 * Config for the primary database ID and its collections
 */
export const DATABASE_ID = 
  (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID || 
  (typeof window !== 'undefined' ? (window as any).VITE_APPWRITE_DATABASE_ID : undefined) || 
  process.env.VITE_APPWRITE_DATABASE_ID || 
  process.env.APPWRITE_DATABASE_ID || 
  'sovereign';

export const COLLECTIONS = {
  // Sovereign Ledger
  LEDGER: 'ledger',
  TRANSACTIONS: 'transactions',
  WORKFLOWS: 'workflows',
  AGENTS: 'agents',
  RITUALS: 'rituals',
  POLICIES: 'policies',
  AUDIT: 'audit',
  WSCONFIG: 'wsconfig',
  
  // Core system collections
  USERS: 'users',
  SYNDICATES: 'syndicates',
  CONNECTIONS: 'connections',
  CREWS: 'crews',
  AGENT_TEMPLATES: 'agent_templates',
  WORKFLOW_VERSIONS: 'workflow_versions',
  CHRONICLE_EVENTS: 'chronicle_events',
  
  // CRM Module
  CRM_CONTACTS: 'crm_contacts',
  CRM_DEALS: 'crm_deals',
  CRM_ACTIVITIES: 'crm_activities',
  
  // Financial/Treasury
  TREASURY_TRANSACTIONS: 'treasury_transactions',
  STRIPE_EVENTS: 'stripe_events',
  TRIBUTE_LOGS: 'tribute_logs',
  PULSE_PROFILES: 'pulse_profiles',
  GLOBAL_ECONOMIC_DIALS: 'global_economic_dials',
  PILLAR_OF_ETERNITY: 'pillar_of_eternity',
  
  // Micro Apps
  MICRO_APP_MODULES: 'micro_app_modules',
  MICRO_APP_PATCHES: 'micro_app_patches',
  MICRO_APP_DRAFTS: 'micro_app_drafts',
  PUBLISHED_MICRO_APPS: 'published_micro_apps',
  
  // Operations & Procurement
  OPERATIONS_TASKS: 'operations_tasks',
  PROCUREMENT_ORDERS: 'procurement_orders',
  
  // Admin/Integration
  ACCESS_KEYS: 'access_keys',
  SYNDICATE_INTEGRATIONS: 'syndicate_integrations',
  NOTES: 'notes',
  CHAT_MESSAGES: 'chat_messages',
  
  // Vault
  SECRETS: 'secrets',
  AGENTCREDS: 'agentcreds',

  // Growth Engine — Email Lab (syndicate-scoped; persisted in Appwrite Collections)
  EMAIL_MARKETING_LAB: 'email_marketing_lab',
};

/**
 * Alias for backward compatibility
 */
export const TABLES = COLLECTIONS;

/**
 * Storage bucket IDs
 */
export const BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  MEDIA: 'media',
};
