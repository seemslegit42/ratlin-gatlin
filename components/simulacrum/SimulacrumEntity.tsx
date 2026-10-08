
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '../../types';
import { AgentStatus } from '../../types';
import { getAgentAvatar, AGENT_STATUS_STYLES } from '../../utils/agent-visuals.js';

interface SimulacrumEntityProps {
    agent: Agent;
    onSelect: (agent: Agent) => void;
    isSelected: boolean;
    gossip?: string;
}

const Satellite: React.FC<{ 
    radius: number; 
    duration: number; 
    color: string; 
    size: number;
    delay: number;
}> = ({ radius, duration, color, size, delay }) => (
    <motion.div
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
            width: size,
            height: size,
            backgroundColor: color,
            boxShadow: `0 0 ${size * 2}px ${color}`,
            marginTop: -size / 2,
            marginLeft: -size / 2,
        }}
        animate={{
            x: [radius, -radius, radius],
            y: [0, radius / 2, 0, -radius / 2, 0],
            scale: [1, 1.3, 0.7, 1],
            zIndex: [0, 10, 0, -10, 0]
        }}
        transition={{
            duration: duration,
            ease: "linear",
            repeat: Infinity,
            delay: delay
        }}
    />
);

const DataRing: React.FC<{ size: number; color: string; duration: number }> = ({ size, color, duration }) => {
    return (
        <motion.div
            className="absolute top-1/2 left-1/2 rounded-full border border-current opacity-20"
            style={{
                width: size,
                height: size,
                marginTop: -size / 2,
                marginLeft: -size / 2,
                color: color,
                borderStyle: 'dashed',
                borderWidth: '1.5px',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: duration, ease: "linear", repeat: Infinity }}
        />
    );
};

