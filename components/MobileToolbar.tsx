/**
 * @file components/MobileToolbar.tsx
 * @description A mobile-specific toolbar for the Weaver Studio, providing quick access
 * to common actions such as adding new agents and running the entire workflow.
 */


import React, { memo } from 'react';

/**
 * Props for the MobileToolbar component.
 * @interface
 */
interface MobileToolbarProps {
    /** Callback function to open the "Add Agent" sheet. */
    onAddAgentClick: () => void;
    /** Callback function to run all agents in the workflow. */
    onRunAllAgents: () => void;
}

/**
 * The MobileToolbar component.
 * Renders a compact toolbar for mobile devices, offering essential workflow actions.
 * @param {MobileToolbarProps} props - The component props.
 * @returns {React.FC} The MobileToolbar UI.
 */
const MobileToolbar: React.FC<MobileToolbarProps> = memo(({ onAddAgentClick, onRunAllAgents }) => {
    return (
        <div className="flex-shrink-0 p-3 bg-panel-bg backdrop-blur-md border-b border-glass-border flex items-center justify-between z-10">
            <h2 className="font-comfortaa text-lg text-vitreous-white">Canvas</h2>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onRunAllAgents}
                    className="px-4 py-2 flex items-center space-x-2 font-bold text-sm rounded-lg bg-red-600/50 hover:bg-red-600/80 text-white transition-all shadow-glass"
                    aria-label="Run all agents"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4.018 15.59a1.5 1.5 0 002.121 0l4.242-4.243a1.5 1.5 0 000-2.121L6.14 5.085a1.5 1.5 0 10-2.121 2.121L5.939 9l-1.921 1.921a1.5 1.5 0 000 2.121zM9.018 15.59a1.5 1.5 0 002.121 0l4.242-4.243a1.5 1.5 0 000-2.121L11.14 5.085a1.5 1.5 0 10-2.121 2.121L10.939 9l-1.921 1.921a1.5 1.5 0 000 2.121z" /></svg>
                    <span>Run All</span>
                </button>
                <button
                    onClick={onAddAgentClick}
                    className="px-4 py-2 flex items-center space-x-2 font-bold text-sm rounded-lg bg-patina-green/80 hover:bg-patina-green text-white transition-all shadow-glass"
                    aria-label="Add new agent"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Add Agent</span>
                </button>
            </div>
        </div>
    );
});
MobileToolbar.displayName = 'MobileToolbar';

export default MobileToolbar;