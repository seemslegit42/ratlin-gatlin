

/**
 * @file components/switchboard/NodeDetailView.tsx
 * @description Displays and allows editing of detailed information for a selected module
 * in the Micro-App Forge. It's a sidebar panel that appears when a module is selected.
 */

import React, { useState, useEffect } from 'react';
import type { ModuleData } from '../../types.js';

/**
 * Props for the NodeDetailView component.
 */
interface NodeDetailViewProps {
  /** The module data to display and edit, or `null` if no module is selected. */
  module: ModuleData | null;
  /** Callback function to close the detail view. */
  onClose: () => void;
  /** Callback function to update a module's properties. */
  onUpdateModule: (id: string, updates: Partial<ModuleData>) => void;
  /** Callback function to delete the module. */
  onDeleteModule: (id: string) => void;
}

/**
 * The NodeDetailView component for Micro-App Forge modules.
 * It provides an interface to view and edit module properties,
 * such as the name, position, and specific data (e.g., URL for Micro-App Host).
 * @param {NodeDetailViewProps} props - The component props.
 * @returns {React.FC | null} The NodeDetailView UI, or null if no module is selected.
 */
const NodeDetailView: React.FC<NodeDetailViewProps> = ({ module, onClose, onUpdateModule, onDeleteModule }) => {
  const [url, setUrl] = useState((module?.data?.url as string) || '');
  const [label, setLabel] = useState((module?.data?.label as string) || ''); // For System Ports

  useEffect(() => {
    setUrl((module?.data?.url as string) || '');
    setLabel((module?.data?.label as string) || module?.name || '');
  }, [module]);

  if (!module) return null;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onUpdateModule(module.id, { data: { ...module.data, url: newUrl } });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLabel = e.target.value;
      setLabel(newLabel);
      onUpdateModule(module.id, { data: { ...module.data, label: newLabel } });
  };

  const handleDelete = () => {
      if (window.confirm(`Are you sure you want to delete "${module.name}"? This will also remove any connected cables.`)) {
          onDeleteModule(module.id);
          onClose();
      }
  };

  const isSystemNode = module.name === 'System Input' || module.name === 'System Output';

  return (
    <div className="fixed top-24 right-4 bg-panel-bg/90 backdrop-blur-2xl border border-glass-border rounded-2xl p-5 shadow-glass z-40 w-72 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <h3 className="text-lg font-bold font-comfortaa text-vitreous-white truncate" title={module.name}>{module.name}</h3>
        <button onClick={onClose} className="p-1.5 rounded-full text-vitreous-white/50 hover:bg-white/10 transition-colors" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto custom-scrollbar">
          <div className="text-xs text-text-tertiary font-mono">
              UUID: <span className="text-white/50">{module.id.substring(0, 12)}</span>
          </div>

          {isSystemNode ? (
              <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Port Label</label>
                  <input 
                      type="text" 
                      value={label} 
                      onChange={handleLabelChange} 
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-vitreous-white focus:outline-none focus:border-roman-aqua transition-colors"
                      placeholder="e.g. User Data"
                  />
                  <p className="text-[10px] text-text-tertiary mt-2 leading-relaxed">This label defines how this Micro-App appears when used as an Agent in Weaver Studio.</p>
              </div>
          ) : (
              <>
                {module.name === 'Micro-App Host' && (
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Source URL</label>
                        <input 
                            type="text" 
                            value={url} 
                            onChange={handleUrlChange} 
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-vitreous-white focus:outline-none focus:border-roman-aqua transition-colors"
                            placeholder="https://..."
                        />
                    </div>
                )}
                {/* Add other module type configs here if needed */}
              </>
          )}
      </div>

      <div className="pt-4 border-t border-white/10 mt-auto">
          <button 
              onClick={handleDelete}
              className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 hover:border-red-500/40 transition-all uppercase tracking-wider"
          >
              Dismantle Instrument
          </button>
      </div>
    </div>
  );
};

export default NodeDetailView;