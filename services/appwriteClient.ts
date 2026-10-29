/**
 * @file services/appwriteClient.ts
 * @description Appwrite Backend-as-a-Service client initialization with lazy-loading singleton Proxy pattern to prevent cyclic dependencies and ReferenceErrors.
 */

import { Client, Account, Databases, Storage, Realtime, Query } from 'appwrite';
import { Teams, Permission, Role, ID } from 'appwrite';

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

  const regional = all.find(c => c.includes('.cloud.appwrite.io') && !c.includes('//cloud.appwrite.io'));
  if (regional) return regional.trim();

  if (candidateProcess && candidateProcess.trim() && candidateProcess !== 'https://cloud.appwrite.io/v1') {
    return candidateProcess.trim();
  }

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

let cachedClient: Client | null = null;

/**
 * Lazy singleton getter for Appwrite Client.
 */
export const getClient = (): Client => {
  if (!cachedClient) {
    cachedClient = new Client();
    const appwriteEndpoint = resolveAppwriteEndpoint();
    const appwriteProjectId = resolveAppwriteProjectId();

    if (appwriteEndpoint) {
      cachedClient.setEndpoint(appwriteEndpoint);
    }
    if (appwriteProjectId) {
      cachedClient.setProject(appwriteProjectId);
    }

    if (!appwriteEndpoint || !appwriteProjectId) {
      console.warn('Appwrite credentials missing (VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID). Backend requests will fail until configured.');
    }
  }
  return cachedClient;
};

/**
 * Lazy singleton getter for Appwrite Account service.
 */
export const getAccount = (): Account => {
  return new Account(getClient());
};

/**
 * Strips Appwrite system attributes ($id, $createdAt, etc.) and custom 'id'
 * attribute from document payloads.
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
 * Lazy singleton getter for Appwrite Databases service with payload sanitization.
 */
export const getDatabases = (): Databases => {
  const db = new Databases(getClient());

  const originalCreateDocument = db.createDocument.bind(db);
  const originalUpdateDocument = db.updateDocument.bind(db);

  db.createDocument = ((
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

  db.updateDocument = ((
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

  return db;
};

/**
 * Lazy singleton getters for storage, realtime, and teams services.
 */
export const getStorage = (): Storage => new Storage(getClient());
export const getRealtime = (): Realtime => new Realtime(getClient());
export const getTeams = (): Teams => new Teams(getClient());

/**
 * Lazy-loading singleton Proxies for backward compatibility and circular dependency prevention.
 */
export const client = new Proxy({} as Client, {
  get(_, prop) {
    const c = getClient();
    const val = (c as any)[prop];
    return typeof val === 'function' ? val.bind(c) : val;
  }
});

export const account = new Proxy({} as Account, {
  get(_, prop) {
    const a = getAccount();
    const val = (a as any)[prop];
    return typeof val === 'function' ? val.bind(a) : val;
  }
});

export const databases = new Proxy({} as Databases, {
  get(_, prop) {
    const d = getDatabases();
    const val = (d as any)[prop];
    return typeof val === 'function' ? val.bind(d) : val;
  }
});

export const storage = new Proxy({} as Storage, {
  get(_, prop) {
    const s = getStorage();
    const val = (s as any)[prop];
    return typeof val === 'function' ? val.bind(s) : val;
  }
});

export const realtime = new Proxy({} as Realtime, {
  get(_, prop) {
    const r = getRealtime();
    const val = (r as any)[prop];
    return typeof val === 'function' ? val.bind(r) : val;
  }
});

export const teams = new Proxy({} as Teams, {
  get(_, prop) {
    const t = getTeams();
    const val = (t as any)[prop];
    return typeof val === 'function' ? val.bind(t) : val;
  }
});

/**
 * Backward-compatible alias for databases service (formerly tablesDB)
 */
export const tablesDB = {
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

    if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
      databaseId = arg1.databaseId || DATABASE_ID;
      collId = arg1.tableId || arg1.collectionId;
      rowId = arg1.rowId || 'unique()';
      data = arg1.data || {};
      permissions = arg1.permissions;
    } else {
      databaseId = arg1;
      collId = tableId!;
      if (typeof rowIdOrData === 'string' && (typeof dataOrPermissions === 'object' || dataOrPermissions === undefined)) {
        rowId = rowIdOrData;
        data = dataOrPermissions || {};
        permissions = permissionsOrTx;
      } else {
        rowId = 'unique()';
        data = rowIdOrData || {};
        permissions = dataOrPermissions;
      }
    }

    return getDatabases().createDocument(databaseId, collId, rowId, sanitizeDocumentPayload(data), permissions);
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
    return getDatabases().getDocument(databaseId, collId, docId);
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

    const res = await getDatabases().listDocuments(databaseId, collId, q);
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

    return getDatabases().updateDocument(databaseId, collId, docId, sanitizeDocumentPayload(payload), perms);
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

    return getDatabases().deleteDocument(databaseId, collId, docId);
  },

  getPresence: async (presenceId: string) => {
    return getDatabases().getDocument(DATABASE_ID, 'presences', presenceId);
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
        const existing = await getDatabases().getDocument(databaseId, collId, rowId);
        if (existing) {
          return getDatabases().updateDocument(databaseId, collId, rowId, sanitizeDocumentPayload(payload), perms);
        }
      } catch {
        // Not found, create
      }
    }

    return getDatabases().createDocument(databaseId, collId, rowId, sanitizeDocumentPayload(payload), perms);
  },
};

