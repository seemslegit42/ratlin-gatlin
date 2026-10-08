
/**
 * @file components/finance/TaxVaultStatus.tsx
 * @description Visualizes the status of the automated tax vault and compliance checks.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { TreasuryIcon } from '../icons/EconomyIcons';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

export const TaxVaultStatus: React.FC = () => {
    return (
        <ModuleCard title="Tax Vault" icon={<TreasuryIcon className="w-6 h-6 text-roman-aqua"/>}>
            <div className="flex flex-col items-center justify-center h-full p-2">
                <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full border-4 border-roman-aqua/30 flex items-center justify-center animate-pulse-slow">
                        <ShieldCheckIcon className="w-10 h-10 text-roman-aqua" />
                    </div>
                    <div className="absolute top-0 right-0 w-6 h-6 bg-patina-green rounded-full flex items-center justify-center border-2 border-black">
                        <svg className="w-3 h-3 text-black font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                </div>
                
                <div className="text-3xl font-bold text-roman-aqua mb-1">SAFE</div>
                <p className="text-xs text-text-secondary text-center mb-4">
                    Automated 18% Tithe Allocation Active.<br/>
                    <span className="text-text-tertiary">Next audit cycle: 14 days.</span>
                </p>
                
                <button className="w-full px-4 py-2 bg-roman-aqua/10 hover:bg-roman-aqua/20 border border-roman-aqua/30 text-roman-aqua rounded-lg text-xs font-bold transition-all">
                    Generate Compliance Report
                </button>
            </div>
        </ModuleCard>
    );
};
