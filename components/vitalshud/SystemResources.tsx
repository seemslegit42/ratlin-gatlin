
/**
 * @file components/vitalshud/SystemResources.tsx
 * @description Simulates and visualizes system resource usage (CPU/RAM) based on active Agent load.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GlassPane } from '../shared/GlassPane';
import type { Agent } from '../../types.js';
import type { AgentResourceSnapshot } from '../../utils/agentResourceMetrics.js';
import { computeAgentResourceMetrics } from '../../utils/agentResourceMetrics.js';

export interface SystemResourcesPanelProps {
    vitals: AgentResourceSnapshot;
}

interface SystemResourcesProps {
    agents?: Record<string, Agent>;
}

export const SystemResourcesPanel: React.FC<SystemResourcesPanelProps> = ({ vitals }) => {
    const cpu = vitals.cpuLoad;
    const mem = vitals.memLoad;

    return (
        <GlassPane 
            variant="default"
            className="min-w-[85vw] md:min-w-0 snap-center md:col-span-2 p-2.5 relative overflow-hidden flex flex-col justify-between min-h-[105px]"
        >
            <div className="flex justify-between items-start mb-1">
                <h3 className="font-comfortaa font-bold text-xs text-vitreous-white/90">SYS RESOURCES</h3>
                <span className="text-[8px] font-mono text-text-tertiary">LOCAL</span>
            </div>
            
            <div className="space-y-2.5">
                {/* CPU */}
                <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] uppercase font-bold text-text-secondary">
                        <span>Neural Load</span>
                        <span className={cpu > 80 ? 'text-red-500' : 'text-roman-aqua'}>{cpu.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            animate={{ width: `${cpu}%` }}
                            transition={{ type: 'spring', stiffness: 50 }}
                            className={`h-full rounded-full`}
                            style={{ backgroundColor: cpu > 80 ? 'var(--red-500)' : 'var(--roman-aqua)', boxShadow: cpu > 80 ? '0_0_8px_rgba(239,68,68,0.5)' : '0_0_6px_rgba(32,178,170,0.5)' }}
                        />
                    </div>
                </div>
                {/* RAM */}
                <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] uppercase font-bold text-text-secondary">
                        <span>Ctx Memory</span>
                        <span className="text-imperial-purple">{mem.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            animate={{ width: `${mem}%` }}
                            transition={{ type: 'spring', stiffness: 50 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: 'var(--imperial-purple)', boxShadow: '0_0_6px_rgba(106,13,173,0.5)' }}
                        />
                    </div>
                </div>
            </div>
        </GlassPane>
    );
};

const SystemResources: React.FC<SystemResourcesProps> = ({ agents = {} }) => {
    const vitals = computeAgentResourceMetrics(agents);
    return <SystemResourcesPanel vitals={vitals} />;
};

export default SystemResources;
