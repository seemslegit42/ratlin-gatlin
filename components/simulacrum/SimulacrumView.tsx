
/**
 * @file components/simulacrum/SimulacrumView.tsx
 * @description The live visualization of the agent swarm. Implement the 'Glasshouse Protocol'.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '../../types';
import SimulacrumEntity from './SimulacrumEntity';
import SimulacrumBackground from './SimulacrumBackground';
import TetherLayer from './TetherLayer';
import { DirectorTray } from './DirectorTray';

interface SimulacrumViewProps {
    agents: Record<string, Agent>;
    onSelectAgent: (agent: Agent) => void;
    selectedAgent: Agent | null;
}

const SimulacrumView: React.FC<SimulacrumViewProps> = ({ agents, onSelectAgent, selectedAgent }) => {
    const [selectedRoom, setSelectedRoom] = useState<string>('Ant-Farm');

    const agentList = useMemo(() => Object.values(agents) as Agent[], [agents]);

    return (
        <div className="h-full w-full relative overflow-hidden bg-obsidian-black flex high-density">
            <SimulacrumBackground />
            
            {/* Main Visual Substrate */}
            <div className="flex-grow relative">
                <div className="absolute top-4 right-4 z-40">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/5">
                        Sector: {selectedRoom}
                    </span>
                </div>

                {/* 2.5D Ant-Farm View */}
                <div className="absolute inset-0 flex items-center justify-center perspective-[1000px]">
                    <div className="relative w-[1200px] h-[800px] transform-gpu rotate-x-[30deg] border border-white/5 rounded-[4rem] bg-black/20 shadow-2xl overflow-hidden">
                        
                        {/* Floor Circuit Traces */}
                        <svg className="absolute inset-0 w-full h-full opacity-10">
                            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1"/>
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {/* Animated Trace Lines */}
                            <path className="ant-farm-line" d="M 0 400 L 1200 400" stroke="var(--roman-aqua)" strokeWidth="2" fill="none" />
                            <path className="ant-farm-line" d="M 600 0 L 600 800" stroke="var(--patina-green)" strokeWidth="2" fill="none" />
                        </svg>

                        {/* Agents as Luminaries */}
                        <div className="absolute inset-0">
                            {agentList.map(a => (
                                <SimulacrumEntity 
                                    key={a.id} 
                                    agent={a} 
                                    onSelect={onSelectAgent}
                                    isSelected={selectedAgent?.id === a.id}
                                />
                            ))}
                        </div>

                        <TetherLayer agents={agents} activeCommunications={[]} />
                    </div>
                </div>

                <DirectorTray />
            </div>
        </div>
    );
};

export default SimulacrumView;
