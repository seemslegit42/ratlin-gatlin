
import React from 'react';
import { motion } from 'framer-motion';
import type { Agent, GossipLogEntry } from '../../types';

interface TetherLayerProps {
    agents: Record<string, Agent>;
    activeCommunications: GossipLogEntry[];
}

const TetherLayer: React.FC<TetherLayerProps> = ({ agents, activeCommunications }) => {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
            <defs>
                <filter id="tether-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="tether-gradient" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#20B2AA" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#F5FFFA" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#20B2AA" stopOpacity="0.2" />
                </linearGradient>
                {/* Gradient for the Data Packet Tail */}
                <linearGradient id="packet-tail" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F5FFFA" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#6A0DAD" stopOpacity="0" />
                </linearGradient>
            </defs>

            {activeCommunications.map((comm) => {
                const source = agents[comm.sourceAgentId];
                const target = comm.targetAgentId ? agents[comm.targetAgentId] : null;

                if (!source || !target) return null;

                // Center of the agent glyphs (assuming 80px width/height from SimulacrumEntity)
                // Position is top-left, so center is +40, +40
                const sx = source.position.x + 40;
                const sy = source.position.y + 40;
                const tx = target.position.x + 40;
                const ty = target.position.y + 40;

                // Bezier Control Points for a nice curve
                const cx1 = sx + (tx - sx) / 2;
                const cy1 = sy - 50; // Curve upwards
                const cx2 = tx - (tx - sx) / 2;
                const cy2 = ty + 50; // Curve downwards

                const pathData = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
                const pathId = `tether-path-${comm.id}`;

                return (
                    <motion.g key={comm.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* The Tether Line */}
                        <path
                            id={pathId}
                            d={pathData}
                            fill="none"
                            stroke="url(#tether-gradient)"
                            strokeWidth="1.5"
                            filter="url(#tether-glow)"
                            strokeDasharray="5 5"
                        />
                        
                        {/* Data Packet: Encrypted Shard (Diamond Shape) */}
                        <g>
                            {/* Packet Body */}
                            <path 
                                d="M 0 0 L 6 3 L 0 6 L -6 3 Z" 
                                fill="#F5FFFA" 
                                filter="url(#tether-glow)"
                            >
                                <animateMotion 
                                    dur="1.2s" 
                                    repeatCount="indefinite" 
                                    rotate="auto"
                                    calcMode="spline"
                                    keyTimes="0;1"
                                    keySplines="0.42 0 0.58 1"
                                >
                                    <mpath href={`#${pathId}`} />
                                </animateMotion>
                            </path>
                            
                            {/* Packet Trail (Ghosting effect) */}
                            <circle r="2" fill="url(#packet-tail)">
                                 <animateMotion 
                                    dur="1.2s" 
                                    begin="-0.05s"
                                    repeatCount="indefinite" 
                                    rotate="auto"
                                    calcMode="spline"
                                    keyTimes="0;1"
                                    keySplines="0.42 0 0.58 1"
                                >
                                    <mpath href={`#${pathId}`} />
                                </animateMotion>
                            </circle>
                        </g>
                    </motion.g>
                );
            })}
        </svg>
    );
};

export default TetherLayer;
