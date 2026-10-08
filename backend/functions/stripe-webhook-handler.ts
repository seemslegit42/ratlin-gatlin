/**
 * @file backend/functions/stripe-webhook-handler.ts
 * @description Appwrite Function to validate and process Stripe webhook events.
 */

import { Client, Databases, ID } from 'node-appwrite';
import Stripe from 'stripe';

type FunctionContext = {
  req: {
    body?: string;
    headers?: Record<string, string | undefined>;
  };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
  error: (message: string) => void;
};

const buildError = (
  res: FunctionContext['res'],
  statusCode: number,
  errorCode: string,
  message: string
) =>
  res.json(
    {
      success: false,
      error: {
        type: statusCode >= 500 ? 'system' : statusCode === 403 ? 'auth' : 'validation',
        code: errorCode,
        message,
      },
    },
    statusCode
  );

export default async ({ req, res, log, error }: FunctionContext) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const databaseId = process.env.DATABASE_ID;

  if (!stripeSecretKey || !stripeWebhookSecret || !databaseId) {
    return buildError(
      res,
      500,
      'MISSING_STRIPE_ENV',
      'Missing STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, or DATABASE_ID'
    );
  }

  const signature = req.headers?.['stripe-signature'] || req.headers?.['Stripe-Signature'];
  if (!signature) {
    return buildError(res, 400, 'MISSING_STRIPE_SIGNATURE', 'Missing Stripe signature header');
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-03-31.basil' });
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body || '', signature, stripeWebhookSecret);
  } catch (err: any) {
    error(`Webhook signature verification failed: ${err.message}`);
    return buildError(res, 400, 'INVALID_STRIPE_SIGNATURE', err.message);
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  const databases = new Databases(client);

  try {
    const baseEventPayload = {
      stripe_event_id: event.id,
      stripe_event_type: event.type,
      stripe_created_at: new Date(event.created * 1000).toISOString(),
      payload: JSON.stringify(event),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await databases.createDocument(databaseId, 'stripe_events', event.id, baseEventPayload).catch(async (e: any) => {
      const message = String(e?.message || '');
      if (message.toLowerCase().includes('already exists')) {
        return;
      }
      throw e;
    });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await databases.createDocument(databaseId, 'transactions', ID.unique(), {
          syndicate_id: intent.metadata?.syndicateId || 'unknown',
          amount: (intent.amount_received || intent.amount || 0) / 100,
          type: 'credit',
          reason: `stripe_payment_intent_succeeded:${intent.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        break;
      }
      case 'payment_intent.payment_failed':
      case 'checkout.session.completed':
        break;
      default:
        break;
    }

    log(`✅ Processed Stripe webhook ${event.type}`);
    return res.json({
      success: true,
      received: true,
      eventType: event.type,
      eventId: event.id,
    });
  } catch (err: any) {
    error(`Stripe webhook processing failed: ${err.message}`);
    return buildError(res, 500, 'STRIPE_WEBHOOK_PROCESSING_FAILED', err.message);
  }
};
