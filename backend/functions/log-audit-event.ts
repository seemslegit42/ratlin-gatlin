/**
 * @file backend/functions/log-audit-event.ts
 * @description Ingests structured audit events and persists them to the audit log table.
 */

import { Client, Databases, ID } from 'node-appwrite';

type FunctionContext = {
  req: { body?: string; headers: Record<string, string> };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
  error: (message: string) => void;
};

export default async ({ req, res, log, error }: FunctionContext) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const databases = new Databases(client);

  try {
    const { eventType, payload, severity } = JSON.parse(req.body || '{}');

    await databases.createDocument(
      process.env.DATABASE_ID!,
      'audit',
      ID.unique(),
      {
        syndicate_id: 'SYSTEM', // Assuming global system audit
        event_type: eventType,
        data: JSON.stringify(payload),
        severity: severity || 'low',
        timestamp: Math.floor(Date.now() / 1000),
        source: 'audit-function',
        metadata: JSON.stringify(req.headers)
      }
    );

    log(`✅ Audit event logged: ${eventType}`);
    return res.json({ success: true });
  } catch (err: any) {
    error(`Audit logging failed: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
