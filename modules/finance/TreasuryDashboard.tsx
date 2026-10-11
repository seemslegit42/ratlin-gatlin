import React, { useState, useEffect } from 'react';
import { databases, realtime, DATABASE_ID, COLLECTIONS, Query } from '../../services/appwriteClient';
import { GlassPane } from '../shared/GlassPane';

interface Transaction {
  $id: string;
  amount: number;
  type: 'debit' | 'credit';
  reason: string;
  syndicate_id: string;
  created_at: string;
}

export const TreasuryDashboard: React.FC<{ teamId: string }> = ({ teamId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          [
            Query.equal('syndicate_id', teamId),
            Query.orderDesc('created_at'),
            Query.limit(50)
          ]
        );
        setTransactions(response.documents as unknown as Transaction[]);
      } catch (error) {
        console.error('Failed to fetch treasury transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    const unsubscribe = realtime.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.TRANSACTIONS}.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const newDoc = response.payload as unknown as Transaction;
          if (newDoc.syndicate_id === teamId) {
            setTransactions(prev => [newDoc, ...prev].slice(0, 50));
          }
        }
      }
    );

    return () => unsubscribe();
  }, [teamId]);

  return (
    <GlassPane className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-comfortaa mb-6 text-white">Treasury Transactions</h2>
      {loading ? (
        <div className="text-white/60">Synchronizing ledger...</div>
      ) : (
        <table className="w-full text-left text-white/90">
          <thead>
            <tr className="border-b border-white/20">
              <th className="p-2">Reason</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Type</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.$id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-2">{t.reason || 'N/A'}</td>
                <td className={`p-2 font-mono ${t.type === 'credit' ? 'text-patina-green' : 'text-imperial-purple'}`}>
                  {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                </td>
                <td className="p-2 capitalize">{t.type}</td>
                <td className="p-2 text-white/50">{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </GlassPane>
  );
};
