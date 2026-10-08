
/**
 * @file components/MobileAddAgentSheet.tsx
 * @description A mobile-specific bottom sheet for adding new agents or instantiating them from saved templates
 * within the Weaver Studio. It provides a tabbed interface for "New" agents and "Templates."
 */

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentTemplate } from '../types.js';
import { AgentType } from '../types.js';
import { AGENT_ICONS } from '../utils/agent-visuals.js';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon.js';

/**
 * Static information about available agent types for display.
 * @constant {Array<object>}
 */
const AGENT_INFO: {type: AgentType, name: string, description: string}[] = [
    { type: AgentType.Input, name: 'Input', description: 'Provides initial data for a workflow.' },
    { type: AgentType.CognitiveCore, name: 'Cognitive Core', description: 'Runs an Ollama prompt to think or create.' },
    { type: AgentType.DataTransformer, name: 'Data Transformer', description: 'Modifies data using custom logic.' },
    { type: AgentType.ApiCall, name: 'API Call', description: 'Fetches data from an external URL.' },
    { type: AgentType.Condition, name: 'Condition', description: 'Creates a branching point in your logic.' },
    { type: AgentType.Output, name: 'Output', description: 'Produces the final result of a workflow.' },
];

/**
 * Props for the MobileAddAgentSheet component.
 * @interface
 */
interface MobileAddAgentSheetProps {
  /** Controls the visibility of the sheet. */
  isOpen: boolean;
  /** Callback function to close the sheet. */
  onClose: () => void;
  /** Callback function to add a new agent, optionally from a template. */
  onAddAgent: (type: AgentType, template?: AgentTemplate) => void;
  /** An array of available agent templates. */
  templates: AgentTemplate[];
  /** Callback function to delete an agent template. */
  onDeleteTemplate: (templateId: string) => void;
}

/**
 * The MobileAddAgentSheet component.
 * Displays a bottom sheet on mobile devices for adding new agents or selecting from templates.
 * @param {MobileAddAgentSheetProps} props - The component props.
 * @returns {React.FC} The MobileAddAgentSheet UI.
 */
const MobileAddAgentSheet: React.FC<MobileAddAgentSheetProps> = memo(({ isOpen, onClose, onAddAgent, templates, onDeleteTemplate }) => {
  /** @state {'new' | 'templates'} activeTab - Controls which tab ('New' or 'Templates') is currently active. */
  const [activeTab, setActiveTab] = useState('new');
  const [selectedType, setSelectedType] = useState<AgentType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentName, setAgentName] = useState('');
  
  const handleTypeSelect = (type: AgentType) => {
    setSelectedType(type);
    setAgentName(`New ${type}`);
  };

  const handleTemplateSelect = (template: AgentTemplate) => {
      setSelectedTemplate(template);
      setSelectedType(template.type);
      setAgentName(template.name);
  }

  const handleConfirm = () => {
    if (selectedType) {
        // Construct a pseudo-template to pass the name
        const finalTemplate = selectedTemplate 
            ? { ...selectedTemplate, name: agentName }
            : { name: agentName } as AgentTemplate;

        onAddAgent(selectedType, finalTemplate);
        handleClose();
    }
  };

  const handleBack = () => {
      setSelectedType(null);
      setSelectedTemplate(null);
      setAgentName('');
  };

  const handleClose = () => {
      handleBack();
      onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 z-40"
          aria-modal="true"
          role="dialog"
          aria-labelledby="add-agent-sheet-title"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-panel-bg backdrop-blur-xl p-4 rounded-t-2xl border-t border-glass-border flex flex-col max-h-[80vh]"
          >
            <div className="flex-shrink-0 mb-4">
                <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto mb-4"></div>
                
                {selectedType ? (
                    <div className="flex items-center space-x-2">
                        <button onClick={handleBack} className="p-2 -ml-2 text-text-tertiary hover:text-white">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <h3 className="font-bold text-white text-lg">Configure Agent</h3>
                    </div>
                ) : (
                    <div className="flex items-center p-1 rounded-lg bg-conchoidal-gray">
                        <button 
                        onClick={() => setActiveTab('new')} 
                        className={`flex-1 p-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'new' ? 'bg-imperial-purple text-white' : 'text-vitreous-white/60'}`}
                        aria-controls="new-agents-tab-panel"
                        aria-selected={activeTab === 'new'}
                        role="tab"
                        id="new-agents-tab"
                        >
                        New
                        </button>
                        <button 
                        onClick={() => setActiveTab('templates')} 
                        className={`flex-1 p-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'templates' ? 'bg-imperial-purple text-white' : 'text-vitreous-white/60'}`}
                        aria-controls="templates-tab-panel"
                        aria-selected={activeTab === 'templates'}
                        role="tab"
                        id="templates-tab"
                        >
                        Templates
                        </button>
                    </div>
                )}
            </div>
            
            <div className="flex-grow overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedType ? (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4 pb-4"
                        >
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Designation</label>
                                <input 
                                    type="text" 
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-imperial-purple outline-none"
                                    placeholder="Agent Name"
                                    autoFocus
                                />
                            </div>
                            
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center space-x-3">
                                <div className="text-patina-green">
                                    {AGENT_ICONS[selectedType]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{selectedType}</div>
                                    <div className="text-xs text-text-tertiary">
                                        {selectedTemplate ? 'Template: ' + selectedTemplate.name : 'Standard Protocol'}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleConfirm}
                                disabled={!agentName.trim()}
                                className="w-full py-3 bg-patina-green text-black font-bold rounded-lg uppercase tracking-wider text-sm hover:bg-white transition-colors disabled:opacity-50"
                            >
                                Manifest Agent
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                        {activeTab === 'new' ? (
                            <div id="new-agents-tab-panel" role="tabpanel" aria-labelledby="new-agents-tab" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {AGENT_INFO.map(({type, name, description}) => (
                                <button 
                                key={type} 
                                onClick={() => handleTypeSelect(type)} 
                                className="p-4 bg-conchoidal-gray rounded-lg text-left space-y-2 hover:bg-white/10 transition-colors"
                                aria-label={`Add new ${name} agent`}
                                >
                                    <div className="flex items-center space-x-3 text-patina-green">{AGENT_ICONS[type]} <span className="font-bold text-vitreous-white">{name}</span></div>
                                    <p className="text-xs text-vitreous-white/60">{description}</p>
                                </button>
                            ))}
                            </div>
                        ) : (
                            <div id="templates-tab-panel" role="tabpanel" aria-labelledby="templates-tab" className="space-y-3">
                                {templates.length === 0 ? (
                                    <p className="text-center text-sm text-vitreous-white/60 py-8">You have no saved templates.</p>
                                ) : templates.map(template => (
                                    <div key={template.id} className="p-3 bg-conchoidal-gray rounded-lg flex items-center justify-between">
                                        <button 
                                        onClick={() => handleTemplateSelect(template)} 
                                        className="flex-grow text-left flex items-center space-x-3"
                                        aria-label={`Add agent from ${template.name} template`}
                                        >
                                            <div className="text-patina-green">{AGENT_ICONS[template.type]}</div>
                                            <span className="font-bold text-vitreous-white">{template.name}</span>
                                        </button>
                                        <button 
                                        onClick={() => onDeleteTemplate(template.id)} 
                                        className="p-2 rounded-full text-vitreous-white/50 hover:bg-red-600/50 hover:text-white"
                                        aria-label={`Delete ${template.name} template`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
MobileAddAgentSheet.displayName = 'MobileAddAgentSheet';

export default MobileAddAgentSheet;