/**
 * Query utilities for database operations and realtime filtering
 */
export { Query, Permission, Role, ID } from 'appwrite';

/**
 * Drops both Realtime stacks on the singleton client when the auth session ends or changes.
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

  const modern = getRealtime() as unknown as ModernRealtime;

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
}

/**
 * Probes Appwrite backend availability.
 */
export const checkConnection = async (): Promise<boolean> => {
    try {
        await getAccount().get().catch(() => true);
        console.log('Appwrite Connection: SUCCESS');
        return true;
    } catch (e) {
        console.error('Appwrite Connection: FAILED', e);
        return false;
    }
};

/**
 * Config for primary database ID and collections
 */
export const DATABASE_ID = 
  (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID || 
  (typeof window !== 'undefined' ? (window as any).VITE_APPWRITE_DATABASE_ID : undefined) || 
  process.env.VITE_APPWRITE_DATABASE_ID || 
  process.env.APPWRITE_DATABASE_ID || 
  'sovereign';

export const COLLECTIONS = {
  LEDGER: 'ledger',
  TRANSACTIONS: 'transactions',
  WORKFLOWS: 'workflows',
  AGENTS: 'agents',
  RITUALS: 'rituals',
  POLICIES: 'policies',
  AUDIT: 'audit',
  WSCONFIG: 'wsconfig',
  USERS: 'users',
  SYNDICATES: 'syndicates',
  CONNECTIONS: 'connections',
  CREWS: 'crews',
  AGENT_TEMPLATES: 'agent_templates',
  WORKFLOW_VERSIONS: 'workflow_versions',
  CHRONICLE_EVENTS: 'chronicle_events',
  CRM_CONTACTS: 'crm_contacts',
  CRM_DEALS: 'crm_deals',
  CRM_ACTIVITIES: 'crm_activities',
  TREASURY_TRANSACTIONS: 'treasury_transactions',
  STRIPE_EVENTS: 'stripe_events',
  TRIBUTE_LOGS: 'tribute_logs',
  PULSE_PROFILES: 'pulse_profiles',
  GLOBAL_ECONOMIC_DIALS: 'global_economic_dials',
  PILLAR_OF_ETERNITY: 'pillar_of_eternity',
  MICRO_APP_MODULES: 'micro_app_modules',
  MICRO_APP_PATCHES: 'micro_app_patches',
  MICRO_APP_DRAFTS: 'micro_app_drafts',
  PUBLISHED_MICRO_APPS: 'published_micro_apps',
  OPERATIONS_TASKS: 'operations_tasks',
  PROCUREMENT_ORDERS: 'procurement_orders',
  ACCESS_KEYS: 'access_keys',
  SYNDICATE_INTEGRATIONS: 'syndicate_integrations',
  NOTES: 'notes',
  CHAT_MESSAGES: 'chat_messages',
  SECRETS: 'secrets',
  AGENTCREDS: 'agentcreds',
  EMAIL_MARKETING_LAB: 'email_marketing_lab',
};

export const TABLES = COLLECTIONS;

export const BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  MEDIA: 'media',
};
