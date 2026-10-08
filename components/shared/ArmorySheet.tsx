/**
 * @file components/shared/ArmorySheet.tsx
 * @description A side sheet for browsing available Agent archetypes (templates) and tools.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentType } from '../../types';
import { AGENT_ICONS, AGENT_DESCRIPTIONS } from '../../utils/agent-visuals';

interface ArmorySheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAgent: (type: AgentType) => void;
}

const ArmorySheet: React.FC<ArmorySheetProps> = ({ isOpen, onClose, onSelectAgent }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" 
                        onClick={onClose} 
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-panel-bg/95 backdrop-blur-2xl border-l border-glass-border shadow-2xl z-50 flex flex-col"
                    >
                        <header className="p-4 border-b border-white/10 flex justify-between items-center">
                            <div>
                                <h2 className="font-comfortaa text-lg text-vitreous-white">The Armory</h2>
                                <p className="text-xs text-text-tertiary font-mono uppercase">Protocol Selection</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-text-tertiary hover:text-white">✕</button>
                        </header>

                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {/* Fix: Cast Object.values to AgentType array */}
                            {(Object.values(AgentType) as AgentType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => { onSelectAgent(type); onClose(); }}
                                    className="w-full flex items-start space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-patina-green/30 transition-all text-left group"
                                >
                                    <div className="p-2 rounded-lg bg-black/20 text-patina-green group-hover:scale-110 transition-transform">
                                        {AGENT_ICONS[type]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-vitreous-white group-hover:text-patina-green transition-colors">{type}</h3>
                                        <p className="text-[10px] text-text-secondary mt-1 leading-tight">
                                            {AGENT_DESCRIPTIONS[type]}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ArmorySheet;
