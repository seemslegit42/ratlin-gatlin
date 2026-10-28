/**
 * @file useTursoTenant.native.ts
 * @description React Native hook for Turso libSQL Database-per-Tenant operations.
 * Enforces Zero ORM, raw SQLite queries, and parameterized arguments.
 */

import { useState, useCallback, useMemo } from 'react';
import { createClient, type Client } from '@libsql/client';

export interface AgentLogRecord {
  id: string;
  agent_name: string;
  action: string;
  thought: string;
  created_at: string;
}

export function useTursoTenant(tenantUrl?: string, authToken?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client: Client = useMemo(() => {
    return createClient({
      url: tenantUrl || process.env.TURSO_DATABASE_URL || 'libsql://demo-tenant.turso.io',
      authToken: authToken || process.env.TURSO_AUTH_TOKEN || 'tenant-token',
    });
  }, [tenantUrl, authToken]);

  // Schema Provisioning: Raw SQLite CREATE TABLE
  const initTenantAgentTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await client.batch([
        {
          sql: `
            CREATE TABLE IF NOT EXISTS agent_execution_logs (
              id TEXT PRIMARY KEY,
              agent_name TEXT NOT NULL,
              action TEXT NOT NULL,
              thought TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
          `,
          args: [],
        },
        {
          sql: `
            CREATE TABLE IF NOT EXISTS tenant_llm_history (
              id TEXT PRIMARY KEY,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              model TEXT NOT NULL,
              timestamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
          `,
          args: [],
        },
      ]);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Parameterized Query Execution (Zero ORM)
  const executeQuery = useCallback(
    async <T = any>(sql: string, args: any[] = []): Promise<T[]> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.execute({ sql, args });
        return result.rows as unknown as T[];
      } catch (err: any) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    client,
    loading,
    error,
    initTenantAgentTables,
    executeQuery,
  };
}
