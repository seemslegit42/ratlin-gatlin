
/**
 * @file components/marketing/MarketingOpsConsole.tsx
 * @description Provides a view into the operational backbone of marketing:
 * Budget utilization, Automation health, and Resource allocation.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ChartBarIcon } from '../icons/EconomyIcons';

const ProgressBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => {
    const percentage = Math.min(100, (value / max) * 100);
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-vitreous-white">{label}</span>
                <span className="font-mono text-text-secondary">${value.toLocaleString()} / ${max.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
};

const AutomationNode: React.FC<{ name: string; triggers: number; status: 'Active' | 'Paused' }> = ({ name, triggers, status }) => (
    <div className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
        <div>
            <div className="text-sm font-bold text-vitreous-white">{name}</div>
            <div className="text-[10px] text-text-tertiary">{triggers.toLocaleString()} triggers/day</div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${status === 'Active' ? 'text-patina-green border-patina-green/30 bg-patina-green/10' : 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'}`}>
            {status}
        </div>
    </div>
);

export const MarketingOpsConsole: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Budget Allocation */}
            <ModuleCard title="Resource Allocation" icon={<ChartBarIcon className="w-5 h-5 text-imperial-purple" />}>
                <div className="p-2">
                    <ProgressBar label="Q4 Global Ad Spend" value={42500} max={60000} color="bg-roman-aqua" />
                    <ProgressBar label="Content Production" value={12000} max={15000} color="bg-imperial-purple" />
                    <ProgressBar label="Tooling & SaaS" value={4800} max={5000} color="bg-pink-500" />
                    <ProgressBar label="Freelance Network" value={8500} max={20000} color="bg-patina-green" />
                    
                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-text-tertiary">Total Burn Rate</span>
                        <span className="text-lg font-mono font-bold text-vitreous-white">68%</span>
                    </div>
                </div>
            </ModuleCard>

            {/* Automation Health */}
            <ModuleCard title="Automation Neural Net">
                <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                    <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-text-secondary uppercase">Active Journeys</span>
                        <div className="w-2 h-2 bg-patina-green rounded-full animate-pulse shadow-[0_0_8px_currentColor]" />
                    </div>
                    <div>
                        <AutomationNode name="Nurture Sequence: Ent. Leads" triggers={452} status="Active" />
                        <AutomationNode name="Cart Abandonment (Sms)" triggers={128} status="Active" />
                        <AutomationNode name="Post-Purchase Upsell" triggers={89} status="Active" />
                        <AutomationNode name="Churn Prevention (Risk)" triggers={12} status="Paused" />
                    </div>
                </div>
                
                <div className="mt-4 flex items-center space-x-3 p-3 rounded-lg bg-imperial-purple/10 border border-imperial-purple/20">
                    <div className="p-2 bg-imperial-purple/20 rounded-full text-imperial-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-vitreous-white">System Efficiency</div>
                        <div className="text-[10px] text-text-tertiary">99.8% Uptime on Event Triggers</div>
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
};
