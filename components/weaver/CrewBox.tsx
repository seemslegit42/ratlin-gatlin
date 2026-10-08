
/**
 * @file components/weaver/CrewBox.tsx
 * @description Renders a visual bounding box around a group of agents (a "crew") in Weaver Studio.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, Crew } from '../../types';
import { PlayIcon } from '../icons/CommandPaletteIcons';
import { CogIcon } from '../icons/AgentStatusIcons';

/**
 * Props for the CrewBox component.
 */
interface CrewBoxProps {
  /** The data for the crew. */
  crew: Crew;
  /** A record of all agents in the system. */
  agents: Record<string, Agent>;
  /** Callback to run the crew. */
  onRunCrew?: (crewId: string) => void;
  /** Callback to edit the crew. */
  onEditCrew?: (crewId: string) => void;
}

const CrewBox: React.FC<CrewBoxProps> = ({ crew, agents, onRunCrew, onEditCrew }) => {
  const [isHovered, setIsHovered] = useState(false);
  const crewAgents = crew.agentIds.map(id => agents[id]).filter(Boolean);

  if (crewAgents.length === 0) {
    return null;
  }

  const padding = 40;
  const nodeWidth = 256; 
  const nodeHeight = 112; 

  const minX = Math.min(...crewAgents.map(a => a.position.x)) - padding;
  const minY = Math.min(...crewAgents.map(a => a.position.y)) - padding;
  const maxX = Math.max(...crewAgents.map(a => a.position.x + nodeWidth)) + padding;
  const maxY = Math.max(...crewAgents.map(a => a.position.y + nodeHeight)) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute rounded-3xl border-2 pointer-events-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: minX,
        top: minY,
        width,
        height,
        borderColor: `${crew.color}40`,
        backgroundColor: `${crew.color}05`,
        boxShadow: isHovered ? `0 0 40px ${crew.color}15, inset 0 0 20px ${crew.color}05` : `0 0 32px ${crew.color}10, inset 0 0 16px ${crew.color}05`
      }}
    >
        {/* Crew Header & Actions */}
        <div 
            className="absolute -top-4 left-8 flex items-center gap-2 pointer-events-auto"
        >
            <div 
                className="px-4 py-1.5 text-[11px] font-bold rounded-full border-2 bg-obsidian-black flex items-center gap-2 shadow-xl ring-1 ring-white/10"
                style={{
                    color: crew.color,
                    borderColor: `${crew.color}80`
                }}
            >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: crew.color }} />
                <span className="uppercase tracking-widest">{crew.name}</span>
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-xl"
                    >
                        <button 
                            onClick={() => onRunCrew?.(crew.id)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-patina-green transition-colors"
                            title="Execute Coordinated Action"
                        >
                            <PlayIcon className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => onEditCrew?.(crew.id)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-text-tertiary hover:text-white transition-colors"
                            title="Configure Crew Protocol"
                        >
                            <CogIcon className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Objective Hint (Visible on hover) */}
        <AnimatePresence>
            {isHovered && crew.description && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-6 right-6 p-3 bg-black/60 backdrop-blur-md border border-white/5 rounded-xl pointer-events-auto"
                >
                    <span className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest block mb-1">Directives:</span>
                    <p className="text-[10px] text-white/80 leading-relaxed italic line-clamp-2">
                        "{crew.description}"
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

export default CrewBox;
