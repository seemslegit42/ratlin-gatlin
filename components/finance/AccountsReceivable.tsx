
/**
 * @file components/finance/AccountsReceivable.tsx
 * @description Displays a list of outstanding invoices with aging details and actions.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ChartBarIcon } from '../icons/EconomyIcons';

export const AccountsReceivable: React.FC = () => {
    const invoices = [
        { client: 'Corp X', id: 'Inv #001', amount: '$12,000', due: '2 days ago', status: 'Overdue' },
        { client: 'Syndicate Alpha', id: 'Inv #042', amount: '$4,500', due: 'In 5 days', status: 'Pending' },
        { client: 'Nexus Tech', id: 'Inv #101', amount: '$8,250', due: 'In 12 days', status: 'Pending' },
    ];

    return (
        <ModuleCard title="Accounts Receivable" icon={<ChartBarIcon className="w-6 h-6 text-patina-green"/>}>
            <div className="space-y-3">
                {invoices.map((inv, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-2 rounded transition-colors group">
                        <div>
                            <div className="text-vitreous-white font-bold">{inv.client}</div>
                            <div className="text-[10px] text-text-tertiary flex items-center gap-2">
                                <span className="font-mono text-roman-aqua">{inv.id}</span>
                                <span>•</span>
                                <span className={inv.status === 'Overdue' ? 'text-red-400' : 'text-text-secondary'}>{inv.due}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-mono text-vitreous-white">{inv.amount}</div>
                            <button className="text-[10px] text-patina-green hover:text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-wider">
                                Remind
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ModuleCard>
    );
};
