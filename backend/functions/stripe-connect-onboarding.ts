/**
 * @file backend/functions/stripe-connect-onboarding.ts
 * @description Appwrite Function to create Stripe Connect onboarding links.
 */

import Stripe from 'stripe';

type FunctionContext = {
  req: {
    body?: string;
    headers?: Record<string, string | undefined>;
  };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
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

export default async ({ req, res }: FunctionContext) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return buildError(res, 500, 'MISSING_STRIPE_SECRET_KEY', 'Missing STRIPE_SECRET_KEY');
  }

  const userId = req.headers?.['x-appwrite-user-id'];
  if (!userId || userId === 'guest') {
    return buildError(res, 403, 'AUTH_REQUIRED', 'Authenticated user is required');
  }

  const { connectedAccountId, refreshUrl, returnUrl } = JSON.parse(req.body || '{}');
  if (!connectedAccountId || !refreshUrl || !returnUrl) {
    return buildError(
      res,
      400,
      'INVALID_CONNECT_PAYLOAD',
      'connectedAccountId, refreshUrl, and returnUrl are required'
    );
  }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-03-31.basil' });
    const accountLink = await stripe.accountLinks.create({
      account: connectedAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return res.json({
      success: true,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expires_at,
    });
  } catch (err: any) {
    return buildError(res, 500, 'STRIPE_CONNECT_ONBOARDING_FAILED', err.message);
  }
};
