/**
 * @file components/CommandBar.tsx
 * @description A floating, central command bar for the Weaver Studio canvas.
 * Focused on tactical canvas manipulation and workflow execution.
 */

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChainIcon } from './icons/ChainIcon.js';
import { LayoutIcon } from './icons/LayoutIcon.js';
import { WeaverMode } from '../types.js';
import { PlusIcon } from './icons/PlusIcon.js';
import { SaveIcon } from './icons/SaveIcon.js';

interface CommandBarProps {
  onRunAll: () => void;
  onToggleCrewMode: () => void;
  isCrewMode: boolean;
  isSimulationActive: boolean;
  onToggleSimulation: () => void;
  isWorkflowRunning: boolean;
  isGlobalWorkflowExecuting: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetWorkspace: () => void;
  onConnectAll: () => void;
  onLayoutAgents: () => void;
  mode: WeaverMode;
  onOpenCreator?: () => void;
  onSave?: () => void;
}

interface CommandBarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  description?: string;
  shortcut?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  activeColor?: string; 
}

const CommandBarButton: React.FC<CommandBarButtonProps> = memo(({
  onClick, children, label, description, shortcut, isActive = false, isDisabled = false, activeColor = 'var(--imperial-purple)'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        onClick={onClick}
        disabled={isDisabled}
        aria-label={label}
        whileHover={!isDisabled ? { scale: 1.1 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        className={`
            relative p-3 rounded-xl transition-all duration-300 flex items-center justify-center group
            ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer'}
            ${isActive
                ? `text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-1 ring-white/50`
                : 'bg-white/5 text-text-secondary hover:bg-white/20 hover:text-white border border-transparent hover:border-white/20'}
        `}
        style={isActive ? { backgroundColor: activeColor } : {}}
      >
        {children}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -12, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-full mb-3 z-50 pointer-events-none"
          >
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-2 text-center shadow-2xl w-max max-w-[200px] flex flex-col items-center gap-1 ring-1 ring-black">
              <span className="text-xs font-bold text-white font-comfortaa uppercase tracking-wider">{label}</span>
              {description && <span className="text-[10px] text-text-secondary leading-tight">{description}</span>}
              {shortcut && (
                <div className="mt-1 px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono text-roman-aqua border border-white/10">
                  {shortcut}
                </div>
              )}
              <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-black/90 border-b border-r border-white/20 transform -translate-x-1/2 rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
CommandBarButton.displayName = 'CommandBarButton';

const Divider: React.FC = () => <div className="w-px h-8 bg-white/10 mx-2 self-center" />;

const CommandBar: React.FC<CommandBarProps> = memo(({
  onRunAll, onToggleCrewMode, isCrewMode, isSimulationActive, onToggleSimulation, 
  isGlobalWorkflowExecuting, onUndo, onRedo, canUndo, canRedo, onResetWorkspace,
  onConnectAll, onLayoutAgents, mode, onOpenCreator, onSave
}) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] overflow-visible"
    >
      <div className="flex items-center p-2.5 md:p-3 bg-obsidian-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl shadow-black/80 ring-1 ring-white/10 high-density">

        {/* History Controls */}
        <div className="flex items-center space-x-1">
             {onSave && (
                <CommandBarButton onClick={onSave} label="Snapshot" description="Create restore point" shortcut="Ctrl+S">
                    <SaveIcon className="h-5 w-5" />
                </CommandBarButton>
            )}
            <CommandBarButton onClick={onUndo} label="Undo" shortcut="Ctrl+Z" isDisabled={!canUndo}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </CommandBarButton>
            <CommandBarButton onClick={onRedo} label="Redo" shortcut="Ctrl+Y" isDisabled={!canRedo}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
            </CommandBarButton>
        </div>

        {/* Architect Tools */}
        <AnimatePresence>
          {mode === 'architect' && (
            <motion.div
              initial={{ width: 0, opacity: 0, scale: 0.9 }}
              animate={{ width: 'auto', opacity: 1, scale: 1 }}
              exit={{ width: 0, opacity: 0, scale: 0.9 }}
              className="flex items-center overflow-hidden"
            >
              <Divider />
              <div className="flex items-center space-x-1 px-1">
                {onOpenCreator && (
                    <CommandBarButton onClick={onOpenCreator} label="Add Agent" description="Spawn new entity" shortcut="+" activeColor="var(--patina-green)">
                        <PlusIcon className="h-5 w-5 text-patina-green group-hover:text-white" />
                    </CommandBarButton>
                )}
                <CommandBarButton onClick={onToggleCrewMode} label="Group" description="Batch actions" shortcut="C" isActive={isCrewMode}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </CommandBarButton>
                <CommandBarButton onClick={onConnectAll} label="Auto-Connect" description="Link linear">
                  <ChainIcon className="h-5 w-5" />
                </CommandBarButton>
                <CommandBarButton onClick={onLayoutAgents} label="Auto-Layout" description="Grid align">
                  <LayoutIcon className="h-5 w-5" />
                </CommandBarButton>
                <CommandBarButton onClick={onToggleSimulation} label="Vitals" description="Toggle moodlets" isActive={isSimulationActive}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </CommandBarButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Divider />

        {/* Execution & Cleanup */}
        <div className="flex items-center space-x-1">
          <CommandBarButton onClick={() => { void onRunAll(); }} label="Run Swarm" description="Execute workflow" shortcut="Cmd+Enter" isDisabled={isGlobalWorkflowExecuting} activeColor="var(--patina-green)">
            {isGlobalWorkflowExecuting ? (
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-patina-green group-hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
            )}
          </CommandBarButton>
          
          <CommandBarButton onClick={onResetWorkspace} label="Nuke" description="Reset Workspace" activeColor="var(--red-500)">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </CommandBarButton>
        </div>

      </div>
    </motion.div>
  );
});
CommandBar.displayName = 'CommandBar';

export default CommandBar;