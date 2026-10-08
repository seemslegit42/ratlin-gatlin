
import React from 'react';
import { motion } from 'framer-motion';
import type { Agent, AgentMood } from '../types';
import { AgentStatus } from '../types';

interface SimulationLayerProps {
    agents: Record<string, Agent>;
}

const getMoodFromStatus = (status: AgentStatus): { mood: AgentMood, color: string, glow: string } => {
  switch (status) {
    case AgentStatus.OPERATIONAL:
    case AgentStatus.Success:
    case AgentStatus.Idle:
         return { mood: 'Ebullient', color: 'text-patina-green', glow: 'shadow-[0_0_8px_var(--patina-green)]' };
    case AgentStatus.COMPILING:
    case AgentStatus.Running:
    case AgentStatus.Pending:
        return { mood: 'Pensive', color: 'text-yellow-400', glow: 'shadow-[0_0_8px_#FACC15]' };
    case AgentStatus.DEGRADED:
    case AgentStatus.Error:
        return { mood: 'Faltering', color: 'text-orange-500', glow: 'shadow-[0_0_8px_#F97316]' };
    case AgentStatus.TERMINATED:
        return { mood: 'Dormant', color: 'text-text-tertiary', glow: '' };
    default: return { mood: 'Dormant', color: 'text-text-tertiary', glow: '' };
  }
}

const NeedBarMini: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => (
    <div className="flex items-center space-x-1.5">
        <span className="text-[7px] text-text-tertiary font-bold uppercase w-6">{label}</span>
        <div className="w-12 bg-black/30 rounded-full h-1.5 overflow-hidden">
            <motion.div
                className={`h-full rounded-full`}
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />
        </div>
    </div>
);


const AgentSimDisplay: React.FC<{ agent: Agent }> = ({ agent }) => {
    const { mood, color, glow } = getMoodFromStatus(agent.status);
    const { needs } = agent;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute p-3 w-48 rounded-lg bg-panel-bg/80 backdrop-blur-md border border-glass-border shadow-lg"
            style={{
                left: agent.position.x + 56, // Centered on agent node
                top: agent.position.y - 110, // Positioned above agent node
            }}
        >
            <div className={`text-center text-[10px] font-black rounded-md mb-2 py-0.5 uppercase tracking-widest ${color} ${glow}`}>
                {mood}
            </div>
            <div className="space-y-1.5">
                <NeedBarMini label="COG" value={needs.cognitive} color="var(--imperial-purple)" />
                <NeedBarMini label="DAT" value={needs.data} color="var(--roman-aqua)" />
                <NeedBarMini label="SOC" value={needs.social} color="var(--patina-green)" />
                <NeedBarMini label="INT" value={needs.integrity} color="var(--gilded-accent)" />
            </div>
             <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-panel-bg/80 border-b border-r border-glass-border transform -translate-x-1/2 rotate-45" />
        </motion.div>
    );
};


const SimulationLayer: React.FC<SimulationLayerProps> = ({ agents }) => {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {Object.values(agents).map((agent: Agent) => (
                <AgentSimDisplay key={`sim-${agent.id}`} agent={agent} />
            ))}
        </div>
    );
};

export default SimulationLayer;
