
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import { LayersIcon } from '../../../components/icons/LayersIcon';
import { FolderIcon, UsersIcon } from '../../../components/icons/QuickActionIcons';
import { HistoryIcon } from '../../../components/icons/HistoryIcon';
import { ListTodoIcon } from '../../../components/icons/ListTodoIcon';
import { ClockIcon } from '../../../components/icons/AetheriumIcons'; 

// Canvas Components
import WeaverCanvasCore from '../WeaverCanvasCore';
import CommandBar from '../../../components/CommandBar';
import ControlPanel from '../../../components/ControlPanel';
import { InspectorPanel } from '../../../components/weaver/InspectorPanel';
import { LibraryPanel } from '../../../components/weaver/LibraryPanel';
import TemplateBrowser from '../../../components/TemplateBrowser';
import { ConsolePanel } from '../../../components/weaver/ConsolePanel';
import { TimelinePanel } from '../../../components/weaver/TimelinePanel'; 
import VersionHistoryPanel from '../../../components/weaver/VersionHistoryPanel';
import SaveVersionModal from '../../../components/weaver/SaveVersionModal';
import TutorialHint from '../../../components/shared/TutorialHint';
import Minimap from '../../../components/weaver/Minimap';
import CollaborationPanel from '../../../components/CollaborationPanel';
import WorkflowKanban from '../../../components/weaver/WorkflowKanban';
import { AgentStatus } from '../../../types';

interface DesktopLayoutProps {
    canvasRef: React.RefObject<HTMLDivElement>;
    dragConstraintsRef: React.RefObject<HTMLDivElement>;
    uiState: any; 
    actions: any; 
    canvasProps: any;
    currentUser: any;
    users: any;
    allTemplates: any[];
    chronicleEvents: any[];
    versions: any[]; 
    onSaveVersion: (name: string, desc: string) => void;
    onRestoreVersion: (id: string) => void;
    onDeleteVersion: (id: string) => void;
    onOpenCreator?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
    tutorial?: any;
    collaborationProps: any;
}

const ToolbladeButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <div className="relative group flex items-center justify-center">
        {/* Tooltip Label (Left) - Increased z-index relative to container */}
        <div className="absolute left-full ml-3 px-2 py-1 bg-black/80 border border-white/10 rounded text-[10px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
            {label}
        </div>

        <button 
            onClick={onClick}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 border ${
                isActive 
                ? 'bg-imperial-purple text-white border-imperial-purple/50 shadow-[0_0_15px_rgba(106,13,173,0.4)]' 
                : 'bg-white/5 border-transparent text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/10'
            }`}
        >
            <div className={`transition-transform transform duration-300 ${isActive ? 'scale-100' : 'scale-90 group-hover:scale-100'}`}>
                {icon}
            </div>
        </button>
        
        {/* Active Indicator Dot */}
        {isActive && (
            <motion.div 
                layoutId="toolblade-active"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}
    </div>
);

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ 
    canvasRef, dragConstraintsRef, uiState, actions, canvasProps, currentUser, users, allTemplates, chronicleEvents,
    versions, onSaveVersion, onRestoreVersion, onDeleteVersion, onOpenCreator, onContextMenu, tutorial,
    collaborationProps
}) => {
    
    const handleLibraryDragStart = (e: React.DragEvent, type: any, template: any) => {
        const dragData = template ? { type, template } : { type };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Helper to enforce mutual exclusivity of panels
    const togglePanel = (panelName: string) => {
        // Map of state setters
        const panels: Record<string, (val: boolean) => void> = {
            'library': uiState.setIsLibraryOpen,
            'templates': uiState.setIsTemplatesOpen,
            'timeline': uiState.setIsTimelineOpen,
            'history': uiState.setIsVersionHistoryOpen,
            'collab': uiState.setIsCollaborationPanelOpen,
            'console': uiState.setIsConsoleOpen
        };

        const currentStates: Record<string, boolean> = {
            'library': uiState.isLibraryOpen,
            'templates': uiState.isTemplatesOpen,
            'timeline': uiState.isTimelineOpen,
            'history': uiState.isVersionHistoryOpen,
            'collab': uiState.isCollaborationPanelOpen,
            'console': uiState.isConsoleOpen
        };

        const isCurrentlyOpen = currentStates[panelName];

        // Close all first
        Object.keys(panels).forEach(key => panels[key](false));

        // If it wasn't open, open it.
        if (!isCurrentlyOpen) {
            panels[panelName](true);
        }
    };

    return (
        <div 
            className="relative h-full w-full bg-obsidian-black overflow-hidden select-none flex high-density" 
            ref={dragConstraintsRef}
            onContextMenu={onContextMenu}
        >
            {/* LEFT: Persistent Toolblade - High Z-Index to stay above canvas and floating panels */}
            <motion.div 
                initial={{ x: -60 }} animate={{ x: 0 }}
                className="w-16 h-full flex flex-col items-center gap-6 py-8 bg-black/60 backdrop-blur-xl border-r border-white/5 z-[60] shrink-0 shadow-2xl relative"
            >
                <ToolbladeButton 
                    icon={<LayersIcon className="w-5 h-5" />} 
                    label="Library" 
                    isActive={uiState.isLibraryOpen} 
                    onClick={() => togglePanel('library')} 
                />
                <ToolbladeButton 
                    icon={<FolderIcon className="w-5 h-5" />} 
                    label="Templates" 
                    isActive={uiState.isTemplatesOpen} 
                    onClick={() => togglePanel('templates')} 
                />
                <div className="w-8 h-px bg-white/10" />
                <ToolbladeButton 
                    icon={<ClockIcon className="w-5 h-5" />} 
                    label="Timeline" 
                    isActive={uiState.isTimelineOpen} 
                    onClick={() => togglePanel('timeline')} 
                />
                <ToolbladeButton 
                    icon={<HistoryIcon className="w-5 h-5" />} 
                    label="History" 
                    isActive={uiState.isVersionHistoryOpen} 
                    onClick={() => togglePanel('history')} 
                />
                <div className="w-8 h-px bg-white/10" />
                <ToolbladeButton 
                    icon={<UsersIcon className="w-5 h-5" />} 
                    label="Collaborate" 
                    isActive={uiState.isCollaborationPanelOpen} 
                    onClick={() => togglePanel('collab')} 
                />
                
                {/* Separator before board toggle */}
                <div className="w-8 h-px bg-white/10" />

                {/* Kanban Board toggle */}
                <div className="relative group flex items-center justify-center">
                    <div className="absolute left-full ml-3 px-2 py-1 bg-black/80 border border-white/10 rounded text-[10px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
                        Status Board
                    </div>
                    <button
                        onClick={() => uiState.setViewMode((v: 'canvas' | 'board') => v === 'board' ? 'canvas' : 'board')}
                        title="Toggle Status Board"
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 border relative ${
                            uiState.viewMode === 'board'
                                ? 'bg-roman-aqua text-black border-roman-aqua/50 shadow-[0_0_15px_rgba(32,178,170,0.4)]'
                                : 'bg-white/5 border-transparent text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/10'
                        }`}
                    >
                        {/* Board / Kanban icon */}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <rect x="3" y="3" width="5" height="18" rx="1" />
                            <rect x="10" y="3" width="5" height="13" rx="1" />
                            <rect x="17" y="3" width="5" height="9"  rx="1" />
                        </svg>
                        {uiState.viewMode === 'board' && (
                            <motion.div
                                layoutId="toolblade-active"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-roman-aqua rounded-r-full"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                </div>

                <div className="mt-auto pb-4">
                    <ToolbladeButton 
                        icon={<ListTodoIcon className="w-5 h-5" />} 
                        label="Console" 
                        isActive={uiState.isConsoleOpen} 
                        onClick={() => togglePanel('console')} 
                    />
                </div>
            </motion.div>

            {/* MAIN CANVAS / BOARD AREA */}
            <div 
                className="relative flex-grow h-full overflow-hidden bg-[#050505]"
                onMouseDown={uiState.viewMode === 'canvas' ? actions.handleMouseDown : undefined}
                onMouseMove={uiState.viewMode === 'canvas' ? actions.handleMouseMove : undefined}
                onMouseUp={uiState.viewMode === 'canvas' ? actions.handleMouseUp : undefined}
                onMouseLeave={uiState.viewMode === 'canvas' ? actions.handleMouseLeave : undefined}
                onWheel={uiState.viewMode === 'canvas' ? actions.handleWheel : undefined}
            >
                {/* ── Kanban Board View ─────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {uiState.viewMode === 'board' ? (
                        <motion.div
                            key="board"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute inset-0 z-10"
                        >
                            <WorkflowKanban
                                agents={canvasProps.agents}
                                onUpdateAgentStatus={(agentId, newStatus) =>
                                    actions.updateAgent(agentId, { status: newStatus as AgentStatus })
                                }
                                onToggleVeil={(agentId) => {
                                    const agent = canvasProps.agents[agentId];
                                    if (agent) actions.updateAgent(agentId, { isVeiled: !agent.isVeiled });
                                }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="canvas"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 z-0"
                            ref={canvasRef}
                        >
                            <WeaverCanvasCore {...canvasProps} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LEFT BLADES & HUD OVERLAYS — hidden in board mode */}
                {uiState.viewMode === 'canvas' && (<>
                <AnimatePresence mode="wait">
                    {uiState.isLibraryOpen && (
                        <LibraryPanel 
                            key="library"
                            isOpen={true} 
                            onClose={() => uiState.setIsLibraryOpen(false)} 
                            onDragStart={handleLibraryDragStart} 
                            customTemplates={allTemplates} 
                        />
                    )}
                    {uiState.isTemplatesOpen && (
                        <TemplateBrowser 
                            key="templates"
                            templates={allTemplates} 
                            onAddAgent={actions.handleQuickAdd} 
                            onDeleteTemplate={actions.deleteTemplate} 
                            onClose={() => uiState.setIsTemplatesOpen(false)} 
                            dragConstraintsRef={dragConstraintsRef}
                        />
                    )}
                    {uiState.isTimelineOpen && (
                        <TimelinePanel 
                            key="timeline"
                            events={chronicleEvents} 
                            onClose={() => uiState.setIsTimelineOpen(false)} 
                            dragConstraintsRef={dragConstraintsRef} 
                        />
                    )}
                    {uiState.isVersionHistoryOpen && (
                        <VersionHistoryPanel 
                            key="history"
                            versions={versions} 
                            onRestore={onRestoreVersion} 
                            onDelete={onDeleteVersion} 
                            onClose={() => uiState.setIsVersionHistoryOpen(false)} 
                            onOpenSaveModal={() => uiState.setIsSaveVersionModalOpen(true)} 
                            dragConstraintsRef={dragConstraintsRef} 
                        />
                    )}
                </AnimatePresence>

                {/* FLOATING HUD OVERLAYS */}
                <div className="absolute top-6 right-6 z-50">
                    <ControlPanel zoom={actions.zoom} onZoomIn={() => actions.setZoom((z: number) => Math.min(z + 0.1, 2))} onZoomOut={() => actions.setZoom((z: number) => Math.max(z - 0.1, 0.2))} onResetView={actions.resetView} />
                </div>

                {/* MINIMAP */}
                <div className="absolute bottom-40 left-4 z-40 pointer-events-none">
                     <div className="pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
                         <Minimap agents={canvasProps.agents} pan={canvasProps.pan} zoom={canvasProps.zoom} />
                     </div>
                </div>

                {/* TACTICAL COMMAND BAR */}
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                    <div className="pointer-events-auto">
                        <CommandBar 
                            {...actions} 
                            isCrewMode={uiState.isCrewMode}
                            onToggleCrewMode={uiState.handleToggleCrewMode}
                            isSimulationActive={uiState.isSimulationActive}
                            onToggleSimulation={() => uiState.setIsSimulationActive((p: boolean) => !p)}
                            onOpenCreator={onOpenCreator} 
                            onSave={() => uiState.setIsSaveVersionModalOpen(true)} 
                            isGlobalWorkflowExecuting={actions.isWorkflowExecuting} 
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {tutorial && tutorial.isActive && tutorial.currentStep && <TutorialHint {...tutorial} />}
                </AnimatePresence>

                {/* MODALS */}
                <AnimatePresence>
                    {uiState.isSaveVersionModalOpen && (
                        <SaveVersionModal 
                            isOpen={uiState.isSaveVersionModalOpen}
                            onClose={() => uiState.setIsSaveVersionModalOpen(false)}
                            onSave={onSaveVersion}
                        />
                    )}
                </AnimatePresence>
                </>)}
            </div>

            {/* RIGHT BLADES: Inspector & Collaboration */}
            <AnimatePresence mode="wait">
                {(uiState.selectedAgentId || uiState.isCollaborationPanelOpen) && (
                    <motion.div 
                        initial={{ width: 0, x: 20, opacity: 0 }}
                        animate={{ width: 384, x: 0, opacity: 1 }}
                        exit={{ width: 0, x: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full bg-black/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl shrink-0 z-50 relative"
                    >
                        {uiState.selectedAgentId && canvasProps.agents[uiState.selectedAgentId] ? (
                             <InspectorPanel 
                                agent={canvasProps.agents[uiState.selectedAgentId]}
                                allAgents={canvasProps.agents}
                                onUpdate={(agentId, updates) => actions.updateAgent(agentId, updates)}
                                onDelete={(agentId) => { actions.deleteAgent(agentId); uiState.setSelectedAgentId(null); }}
                                onClose={() => uiState.setSelectedAgentId(null)}
                                onRun={(agentId) => actions.runAgent(agentId)}
                                onSaveTemplate={(agent, name) => actions.saveAgentAsTemplate(agent, name)}
                                onStartConnection={(id, portId) => canvasProps.onStartConnection(id, portId)}
                                onDuplicate={(agentId) => actions.duplicateAgent(agentId)}
                                className="h-full w-full border-none shadow-none bg-transparent"
                                onSynthesizeAvatar={actions.synthesizeAgentAvatar}
                            />
                        ) : uiState.isCollaborationPanelOpen ? (
                            <CollaborationPanel {...collaborationProps} />
                        ) : null}
                        
                        {/* Drag Handle (Visual only for now) */}
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 w-1 h-12 bg-white/20 rounded-full cursor-col-resize hidden md:block opacity-50 hover:opacity-100" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FULL-WIDTH CONSOLE (Overlay) */}
            <AnimatePresence>
                {uiState.isConsoleOpen && (
                    <ConsolePanel events={chronicleEvents} onClose={() => uiState.setIsConsoleOpen(false)} dragConstraintsRef={dragConstraintsRef} />
                )}
            </AnimatePresence>
        </div>
    );
};
