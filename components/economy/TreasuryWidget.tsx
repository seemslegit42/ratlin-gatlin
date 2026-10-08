

import React from 'react';
import { motion } from 'framer-motion';
import type { TreasuryTransaction } from '../../types';
import { TreasuryIcon } from '../icons/EconomyIcons';

interface TreasuryWidgetProps {
    balance: number;
    transactions: TreasuryTransaction[];
}

const TransactionRow: React.FC<{ transaction: TreasuryTransaction, index: number }> = ({ transaction, index }) => {
    const isAccrual = transaction.type === 'accrual';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0"
        >
            <div>
                <p className="text-sm text-vitreous-white">{transaction.description}</p>
                <p className="text-[10px] text-text-tertiary">{new Date(transaction.timestamp).toLocaleString()}</p>
            </div>
            <p className={`font-mono font-bold text-base ${isAccrual ? 'text-patina-green' : 'text-red-500'}`}>
                {isAccrual ? '+' : ''}{transaction.amount.toLocaleString()} $\Xi$
            </p>
        </motion.div>
    );
};

const TreasuryWidget: React.FC<TreasuryWidgetProps> = ({ balance, transactions }) => {
    return (
        <div className="bg-panel-bg backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-glass flex flex-col h-full">
            <div className="flex items-start space-x-4 mb-4">
                <div className="p-3 rounded-lg bg-yellow-400/20 text-yellow-400">
                    <TreasuryIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-comfortaa font-bold text-lg text-vitreous-white">Syndicate Treasury</h3>
                    <p className="text-3xl font-bold font-mono text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                        {balance.toLocaleString()} $\Xi$
                    </p>
                </div>
            </div>

            <div className="flex-grow flex flex-col overflow-hidden">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-2 mb-2 flex-shrink-0">Recent Activity</h4>
                <div className="flex-grow overflow-y-auto pr-2">
                    {transactions.length > 0 ? (
                        transactions.map((tx, i) => <TransactionRow key={tx.id} transaction={tx} index={i} />)
                    ) : (
                        <p className="text-sm text-text-tertiary text-center py-8">No recent treasury activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreasuryWidget;
