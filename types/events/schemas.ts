/**
 * @file types/events/schemas.ts
 * @description Standardized JSON Schema contracts for inter-module event communication.
 */

export interface DealClosedEvent {
  dealId: string;
  accountId: string;
  finalAmount: number;
  currency: string;
  timestamp: string;
  signeeDetails: { name: string; email: string };
}

export interface TreasuryMovementEvent {
  transactionId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  initiatedBy: string;
  linkedEventId: string;
}

export interface UserOnboardedEvent {
  userId: string;
  organizationId: string;
  role: string;
  creationTimestamp: string;
  authProvider: string;
}

export interface SystemExceptionEvent {
  errorId: string;
  serviceName: string;
  exceptionType: string;
  stackTrace: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  contextPayload: Record<string, unknown>;
}
