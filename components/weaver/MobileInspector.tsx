
import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import type { Agent } from '../../types';
import { AGENT_STATUS_STYLES, getAgentAvatar } from '../../utils/agent-visuals';
import { PlayIcon, TrashIcon } from '../icons/CommandPaletteIcons';
import { ChainIcon } from '../icons/ChainIcon';

interface MobileInspectorProps {
    agent: Agent;
    onUpdate: (updates: Partial<Agent>) => void;
    onDelete: () => void;
    onClose: () => void;
    onRun: () => void;
    onStartConnection: (agentId: string) => void;
}

const MobileInspector: React.FC<MobileInspectorProps> = ({ 
    agent, onUpdate, onDelete, onClose, onRun, onStartConnection 
}) => {
    const dragControls = useDragControls();
    const statusConfig = AGENT_STATUS_STYLES[agent.status];

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            
            <motion.div
                drag="y"
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-panel-bg border-t border-glass-border rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
            >
                {/* Handle */}
                <div 
                    className="w-full p-4 flex justify-center cursor-grab active:cursor-grabbing touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                <div className="px-6 pb-6 overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-white relative overflow-hidden"
                             style={{ color: statusConfig.glowColor }}>
                             {getAgentAvatar(agent)}
                             <div className={`absolute bottom-0 left-0 right-0 h-1 bg-${statusConfig.dot.split(' ')[0]}`} />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={agent.name}
                                onChange={(e) => onUpdate({ name: e.target.value })}
                                className="bg-transparent text-xl font-bold font-comfortaa text-white focus:outline-none w-full"
                            />
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                                <span className="text-xs font-mono text-text-tertiary uppercase tracking-widest">{agent.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <button 
                            onClick={onRun}
                            className="flex flex-col items-center justify-center p-3 bg-patina-green/10 border border-patina-green/30 rounded-xl text-patina-green hover:bg-patina-green/20 transition-colors"
                        >
                            <PlayIcon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold uppercase">Run</span>
                        </button>
                        <button 
                            onClick={() => onStartConnection(agent.id)}
                            className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                        >
                            <ChainIcon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold uppercase">Connect</span>
                        </button>
                        <button 
                            onClick={onDelete}
                            className="flex flex-col items-center justify-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 hover:bg-red-500/20 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold uppercase">Delete</span>
                        </button>
                    </div>

                    {/* Config Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Instructions</label>
                            <textarea
                                value={(agent.data.prompt as string) || agent.description || ''}
                                onChange={(e) => onUpdate({ data: { ...agent.data, prompt: e.target.value } })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white h-32 focus:border-roman-aqua outline-none resize-none"
                                placeholder="Define agent behavior..."
                            />
                        </div>
                        
                         <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Goals</label>
                            <div className="space-y-2">
                                {(agent.goals || []).map((goal, idx) => (
                                    <div key={idx} className="p-2 bg-white/5 rounded border border-white/5 text-xs text-text-secondary">
                                        {goal}
                                    </div>
                                ))}
                                <button 
                                    className="w-full py-2 border border-dashed border-white/20 rounded text-xs text-text-tertiary"
                                    onClick={() => onUpdate({ goals: [...(agent.goals || []), "New Goal"] })}
                                >
                                    + Add Goal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default MobileInspector;
