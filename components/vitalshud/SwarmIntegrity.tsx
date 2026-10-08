
/**
 * @file components/vitalshud/SwarmIntegrity.tsx
 * @description Visualizes the health and status of the agent swarm.
 * Enhanced for Swarm Dynamics: Coherence & Pheromone tracking.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { Agent, View } from '../../types.js';
import { CheckCircleIcon, ExclamationIcon, CogIcon, PowerIcon } from '../icons/AgentStatusIcons';
import { GlassPane } from '../shared/GlassPane';
import type { SwarmVitalsSnapshot } from '../../hooks/useSwarmVitals.js';
import { useSwarmVitals } from '../../hooks/useSwarmVitals.js';

export interface SwarmIntegrityPanelProps {
    vitals: SwarmVitalsSnapshot;
    onNavigate: (view: View) => void;
}

interface SwarmIntegrityProps {
    agents: Record<string, Agent>;
    onNavigate: (view: View) => void;
}

// Helper to resolve CSS variables to RGBA for boxShadow (for JIT compatibility)
const getShadowRgbaForStatus = (colorVar: string, opacity: number = 0.6): string => {
    switch (colorVar) {
        case 'var(--patina-green)': return `rgba(62, 185, 145, ${opacity})`;
        case 'var(--roman-aqua)': return `rgba(32, 178, 170, ${opacity})`;
        case 'var(--yellow-400)': return `rgba(250, 204, 21, ${opacity})`;
        case 'var(--text-tertiary)': return `rgba(113, 128, 150, ${opacity})`; 
        default: return `rgba(255, 255, 255, ${opacity})`; 
    }
};

const StatusPillar: React.FC<{ label: string; count: number; color: string; icon: React.ReactNode; total: number }> = ({ label, count, color, icon, total }) => {
    const heightPercent = total > 0 ? Math.max(15, (count / total) * 100) : 15;
    const shadowRgba = getShadowRgbaForStatus(color);

    return (
        <div className="flex flex-col items-center group cursor-default space-y-1 flex-1">
            <div className="relative w-full max-w-[2.5rem] h-12 bg-white/5 rounded border border-white/5 overflow-hidden flex items-end justify-center pb-0.5 shadow-inner">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.1) 50%)', backgroundSize: '100% 3px' }}></div>
                <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="w-full mx-0.5 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${shadowRgba}` }}
                />
                <span className="absolute bottom-0.5 text-[9px] font-bold text-white drop-shadow-md">{count}</span>
            </div>
            <div className="flex items-center space-x-0.5 text-[7px] uppercase tracking-wider text-text-secondary">
                <span style={{ color }}>{icon}</span>
                <span className="hidden xl:inline">{label}</span>
            </div>
        </div>
    );
};

export const SwarmIntegrityPanel: React.FC<SwarmIntegrityPanelProps> = ({ vitals, onNavigate }) => {
    const { totalAgents, statusCounts, coherenceScore, densityLabel } = vitals;

    return (
        <GlassPane 
            variant="default"
            onClick={() => onNavigate('simulacrum')}
            className="min-w-[85vw] md:min-w-0 snap-center md:col-span-3 p-2.5 relative overflow-hidden group hover:border-white/20 transition-colors cursor-pointer flex flex-col justify-between min-h-[105px]"
        >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-patina-green via-roman-aqua to-transparent opacity-30 group-hover:opacity-60 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-1.5">
                <div>
                    <h3 className="font-comfortaa font-bold text-xs text-vitreous-white flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-patina-green rounded-full animate-pulse"></span>
                        <span>SWARM INTEGRITY</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                         <div className="flex items-center gap-0.5">
                             <span className="text-[7px] text-text-tertiary uppercase">Coherence</span>
                             <span className="text-[9px] font-mono font-bold text-roman-aqua">{coherenceScore.toFixed(1)}%</span>
                         </div>
                         <div className="flex items-center gap-0.5">
                             <span className="text-[7px] text-text-tertiary uppercase">Density</span>
                             <span className="text-[9px] font-mono font-bold text-patina-green">{densityLabel}</span>
                         </div>
                    </div>
                </div>
                <span className="text-[9px] font-mono text-text-tertiary tracking-widest">ACT:{totalAgents}</span>
            </div>
            
            <div className="flex justify-between items-end px-0.5 gap-1.5">
                <StatusPillar label="OK" count={statusCounts.operational} total={totalAgents} color="var(--patina-green)" icon={<CheckCircleIcon className="w-2.5 h-2.5"/>} />
                <StatusPillar label="BUSY" count={statusCounts.processing} total={totalAgents} color="var(--roman-aqua)" icon={<CogIcon className="w-2.5 h-2.5"/>} />
                <StatusPillar label="WARN" count={statusCounts.warning} total={totalAgents} color="var(--yellow-400)" icon={<ExclamationIcon className="w-2.5 h-2.5"/>} />
                <StatusPillar label="OFF" count={statusCounts.offline} total={totalAgents} color="var(--text-tertiary)" icon={<PowerIcon className="w-2.5 h-2.5"/>} />
            </div>
        </GlassPane>
    );
};

const SwarmIntegrity: React.FC<SwarmIntegrityProps> = ({ agents, onNavigate }) => {
    const vitals = useSwarmVitals(agents);
    return <SwarmIntegrityPanel vitals={vitals} onNavigate={onNavigate} />;
};

export default SwarmIntegrity;
