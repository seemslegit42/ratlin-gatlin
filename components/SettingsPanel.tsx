/**
 * @file components/SettingsPanel.tsx
 * @description A comprehensive configuration panel for the application.
 * It manages User Identity (Profile), Interface Preferences, and System Operations.
 * Features a tabbed layout and draggable modal behavior.
 */

import React, { useState, useCallback, memo } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import type { Settings } from '../types';
import { Theme, AnimationLevel } from '../types';
import { useAuth, USER_COLORS } from '../contexts/AuthContext';
import { CrownIcon } from './icons/CrownIcon';
import { LayersIcon } from './icons/LayersIcon';
import { CogIcon } from './icons/AgentStatusIcons';
import { BrainIcon } from './icons/BrainIcon';

/**
 * Props for the SettingsPanel component.
 * @interface
 */
interface SettingsPanelProps {
  /** The current application settings. */
  settings: Settings;
  /** Callback function to update specific settings. */
  onUpdateSettings: (updates: Partial<Settings>) => void;
  /** Callback function to reset the entire workspace. */
  onResetWorkspace: () => void;
  /** Callback function to reset all agent statuses. */
  onResetAllAgents: () => void;
  /** Callback function to close the settings panel. */
  onClose: () => void;
  /** Reference to the element that constrains the dragging boundaries. */
  dragConstraintsRef: React.RefObject<HTMLElement>;
}

/**
 * Defines the available tabs within the settings panel.
 * @typedef {'identity' | 'interface' | 'intelligence' | 'system'} SettingsTab
 */
type SettingsTab = 'identity' | 'interface' | 'intelligence' | 'system';

/**
 * The SettingsPanel component.
 * Acts as the central hub for user and application configuration.
 * @param {SettingsPanelProps} props - The component props.
 * @returns {React.FC} The SettingsPanel UI.
 */
