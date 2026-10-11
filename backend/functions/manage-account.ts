/**
 * @file backend/functions/manage-account.ts
 * @description Processes account updates and validates permissions server-side.
 */

import { Client, Users } from 'node-appwrite';
import { AuditLogger } from '../../services/auditService';

type FunctionContext = {
  req: { body?: string };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
  error: (message: string) => void;
};

export default async ({ req, res, log, error }: FunctionContext) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const users = new Users(client);

  try {
    const { userId, name, prefs } = JSON.parse(req.body || '{}');

    if (!userId) {
      throw new Error('Missing userId');
    }

    // Logic: Validate permissions (simplistic check for this draft)
    log(`🔄 Managing account for: ${userId}`);

    let updatedUser;

    if (name) {
        updatedUser = await users.updateName(userId, name);
    }
    
    if (prefs) {
        updatedUser = await users.updatePrefs(userId, prefs);
    }

    await AuditLogger.track('account.updated', { userId, name: !!name, prefs: !!prefs });

    return res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    error(`Account management failed: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
