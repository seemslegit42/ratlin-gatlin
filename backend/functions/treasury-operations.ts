/**
 * @file backend/functions/treasury-operations.ts
 * @description Appwrite Function for treasury/financial operations
 */

import { Client, Databases, ID, Query } from 'node-appwrite';

type FunctionContext = {
  req: { body?: string };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
  error: (message: string) => void;
};

type TreasuryAction = 'record_transaction' | 'log_tribute';

const buildError = (
  res: FunctionContext['res'],
  statusCode: number,
  errorCode: string,
  message: string,
  details?: Record<string, unknown>
) =>
  res.json(
    {
      success: false,
      error: {
        type: statusCode >= 500 ? 'system' : statusCode === 403 ? 'auth' : 'validation',
        code: errorCode,
        message,
        details,
      },
    },
    statusCode
  );

const normalizeAmount = (amount: unknown): number => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Amount must be a positive number');
  }
  return parsed;
};

export default async ({ req, res, log, error }: FunctionContext) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const databases = new Databases(client);
  const databaseId = process.env.DATABASE_ID;

  try {
    const { action, syndicateId, data } = JSON.parse(req.body || '{}');

    if (!databaseId) {
      return buildError(res, 500, 'MISSING_DATABASE_ID', 'Missing DATABASE_ID environment variable');
    }

    if (!action || !syndicateId) {
      return buildError(res, 400, 'MISSING_REQUIRED_FIELDS', 'Missing action or syndicateId', {
        required: ['action', 'syndicateId'],
      });
    }

    log(`💰 Treasury Action: ${action}`);

    let result;
    const now = new Date().toISOString();

    switch (action as TreasuryAction) {
      case 'record_transaction': {
        const amount = normalizeAmount(data?.amount);
        const type = data?.type;
        if (type !== 'debit' && type !== 'credit') {
          return buildError(res, 400, 'INVALID_TRANSACTION_TYPE', 'Transaction type must be debit or credit');
        }

        const idempotencyKey =
          typeof data?.idempotencyKey === 'string' && data.idempotencyKey.trim().length > 0
            ? data.idempotencyKey.trim()
            : undefined;

        let transaction;
        const transactionId = idempotencyKey || ID.unique();

        try {
          transaction = await databases.createDocument(databaseId, 'transactions', transactionId, {
            syndicate_id: syndicateId,
            amount,
            type,
            reason: data?.reason || null,
            created_at: now,
            updated_at: now,
          });
        } catch (createError: any) {
          if (idempotencyKey && String(createError?.message || '').toLowerCase().includes('already exists')) {
            transaction = await databases.getDocument(databaseId, 'transactions', transactionId);
          } else {
            throw createError;
          }
        }

        // Update ledger balance
        let ledger = await databases.listDocuments(
          databaseId,
          'ledger',
          [Query.equal('syndicate_id', syndicateId), Query.limit(1)]
        ).then(r => r.documents[0]);

        if (!ledger) {
          ledger = await databases.createDocument(
            databaseId,
            'ledger',
            ID.unique(),
            {
              syndicate_id: syndicateId,
              balance: type === 'credit' ? amount : -amount,
              committed: 0,
              reserved: 0,
              updated_at: now,
            }
          );
        } else {
          const delta = type === 'credit' ? amount : -amount;
          ledger = await databases.updateDocument(
            databaseId,
            'ledger',
            ledger.$id,
            {
              balance: (ledger.balance || 0) + delta,
              updated_at: now,
            }
          );
        }

        result = {
          transaction,
          ledger,
          idempotency: {
            key: idempotencyKey || null,
            reusedTransaction: Boolean(idempotencyKey && transaction?.$id === transactionId),
          },
        };
        log(`✅ Transaction recorded: ${type} ${amount}`);
        break;
      }

      case 'log_tribute': {
        const amount = normalizeAmount(data?.amount);
        result = await databases.createDocument(
          databaseId,
          'tribute_logs',
          ID.unique(),
          {
            syndicate_id: syndicateId,
            amount,
            reason: data.reason,
            created_at: now,
            updated_at: now,
          }
        );
        log(`✅ Tribute logged: ${amount}`);
        break;
      }

      default:
        return buildError(res, 400, 'UNKNOWN_TREASURY_ACTION', `Unknown action: ${action}`, {
          allowedActions: ['record_transaction', 'log_tribute'],
        });
    }

    return res.json({
      success: true,
      action,
      result,
    });
  } catch (err: any) {
    error(`Treasury operation failed: ${err.message}`);
    if (err.message === 'Amount must be a positive number') {
      return buildError(res, 400, 'INVALID_AMOUNT', err.message);
    }
    return buildError(res, 500, 'TREASURY_OPERATION_FAILED', err.message);
  }
};
