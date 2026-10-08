
/**
 * @file components/admin/ConstitutionManager.tsx
 * @description The "Ethical Anchor" interface for Project Magenta Ki.
 * Displays the normative principles governing agentic behavior.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import type { ConstitutionalPrinciple } from '../../types';

const PRINCIPLES: ConstitutionalPrinciple[] = [
    {
        id: 'autonomy',
        title: 'User Autonomy',
        mandate: 'Respect the user\'s right to independent decisions without coercion.',
        governedBehaviors: ['No high-pressure tactics', 'Clear labeling of persuasive intent', 'Universal opt-out enforcement'],
        riskMitigated: 'Dark patterns; Loss of user trust',
        status: 'ENFORCED'
    },
    {
        id: 'benefit',
        title: 'Beneficial Persuasion',
        mandate: 'Persuade only toward actions aligned with user-stated long-term goals.',
        governedBehaviors: ['Cross-reference against episodic memory', 'Prioritize LTV over short-term churn'],
        riskMitigated: 'Perceived selfishness; Irrelevant upselling',
        status: 'ENFORCED'
    },
    {
        id: 'transparency',
        title: 'Transparent Reasoning',
        mandate: 'Explain the logical basis for recommendations in simple terms.',
        governedBehaviors: ['Expose reasoning chains', 'Identify data influences'],
        riskMitigated: 'Black-box anxiety; Audit failure',
        status: 'AUDITING'
    },
    {
        id: 'accuracy',
        title: 'Factual Accuracy',
        mandate: 'Prioritize verifiable truth and ground all claims in semantic memory.',
        governedBehaviors: ['Symbolic fact-checking', 'Hallucination mitigation'],
        riskMitigated: 'Misinformation; Legal liability',
        status: 'ENFORCED'
    }
];

export const ConstitutionManager: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-8 bg-panel-bg/40 border border-imperial-purple/30 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-imperial-purple to-roman-aqua" />
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 rounded-2xl bg-imperial-purple/20 border border-imperial-purple/40 shadow-[0_0_20px_rgba(106,13,173,0.3)]">
                        <ShieldCheckIcon className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold font-comfortaa text-white mb-2">The Chimera Constitution</h2>
                        <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                            The ethical framework governing Project Magenta Ki. These principles are not suggestions; they are the fixed parameters within which the Sentient Core operates. Every agent action is audited against this document via Reinforcement Learning from AI Feedback (RLAIF).
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PRINCIPLES.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <ModuleCard 
                            title={p.title} 
                            action={
                                <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${
                                    p.status === 'ENFORCED' ? 'bg-patina-green/10 border-patina-green/30 text-patina-green' : 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                                }`}>
                                    {p.status}
                                </span>
                            }
                        >
                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 italic text-sm text-vitreous-white">
                                    "{p.mandate}"
                                </div>
                                
                                <div>
                                    <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2">Governed Behaviors</h4>
                                    <ul className="space-y-1.5">
                                        {p.governedBehaviors.map((b, idx) => (
                                            <li key={idx} className="text-xs text-text-secondary flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-roman-aqua" />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-3 border-t border-white/5">
                                    <span className="text-[10px] font-bold text-text-tertiary uppercase">Risk Mitigation:</span>
                                    <p className="text-[10px] text-red-400/70 mt-0.5">{p.riskMitigated}</p>
                                </div>
                            </div>
                        </ModuleCard>
                    </motion.div>
                ))}
            </div>

            <ModuleCard title="Alignment Telemetry">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-4">
                    <div className="text-center md:text-left">
                        <div className="text-4xl font-mono font-bold text-patina-green">99.98%</div>
                        <div className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] mt-1">Constitutional Adherence</div>
                    </div>
                    <div className="flex-grow max-w-md w-full">
                        <div className="flex justify-between text-[10px] text-text-secondary uppercase mb-1">
                            <span>Audit Velocity (RLAIF)</span>
                            <span className="text-roman-aqua">High-Frequency</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                className="h-full bg-roman-aqua" 
                                animate={{ width: ['40%', '90%', '60%', '100%', '80%'] }} 
                                transition={{ duration: 5, repeat: Infinity }}
                            />
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                        View Audit Log
                    </button>
                </div>
            </ModuleCard>
        </div>
    );
};
