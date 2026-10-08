/**
 * @file backend/functions/crm-operations.ts
 * @description Appwrite Function for CRM operations (deals, contacts, activities)
 */

import { Client, Databases, ID } from 'node-appwrite';

type FunctionContext = {
  req: { body?: string };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
  error: (message: string) => void;
};

type CrmAction = 'create_deal' | 'create_activity' | 'create_contact';

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

const assertRequired = (field: string, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required field: ${field}`);
  }
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

    log(`📞 CRM Action: ${action}`);

    let result;
    const now = new Date().toISOString();

    switch (action as CrmAction) {
      case 'create_deal': {
        assertRequired('data.name', data?.name);
        assertRequired('data.value', data?.value);

        result = await databases.createDocument(
          databaseId,
          'crm_deals',
          ID.unique(),
          {
            syndicate_id: syndicateId,
            name: data.name,
            value: data.value,
            stage: data.stage || 'prospect',
            contact_id: data.contact_id,
            created_at: now,
            updated_at: now,
          }
        );
        log(`✅ Deal "${data.name}" created`);
        break;
      }

      case 'create_activity': {
        assertRequired('data.deal_id', data?.deal_id);
        assertRequired('data.type', data?.type);

        result = await databases.createDocument(
          databaseId,
          'crm_activities',
          ID.unique(),
          {
            syndicate_id: syndicateId,
            deal_id: data.deal_id,
            type: data.type, // 'call', 'email', 'meeting'
            notes: data.notes,
            created_at: now,
            updated_at: now,
          }
        );
        log(`✅ Activity logged`);
        break;
      }

      case 'create_contact': {
        assertRequired('data.name', data?.name);
        assertRequired('data.email', data?.email);

        result = await databases.createDocument(
          databaseId,
          'crm_contacts',
          ID.unique(),
          {
            syndicate_id: syndicateId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company,
            tags: JSON.stringify(data.tags || []),
            created_at: now,
            updated_at: now,
          }
        );
        log(`✅ Contact "${data.name}" created`);
        break;
      }

      default:
        return buildError(res, 400, 'UNKNOWN_CRM_ACTION', `Unknown action: ${action}`, {
          allowedActions: ['create_deal', 'create_activity', 'create_contact'],
        });
    }

    return res.json({
      success: true,
      action,
      result,
    });
  } catch (err: any) {
    error(`CRM operation failed: ${err.message}`);
    if (err.message?.startsWith('Missing required field:')) {
      return buildError(res, 400, 'INVALID_ACTION_PAYLOAD', err.message);
    }
    return buildError(res, 500, 'CRM_OPERATION_FAILED', err.message);
  }
};