const SettingsPanelContent: React.FC<SettingsPanelProps> = memo(({ 
    settings, 
    onUpdateSettings, 
    onResetWorkspace, 
    onResetAllAgents, 
    onClose, 
    dragConstraintsRef 
}) => {
  const dragControls = useDragControls();
  const { currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');

  // --- Handlers ---

  /**
   * Handles the reset of the entire workspace after user confirmation.
   */
  const handleResetWorkspace = useCallback(() => {
    if (window.confirm('WARNING: This will permanently delete all agents, connections, and crews. This action cannot be undone.')) {
        onResetWorkspace();
        onClose();
    }
  }, [onClose, onResetWorkspace]);

  /**
   * Handles the reset of all agent statuses after user confirmation.
   */
  const handleResetAllAgents = useCallback(() => {
    if (window.confirm('Reset all agent statuses to "Idle" and clear output data?')) {
      onResetAllAgents();
      onClose();
    }
  }, [onClose, onResetAllAgents]);

  // --- Render Helpers ---

  /**
   * Props for a TabButton component.
   * @interface
   */
  interface TabButtonProps {
    id: SettingsTab;
    label: string;
    icon: React.ReactNode;
  }

  /**
   * Renders a button for switching between settings tabs.
   * @param {TabButtonProps} props - The component props.
   * @returns {React.FC} The TabButton UI.
   */
  const TabButton: React.FC<TabButtonProps> = memo(({ id, label, icon }) => (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all relative ${activeTab === id ? 'text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        aria-controls={`settings-panel-${id}`}
        aria-selected={activeTab === id}
        role="tab"
        id={`tab-${id}`}
      >
          {activeTab === id && (
              <motion.div 
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
          )}
          <span className="relative z-10">{icon}</span>
          <span className="relative z-10 hidden sm:inline">{label}</span>
      </button>
  ));
  TabButton.displayName = 'TabButton';

  return (
    <>
      {/* Backdrop - Fixed to prevent accidental clicks */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
        aria-label="Close settings panel"
      />
      
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragConstraints={dragConstraintsRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50
                   bg-panel-bg/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-glass-border text-vitreous-white flex flex-col overflow-hidden max-h-[85vh] high-density"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-panel-title"
      >
        {/* Header */}
        <header 
            onPointerDown={(e) => dragControls.start(e)} 
            className="p-4 border-b border-glass-border flex justify-between items-center cursor-grab active:cursor-grabbing bg-white/5"
        >
          <div>
            <h2 id="settings-panel-title" className="font-comfortaa text-xl font-bold">System Config</h2>
            <p className="text-xs text-text-tertiary font-mono uppercase tracking-widest">Protocol Control</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-vitreous-white/50 hover:bg-white/10 transition-colors" aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </header>

        {/* Tabs */}
        <div className="flex p-2 bg-black/20 border-b border-white/5 space-x-1 justify-between" role="tablist">
            <TabButton id="identity" label="Identity" icon={<CrownIcon className="w-4 h-4" />} />
            <TabButton id="interface" label="Interface" icon={<LayersIcon className="w-4 h-4" />} />
            <TabButton id="intelligence" label="Intelligence" icon={<BrainIcon className="w-4 h-4" />} />
            <TabButton id="system" label="System" icon={<CogIcon className="w-4 h-4" />} />
        </div>

        {/* Content Body */}
        <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
                {activeTab === 'identity' && currentUser && (
                    <motion.div
                        key="identity"
                        id="settings-panel-identity"
                        role="tabpanel"
                        aria-labelledby="tab-identity"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                    >
                        {/* Avatar Preview */}
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/10 shadow-lg mb-3 transition-colors duration-300"
                                style={{ backgroundColor: currentUser.color }}
                                aria-hidden="true"
                            >
                                {currentUser.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs text-text-tertiary font-mono">{currentUser.syndicateId}</span>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label htmlFor="designation-input" className="block text-xs font-bold text-text-secondary uppercase mb-2">Designation</label>
                            <input 
                                id="designation-input"
                                type="text"
                                value={currentUser.name}
                                onChange={(e) => updateUser({ name: e.target.value })}
                                className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-white focus:ring-1 focus:ring-roman-aqua focus:border-roman-aqua transition-all"
                                aria-label="User designation"
                            />
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Signal Color</label>
                            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Select signal color">
                                {USER_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateUser({ color })}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ${currentUser.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''}`}
                                        style={{ backgroundColor: color }}
                                        aria-checked={currentUser.color === color}
                                        role="radio"
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Covenant Selection */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Philosophical Covenant</label>
                            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Select philosophical covenant">
                                <button
                                    onClick={() => updateUser({ covenant: 'motion' })}
                                    className={`p-3 rounded-xl border text-left transition-all ${currentUser.covenant === 'motion' ? 'bg-imperial-purple/20 border-imperial-purple text-white' : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'}`}
                                    aria-checked={currentUser.covenant === 'motion'}
                                    role="radio"
                                    aria-label="Covenant of Motion"
                                >
                                    <div className="font-bold text-sm mb-1">Motion</div>
                                    <div className="text-[10px] opacity-70 leading-tight">Action over contemplation. Speed. Energy. Aurora Theme.</div>
                                </button>
                                <button
                                    onClick={() => updateUser({ covenant: 'silence' })}
                                    className={`p-3 rounded-xl border text-left transition-all ${currentUser.covenant === 'silence' ? 'bg-roman-aqua/20 border-roman-aqua text-white' : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'}`}
                                    aria-checked={currentUser.covenant === 'silence'}
                                    role="radio"
                                    aria-label="Covenant of Silence"
                                >
                                    <div className="font-bold text-sm mb-1">Silence</div>
                                    <div className="text-[10px] opacity-70 leading-tight">Observation over action. Depth. Starlight Theme.</div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'interface' && (
                    <motion.div
                        key="interface"
                        id="settings-panel-interface"
                        role="tabpanel"
                        aria-labelledby="tab-interface"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                    >
                        {/* Interaction Style */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">AI Persona</label>
                            <div className="space-y-2" role="radiogroup" aria-label="Select AI persona interaction style">
                                <button 
                                    onClick={() => onUpdateSettings({ interactionStyle: 'concise' })}
                                    className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${settings.interactionStyle === 'concise' ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                    aria-checked={settings.interactionStyle === 'concise'}
                                    role="radio"
                                    aria-label="Concise AI persona"
                                >
                                    <div>
                                        <div className="text-sm font-bold">Concise</div>
                                        <div className="text-[10px] text-text-tertiary">Minimalist. To the point.</div>
                                    </div>
                                    {settings.interactionStyle === 'concise' && <div className="w-2 h-2 bg-patina-green rounded-full shadow-[0_0_5px_currentColor]"/>}
                                </button>
                                <button 
                                    onClick={() => onUpdateSettings({ interactionStyle: 'conversational' })}
                                    className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${settings.interactionStyle === 'conversational' ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                    aria-checked={settings.interactionStyle === 'conversational'}
                                    role="radio"
                                    aria-label="Conversational AI persona"
                                >
                                    <div>
                                        <div className="text-sm font-bold">Conversational</div>
                                        <div className="text-[10px] text-text-tertiary">Natural. Friendly.</div>
                                    </div>
                                    {settings.interactionStyle === 'conversational' && <div className="w-2 h-2 bg-roman-aqua rounded-full shadow-[0_0_5px_currentColor]"/>}
                                </button>
                                <button 
                                    onClick={() => onUpdateSettings({ interactionStyle: 'technical' })}
                                    className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${settings.interactionStyle === 'technical' ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                    aria-checked={settings.interactionStyle === 'technical'}
                                    role="radio"
                                    aria-label="Technical Protocol AI persona"
                                >
                                    <div>
                                        <div className="text-sm font-bold">Technical Protocol</div>
                                        <div className="text-[10px] text-text-tertiary">Precise. Data-rich.</div>
                                    </div>
                                    {settings.interactionStyle === 'technical' && <div className="w-2 h-2 bg-imperial-purple rounded-full shadow-[0_0_5px_currentColor]"/>}
                                </button>
                            </div>
                        </div>

                        {/* Theme Override */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Visual Mode</label>
                            <div className="flex bg-black/30 p-1 rounded-lg" role="radiogroup" aria-label="Select visual theme">
                                <button 
                                    onClick={() => onUpdateSettings({ theme: Theme.Dark })} 
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${settings.theme === Theme.Dark ? 'bg-white/10 text-white' : 'text-text-tertiary'}`}
                                    aria-checked={settings.theme === Theme.Dark}
                                    role="radio"
                                    aria-label="Dark theme"
                                >
                                    Dark
                                </button>
                                <button 
                                    onClick={() => onUpdateSettings({ theme: Theme.Light })} 
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${settings.theme === Theme.Light ? 'bg-white text-black' : 'text-text-tertiary'}`}
                                    aria-checked={settings.theme === Theme.Light}
                                    role="radio"
                                    aria-label="Light theme"
                                >
                                    Light
                                </button>
                            </div>
                        </div>

                        {/* Performance */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Performance</label>
                            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                                <span className="text-sm text-vitreous-white">Reduced Motion</span>
                                <button 
                                    onClick={() => onUpdateSettings({ animationLevel: settings.animationLevel === AnimationLevel.Full ? AnimationLevel.Minimal : AnimationLevel.Full })}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${settings.animationLevel === AnimationLevel.Minimal ? 'bg-patina-green' : 'bg-white/20'}`}
                                    role="switch"
                                    aria-checked={settings.animationLevel === AnimationLevel.Minimal}
                                    aria-label="Toggle reduced motion"
                                >
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.animationLevel === AnimationLevel.Minimal ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'intelligence' && (
                    <motion.div
                        key="intelligence"
                        id="settings-panel-intelligence"
                        role="tabpanel"
                        aria-labelledby="tab-intelligence"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                    >
                        {/* LLM Provider */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Primary Intelligence Model</label>
                            <div className="space-y-2" role="radiogroup" aria-label="Select primary intelligence model">
                                <button 
                                    onClick={() => onUpdateSettings({ llmProvider: 'ollama' })}
                                    className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${settings.llmProvider === 'ollama' ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                    aria-checked={settings.llmProvider === 'ollama'}
                                    role="radio"
                                    aria-label="Ollama Qwen Coder model"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-1 bg-white rounded text-black text-xs font-bold">Q</div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold">Ollama Qwen Coder</div>
                                            <div className="text-[10px] text-text-tertiary">Local code-focused reasoning.</div>
                                        </div>
                                    </div>
                                    {settings.llmProvider === 'ollama' && <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_5px_currentColor]"/>}
                                </button>
                                <button 
                                    onClick={() => onUpdateSettings({ llmProvider: 'openai' })}
                                    className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${settings.llmProvider === 'openai' ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                    aria-checked={settings.llmProvider === 'openai'}
                                    role="radio"
                                    aria-label="OpenAI GPT-4o model"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-1 bg-black rounded text-white text-xs font-bold">O</div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold">OpenAI GPT-4o</div>
                                            <div className="text-[10px] text-text-tertiary">High logical fidelity.</div>
                                        </div>
                                    </div>
                                    {settings.llmProvider === 'openai' && <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_5px_currentColor]"/>}
                                </button>
                                <button 
                                    onClick={() => onUpdateSettings({ llmProvider: 'anthropic' })}
                                    className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${settings.llmProvider === 'anthropic' ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                    aria-checked={settings.llmProvider === 'anthropic'}
                                    role="radio"
                                    aria-label="Anthropic Claude model"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-1 bg-[#d09a7e] rounded text-black text-xs font-bold">A</div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold">Anthropic Claude</div>
                                            <div className="text-[10px] text-text-tertiary">Context window & safety.</div>
                                        </div>
                                    </div>
                                    {settings.llmProvider === 'anthropic' && <div className="w-2 h-2 bg-[#d09a7e] rounded-full shadow-[0_0_5px_currentColor]"/>}
                                </button>
                            </div>
                        </div>

                        {/* Anomaly Sensitivity */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Anomaly Detection Sensitivity</label>
                            <input 
                                type="range" min="0" max="100" value={settings.anomalySensitivity}
                                onChange={(e) => onUpdateSettings({ anomalySensitivity: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-imperial-purple"
                            />
                            <div className="flex justify-between text-xs text-text-tertiary mt-1">
                                <span>Low</span>
                                <span>{settings.anomalySensitivity}%</span>
                                <span>High</span>
                            </div>
                        </div>

                        {/* MCP Auto-Absorption */}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">MCP Bridge Configuration</label>
                            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                                <div>
                                    <span className="text-sm text-vitreous-white block">Auto-Absorption</span>
                                    <span className="text-[10px] text-text-tertiary block mt-0.5">Automatically ingest relevant MCP data streams.</span>
                                </div>
                                <button 
                                    onClick={() => onUpdateSettings({ mcpAutoAbsorption: !settings.mcpAutoAbsorption })}
                                    className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ml-4 ${settings.mcpAutoAbsorption ? 'bg-patina-green' : 'bg-white/20'}`}
                                    role="switch"
                                    aria-checked={settings.mcpAutoAbsorption}
                                    aria-label="Toggle MCP Auto-Absorption"
                                >
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.mcpAutoAbsorption ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'system' && (
                    <motion.div
                        key="system"
                        id="settings-panel-system"
                        role="tabpanel"
                        aria-labelledby="tab-system"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                    >
                        {/* Reset All Agents */}
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <h4 className="font-bold text-sm text-red-400 mb-2">Agent State Reset</h4>
                            <p className="text-xs text-text-secondary mb-4">
                                Resets all agent statuses to 'Idle' and clears their output caches. Preserves workflow structure.
                            </p>
                            <button 
                                onClick={handleResetAllAgents}
                                className="w-full py-2 bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all"
                            >
                                Reset All Agent States
                            </button>
                        </div>

                        {/* Nuke Workspace */}
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <h4 className="font-bold text-sm text-red-400 mb-2">Total Workspace Annihilation</h4>
                            <p className="text-xs text-text-secondary mb-4">
                                This will purge ALL agents, connections, and crews from the current Syndicate. This action is irreversible.
                            </p>
                            <button 
                                onClick={handleResetWorkspace}
                                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white border border-red-500/40 rounded-lg text-xs font-bold transition-all"
                            >
                                Initiate Sovereign Purge
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
});
SettingsPanelContent.displayName = 'SettingsPanelContent';

export const SettingsPanel: React.FC<SettingsPanelProps> = SettingsPanelContent;