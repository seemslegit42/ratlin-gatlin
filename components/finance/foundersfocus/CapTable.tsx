import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../../modules/shared/ModuleCard';
import { CoinsIcon } from '../../icons/EconomyIcons';
import { TrendingUpIcon } from '../../icons/VitalsIcons';

interface Stakeholder {
    id: string;
    name: string;
    shares: number;
    equity: number;
    type: 'Founder' | 'Investor' | 'Employee' | 'Advisor';
    color: string;
}

const mockStakeholders: Stakeholder[] = [
    { id: '1', name: 'Original Syndicate', shares: 5000000, equity: 50, type: 'Founder', color: '#EAB308' },
    { id: '2', name: 'Neo-Genesis Fund', shares: 2000000, equity: 20, type: 'Investor', color: '#F97316' },
    { id: '3', name: 'Agent Reserve Pool', shares: 1500000, equity: 15, type: 'Employee', color: '#3EB991' },
    { id: '4', name: 'Neural Seed LLC', shares: 1000000, equity: 10, type: 'Investor', color: '#20B2AA' },
    { id: '5', name: 'Advisory Council', shares: 500000, equity: 5, type: 'Advisor', color: '#6366F1' },
];

export const CapTable: React.FC = () => {
    const totalShares = mockStakeholders.reduce((sum, s) => sum + s.shares, 0);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
                <ModuleCard title="Capital Allocation Matrix" icon={<CoinsIcon className="w-5 h-5 text-yellow-500" />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Stakeholder</th>
                                    <th className="py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Shares</th>
                                    <th className="py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Equity %</th>
                                    <th className="py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockStakeholders.map((s) => (
                                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: s.color }} />
                                                <div>
                                                    <div className="text-sm font-bold text-white uppercase tracking-tighter">{s.name}</div>
                                                    <div className="text-[10px] text-text-tertiary">{s.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right font-mono text-sm text-text-secondary">
                                            {s.shares.toLocaleString()}
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${s.equity}%` }}
                                                        className="h-full"
                                                        style={{ backgroundColor: s.color }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-white">{s.equity}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="px-2 py-1 bg-patina-green/10 text-patina-green text-[8px] font-black rounded border border-patina-green/20">VESTED</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ModuleCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModuleCard title="Dilution Forecast" icon={<TrendingUpIcon className="w-5 h-5 text-orange-500" />}>
                        <div className="space-y-4 pt-2">
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                                <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Post-Series A Target</div>
                                <div className="text-xl font-bold text-white">$12.5M <span className="text-xs text-text-tertiary">@ $50M Valuation</span></div>
                            </div>
                            <p className="text-[11px] text-text-tertiary leading-relaxed">
                                Projected dilution for Founders: <span className="text-white font-bold">-12.5%</span>. 
                                Maintaining 20% Option Pool reserved for future core agents.
                            </p>
                        </div>
                    </ModuleCard>
                    
                    <ModuleCard title="Equity Velocity" icon={<div className="w-5 h-5 rounded-full border-2 border-roman-aqua border-t-transparent animate-spin" />}>
                        <div className="h-24 flex items-end gap-1 px-4">
                            {[40, 60, 45, 70, 85, 95, 80, 100].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="flex-1 bg-gradient-to-t from-roman-aqua/20 to-roman-aqua rounded-t-sm"
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between px-4 text-[8px] text-text-tertiary uppercase font-bold">
                            <span>Q1 2025</span>
                            <span>Projected Q4 2026</span>
                        </div>
                    </ModuleCard>
                </div>
            </div>

            <div className="space-y-6">
                <ModuleCard title="Share Structure" icon={null}>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[10px] text-text-tertiary uppercase font-bold">Total Authorized</span>
                            <span className="text-sm font-mono text-white">20,000,000</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[10px] text-text-tertiary uppercase font-bold">Total Issued</span>
                            <span className="text-sm font-mono text-white">10,000,000</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[10px] text-text-tertiary uppercase font-bold">Option Pool</span>
                            <span className="text-sm font-mono text-white">2,000,000</span>
                        </div>
                        
                        <div className="relative aspect-square w-full mt-4 bg-black/40 rounded-full border border-white/5 flex items-center justify-center overflow-hidden">
                            <svg className="w-4/5 h-4/5 -rotate-90" viewBox="0 0 100 100">
                                {mockStakeholders.map((s, i) => {
                                    const offset = mockStakeholders.slice(0, i).reduce((sum, prev) => sum + prev.equity, 0);
                                    return (
                                        <circle
                                            key={s.id}
                                            cx="50" cy="50" r="40"
                                            fill="transparent"
                                            stroke={s.color}
                                            strokeWidth="12"
                                            strokeDasharray={`${s.equity} 100`}
                                            strokeDashoffset={-offset}
                                            className="transition-all hover:stroke-white cursor-pointer"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Total Issued</span>
                                <span className="text-lg font-bold text-white">10M</span>
                            </div>
                        </div>
                    </div>
                </ModuleCard>
            </div>
        </div>
    );
};
