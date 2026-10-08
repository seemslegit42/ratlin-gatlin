
/**
 * @file components/procurement/PurchaseOrderList.tsx
 * @description Displays a list of recent purchase orders with their status.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import type { PurchaseOrder } from '../../types'; // New import

interface PurchaseOrderListProps {
  orders: PurchaseOrder[]; // Now receives orders as a prop
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({ orders }) => {
    return (
        <ModuleCard title="Active Purchase Orders">
            <div className="space-y-3">
                {orders.length === 0 ? (
                    <div className="text-center py-8 text-text-tertiary text-sm">No active purchase orders.</div>
                ) : (
                    orders.map((order, i) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors">
                            <div>
                                <div className="font-mono text-sm text-orange-400">{order.poNumber}</div>
                                <div className="text-xs text-text-secondary">{order.vendor}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-vitreous-white">${order.amount.toLocaleString()}</div>
                                <div className={`text-[10px] uppercase font-bold ${
                                    order.status === 'Approved' ? 'text-patina-green' :
                                    order.status === 'Pending' ? 'text-yellow-500' :
                                    order.status === 'Shipped' ? 'text-blue-400' :
                                    'text-text-tertiary'
                                }`}>{order.status}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ModuleCard>
    );
};
