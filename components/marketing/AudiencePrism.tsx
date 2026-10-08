
/**
 * @file components/marketing/AudiencePrism.tsx
 * @description A high-fidelity visualization of customer segments (The Prism).
 * Displays cohorts by Value, Churn Risk, and Growth trajectory.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { BrainIcon } from '../icons/BrainIcon';

interface Segment {
    id: string;
    label: string;
    count: number;
    ltv: number;
    churnRisk: number; // 0-100
    growth: number; // %
    color: string;
    desc: string;
}

const SEGMENTS: Segment[] = [
    { id: 'whales', label: 'Enterprise Apex', count: 142, ltv: 12500, churnRisk: 12, growth: 15, color: 'from-purple-500 to-indigo-600', desc: "High-value, low-touch. Primary revenue drivers." },
    { id: 'early', label: 'Early Adopters', count: 2400, ltv: 850, churnRisk: 45, growth: 5, color: 'from-cyan-400 to-blue-500', desc: "Vocal, demanding, but evangelistic." },
    { id: 'mid', label: 'Core Mid-Market', count: 850, ltv: 3200, churnRisk: 25, growth: 32, color: 'from-emerald-400 to-teal-500', desc: "Stable growth engine. Optimization target." },
    { id: 'risk', label: 'At-Risk Cohort', count: 320, ltv: 600, churnRisk: 85, growth: -12, color: 'from-red-500 to-orange-500', desc: "Showing engagement decay. Requires intervention." },
];

export const AudiencePrism: React.FC = () => {
    return (
        <ModuleCard title="Audience Prism" icon={<BrainIcon className="w-5 h-5 text-roman-aqua" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Prism */}
                <div className="relative h-64 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
                    
                    {/* Simulated 3D Stack */}
                    <div className="relative w-40 h-40 transform-gpu rotate-x-12 rotate-y-12 transition-transform duration-700 group-hover:rotate-y-45">
                        {SEGMENTS.map((seg, i) => {
                            const size = 100 - (i * 20);
                            const zIndex = SEGMENTS.length - i;
                            return (
                                <motion.div
                                    key={seg.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.9 }}
                                    transition={{ delay: i * 0.1, type: "spring" }}
                                    className={`absolute inset-0 m-auto rounded-xl border border-white/20 bg-gradient-to-br ${seg.color} shadow-lg backdrop-blur-sm flex items-center justify-center`}
                                    style={{ 
                                        width: `${size}%`, 
                                        height: `${size}%`, 
                                        zIndex,
                                        transform: `translateZ(${i * 20}px) rotate(${i * 10}deg)` 
                                    }}
                                >
                                    <span className="text-[10px] font-bold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        {seg.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                    
                    <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-text-tertiary font-mono uppercase tracking-widest">
                        Total Souls: {SEGMENTS.reduce((a, b) => a + b.count, 0).toLocaleString()}
                    </div>
                </div>

                {/* Data Breakdown */}
                <div className="space-y-3 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                    {SEGMENTS.map(seg => (
                        <div key={seg.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group/card">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${seg.color}`} />
                                    <span className="text-xs font-bold text-white">{seg.label}</span>
                                </div>
                                <span className={`text-[10px] font-mono ${seg.growth > 0 ? 'text-patina-green' : 'text-red-400'}`}>
                                    {seg.growth > 0 ? '+' : ''}{seg.growth}%
                                </span>
                            </div>
                            
                            <p className="text-[10px] text-text-secondary leading-tight mb-3">
                                {seg.desc}
                            </p>

                            <div className="flex items-center gap-4 text-[10px] font-mono text-text-tertiary">
                                <div>LTV: <span className="text-white">${seg.ltv}</span></div>
                                <div>Risk: <span className={seg.churnRisk > 50 ? 'text-red-400' : 'text-patina-green'}>{seg.churnRisk}%</span></div>
                            </div>

                            {seg.churnRisk > 50 && (
                                <button className="mt-2 w-full py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase hover:bg-red-500/20 transition-colors opacity-0 group-hover/card:opacity-100">
                                    Trigger Retention Protocol
                                </button>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </ModuleCard>
    );
};
