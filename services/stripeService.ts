
/**
 * @file services/stripeService.ts
 * @description Service layer for handling Stripe payments.
 * Simulates backend interactions for PaymentIntent creation and confirmation.
 */

import { loadStripe } from '@stripe/stripe-js';
import { createStripePaymentIntent } from './backendFunctionService';

// Initialize Stripe with a publishable key.
// In a real app, this would be an environment variable.
// We use a test key here for demonstration purposes.
let stripePromise: Promise<any> | null = null;
const useMockStripe = import.meta.env.VITE_USE_MOCK_STRIPE !== 'false';

export const getStripe = (key?: string) => {
  if (!stripePromise && key) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Simulates creating a PaymentIntent on the backend.
 * @param amount Amount in cents
 * @param currency Currency code (e.g., 'usd')
 */
export const createPaymentIntent = async (amount: number, currency: string = 'usd'): Promise<{ clientSecret: string }> => {
    if (useMockStripe) {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would fetch from your backend.
      // Here we return a mock secret.
      console.log(`Creating mock PaymentIntent for ${amount} ${currency}`);

      // Simulate success
      return {
        clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substr(2, 9)
      };
    }

    const syndicateId = import.meta.env.VITE_DEFAULT_SYNDICATE_ID || 'default';
    const response = await createStripePaymentIntent(syndicateId, amount, currency, {
      source: 'frontend',
    });
    if (!response?.success || !response?.clientSecret) {
      throw new Error(response?.error?.message || 'Payment intent creation failed');
    }
    return { clientSecret: response.clientSecret };
};

/**
 * Simulates the confirmation of a payment.
 * Used when we don't have a real backend to confirm the intent status.
 */
export const confirmMockPayment = async (): Promise<boolean> => {
     await new Promise(resolve => setTimeout(resolve, 2000));
     return Math.random() > 0.1; // 90% success rate
};
