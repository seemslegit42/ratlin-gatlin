/**
 * @file backend/functions/stripe-create-payment-intent.ts
 * @description Appwrite Function to create Stripe PaymentIntents server-side.
 */

import Stripe from 'stripe';

type FunctionContext = {
  req: {
    body?: string;
    headers?: Record<string, string | undefined>;
  };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
};

type PaymentIntentPayload = {
  syndicateId?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string>;
};

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

export default async ({ req, res, log }: FunctionContext) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return buildError(res, 500, 'MISSING_STRIPE_SECRET_KEY', 'Missing STRIPE_SECRET_KEY');
  }

  const userId = req.headers?.['x-appwrite-user-id'];
  if (!userId || userId === 'guest') {
    return buildError(res, 403, 'AUTH_REQUIRED', 'Authenticated user is required');
  }

  const payload: PaymentIntentPayload = JSON.parse(req.body || '{}');
  const amount = Number(payload.amount);
  const currency = (payload.currency || 'usd').toLowerCase();

  if (!payload.syndicateId || !Number.isFinite(amount) || amount <= 0) {
    return buildError(res, 400, 'INVALID_PAYMENT_PAYLOAD', 'syndicateId and positive amount are required', {
      required: ['syndicateId', 'amount'],
    });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-03-31.basil',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata: {
        syndicateId: payload.syndicateId,
        initiatedByUserId: userId,
        ...(payload.metadata || {}),
      },
      automatic_payment_methods: { enabled: true },
    });

    log(`✅ Created PaymentIntent ${paymentIntent.id} for syndicate ${payload.syndicateId}`);
    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err: any) {
    return buildError(res, 500, 'STRIPE_PAYMENT_INTENT_FAILED', err.message);
  }
};
