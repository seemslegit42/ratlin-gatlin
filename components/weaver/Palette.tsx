
import React from 'react';
import { motion } from 'framer-motion';
import { AgentType } from '../../types.js';
import { AGENT_ICONS, AGENT_TOOLTIPS, AGENT_DESCRIPTIONS } from '../../utils/agent-visuals.js';

const AGENT_TYPES_TO_ADD = [
    AgentType.Input, 
    AgentType.CronTrigger,
    AgentType.CognitiveCore, 
    AgentType.KnowledgeRetrieval,
    AgentType.DataTransformer, 
    AgentType.Condition,
    AgentType.Router,
    AgentType.CodeExecution,
    AgentType.ApiCall, 
    AgentType.ImageGeneration,
    AgentType.EmailAction,
    AgentType.Output
];

interface PaletteProps {
  position: { x: number; y: number };
  onAddAgent: (type: AgentType) => void;
  onClose: () => void;
}

const Palette: React.FC<PaletteProps> = ({ position, onAddAgent, onClose }) => {
    return (
        <>
            {/* High Z-Index Backdrop */}
            <div className="fixed inset-0 z-[90]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="fixed z-[100] grid grid-cols-4 gap-2 p-3 rounded-xl bg-obsidian-black/95 backdrop-blur-xl shadow-2xl border border-white/20 ring-1 ring-black"
                style={{
                    top: Math.min(window.innerHeight - 200, Math.max(100, position.y)), // Boundary checks
                    left: Math.min(window.innerWidth - 200, Math.max(100, position.x)),
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="col-span-4 text-center pb-2 mb-2 border-b border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Select Protocol</span>
                </div>

                {AGENT_TYPES_TO_ADD.map(type => (
                    <button
                        key={type}
                        onClick={() => onAddAgent(type)}
                        className="group relative p-3 rounded-lg text-text-secondary hover:bg-white/10 hover:text-white transition-all flex justify-center items-center bg-white/5 border border-transparent hover:border-white/10"
                    >
                        {AGENT_ICONS[type]}
                        
                        {/* Enhanced Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-1 z-[110]">
                            <span className="font-bold text-patina-green text-xs uppercase tracking-wider text-center">{AGENT_TOOLTIPS[type] || type}</span>
                            <div className="w-full h-px bg-white/10 my-1" />
                            <span className="text-white/80 text-[10px] leading-relaxed text-left font-lexend">{AGENT_DESCRIPTIONS[type]}</span>
                            {/* Arrow */}
                            <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-black/95 border-b border-r border-white/20 transform -translate-x-1/2 rotate-45"></div>
                        </div>
                    </button>
                ))}
            </motion.div>
        </>
    );
};

export default Palette;
