
import React from 'react';
import type { View } from '../../types';
import { DesktopWidgetType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

// Canonical Icon Imports
// Core Modules
import { WeaverIcon } from '../icons/WeaverIcon';
import { SimulationIcon } from '../icons/SimulationIcon';
import { LayersIcon } from '../icons/LayersIcon'; 
import { BrainIcon } from '../icons/BrainIcon'; 
import { DatabaseIcon } from '../icons/AetheriumIcons';

// ERP Modules
import { ChartBarIcon, CoinsIcon } from '../icons/EconomyIcons';
import { UserGroupIcon } from '../icons/CommandPaletteIcons'; 
import { UsersIcon } from '../icons/QuickActionIcons'; 
import { MegaphoneIcon } from '../icons/MarketingIcons'; 
import { FolderIcon } from '../icons/QuickActionIcons'; 
import { ListTodoIcon } from '../icons/ListTodoIcon'; 
import { ShieldIcon } from '../icons/SecurityIcons'; 
import { CrownIcon } from '../icons/CrownIcon'; 
import { BookIcon } from '../icons/BookIcon'; 

// Widget Specific Icons
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons'; 

interface CommandCenterProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: View) => void;
    onQuickAction: (command: string) => void;
    onSpawnWidget: (type: DesktopWidgetType) => void;
}

const ModuleButton: React.FC<{ icon: React.ReactNode, label: string, view: View, onNavigate: (view: View) => void, delay: number }> = ({ icon, label, view, onNavigate, delay }) => (
    <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.05 }}
        onClick={() => onNavigate(view)}
        className="one-tap-tile group w-full"
        aria-label={`Open ${label}`}
    >
        <div className="text-text-tertiary group-hover:text-roman-aqua group-active:scale-105 transition-all duration-200">
            {icon}
        </div>
        <span className="text-[10px] font-comfortaa font-bold text-text-secondary group-hover:text-vitreous-white uppercase tracking-wide text-center leading-tight">{label}</span>
    </motion.button>
);

const WidgetButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="one-tap-row group"
        aria-label={label}
    >
        <div className="text-text-tertiary group-hover:text-patina-green transition-colors flex-shrink-0">{icon}</div>
        <span className="text-xs font-lexend font-semibold text-text-secondary group-hover:text-vitreous-white">{label}</span>
    </button>
);