const SimulacrumEntity: React.FC<SimulacrumEntityProps> = ({ agent, onSelect, isSelected, gossip }) => {
    const statusConfig = AGENT_STATUS_STYLES[agent.status] || AGENT_STATUS_STYLES[AgentStatus.Idle];
    const size = 80;
    const center = size / 2;
    const radius = 34;

    // Derived visual parameters from Agent Metrics
    const clarity = agent.metrics?.clarity || 50; 
    const celerity = agent.metrics?.celerity || 50; 

    // Visual paths for Moodlet Rings
    const jaggedPath = `
        M ${center + radius} ${center} 
        L ${center + radius - 6} ${center + 12} 
        L ${center + radius + 3} ${center + 24} 
        L ${center + 12} ${center + radius - 6} 
        L ${center} ${center + radius} 
        L ${center - 12} ${center + radius - 6} 
        L ${center - radius + 6} ${center + 24} 
        L ${center - radius} ${center} 
        L ${center - radius + 6} ${center - 24} 
        L ${center - 12} ${center - radius + 6} 
        L ${center} ${center - radius} 
        L ${center + 12} ${center - radius + 6} 
        L ${center + radius - 3} ${center - 24} 
        Z
    `;

    // Movement: Pacing logic if Cognitive load is high
    const isPacing = agent.needs.cognitive < 40;

    return (
        <motion.div
            className="absolute flex flex-col items-center justify-center cursor-pointer z-20 group"
            style={{
                left: agent.position.x,
                top: agent.position.y,
                width: size,
                height: size,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: isSelected ? 1.25 : 1, 
                opacity: 1,
                x: isPacing ? [0, 30, -30, 0] : 0
            }}
            transition={{
                x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                scale: { type: 'spring' }
            }}
            whileHover={{ scale: 1.15, zIndex: 60 }}
            onClick={() => onSelect(agent)}
        >
            {/* Gossip Bubble */}
            <AnimatePresence>
                {gossip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -65, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute left-1/2 -translate-x-1/2 w-64 pointer-events-none z-[100] bottom-full"
                    >
                        <div className="bg-obsidian-black/95 border border-glass-border p-4 rounded-xl shadow-2xl backdrop-blur-xl relative ring-1 ring-white/10">
                            <p className="text-[11px] font-mono text-roman-aqua leading-snug">
                                <span className="text-text-tertiary mr-1 font-bold">#</span>
                                {gossip}
                            </p>
                            <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-obsidian-black/95 border-b border-r border-glass-border transform -translate-x-1/2 rotate-45"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Orbitals - 4 Needs mapped to satellites */}
            {agent.needs && (
                <div className="absolute inset-0 pointer-events-none">
                    <Satellite radius={60} duration={Math.max(1, (2000 / celerity))} color="#6A0DAD" size={3 + (agent.needs.cognitive / 25)} delay={0} />
                    <Satellite radius={72} duration={Math.max(1, (3000 / celerity))} color="#20B2AA" size={3 + (agent.needs.data / 25)} delay={1} />
                    <Satellite radius={84} duration={Math.max(1, (4000 / celerity))} color="#3EB991" size={3 + (agent.needs.social / 25)} delay={2} />
                    <Satellite radius={96} duration={Math.max(1, (5000 / celerity))} color="#FFD700" size={3 + (agent.needs.integrity / 25)} delay={3} />
                </div>
            )}

            {/* Outer Data Ring */}
            <DataRing size={130} color={statusConfig.glowColor} duration={Math.max(1, 8000 / celerity)} />

            {/* The Entity Core */}
            <div className="relative w-full h-full">
                
                {/* Selection Reticle */}
                {isSelected && (
                    <motion.div
                        className="absolute inset-0 border-2 border-white/60 rounded-full"
                        animate={{ rotate: 90, scale: [1.1, 1.3, 1.1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                )}

                {/* Moodlet Ring (Procedural status visual) */}
                <motion.svg
                    className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_currentColor]"
                    style={{ color: statusConfig.glowColor, opacity: (clarity / 100) * (agent.needs.integrity / 100) }}
                    viewBox={`0 0 ${size} ${size}`}
                    animate={{ rotate: -360 }}
                    transition={{ duration: agent.status === 'Running' ? 10 : 60, repeat: Infinity, ease: "linear" }}
                >
                    {statusConfig.ringStyle === 'jagged' || agent.needs.integrity < 40 ? (
                        <path 
                            d={jaggedPath} 
                            stroke={statusConfig.glowColor} 
                            strokeWidth="2.5" 
                            fill="none"
                            className={agent.needs.integrity < 30 ? "animate-pulse" : ""}
                        />
                    ) : (
                        <circle 
                            cx={center} cy={center} r={radius} 
                            stroke={statusConfig.glowColor} 
                            strokeWidth="2.5" 
                            fill="none" 
                            strokeDasharray={statusConfig.ringStyle === 'dashed' ? "6 8" : statusConfig.ringStyle === 'dotted' ? "2 6" : "none"}
                            strokeLinecap="round"
                        />
                    )}
                </motion.svg>

                {/* Central Glyphs (The Shard) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        className={`w-14 h-14 rounded-full bg-obsidian-black flex items-center justify-center border-2 border-white/20 transition-all duration-500 z-10 shadow-2xl`}
                        style={{
                            opacity: agent.needs.integrity / 100,
                            boxShadow: isSelected 
                                ? `0 0 30px ${statusConfig.glowColor}60, inset 0 0 20px ${statusConfig.glowColor}30` 
                                : `inset 0 0 15px ${statusConfig.glowColor}20`
                        }}
                    >
                        <div className="transform scale-110" style={{ color: statusConfig.glowColor }}>
                            {getAgentAvatar(agent)}
                        </div>
                    </motion.div>
                </div>

                {/* Identity Tag (Visible on focus) */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-black/90 px-4 py-1.5 rounded-full border border-white/10 z-[70] shadow-2xl pointer-events-none"
                >
                    <span className="text-[11px] font-black font-comfortaa text-white whitespace-nowrap tracking-widest uppercase">
                        {agent.name}
                    </span>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SimulacrumEntity;
