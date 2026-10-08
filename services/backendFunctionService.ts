/**
 * @file services/backendFunctionService.ts
 * @description Service layer for calling Appwrite backend functions
 */

import { client } from './appwriteClient.js';
import { Functions } from 'appwrite';

const functions = new Functions(client);

const FUNCTION_IDS = {
  PROCESS_WORKFLOW: 'process-workflow',
  CRM_OPERATIONS: 'crm-operations',
  TREASURY_OPERATIONS: 'treasury-operations',
  STRIPE_CREATE_PAYMENT_INTENT: 'stripe-create-payment-intent',
  STRIPE_CONNECT_ONBOARDING: 'stripe-connect-onboarding',
};

/**
 * Execute a workflow via Appwrite Function
 */
export const executeWorkflow = async (
  workflowId: string,
  syndicateId: string,
  inputData: Record<string, any> = {}
) => {
  try {
    const response = await functions.createExecution(FUNCTION_IDS.PROCESS_WORKFLOW, JSON.stringify({
      workflowId,
      syndicateId,
      inputData,
    }));
    return JSON.parse(response.responseBody);
  } catch (error) {
    console.error('Workflow execution failed:', error);
    throw error;
  }
};

/**
 * Perform CRM operation
 */
export const performCRMOperation = async (
  action: 'create_deal' | 'create_activity' | 'create_contact',
  syndicateId: string,
  data: Record<string, any>
) => {
  try {
    const response = await functions.createExecution(FUNCTION_IDS.CRM_OPERATIONS, JSON.stringify({
      action,
      syndicateId,
      data,
    }));
    return JSON.parse(response.responseBody);
  } catch (error) {
    console.error('CRM operation failed:', error);
    throw error;
  }
};

/**
 * Perform treasury operation
 */
export const performTreasuryOperation = async (
  action: 'record_transaction' | 'log_tribute',
  syndicateId: string,
  data: Record<string, any>
) => {
  try {
    const response = await functions.createExecution(FUNCTION_IDS.TREASURY_OPERATIONS, JSON.stringify({
      action,
      syndicateId,
      data,
    }));
    return JSON.parse(response.responseBody);
  } catch (error) {
    console.error('Treasury operation failed:', error);
    throw error;
  }
};

/**
 * Create a Stripe PaymentIntent via Appwrite Function.
 */
export const createStripePaymentIntent = async (
  syndicateId: string,
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
) => {
  try {
    const response = await functions.createExecution(
      FUNCTION_IDS.STRIPE_CREATE_PAYMENT_INTENT,
      JSON.stringify({
        syndicateId,
        amount,
        currency,
        metadata,
      })
    );
    return JSON.parse(response.responseBody);
  } catch (error) {
    console.error('Stripe PaymentIntent creation failed:', error);
    throw error;
  }
};

/**
 * Create Stripe Connect onboarding URL via Appwrite Function.
 */
export const createStripeConnectOnboarding = async (
  connectedAccountId: string,
  refreshUrl: string,
  returnUrl: string
) => {
  try {
    const response = await functions.createExecution(
      FUNCTION_IDS.STRIPE_CONNECT_ONBOARDING,
      JSON.stringify({
        connectedAccountId,
        refreshUrl,
        returnUrl,
      })
    );
    return JSON.parse(response.responseBody);
  } catch (error) {
    console.error('Stripe Connect onboarding failed:', error);
    throw error;
  }
};

export default {
  executeWorkflow,
  performCRMOperation,
  performTreasuryOperation,
  createStripePaymentIntent,
  createStripeConnectOnboarding,
};
