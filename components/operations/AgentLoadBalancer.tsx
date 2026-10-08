
/**
 * @file components/operations/AgentLoadBalancer.tsx
 * @description Visualizes the distribution of workload between autonomous agents and human operators.
 */

import React, { useMemo } from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { BrainIcon } from '../icons/BrainIcon';
import type { Agent } from '../../types';
import { AgentStatus } from '../../types';

interface AgentLoadBalancerProps {
    agents?: Record<string, Agent>;
}

export const AgentLoadBalancer: React.FC<AgentLoadBalancerProps> = ({ agents = {} }) => {
    const { agentCapacity, humanCapacity } = useMemo(() => {
        const agentList = Object.values(agents) as Agent[];
        const total = agentList.length;
        if (total === 0) return { agentCapacity: 0, humanCapacity: 10 }; // Default baseline

        const activeAgents = agentList.filter(a => 
            a.status === AgentStatus.Running || 
            a.status === AgentStatus.Pending || 
            a.status === AgentStatus.COMPILING
        ).length;

        // Calculate load percentage (e.g., if 50% agents are running, capacity usage is 50%)
        // Arbitrary scale: Assume each agent can handle 1 "unit" of work.
        const capacity = Math.round((activeAgents / total) * 100) || 5; // Min 5% for visual

        // Inverse relationship + random noise for human capacity (simulation)
        // If agents are busy, humans are likely supervising or handling edge cases
        const humanLoad = Math.max(5, Math.min(100, (100 - capacity) * 0.2 + 10));

        return { agentCapacity: capacity, humanCapacity: Math.round(humanLoad) };
    }, [agents]);

    return (
        <ModuleCard title="Cognitive Load" icon={<BrainIcon className="w-5 h-5 text-imperial-purple" />}>
            <div className="flex flex-col h-full justify-center space-y-4">
                {/* Agent Load */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-imperial-purple font-bold">Autonomous Agents</span>
                        <span className="text-vitreous-white font-mono">{agentCapacity}% Capacity</span>
                    </div>
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-imperial-purple shadow-[0_0_10px_rgba(106,13,173,0.5)] transition-all duration-1000 ease-out" 
                            style={{ width: `${agentCapacity}%` }}
                        />
                    </div>
                </div>

                {/* Human Load */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-roman-aqua font-bold">Human Operators</span>
                        <span className="text-vitreous-white font-mono">{humanCapacity}% Capacity</span>
                    </div>
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-roman-aqua transition-all duration-1000 ease-out"
                            style={{ width: `${humanCapacity}%` }}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-text-tertiary">
                        <span className="text-patina-green font-bold">OPTIMAL:</span> Agents are handling {agentCapacity > 50 ? 'peak' : 'baseline'} ops. Human attention reserved for strategic anomalies.
                    </p>
                </div>
            </div>
        </ModuleCard>
    );
};
