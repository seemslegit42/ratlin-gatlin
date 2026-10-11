/**
 * @file backend/functions/finalize-deal.ts
 * @description Finalizes a deal, updates status, calculates commission, and triggers webhooks.
 */

import { Client, Databases } from 'node-appwrite';
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

  const databases = new Databases(client);

  try {
    const { dealId, syndicateId } = JSON.parse(req.body || '{}');

    if (!dealId || !syndicateId) {
      throw new Error('Missing dealId or syndicateId');
    }

    // 1. Update Deal Status
    const deal = await databases.updateDocument(
      process.env.DATABASE_ID!,
      'crm_deals',
      dealId,
      { stage: 'closed-won' }
    );

    // 2. Calculate Commission (simple 5% for now)
    const commission = (deal.value as number) * 0.05;

    log(`✅ Deal ${dealId} finalized. Commission: ${commission}`);

    // 3. Log Audit
    await AuditLogger.track('deal.closed', {
      dealId,
      finalAmount: deal.value,
      commission
    });

    return res.json({ success: true, deal, commission });
  } catch (err: any) {
    error(`Deal finalization failed: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
