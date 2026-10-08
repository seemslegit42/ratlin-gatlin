/**
 * @file services/db.ts
 * @description Appwrite substrate health and query routing.
 * All persistent data for ΛΞVON OS lives in Appwrite (TablesDB, Storage, Auth, Realtime).
 */

import { checkConnection, DATABASE_ID, TABLES } from './appwriteClient.js';

export type AppwriteSubstrate = 'TABLES' | 'STORAGE' | 'REALTIME' | 'AUTH';

export interface DBConfig {
  substrate: AppwriteSubstrate;
  tableId?: keyof typeof TABLES | string;
  tenantId?: string;
}

export interface SubstrateHealth {
  appwrite: 'CONNECTED' | 'UNREACHABLE' | 'PENDING';
  databaseId: string;
  checkedAt: number;
}

/**
 * Routes logical operations to the Appwrite substrate (logging hook for future server routing).
 */
export const executeLatticeQuery = async (operation: string, config: DBConfig) => {
  const table = config.tableId ?? 'unknown';
  console.log(`[APPWRITE] [${config.substrate}] ${operation.slice(0, 50)}… table=${table}`);
  return {
    source: `Appwrite_${config.substrate}`,
    databaseId: DATABASE_ID,
    tableId: table,
    status: 'SUCCESS' as const,
  };
};

/**
 * Probes Appwrite availability (auth + project reachability).
 */
export const checkSubstrateHealth = async (): Promise<SubstrateHealth> => {
  const ok = await checkConnection();
  return {
    appwrite: ok ? 'CONNECTED' : 'UNREACHABLE',
    databaseId: DATABASE_ID,
    checkedAt: Date.now(),
  };
};
