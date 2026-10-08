
/**
 * @file components/EmptyState.tsx
 * @description Displays a welcoming message and a call to action when the Weaver Studio canvas is empty.
 * It guides the user to add their first agent to begin building a workflow.
 * Updated for high visibility and dismissibility.
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { AgentType } from '../types.js';
import { LayersIcon } from './icons/LayersIcon.js';

/**
 * Props for the EmptyState component.
 * @interface
 */
interface EmptyStateProps {
    /** Callback function to add a new agent, typically an Input agent to start the workflow. */
    onAddAgent: (type: AgentType) => void;
    /** Callback to dismiss the empty state overlay. */
    onDismiss: () => void;
}

/**
 * The EmptyState component.
 * Renders an inviting message and a prominent button to add the first agent
 * when the Weaver Studio canvas is devoid of elements.
 * @param {EmptyStateProps} props - The component props.
 * @returns {React.FC} The EmptyState UI.
 */
const EmptyState: React.FC<EmptyStateProps> = memo(({onAddAgent, onDismiss}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
        >
            <div
              className="bg-panel-bg/90 backdrop-blur-xl border border-glass-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full relative overflow-hidden pointer-events-auto ring-1 ring-white/10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="empty-state-title"
            >
                
                {/* Close Button */}
                <button 
                    onClick={onDismiss}
                    className="absolute top-4 right-4 text-text-tertiary hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                    aria-label="Dismiss: explore empty canvas"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Decorative Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-imperial-purple via-roman-aqua to-patina-green" />
                
                <div className="p-6 rounded-full bg-white/5 shadow-inner mb-6 border border-white/5">
                    <LayersIcon className="h-12 w-12 text-roman-aqua animate-pulse-slow" />
                </div>
                
                <h2 id="empty-state-title" className="font-comfortaa text-3xl font-bold text-white mb-3">The Forge is Silent</h2>
                <p className="text-text-secondary mb-8 leading-relaxed text-sm text-center">
                    Your canvas awaits. Initiate the first spark of intelligence to begin your workflow.
                </p>
                
                <div className="flex flex-col gap-3 w-full">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAddAgent(AgentType.Input)}
                        className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-roman-aqua/20 flex items-center justify-center space-x-2 cursor-pointer w-full"
                        aria-label="Initialize Input Agent"
                    >
                        <span className="relative z-10 font-mono tracking-widest text-xs uppercase">Initialize Protocol</span>
                        <div className="absolute inset-0 rounded-xl ring-1 ring-white/20 group-hover:ring-roman-aqua/50 transition-all duration-500" />
                    </motion.button>
                    
                    <button 
                        onClick={onDismiss}
                        className="text-xs text-text-tertiary hover:text-white transition-colors py-2"
                    >
                        Explore Empty Canvas
                    </button>
                </div>
            </div>
        </motion.div>
    );
});
EmptyState.displayName = 'EmptyState';

export default EmptyState;
