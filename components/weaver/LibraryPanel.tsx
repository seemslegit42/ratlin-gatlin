
/**
 * @file components/weaver/LibraryPanel.tsx
 * @description The "Palette Panel" - A modular, floating dock containing the Instruments of Orchestration.
 * Users drag nodes from here onto the Weaver canvas.
 * Implements "Glassmorphism Perfected" aesthetic with clear categorization and tabbed interface for Templates.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentType, AgentTemplate } from '../../types';
import { AGENT_ICONS, AGENT_DESCRIPTIONS } from '../../utils/agent-visuals';
import { SYSTEM_TEMPLATES } from '../../services/templateService';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { SearchIcon } from '../icons/CommandPaletteIcons';

interface LibraryPanelProps {
    onDragStart: (e: React.DragEvent, type: AgentType, template?: AgentTemplate) => void;
    isOpen: boolean;
    onClose: () => void;
    customTemplates?: AgentTemplate[]; // User defined templates
}

type LibraryTab = 'primitives' | 'library' | 'custom';

// Node Categorization Configuration - "The Instruments of Orchestration"
const CATEGORIZED_PRIMITIVES = {
    "Orchestration": {
        color: "text-roman-aqua",
        items: [
            { type: AgentType.Start, label: 'Start Node' },
            { type: AgentType.End, label: 'End Node' },
            { type: AgentType.Trigger, label: 'Trigger Event' },
            { type: AgentType.CronTrigger, label: 'Schedule' },
            { type: AgentType.Condition, label: 'Condition (If/Else)' },
            { type: AgentType.Router, label: 'Router' },
        ]
    },
    "Agentic Force": {
        color: "text-imperial-purple",
        items: [
            { type: AgentType.CognitiveCore, label: 'Agent Task' }, // Primary AI Worker
            { type: AgentType.KnowledgeRetrieval, label: 'Retrieval' },
            { type: AgentType.WebScraper, label: 'Web Scraper' },
            { type: AgentType.ImageGeneration, label: 'Visual Synth' },
            { type: AgentType.Copywriter, label: 'Copywriter' },
        ]
    },
    "Operations": {
        color: "text-patina-green",
        items: [
            { type: AgentType.ManualTask, label: 'Manual Task' },
            { type: AgentType.ApiCall, label: 'API Call' },
            { type: AgentType.DataTransformer, label: 'Data Transform' },
            { type: AgentType.Prompt, label: 'Prompt Injector' },
            { type: AgentType.CodeExecution, label: 'Code Exec' },
            { type: AgentType.EmailAction, label: 'Email' },
        ]
    },
    "Tools": {
        color: "text-gilded-accent",
        items: [
            { type: AgentType.MicroApp, label: 'Micro-App' },
        ]
    }
};

const LibraryCategory: React.FC<{ 
    title: string; 
    items: { type: AgentType, label: string, template?: AgentTemplate }[]; 
    colorClass: string;
    onDragStart: (e: React.DragEvent, type: AgentType, template?: AgentTemplate) => void 
}> = ({ title, items, colorClass, onDragStart }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="mb-3 last:mb-0">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-lg transition-colors mb-1 group border border-transparent hover:border-white/5 ${colorClass}`}
            >
                <span className="opacity-80 group-hover:opacity-100">{title}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform opacity-50 group-hover:opacity-100 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-2 gap-2 px-1 pt-1"
                    >
                        {items.map(item => (
                            <div
                                key={item.template?.id || item.type}
                                draggable
                                onDragStart={(e) => onDragStart(e, item.type, item.template)}
                                className="relative flex flex-col items-center justify-center p-3 bg-black/40 border border-white/5 rounded-xl cursor-grab hover:bg-white/5 hover:border-white/20 hover:shadow-glass active:cursor-grabbing transition-all group overflow-hidden"
                                title={item.template?.description || AGENT_DESCRIPTIONS[item.type]}
                            >
                                <div className={`absolute top-0 left-0 w-full h-0.5 ${colorClass.replace('text-', 'bg-')} opacity-0 group-hover:opacity-50 transition-opacity`} />
                                
                                <div className={`mb-2 transition-transform transform group-hover:scale-110 duration-200 ${colorClass} opacity-80 group-hover:opacity-100`}>
                                    {AGENT_ICONS[item.type]}
                                </div>
                                <span className="text-[9px] font-bold text-text-secondary group-hover:text-white text-center leading-tight transition-colors line-clamp-2">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onDragStart, isOpen, onClose, customTemplates = [] }) => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<LibraryTab>('primitives');

    // Organize System Templates into Categories
    const libraryCategories = useMemo(() => {
        // Group SYSTEM_TEMPLATES by implied category based on type or name
        // For simplicity, we'll group by generic functional buckets
        const grouped: Record<string, { type: AgentType, label: string, template: AgentTemplate }[]> = {
            "Scrapers & Data": [],
            "Analysis & AI": [],
            "Integrations": [],
            "Content & Text": [],
            "Blueprints": [] // Complex multi-node
        };

        SYSTEM_TEMPLATES.forEach(tmpl => {
            const item = { type: tmpl.type, label: tmpl.name, template: tmpl };
            if (tmpl.blueprint) {
                grouped["Blueprints"].push(item);
            } else if (tmpl.type === AgentType.WebScraper || tmpl.type === AgentType.DataTransformer) {
                grouped["Scrapers & Data"].push(item);
            } else if (tmpl.type === AgentType.ApiCall || tmpl.type === AgentType.Trigger) {
                grouped["Integrations"].push(item);
            } else if (tmpl.type === AgentType.Copywriter || tmpl.type === AgentType.SEOAnalyzer) {
                grouped["Content & Text"].push(item);
            } else {
                grouped["Analysis & AI"].push(item);
            }
        });

        return grouped;
    }, []);

    // Filter Logic
    const getFilteredPrimitives = () => {
        const result: typeof CATEGORIZED_PRIMITIVES = JSON.parse(JSON.stringify(CATEGORIZED_PRIMITIVES));
        Object.keys(result).forEach(key => {
            // @ts-ignore
            result[key].items = result[key].items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));
        });
        return result;
    };

    const getFilteredLibrary = () => {
         const result = JSON.parse(JSON.stringify(libraryCategories));
         Object.keys(result).forEach(key => {
            result[key] = result[key].filter((i: any) => i.label.toLowerCase().includes(search.toLowerCase()));
         });
         return result;
    };
    
    const getFilteredCustom = () => {
        return customTemplates
            .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
            .map(t => ({ type: t.type, label: t.name, template: t }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: -320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -320, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute top-4 left-20 bottom-4 w-72 bg-panel-bg/95 backdrop-blur-2xl border-r border-y border-glass-border rounded-r-2xl shadow-2xl z-40 flex flex-col overflow-hidden ring-1 ring-white/10"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                        <div>
                            <h3 className="font-comfortaa font-bold text-vitreous-white text-sm">Palette</h3>
                            <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-widest mt-0.5">Instruments</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-full text-text-tertiary hover:text-white hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-3 bg-black/20">
                        <div className="relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary group-hover:text-roman-aqua transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search nodes..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-roman-aqua/50 focus:bg-black/60 transition-all placeholder-white/20"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10 bg-black/20">
                        {['primitives', 'library', 'custom'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as LibraryTab)}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    activeTab === tab 
                                    ? 'text-white border-b-2 border-roman-aqua bg-white/5' 
                                    : 'text-text-tertiary hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab === 'primitives' ? 'Core' : tab === 'library' ? 'Lib' : 'My Nodes'}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-4">
                        
                        {/* PRIMITIVES TAB */}
                        {activeTab === 'primitives' && Object.entries(getFilteredPrimitives()).map(([category, { color, items }]) => {
                            if (items.length === 0) return null;
                            return (
                                <LibraryCategory 
                                    key={category} 
                                    title={category} 
                                    items={items} 
                                    colorClass={color}
                                    onDragStart={onDragStart} 
                                />
                            );
                        })}

                        {/* LIBRARY TAB (System Templates) */}
                        {activeTab === 'library' && Object.entries(getFilteredLibrary()).map(([category, items]) => {
                            if ((items as any[]).length === 0) return null;
                            return (
                                <LibraryCategory 
                                    key={category} 
                                    title={category} 
                                    items={items as any[]} 
                                    colorClass="text-patina-green"
                                    onDragStart={onDragStart} 
                                />
                            );
                        })}

                        {/* CUSTOM TAB (User Templates) */}
                        {activeTab === 'custom' && (
                            getFilteredCustom().length > 0 ? (
                                <LibraryCategory 
                                    title="My Components" 
                                    items={getFilteredCustom()} 
                                    colorClass="text-gilded-accent"
                                    onDragStart={onDragStart} 
                                />
                            ) : (
                                <div className="text-center py-8 text-text-tertiary">
                                    <p className="text-xs italic">No custom components saved.</p>
                                    <p className="text-[9px] mt-2 opacity-50">Select an agent and click "Save as Template" to add here.</p>
                                </div>
                            )
                        )}
                        
                        {/* Empty State for Search */}
                        {search && 
                            activeTab === 'primitives' && Object.values(getFilteredPrimitives()).every((c: any) => c.items.length === 0) && 
                            <p className="text-center text-xs text-text-tertiary mt-4">No core nodes match "{search}"</p>
                        }
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
