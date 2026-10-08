
/**
 * @file components/marketing/CampaignWarRoom.tsx
 * @description The strategic core of the Marketing module. 
 * Combines high-level "Growth Helix" visualization with agentic task control.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { BrainIcon } from '../icons/BrainIcon';
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons';
import { ChartLineIcon } from '../icons/MarketingIcons';

const GrowthHelix: React.FC = () => {
    return (
        <div className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-black/40 rounded-xl border border-white/5 mb-6">
            <svg viewBox="0 0 800 200" className="w-full h-full">
                {[...Array(20)].map((_, i) => {
                    const x = (i / 19) * 800;
                    const sin = Math.sin(i * 0.5) * 40;
                    const cos = Math.cos(i * 0.5) * 40;
                    
                    return (
                        <g key={i}>
                            <motion.circle
                                cx={x}
                                cy={100 + sin}
                                r={2}
                                fill="#6A0DAD"
                                animate={{ cy: [100 + sin, 100 - sin, 100 + sin] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                            />
                            <motion.circle
                                cx={x}
                                cy={100 + cos}
                                r={2}
                                fill="#3EB991"
                                animate={{ cy: [100 + cos, 100 - cos, 100 + cos] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                            />
                            {i < 19 && (
                                <line 
                                    x1={x} y1={100 + sin} 
                                    x2={((i+1)/19)*800} y2={100 + Math.sin((i+1)*0.5)*40} 
                                    stroke="#6A0DAD" strokeOpacity="0.2" strokeWidth="1" 
                                />
                            )}
                        </g>
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-white tracking-tighter opacity-80">92.4%</span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-roman-aqua">Growth Coherence</span>
            </div>
        </div>
    );
};

const SovereignDirective: React.FC<{ title: string; agent: string; status: string; progress: number }> = ({ title, agent, status, progress }) => (
    <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between group hover:border-roman-aqua/30 transition-all">
        <div className="flex items-center space-x-4">
            <div className="p-2 bg-black/40 rounded-lg text-roman-aqua">
                <BrainIcon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-sm font-bold text-white">{title}</div>
                <div className="text-[10px] text-text-tertiary">Agent: <span className="text-patina-green">{agent}</span> • {status}</div>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="w-24 bg-black/40 h-1.5 rounded-full overflow-hidden hidden sm:block">
                <motion.div 
                    className="h-full bg-roman-aqua"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
            <button className="p-1.5 rounded bg-white/5 text-text-tertiary hover:text-white transition-colors">
                <ZapIcon className="w-3 h-3" />
            </button>
        </div>
    </div>
);

export const CampaignWarRoom: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ModuleCard title="Growth Engine Dynamics">
                        <p className="text-xs text-text-tertiary mb-4">Real-time simulation of acquisition velocity vs. retention pressure.</p>
                        <GrowthHelix />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <div className="text-lg font-bold text-white">4.2k</div>
                                <div className="text-[9px] uppercase text-text-tertiary tracking-wider">New Souls</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <div className="text-lg font-bold text-white">0.82%</div>
                                <div className="text-[9px] uppercase text-text-tertiary tracking-wider">Churn Drag</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-lg border border-patina-green/20">
                                <div className="text-lg font-bold text-patina-green">+$12k</div>
                                <div className="text-[9px] uppercase text-text-tertiary tracking-wider">Net Lift</div>
                            </div>
                        </div>
                    </ModuleCard>
                </div>
                
                <ModuleCard title="The Auditor's Gaze" icon={<ChartLineIcon className="w-5 h-5 text-red-400" />}>
                    <div className="space-y-4">
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                            <h4 className="text-xs font-bold text-red-400 uppercase mb-1">Efficiency Leak</h4>
                            <p className="text-[10px] text-text-secondary leading-relaxed">
                                LinkedIn CPM has spiked by 14%. Current CPL ($151) is exceeding the LTV threshold. 
                            </p>
                            <button className="mt-2 text-[9px] font-bold text-white underline hover:text-red-400 transition-colors">
                                Auto-Throttle Channel
                            </button>
                        </div>
                        <div className="p-3 bg-patina-green/5 border border-patina-green/20 rounded-lg">
                            <h4 className="text-xs font-bold text-patina-green uppercase mb-1">Yield Opportunity</h4>
                            <p className="text-[10px] text-text-secondary leading-relaxed">
                                Content "Synthetic Horizons" is showing a 2.4x virality coefficient on Reddit.
                            </p>
                            <button className="mt-2 text-[9px] font-bold text-white underline hover:text-patina-green transition-colors">
                                Reallocate Surplus Budget
                            </button>
                        </div>
                    </div>
                </ModuleCard>
            </div>

            <ModuleCard title="Sovereign Directives" action={<button className="text-[10px] font-bold text-roman-aqua hover:text-white uppercase tracking-widest">+ Summon Agent</button>}>
                <div className="space-y-2">
                    <SovereignDirective title="Global Sentiment Sweep" agent="Aetheria-9" status="Scanning X/Reddit" progress={65} />
                    <SovereignDirective title="Hyper-Personalized Outreach" agent="Hermes_v2" status="452/1000 Transmitted" progress={45} />
                    <SovereignDirective title="Synthetic Asset Generation" agent="Visual_Synth" status="Awaiting Approval" progress={100} />
                    <SovereignDirective title="SEO Topology Analysis" agent="Scout_Master" status="Indexing Dark Web" progress={12} />
                </div>
            </ModuleCard>
        </div>
    );
};
