/**
 * @file hooks/useIntegrationsState.ts
 * @description Manages persistence for third-party integrations (API keys) via Appwrite.
 */

import { useState, useEffect, useCallback } from 'react';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';
import { nanoid } from 'nanoid';

export interface IntegrationState {
    id: string; // The ID of the integration record
    serviceId: string; // 'openai', 'stripe', etc
    apiKey: string;
    isEnabled: boolean;
    lastSync: number;
}

export const useIntegrationsState = (
  syndicateId: string | null,
  authenticatedUserId?: string | null,
) => {
    const [integrations, setIntegrations] = useState<Record<string, IntegrationState>>({});
    const [loading, setLoading] = useState(true);

    const fetchIntegrations = useCallback(async () => {
        if (!syndicateId) return;

        try {
            const { rows } = await tablesDB.listRows(
                DATABASE_ID,
                TABLES.SYNDICATE_INTEGRATIONS,
                [Query.equal('syndicate_id', syndicateId)]
            );
            
            const map: Record<string, IntegrationState> = {};
            rows.forEach((row: any) => {
                map[row.service_id] = {
                    id: row.$id,
                    serviceId: row.service_id,
                    apiKey: row.api_key,
                    isEnabled: row.is_enabled,
                    lastSync: new Date(row.updated_at).getTime()
                };
            });
            setIntegrations(map);
        } catch (error) {
            console.error("Error fetching integrations:", error);
        } finally {
            setLoading(false);
        }
    }, [syndicateId]);

    useEffect(() => {
        if (!syndicateId || !authenticatedUserId) return;

        fetchIntegrations();
        
        // Subscription
        const channel = `databases.${DATABASE_ID}.collections.${TABLES.SYNDICATE_INTEGRATIONS}.documents`;
        const unsubscribe = client.subscribe(channel, (response) => {
            const record = response.payload as any;
            if (record.syndicate_id === syndicateId) {
                fetchIntegrations();
            }
        });

        return () => { unsubscribe(); };

    }, [syndicateId, authenticatedUserId, fetchIntegrations]);

    const saveIntegration = useCallback(async (serviceId: string, apiKey: string) => {
        if (!syndicateId) return;

        const existing = integrations[serviceId];
        const id = existing?.id || nanoid();
        const record = {
            syndicate_id: syndicateId,
            service_id: serviceId,
            api_key: apiKey,
            is_enabled: true,
            updated_at: new Date().toISOString()
        };

        // Optimistic update
        setIntegrations(prev => ({
            ...prev,
            [serviceId]: { ...prev[serviceId], ...record, lastSync: Date.now(), apiKey, isEnabled: true, serviceId, id }
        }));

        try {
            if (existing?.id) {
                await tablesDB.updateRow(DATABASE_ID, TABLES.SYNDICATE_INTEGRATIONS, id, record);
            } else {
                await tablesDB.createRow(DATABASE_ID, TABLES.SYNDICATE_INTEGRATIONS, id, record);
            }
        } catch (error) {
            console.error("Failed to save integration:", error);
        }

    }, [syndicateId, integrations]);

    const toggleIntegration = useCallback(async (serviceId: string) => {
        if (!syndicateId) return;
        const current = integrations[serviceId];
        if (!current) return;

        const newState = !current.isEnabled;
        
        // Optimistic
        setIntegrations(prev => ({
            ...prev,
            [serviceId]: { ...prev[serviceId], isEnabled: newState }
        }));

        try {
            await tablesDB.updateRow(DATABASE_ID, TABLES.SYNDICATE_INTEGRATIONS, current.id, { is_enabled: newState });
        } catch (error) {
            console.error("Failed to toggle integration:", error);
        }

    }, [syndicateId, integrations]);

    const deleteIntegration = useCallback(async (serviceId: string) => {
        if (!syndicateId) return;
        const current = integrations[serviceId];
        if (!current) return;

        // Optimistic
        setIntegrations(prev => {
            const next = { ...prev };
            delete next[serviceId];
            return next;
        });

        try {
            await tablesDB.deleteRow(DATABASE_ID, TABLES.SYNDICATE_INTEGRATIONS, current.id);
        } catch (error) {
            console.error("Failed to delete integration:", error);
        }
    }, [syndicateId, integrations]);

    return { integrations, loading, saveIntegration, toggleIntegration, deleteIntegration };
};
