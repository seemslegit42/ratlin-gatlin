
/**
 * @file components/weaver/ContextualAgentPalette.tsx
 * @description The "Architect's Apprentice" - A contextual menu that appears
 * when creating a new node from an existing one, suggesting logical next steps.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { AgentSuggestion } from '../../types';
import { AGENT_ICONS, AGENT_DESCRIPTIONS } from '../../utils/agent-visuals';
import { BrainIcon } from '../icons/BrainIcon';

interface ContextualAgentPaletteProps {
    suggestions: AgentSuggestion[];
    position: { x: number; y: number };
    onSelect: (suggestion: AgentSuggestion) => void;
    onClose: () => void;
}

const ContextualAgentPalette: React.FC<ContextualAgentPaletteProps> = ({ suggestions, position, onSelect, onClose }) => {
    return (
        <>
            {/* Backdrop to close */}
            <div className="fixed inset-0 z-[90]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="fixed z-[100] w-72 bg-obsidian-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 ring-1 ring-black/50 p-3"
                style={{
                    top: position.y,
                    left: position.x,
                    transform: 'translate(-50%, 20px)' // Position below cursor
                }}
            >
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/10">
                    <BrainIcon className="w-4 h-4 text-imperial-purple animate-pulse-slow" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                        Suggested Protocols
                    </h4>
                </div>

                <div className="space-y-2">
                    {suggestions.map((suggestion, i) => (
                        <motion.button
                            key={i}
                            onClick={() => onSelect(suggestion)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            className="w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors"
                        >
                            <div className="p-2 bg-black/40 rounded-lg text-roman-aqua border border-white/5">
                                {AGENT_ICONS[suggestion.type] || <BrainIcon className="w-5 h-5" />}
                            </div>
                            <div className="flex-grow">
                                <h5 className="font-bold text-sm text-white">{suggestion.name}</h5>
                                <p className="text-xs text-text-secondary leading-tight mt-1">
                                    {suggestion.description}
                                </p>
                            </div>
                        </motion.button>
                    ))}
                     <button
                        onClick={onClose}
                        className="w-full text-center mt-2 pt-2 border-t border-white/5 text-[10px] uppercase font-bold text-text-tertiary hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default ContextualAgentPalette;
