import React from 'react';
import { motion } from 'framer-motion';
import { BrainIcon } from '../icons/BrainIcon';
import { TrendingUpIcon, ZapIcon } from '../icons/VitalsIcons';

interface SwarmHUDProps {
    agentCount: number;
    totalTethers: number;
    coherence: number; // 0-100
    entropy: number; // 0-100
}

const Metric: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className="flex flex-col items-end">
        <div className="flex items-center space-x-1 text-text-tertiary">
            <span className="text-[8px] md:text-[9px] uppercase tracking-widest">{label}</span>
            <div className="opacity-70" style={{ color }}>{icon}</div>
        </div>
        <div className="font-mono text-sm md:text-lg font-bold text-white leading-none mt-0.5">
            {value}
        </div>
    </div>
);

export const SwarmHUD: React.FC<SwarmHUDProps> = ({ agentCount, totalTethers, coherence, entropy }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-panel-bg/60 backdrop-blur-xl border border-glass-border rounded-xl p-3 md:p-4 shadow-glass z-40 flex items-center space-x-3 md:space-x-6 min-w-0 md:min-w-[300px] justify-between pointer-events-none"
        >
            <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                    <BrainIcon className="w-4 h-4 md:w-6 md:h-6 text-vitreous-white" />
                </div>
                <div className="hidden sm:block">
                    <h3 className="font-bold text-[10px] md:text-xs text-white uppercase tracking-wider">Swarm Net</h3>
                    <span className="text-[8px] md:text-[9px] font-mono text-patina-green">V.9.4</span>
                </div>
            </div>

            <div className="h-6 md:h-8 w-px bg-white/10" />

            <div className="flex space-x-3 md:space-x-6">
                <Metric 
                    label="Nodes" 
                    value={agentCount} 
                    icon={<div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-roman-aqua animate-pulse" />} 
                    color="#20B2AA" 
                />
                <Metric 
                    label="Entropy" 
                    value={`${entropy}%`} 
                    icon={<ZapIcon className="w-2 md:w-3 h-2 md:h-3" />} 
                    color="#FFD700" 
                />
                <Metric 
                    label="Flow" 
                    value={`${coherence}%`} 
                    icon={<TrendingUpIcon className="w-2 md:w-3 h-2 md:h-3" />} 
                    color="#3EB991" 
                />
            </div>
        </motion.div>
    );
};