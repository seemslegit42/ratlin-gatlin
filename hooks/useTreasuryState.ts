import { useState, useEffect, useCallback } from 'react';
import type { TreasuryTransaction } from '../types.js';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';

const mapDBToTx = (dbTx: any): TreasuryTransaction => ({
  id: dbTx.$id,
  type: dbTx.type as 'debit' | 'credit' | 'accrual',
  description: dbTx.description,
  amount: dbTx.amount,
  timestamp: dbTx.timestamp,
});

export const useTreasuryState = (
  syndicateId: string,
  authenticatedUserId?: string | null,
) => {
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [balance, setBalance] = useState(0);

  const fetchTransactions = useCallback(async () => {
      if (!syndicateId) return;
      try {
          const { rows } = await tablesDB.listRows(
              DATABASE_ID,
              TABLES.TREASURY_TRANSACTIONS,
              [Query.equal('syndicate_id', syndicateId), Query.orderDesc('created_at'), Query.limit(20)]
          );
          
          const mapped = rows.map(mapDBToTx);
          setTransactions(mapped);
          
          // Calculate balance from transaction history
          const total = mapped.reduce((acc, curr) => acc + curr.amount, 0);
          setBalance(total);
      } catch (error) {
          console.error("Error fetching treasury:", error);
      }
  }, [syndicateId]);

  useEffect(() => {
    if (!syndicateId || !authenticatedUserId) return;

    fetchTransactions();

    const channel = `databases.${DATABASE_ID}.collections.${TABLES.TREASURY_TRANSACTIONS}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
       const record = response.payload as any;
       if (record.syndicate_id === syndicateId) {
           fetchTransactions();
       }
    });

    return () => { unsubscribe(); };
  }, [syndicateId, authenticatedUserId, fetchTransactions]);

  return { transactions, balance };
};