const CommandCenterContent: React.FC<Pick<CommandCenterProps, 'onNavigate' | 'onQuickAction' | 'onClose' | 'onSpawnWidget'>> = ({ onNavigate, onQuickAction, onClose, onSpawnWidget }) => {
    
    return (
        <div className="flex flex-col h-full overflow-hidden high-density">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center px-3 md:px-5 py-2.5 border-b border-white/5 bg-panel-bg backdrop-blur-md z-10">
                <div>
                    <h3 id="command-center-title" className="app-heading font-bold text-base md:text-lg font-comfortaa text-vitreous-white">System Core</h3>
                    <p className="text-[10px] font-lexend text-text-tertiary uppercase tracking-widest">One-tap module access</p>
                </div>
                <button type="button" onClick={onClose} className="one-tap p-2 rounded-full text-vitreous-white/50 hover:bg-white/10 hover:text-white transition-colors" title="Close Command Center" aria-label="Close System Core">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-2.5 md:p-4 space-y-3 md:space-y-4 pb-20 md:pb-4">
                
                {/* 1. NEUROMANCY (Core) */}
                <section className="density-section">
                    <div className="density-section__header">
                        <h4 className="density-section__title text-imperial-purple">Neuromancy</h4>
                    </div>
                    <div className="density-grid">
                        <ModuleButton icon={<BrainIcon className="w-8 h-8" />} label="Cockpit" view="main" onNavigate={onNavigate} delay={0} />
                        <ModuleButton icon={<WeaverIcon className="w-8 h-8" />} label="Weaver" view="weaver" onNavigate={onNavigate} delay={1} />
                        <ModuleButton icon={<SimulationIcon className="w-8 h-8" />} label="Galaxy View" view="simulacrum" onNavigate={onNavigate} delay={2} />
                        <ModuleButton icon={<LayersIcon className="w-8 h-8" />} label="Micro-App Forge" view="microAppForge" onNavigate={onNavigate} delay={3} />
                        <ModuleButton icon={<DatabaseIcon className="w-8 h-8" />} label="Data Vault" view="vault" onNavigate={onNavigate} delay={4} />
                        <ModuleButton icon={<FolderIcon className="w-8 h-8" />} label="Registry" view="registry" onNavigate={onNavigate} delay={5} />
                    </div>
                </section>

                {/* 2. DOMINION (Ops) */}
                <section className="density-section">
                    <div className="density-section__header">
                        <h4 className="density-section__title text-roman-aqua">Dominion</h4>
                    </div>
                    <div className="density-grid">
                        <ModuleButton icon={<ListTodoIcon className="w-8 h-8" />} label="Operations" view="operations" onNavigate={onNavigate} delay={5} />
                        <ModuleButton icon={<LayersIcon className="w-8 h-8" />} label="Production" view="production" onNavigate={onNavigate} delay={6} />
                        <ModuleButton icon={<FolderIcon className="w-8 h-8" />} label="Procurement" view="procurement" onNavigate={onNavigate} delay={7} />
                        <ModuleButton icon={<ShieldIcon className="w-8 h-8" />} label="Security" view="security" onNavigate={onNavigate} delay={8} />
                    </div>
                </section>

                {/* 3. INFLUENCE (Growth) */}
                <section className="density-section">
                    <div className="density-section__header">
                        <h4 className="density-section__title text-patina-green">Influence</h4>
                    </div>
                    <div className="density-grid">
                        <ModuleButton icon={<MegaphoneIcon className="w-8 h-8" />} label="Marketing" view="marketing" onNavigate={onNavigate} delay={9} />
                        <ModuleButton icon={<UserGroupIcon className="w-8 h-8" />} label="CRM" view="crm" onNavigate={onNavigate} delay={10} />
                        <ModuleButton icon={<UsersIcon className="w-8 h-8" />} label="HRM" view="hrm" onNavigate={onNavigate} delay={11} />
                        <ModuleButton icon={<BookIcon className="w-8 h-8" />} label="Codex" view="codex" onNavigate={onNavigate} delay={12} />
                        <ModuleButton icon={<BookIcon className="w-8 h-8" />} label="Help Center" view="help" onNavigate={onNavigate} delay={13} />
                    </div>
                </section>

                {/* 4. TREASURY (Finance & Games) */}
                <section className="density-section">
                    <div className="density-section__header">
                        <h4 className="density-section__title text-yellow-400">Treasury & Arena</h4>
                    </div>
                    <div className="density-grid">
                        <ModuleButton icon={<ChartBarIcon className="w-8 h-8" />} label="Finance" view="finance" onNavigate={onNavigate} delay={14} />
                        <ModuleButton icon={<ChartBarIcon className="w-8 h-8" />} label="AVF Deck" view="avf" onNavigate={onNavigate} delay={15} />
                        <ModuleButton icon={<CoinsIcon className="w-8 h-8" />} label="Xi Economy" view="economy" onNavigate={onNavigate} delay={15} />
                        <ModuleButton icon={<CrownIcon className="w-8 h-8" />} label="The Pantheon" view="pantheon" onNavigate={onNavigate} delay={16} />
                        <ModuleButton icon={<BrainIcon className="w-8 h-8 text-yellow-400" />} label="Admin Root" view="admin" onNavigate={onNavigate} delay={17} />
                    </div>
                </section>

                {/* 5. WIDGETS (Spawners) */}
                <section className="density-section">
                    <div className="density-section__header">
                        <h4 className="density-section__title text-text-tertiary">Holographic Widgets</h4>
                    </div>
                    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-2">
                        <WidgetButton 
                            icon={<TrendingUpIcon className="w-5 h-5" />} 
                            label="Financial Flow" 
                            onClick={() => onSpawnWidget(DesktopWidgetType.FinancialPulse)} 
                        />
                         <WidgetButton 
                            icon={<BrainIcon className="w-5 h-5" />} 
                            label="System Health" 
                            onClick={() => onSpawnWidget(DesktopWidgetType.SystemResources)} 
                        />
                        <WidgetButton 
                            icon={<ListTodoIcon className="w-5 h-5" />} 
                            label="Task Log" 
                            onClick={() => onQuickAction("Show my active tasks")} 
                        />
                        <WidgetButton 
                            icon={<ZapIcon className="w-5 h-5" />} 
                            label="Syndicate Pulse" 
                            onClick={() => onSpawnWidget(DesktopWidgetType.SyndicateOverview)} 
                        />
                        <WidgetButton 
                            icon={<ListTodoIcon className="w-5 h-5" />} 
                            label="Live Chronicle" 
                            onClick={() => onSpawnWidget(DesktopWidgetType.Chronicle)} 
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose, onNavigate, onQuickAction, onSpawnWidget }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    // Increased z-index to z-[200] to overlay GlobalMobileNav (z-100)
                    className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-8"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-panel-bg/95 backdrop-blur-3xl border border-imperial-purple/20 w-full max-w-4xl h-[90vh] sm:h-[80vh] sm:rounded-2xl rounded-t-2xl shadow-[0_0_50px_rgba(106,13,173,0.3)] overflow-hidden flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="command-center-title"
                    >
                        {/* Edge-lit effect */}
                        <div className="absolute inset-0 pointer-events-none border border-patina-green/10 rounded-[inherit] z-50" />
                        <CommandCenterContent onNavigate={(view) => { onNavigate(view); onClose(); }} onQuickAction={onQuickAction} onClose={onClose} onSpawnWidget={onSpawnWidget} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommandCenter;
