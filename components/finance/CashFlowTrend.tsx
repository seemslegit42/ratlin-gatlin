
/**
 * @file components/finance/CashFlowTrend.tsx
 * @description A reusable component that displays a summary of the current cash flow trend.
 * It includes the total amount, percentage change, and a progress bar towards a target.
 */

import React from 'react';

/**
 * The CashFlowTrend component.
 * Provides a compact, at-a-glance view of key cash flow metrics.
 * 
 * @returns {React.FC} The rendered cash flow trend UI.
 */
export const CashFlowTrend: React.FC = () => {
    return (
        <div className="flex flex-col h-full justify-between">
            {/* Main metric and percentage change */}
            <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-mono font-bold text-vitreous-white">$1,245,000</span>
                <span className="text-xs text-patina-green font-bold bg-patina-green/10 px-2 py-1 rounded">+12.5%</span>
            </div>
            
            {/* Liquidity progress bar */}
            <div className="space-y-1">
                <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-text-tertiary font-mono uppercase">
                    <span>Liquidity</span>
                    <span>Target: 1.5M</span>
                </div>
            </div>
            
            {/* Runway calculation summary */}
            <p className="text-xs text-text-secondary mt-2">Runway: <span className="text-vitreous-white font-bold">14 Months</span> at current burn.</p>
        </div>
    );
};