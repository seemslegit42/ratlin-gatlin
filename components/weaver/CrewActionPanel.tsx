
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentStatus } from '../../types';
import { SaveIcon } from '../icons/SaveIcon'; 
import { PlayIcon } from '../icons/CommandPaletteIcons'; // Reusing Play Icon
import { CogIcon } from '../icons/AgentStatusIcons';

interface CrewActionPanelProps {
  selectedCount: number;
  onCreateCrew: () => void;
  onExitCrewMode: () => void;
  onDeleteSelected: () => void;
  onUpdateStatus: (status: AgentStatus) => void;
  onSaveAsTemplate: (name: string) => void;
  onRunSelection?: () => void; // New prop for running selected agents
}

const CrewActionPanel: React.FC<CrewActionPanelProps> = ({ 
    selectedCount, onCreateCrew, onExitCrewMode, onDeleteSelected, onUpdateStatus, onSaveAsTemplate, onRunSelection 
}) => {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSaveClick = () => {
      if (templateName.trim()) {
          onSaveAsTemplate(templateName);
          setShowSaveInput(false);
          setTemplateName('');
      }
  };

  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
      >
        {/* Toggle Handle */}
        <button 
            onClick={handleToggle}
            className="mb-2 bg-panel-bg/90 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-[9px] font-bold text-text-tertiary uppercase tracking-widest hover:text-white transition-colors shadow-lg"
        >
            {isExpanded ? 'Hide Controls' : 'Crew Ops'}
        </button>

        {isExpanded && (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="p-2 bg-panel-bg backdrop-blur-xl rounded-2xl shadow-glass shadow-glass-edge border border-glass-border flex items-center gap-2"
            >
                <div className="px-3 py-1 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-xs font-bold text-text-secondary whitespace-nowrap">
                    <span className="font-comfortaa text-sm text-white">{selectedCount}</span> Nodes
                    </p>
                </div>
                
                <div className="h-6 w-px bg-white/10" />

                {/* Primary Actions */}
                <button
                    onClick={onCreateCrew}
                    disabled={selectedCount < 2}
                    className="flex items-center space-x-1 px-3 py-2 bg-roman-aqua/10 text-roman-aqua hover:bg-roman-aqua/20 border border-roman-aqua/30 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Form a persistent Crew"
                >
                    <CogIcon className="w-3.5 h-3.5" />
                    <span>Bind</span>
                </button>

                <button
                    onClick={onRunSelection}
                    disabled={selectedCount === 0}
                    className="flex items-center space-x-1 px-3 py-2 bg-patina-green/10 text-patina-green hover:bg-patina-green/20 border border-patina-green/30 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Execute selected agents"
                >
                    <PlayIcon className="w-3.5 h-3.5" />
                    <span>Run</span>
                </button>

                {/* Status Actions */}
                <div className="flex bg-black/20 rounded-lg border border-white/5 p-0.5">
                    <button 
                        onClick={() => onUpdateStatus(AgentStatus.Idle)} 
                        disabled={selectedCount === 0} 
                        className="px-3 py-1.5 rounded-md hover:bg-white/10 text-[10px] font-bold text-text-secondary disabled:opacity-30 transition-colors uppercase" 
                        title="Reset to Idle"
                    >
                        Halt
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(AgentStatus.Running)} 
                        disabled={selectedCount === 0} 
                        className="px-3 py-1.5 rounded-md hover:bg-white/10 text-[10px] font-bold text-white disabled:opacity-30 transition-colors uppercase" 
                        title="Force Running State"
                    >
                        Active
                    </button>
                </div>
                
                <div className="h-6 w-px bg-white/10" />

                {/* Save Template Action */}
                <div className="relative">
                    {showSaveInput ? (
                        <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-0.5 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 shadow-xl">
                            <input 
                                type="text" 
                                value={templateName} 
                                onChange={(e) => setTemplateName(e.target.value)} 
                                className="bg-transparent text-xs text-white px-2 py-1 outline-none w-32" 
                                placeholder="Template Name..." 
                                autoFocus
                            />
                            <button onClick={handleSaveClick} className="px-2 py-1 text-xs font-bold bg-white/10 hover:bg-white/20 rounded">Save</button>
                            <button onClick={() => setShowSaveInput(false)} className="px-2 py-1 text-xs text-red-400 hover:text-red-300">✕</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowSaveInput(true)}
                            disabled={selectedCount === 0}
                            className="p-2 bg-white/5 text-text-tertiary hover:text-white border border-white/5 rounded-lg hover:border-white/20 transition-colors disabled:opacity-50"
                            title="Save Selection as Template"
                        >
                            <SaveIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={onDeleteSelected}
                    disabled={selectedCount === 0}
                    className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 font-bold rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500/20 transition-colors ml-2"
                    title="Delete Selected"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                <button onClick={onExitCrewMode} className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5" aria-label="Exit Selection Mode">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CrewActionPanel;
