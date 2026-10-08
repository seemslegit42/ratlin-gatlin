
/**
 * @file components/TemplateBrowser.tsx
 * @description A draggable panel for browsing and managing saved agent templates in Weaver Studio.
 * Users can create new agents from templates or delete existing templates.
 */


import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import type { AgentTemplate } from '../types';
import { AgentType } from '../types';
import { AGENT_ICONS } from '../utils/agent-visuals';

/**
 * Props for the TemplateBrowser component.
 */
interface TemplateBrowserProps {
    /** An array of available agent templates. */
    templates: AgentTemplate[];
    /** Callback function to add a new agent from a template. */
    onAddAgent: (type: AgentType, template: AgentTemplate) => void;
    /** Callback function to delete an agent template. */
    onDeleteTemplate: (templateId: string) => void;
    /** Callback function to close the template browser. */
    onClose: () => void;
    /** Reference to the element that constrains the dragging boundaries of the panel. */
    dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

/**
 * The TemplateBrowser component.
 * Displays a list of saved agent templates, allowing users to instantiate new agents
 * from them or delete templates.
 * @param {TemplateBrowserProps} props - The component props.
 * @returns {React.FC} The TemplateBrowser UI.
 */
const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ templates, onAddAgent, onDeleteTemplate, onClose, dragConstraintsRef }) => {
    const dragControls = useDragControls();

    return (
        <>
            {/* Transparent backdrop for click-outside dismissal */}
            <div 
                className="fixed inset-0 z-20 bg-transparent" 
                onClick={onClose} 
                aria-hidden="true"
            />

            <motion.div
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                dragConstraints={dragConstraintsRef}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute bottom-20 right-4 w-96 max-h-[60vh] z-30 flex flex-col
                        bg-panel-bg backdrop-blur-xl rounded-2xl shadow-glass shadow-glass-edge border border-glass-border high-density"
            >
                <header onPointerDown={dragControls.start} className="p-4 border-b border-glass-border flex justify-between items-center cursor-grab active:cursor-grabbing">
                    <div>
                        <h2 className="font-comfortaa text-xl text-vitreous-white">Templates</h2>
                        <p className="text-sm text-vitreous-white/50">Blueprints & Archives</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full text-vitreous-white/50 hover:bg-white/10" title="Close Templates" aria-label="Close Templates">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </header>

                <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
                    {templates.length === 0 ? (
                        <div className="text-center py-12 text-vitreous-white/60">
                            <p>No templates available.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {templates.map(template => {
                                const isSystem = template.syndicateId === 'system';
                                return (
                                    <li key={template.id} className="p-3 bg-black/20 rounded-lg flex items-center justify-between group border border-transparent hover:border-white/10 transition-colors">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className="p-1.5 rounded-lg bg-black/30 text-patina-green flex-shrink-0">
                                                {AGENT_ICONS[template.type]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-sm text-vitreous-white truncate">{template.name}</span>
                                                    {isSystem && <span className="text-[9px] font-mono text-text-tertiary bg-white/5 px-1 rounded">SYS</span>}
                                                </div>
                                                <p className="text-xs text-text-tertiary truncate">{template.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1 pl-2">
                                            <button 
                                                onClick={() => onAddAgent(template.type, template)} 
                                                className="p-1.5 text-xs rounded-md bg-patina-green/20 text-patina-green hover:bg-patina-green hover:text-black transition-colors"
                                                title={`Create '${template.name}'`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                            </button>
                                            {!isSystem && (
                                                <button 
                                                    onClick={() => onDeleteTemplate(template.id)} 
                                                    className="p-1.5 text-xs rounded-md bg-white/5 text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                    title={`Delete '${template.name}'`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default TemplateBrowser;
