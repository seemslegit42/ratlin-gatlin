import { useEffect, useRef, useCallback } from 'react';
import { RealtimeResponseEvent } from 'appwrite';
import { realtime, DATABASE_ID } from '@/services/appwriteClient';
import { useAuth } from '@/contexts/AuthContext';

export interface RealtimeSubscription {
  channel: string;
  callback: (payload: RealtimeResponseEvent<Record<string, any>>) => void;
  filters?: string[];
}

export const useRealtimeSubscriptionManager = () => {
  const { onAuthStateChange, syndicateId, handleSessionExpiry } = useAuth();
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  // Function to unsubscribe from all subscriptions
  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(unsubscribeFn => unsubscribeFn());
    subscriptionsRef.current.clear();
  }, []);

  // Function to unsubscribe from a specific channel
  const unsubscribe = useCallback((channel: string) => {
    const existingUnsubscribe = subscriptionsRef.current.get(channel);
    if (existingUnsubscribe) {
      existingUnsubscribe();
      subscriptionsRef.current.delete(channel);
    }
  }, []);

  // Function to create a subscription with error handling
  const subscribe = useCallback(async (subscription: RealtimeSubscription) => {
    const { channel, callback, filters = [] } = subscription;

    // Create filter string if filters provided
    const filterString = filters.length > 0 ? `?${filters.join('&')}` : '';

    // Unsubscribe if already exists
    unsubscribe(channel);

    // Create new subscription
    const realtimeSubscription = await realtime.subscribe(
      `databases.${DATABASE_ID}.collections.${channel}.documents${filterString}`,
      (payload) => {
        // Handle session expiry errors
        if (payload.events.includes('error') && payload.payload?.type === 'authentication') {
          console.warn(`Session expired for subscription: ${channel}. Cleaning up subscriptions.`);
          unsubscribeAll();
          // Trigger re-authentication by clearing user state
          handleSessionExpiry();
          return;
        }
        callback(payload);
      }
    );

    // Store the unsubscribe function
    subscriptionsRef.current.set(channel, () => realtimeSubscription.close());

    return () => realtimeSubscription.close();
  }, [syndicateId, unsubscribeAll, handleSessionExpiry]);

  // Handle auth state changes - clean up subscriptions when user logs out
  useEffect(() => {
    const handleAuthChange = (user: any) => {
      if (!user) {
        // User logged out, clean up all subscriptions
        unsubscribeAll();
      }
      // When user logs in, subscriptions will be re-created by individual hooks
    };

    const cleanup = onAuthStateChange(handleAuthChange);

    return () => {
      cleanup();
      unsubscribeAll();
    };
  }, [onAuthStateChange, unsubscribeAll]);

  return {
    subscribe,
    unsubscribe,
    unsubscribeAll
  };
};