
/**
 * @file components/weaver/AgentCreationModal.tsx
 * @description A modal for instantiating new Agents, either from raw Archetypes or pre-configured Templates.
 * Provides a categorized view of system capabilities.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../shared/Modal';
import { AgentType, AgentTemplate } from '../../types';
import { AGENT_ICONS, AGENT_DESCRIPTIONS } from '../../utils/agent-visuals';
import { SearchIcon } from '../icons/CommandPaletteIcons';
import AgentForm from '../AgentForm';

interface AgentCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAgent: (type: AgentType, template?: AgentTemplate) => void;
    templates: AgentTemplate[];
}

const CATEGORIZED_AGENTS = {
    'Reasoning & Logic': [
        { type: AgentType.CognitiveCore, label: 'Cognitive Core' },
        { type: AgentType.Condition, label: 'Logic Gate' },
        { type: AgentType.Router, label: 'Router' },
        { type: AgentType.Prompt, label: 'Prompt Injector' },
    ],
    'Data & I/O': [
        { type: AgentType.Input, label: 'Data Input' },
        { type: AgentType.Output, label: 'Data Output' },
        { type: AgentType.ApiCall, label: 'API Uplink' },
        { type: AgentType.DataTransformer, label: 'Transformer' },
        { type: AgentType.WebScraper, label: 'Web Scraper' },
        { type: AgentType.KnowledgeRetrieval, label: 'Knowledge Base' },
    ],
    'Execution & Tools': [
        { type: AgentType.CodeExecution, label: 'Code Runtime' },
        { type: AgentType.WasmExecutor, label: 'WASM Core' },
        { type: AgentType.MicroApp, label: 'Micro-App' },
        { type: AgentType.ManualTask, label: 'Human Task' },
    ],
    'Creative & Output': [
        { type: AgentType.ImageGeneration, label: 'Image Gen' },
        { type: AgentType.Copywriter, label: 'Copywriter' },
        { type: AgentType.EmailAction, label: 'Email Sender' },
        { type: AgentType.Notification, label: 'Notification' },
        { type: AgentType.Vortex_Vanguard, label: 'Vortex Vanguard' },
        { type: AgentType.MCP_Bridge, label: 'MCP Bridge' },
    ]
};

const AgentCreationModal: React.FC<AgentCreationModalProps> = ({ isOpen, onClose, onAddAgent, templates }) => {
    const [selectionTab, setSelectionTab] = useState<'archetypes' | 'templates'>('archetypes');
    const [searchQuery, setSearchQuery] = useState('');
    const [configuringType, setConfiguringType] = useState<AgentType | null>(null);

    const handleManualArchetypeSelect = (type: AgentType) => {
        onAddAgent(type);
        onClose();
    };

    const handleTemplateSelect = (template: AgentTemplate) => {
        onAddAgent(template.type, template);
        onClose();
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (configuringType) {
        return (
            <Modal isOpen={isOpen} onClose={() => setConfiguringType(null)} title={`Configure ${configuringType}`}>
                <div className="max-h-[65vh] overflow-y-auto p-4 custom-scrollbar">
                    <AgentForm 
                        type={configuringType}
                        onSubmit={(data) => {
                            onAddAgent(configuringType, { ...data, id: '', type: configuringType } as any);
                            setConfiguringType(null);
                            onClose();
                        }}
                        onCancel={() => setConfiguringType(null)}
                    />
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manifest New Entity">
            <div className="h-[60vh] flex flex-col">
                {/* Tabs & Search */}
                <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                        <button 
                            onClick={() => setSelectionTab('archetypes')}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${selectionTab === 'archetypes' ? 'bg-white/10 text-white shadow-sm' : 'text-text-tertiary hover:text-white'}`}
                        >
                            Archetypes
                        </button>
                        <button 
                            onClick={() => setSelectionTab('templates')}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${selectionTab === 'templates' ? 'bg-white/10 text-white shadow-sm' : 'text-text-tertiary hover:text-white'}`}
                        >
                            Templates ({templates.length})
                        </button>
                    </div>
                    
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input 
                            type="text" 
                            placeholder="Search protocols..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-roman-aqua transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {selectionTab === 'archetypes' ? (
                        <div className="space-y-6">
                            {Object.entries(CATEGORIZED_AGENTS).map(([category, agents]) => {
                                const filteredAgents = agents.filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase()));
                                if (searchQuery && filteredAgents.length === 0) return null;
                                
                                return (
                                    <div key={category}>
                                        <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3 border-b border-white/5 pb-1 sticky top-0 bg-panel-bg z-10">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {(searchQuery ? filteredAgents : agents).map(({ type, label }) => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleManualArchetypeSelect(type)}
                                                    className="flex flex-col items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all group text-left h-full relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                                                    
                                                    <div className="flex items-center justify-between w-full mb-2 relative z-10">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-2 rounded-lg bg-black/40 text-text-secondary group-hover:text-patina-green transition-colors border border-white/5">
                                                                {AGENT_ICONS[type]}
                                                            </div>
                                                            <h3 className="font-bold font-comfortaa text-white group-hover:text-patina-green transition-colors text-sm">
                                                                {label}
                                                            </h3>
                                                        </div>
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setConfiguringType(type);
                                                            }}
                                                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-text-tertiary hover:text-white transition-colors"
                                                            title="Configure parameters before creating"
                                                        >
                                                            Config
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-text-tertiary leading-relaxed line-clamp-2 relative z-10">
                                                        {AGENT_DESCRIPTIONS[type]}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template)}
                                    className="flex flex-col items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-roman-aqua/30 hover:shadow-lg transition-all group text-left h-full relative overflow-hidden"
                                >
                                     <div className="absolute top-0 left-0 w-1 h-full bg-roman-aqua opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-center space-x-3 mb-2 relative z-10">
                                        <div className="p-2 rounded-lg bg-black/40 text-text-secondary group-hover:text-roman-aqua transition-colors border border-white/5">
                                            {AGENT_ICONS[template.type]}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold font-comfortaa text-white group-hover:text-roman-aqua transition-colors text-sm truncate">
                                                {template.name}
                                            </h3>
                                            <span className="text-[9px] font-mono text-text-tertiary uppercase">{template.type}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-text-tertiary leading-relaxed line-clamp-2 relative z-10">
                                        {template.description || 'No description provided.'}
                                    </p>
                                </button>
                            ))}
                            {filteredTemplates.length === 0 && (
                                <div className="col-span-2 text-center py-12 text-text-tertiary border-2 border-dashed border-white/5 rounded-xl">
                                    <p className="text-xs italic">No matching templates found.</p>
                                    <p className="text-[9px] mt-2 opacity-50">Create templates in the Weaver Studio to populate this library.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AgentCreationModal;
