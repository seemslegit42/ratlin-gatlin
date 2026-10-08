
/**
 * @file components/finance/foundersfocus/AlbertaGrants.tsx
 * @description Hyper-localized module for Regional Ecosystem Integration.
 * Tracks "In-Kind" contributions via calendar integration and monitors grant budget utilization.
 * Now integrated with the Financial Model via callbacks.
 */

import React, { useState, useEffect } from 'react';
import { ModuleCard } from '../../../modules/shared/ModuleCard';
import { motion, AnimatePresence } from 'framer-motion';

const GrantProgressBar: React.FC<{ name: string; used: number; total: number; color: string }> = ({ name, used, total, color }) => {
    const percentage = Math.min(100, (used / total) * 100);
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-vitreous-white">{name}</span>
                <span className="font-mono text-text-secondary">${used.toLocaleString()} / ${total.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
};

const REGIONAL_GRANTS: Record<string, any[]> = {
    'Alberta': [
        { name: "Digital Traction (Voucher)", used: 42500, total: 50000, color: "bg-patina-green", remaining: 7500 },
        { name: "Edmonton Edge Fund", used: 12000, total: 100000, color: "bg-roman-aqua", remaining: 88000 },
        { name: "ERIN Coaching", used: 4500, total: 5000, color: "bg-yellow-400", remaining: 500 }
    ],
    'BC': [
        { name: "Innovate BC Ignite", used: 25000, total: 300000, color: "bg-emerald-500", remaining: 275000 },
        { name: "PacificCan Scale Up", used: 0, total: 5000000, color: "bg-blue-500", remaining: 5000000 },
        { name: "Digital Supercluster", used: 15000, total: 150000, color: "bg-purple-500", remaining: 135000 }
    ],
    'Svalbard': [
        { name: "Svalbard Environmental Protection", used: 50000, total: 200000, color: "bg-cyan-300", remaining: 150000 },
        { name: "Arctic Resilience Fund", used: 10000, total: 50000, color: "bg-white", remaining: 40000 },
        { name: "Seed Vault Maintenance", used: 75000, total: 100000, color: "bg-gray-400", remaining: 25000 }
    ]
};

interface AlbertaGrantsProps {
    onUpdateFinancials?: (grants: number, inKind: number) => void;
}

export const AlbertaGrants: React.FC<AlbertaGrantsProps> = ({ onUpdateFinancials }) => {
    const [region, setRegion] = useState('Alberta');
    const [inKindValue, setInKindValue] = useState(24850);

    // Calculate totals and push to parent whenever region or values change
    useEffect(() => {
        if (onUpdateFinancials) {
            const activeGrants = REGIONAL_GRANTS[region] || [];
            // We assume "Remaining" is what's available to extend runway in the model
            const totalRemaining = activeGrants.reduce((acc, curr) => acc + curr.remaining, 0);
            
            onUpdateFinancials(totalRemaining, inKindValue);
        }
    }, [region, inKindValue, onUpdateFinancials]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Grant Watchdog */}
            <ModuleCard title="Ecosystem Watchdog" className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Active Funding Streams</h4>
                    <div className="flex space-x-2">
                        {Object.keys(REGIONAL_GRANTS).map(r => (
                            <button
                                key={r}
                                onClick={() => setRegion(r)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                                    region === r ? 'bg-white text-black' : 'bg-white/10 text-text-secondary hover:bg-white/20'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={region}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full"
                        >
                            {REGIONAL_GRANTS[region].map((grant) => (
                                <GrantProgressBar 
                                    key={grant.name} 
                                    name={grant.name} 
                                    used={grant.used} 
                                    total={grant.total} 
                                    color={grant.color} 
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col justify-center h-fit">
                        <div className="flex items-center space-x-2 mb-2 text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.242-1.21 2.878 0l5.394 10.332a1.5 1.5 0 01-1.306 2.268H4.17a1.5 1.5 0 01-1.306-2.268L8.257 3.099zM9 12a1 1 0 112 0 1 1 0 01-2 0zm1-4a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <span className="font-bold text-sm uppercase">Eligibility Alert</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Warning: Capital expenditure detected (MacBook Pro - $3,200). 
                            <br/><br/>
                            <span className="font-bold text-white">Rule Violation:</span> {region === 'Svalbard' ? 'Capital must be hardened for arctic conditions.' : 'General purpose hardware is ineligible under current voucher rules.'}
                            <br/><br/>
                            <span className="underline cursor-pointer hover:text-white">Re-allocate to 'Internal Funds'</span>
                        </p>
                    </div>
                </div>
            </ModuleCard>

            {/* In-Kind Tracker */}
            <ModuleCard title="In-Kind Contributions">
                <div className="flex flex-col h-full justify-between">
                    <div className="text-center py-4">
                        <div className="text-4xl font-mono font-bold text-vitreous-white">${inKindValue.toLocaleString()}</div>
                        <div className="text-[10px] uppercase text-text-tertiary tracking-widest mt-1">Total Sweat Equity (YTD)</div>
                    </div>
                    
                    <div className="space-y-2">
                        {/* Calendar Scraper Visual */}
                        <div className="bg-white/5 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
                                <span className="text-[10px] font-bold uppercase text-text-tertiary">Recent Calendar Sync</span>
                                <div className="flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 bg-patina-green rounded-full animate-pulse"/>
                                    <span className="text-[9px] text-patina-green">Live</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">24</div>
                                    <div>
                                        <div className="text-xs text-white">Deep Work: Strategy</div>
                                        <div className="text-[10px] text-text-tertiary">4 hrs • Founder Rate</div>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-patina-green">+$400</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">23</div>
                                    <div>
                                        <div className="text-xs text-white">Client Meeting</div>
                                        <div className="text-[10px] text-text-tertiary">1.5 hrs • Sales</div>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-patina-green">+$150</span>
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>Sync Calendar</span>
                    </button>
                </div>
            </ModuleCard>

            {/* SR&ED Optimization */}
            <ModuleCard title="SR&ED Project Tags" className="lg:col-span-3">
                <div className="flex flex-wrap gap-3">
                    {['Algorithm Optimization', 'Latency Reduction Protocol', 'Novel AI Architecture'].map((tag, i) => (
                        <div key={i} className="flex items-center space-x-2 px-3 py-2 bg-imperial-purple/20 border border-imperial-purple/40 rounded-full">
                            <span className="w-2 h-2 bg-imperial-purple rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-white">{tag}</span>
                            <span className="text-[10px] text-text-tertiary ml-2 border-l border-white/10 pl-2">Eligible</span>
                        </div>
                    ))}
                    <button className="px-3 py-2 border border-dashed border-white/20 rounded-full text-xs text-text-secondary hover:text-white hover:border-white/40 transition-colors">
                        + New R&D Project
                    </button>
                </div>
                <div className="mt-4 p-3 bg-black/20 rounded border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Technical Note pending for "Algorithm Optimization".</span>
                    <button className="text-xs font-bold text-roman-aqua hover:underline">Write Entry</button>
                </div>
            </ModuleCard>
        </div>
    );
};
