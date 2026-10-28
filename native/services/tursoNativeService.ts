/**
 * @file tursoNativeService.ts
 * @description Turso libSQL client setup for React Native / SQLite database-per-tenant architecture.
 */

import { createClient } from '@libsql/client';

export function createTursoClient(url: string, authToken: string) {
  return createClient({
    url: url || 'libsql://local-dev.turso.io',
    authToken: authToken || 'development-token',
  });
}

export async function executeNativeQuery(client: ReturnType<typeof createClient>, sql: string, args: any[] = []) {
  try {
    const result = await client.execute({ sql, args });
    return { success: true, rows: result.rows };
  } catch (error: any) {
    console.error('Turso Native Query Error:', error);
    return { success: false, error: error.message, rows: [] };
  }
}
