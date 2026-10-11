/**
 * @file services/auditService.ts
 * @description Encapsulates audit event emission for standardized system tracking.
 */

import { Client, Functions } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const functions = new Functions(client);

export const AuditLogger = {
    async track(eventType: string, payload: Record<string, unknown>, severity: 'low' | 'medium' | 'high' | 'critical' = 'low') {
        try {
            await functions.createExecution(
                'log-audit-event',
                JSON.stringify({ eventType, payload, severity })
            );
        } catch (error) {
            console.error('AuditLogger failed to track event:', error);
        }
    },
    async trackError(error: Error, context: Record<string, unknown>) {
        await this.track('system.exception', {
            exceptionType: error.name,
            stackTrace: error.stack,
            message: error.message,
            ...context
        }, 'high');
    }
};
