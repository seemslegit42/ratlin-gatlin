
/**
 * @file components/Loom.tsx
 * @description A visual component representing the "Loom of Fates" - the underlying
 * data fabric of the OS. Used in Admin views to visualize system health and connectivity.
 * Now driven by real-time agent state.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Agent, Connection } from '../types';
import { AgentStatus } from '../types';

interface LoomProps {
    agents?: Record<string, Agent>;
    connections?: Connection[];
}

const Thread: React.FC<{ index: number; agent?: Agent }> = ({ index, agent }) => {
    // Determine color and activity based on agent status
    const getStatusColor = (status?: AgentStatus) => {
        switch (status) {
            case AgentStatus.Running: return '#20B2AA'; // Roman Aqua
            case AgentStatus.Error: return '#EF4444'; // Red
            case AgentStatus.Success: return '#3EB991'; // Patina Green
            case AgentStatus.Pending: return '#FACC15'; // Yellow
            default: return '#6A0DAD'; // Imperial Purple (Idle/Default)
        }
    };

    const color = agent ? getStatusColor(agent.status) : '#6A0DAD';
    const duration = agent && agent.status === AgentStatus.Running ? 1 : 3 + Math.random() * 2;
    const opacity = agent ? (agent.status === AgentStatus.Idle ? 0.3 : 0.8) : 0.4;

    return (
        <motion.div
            className="absolute w-full h-[1px]"
            style={{ 
                top: `${(index + 1) * 4}%`, // Vertical spacing
                background: `linear-gradient(90deg, transparent, ${color}40, transparent)`
            }}
            animate={{
                opacity: [opacity * 0.5, opacity, opacity * 0.5],
                scaleX: [0.8, 1.2, 0.8],
                background: [
                    `linear-gradient(90deg, transparent, ${color}20, transparent)`,
                    `linear-gradient(90deg, transparent, ${color}60, transparent)`,
                    `linear-gradient(90deg, transparent, ${color}20, transparent)`
                ]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut"
            }}
        />
    );
};

const Loom: React.FC<LoomProps> = ({ agents, connections }) => {
    const agentList = useMemo(() => agents ? Object.values(agents) : [], [agents]);
    
    // Ensure we always show at least some threads for aesthetic purposes
    const threadCount = Math.max(15, agentList.length);
    const activeAgents = agentList.filter(a => a.status === AgentStatus.Running).length;

    return (
        <div className="relative w-full h-full min-h-[300px] overflow-hidden bg-black/40 rounded-xl border border-white/5">
            <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
                {Array.from({ length: threadCount }).map((_, i) => (
                    <Thread key={`thread-${i}`} index={i} agent={agentList[i]} />
                ))}
            </div>
            
            {/* Warp Lines representing structural integrity / connections */}
            <div className="absolute inset-0 flex flex-row justify-center pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={`warp-${i}`}
                        className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-roman-aqua/10 to-transparent"
                        style={{ left: `${i * 5}%` }}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            scaleY: [0.9, 1.1, 0.9],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </div>
            
            {/* Core Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-32 h-32 rounded-full blur-3xl transition-colors duration-1000 ${activeAgents > 0 ? 'bg-roman-aqua/10 animate-pulse' : 'bg-imperial-purple/5 animate-pulse-slow'}`}></div>
            </div>
            
            {/* Status Readout */}
            <div className="absolute bottom-4 right-4 text-right">
                <div className="text-[10px] font-mono text-text-tertiary">
                    LOOM_STATUS: {activeAgents > 0 ? 'ACTIVE_WEAVE' : 'IDLE'}
                </div>
                {agentList.length > 0 && (
                    <div className="text-[9px] font-mono text-text-secondary opacity-70">
                        NODES: {agentList.length} // LINKS: {connections?.length || 0}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Loom;
