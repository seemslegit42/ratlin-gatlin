/**
 * @file hooks/useAccessKeysState.ts
 * @description Manages persistence for generated Access Keys via Appwrite.
 */

import { useState, useEffect, useCallback } from 'react';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';
import { nanoid } from 'nanoid';

export interface AccessKey {
  id: string;
  name: string;
  prefix: string;
  scope: 'read' | 'write' | 'admin';
  created: number;
  lastUsed?: number;
}

export const useAccessKeysState = (
  syndicateId: string | null,
  authenticatedUserId?: string | null,
) => {
    const [keys, setKeys] = useState<AccessKey[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchKeys = useCallback(async () => {
        if (!syndicateId) return;
        try {
            const { rows } = await tablesDB.listRows(
                DATABASE_ID,
                TABLES.ACCESS_KEYS,
                [Query.equal('syndicate_id', syndicateId), Query.orderDesc('created_at')]
            );
            
            setKeys(rows.map(row => ({
                id: row.$id,
                name: row.name,
                prefix: row.prefix,
                scope: row.scope as any,
                created: new Date(row.created_at).getTime(),
                lastUsed: row.last_used_at ? new Date(row.last_used_at).getTime() : undefined
            })));
        } catch (error) {
            console.error("Error fetching access keys:", error);
        } finally {
            setLoading(false);
        }
    }, [syndicateId]);

    useEffect(() => {
        if (!syndicateId || !authenticatedUserId) return;

        fetchKeys();

        const channel = `databases.${DATABASE_ID}.collections.${TABLES.ACCESS_KEYS}.documents`;
        const unsubscribe = client.subscribe(channel, (response) => {
            const record = response.payload as any;
            if (record.syndicate_id === syndicateId) {
                fetchKeys();
            }
        });

        return () => { unsubscribe(); };
    }, [syndicateId, authenticatedUserId, fetchKeys]);

    const generateKey = useCallback(async (name: string, scope: 'read' | 'write' | 'admin') => {
        if (!syndicateId) return null;

        const secret = `lev_live_${nanoid(24)}`;
        const prefix = `${secret.substring(0, 12)}...`;
        const id = nanoid();
        
        const newKey = {
            syndicate_id: syndicateId,
            name,
            prefix,
            scope,
            created_at: new Date().toISOString()
        };

        // Optimistic
        setKeys(prev => [{
            id,
            name,
            prefix,
            scope,
            created: Date.now()
        }, ...prev]);

        try {
            await tablesDB.createRow(DATABASE_ID, TABLES.ACCESS_KEYS, id, newKey);
            return secret;
        } catch (error) {
            console.error("Error creating access key:", error);
            // Revert optimism if needed in a more robust implementation
            return null;
        }
    }, [syndicateId]);

    const revokeKey = useCallback(async (id: string) => {
        // Optimistic
        setKeys(prev => prev.filter(k => k.id !== id));
        try {
            await tablesDB.deleteRow(DATABASE_ID, TABLES.ACCESS_KEYS, id);
        } catch (error) {
            console.error("Error revoking key:", error);
        }
    }, []);

    return { keys, loading, generateKey, revokeKey };
};
