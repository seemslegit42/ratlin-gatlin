
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LockIcon, UnlockIcon } from '../../../components/icons/LockIcons';
import { ShareIcon } from '../../../components/icons/MarketingIcons';
import { SearchIcon } from '../../../components/icons/CommandPaletteIcons'; 
import WeaverCanvasCore from '../WeaverCanvasCore';
import CommandBar from '../../../components/CommandBar';
import MobileInspector from '../../../components/weaver/MobileInspector';
import MobileAddAgentSheet from '../../../components/MobileAddAgentSheet'; 
import SaveVersionModal from '../../../components/weaver/SaveVersionModal';
import ShareModal from '../../../components/weaver/ShareModal';
import WorkflowKanban from '../../../components/weaver/WorkflowKanban';
import { AgentStatus, AgentType } from '../../../types';
import MobileToolbar from '../../../components/MobileToolbar';
import MobileAgentListItem from '../../../components/MobileAgentListItem';

interface MobileLayoutProps {
    canvasRef: React.RefObject<HTMLDivElement>;
    uiState: any;
    actions: any;
    canvasProps: any;
    currentUser: any;
    users: any;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
    canvasRef, uiState, actions, canvasProps, currentUser, users
}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const isBoardView = uiState.viewMode === 'board';

    return (
        <div 
            className="flex flex-col h-full bg-obsidian-black relative overflow-hidden high-density" 
            ref={canvasRef}
        >
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center space-x-2 pointer-events-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); uiState.setIsShareModalOpen(true); }}
                        className="p-3 rounded-full bg-panel-bg/80 border border-glass-border text-white shadow-lg backdrop-blur-md"
                        title="Share"
                    >
                        <ShareIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Board / Canvas toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            uiState.setViewMode((v: 'canvas' | 'board') => v === 'board' ? 'canvas' : 'board');
                        }}
                        className={`p-3 rounded-full border shadow-lg backdrop-blur-md z-10 transition-all duration-300 ${
                            isBoardView
                                ? 'bg-roman-aqua text-black border-roman-aqua'
                                : 'bg-panel-bg/80 border-glass-border text-white'
                        }`}
                        aria-label={isBoardView ? 'Switch to Canvas view' : 'Switch to Board view'}
                        title={isBoardView ? 'Canvas view' : 'Board view'}
                    >
                        {/* Kanban icon */}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <rect x="3" y="3" width="5" height="18" rx="1" />
                            <rect x="10" y="3" width="5" height="13" rx="1" />
                            <rect x="17" y="3" width="5" height="9"  rx="1" />
                        </svg>
                    </button>

                    {!isBoardView && (
                        <div className="relative flex items-center">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.input
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 160, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        type="text"
                                        placeholder="Search..."
                                        value={uiState.searchQuery}
                                        onChange={(e) => uiState.setSearchQuery(e.target.value)}
                                        className="bg-panel-bg/90 border border-glass-border rounded-full py-2.5 px-4 text-sm text-white placeholder-white/40 focus:outline-none backdrop-blur-md absolute left-12"
                                        autoFocus
                                    />
                                )}
                            </AnimatePresence>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsSearchOpen(!isSearchOpen); if(isSearchOpen) uiState.setSearchQuery(''); }}
                                className={`p-3 rounded-full border shadow-lg backdrop-blur-md z-10 transition-colors ${isSearchOpen ? 'bg-roman-aqua text-black border-roman-aqua' : 'bg-panel-bg/80 border-glass-border text-white'}`}
                                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                                title={isSearchOpen ? 'Close search' : 'Open search'}
                            >
                                <SearchIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {!isBoardView && (
                    <button
                        onClick={(e) => { e.stopPropagation(); uiState.setIsMobilePanLocked(!uiState.isMobilePanLocked); }}
                        className={`pointer-events-auto p-3 rounded-full shadow-lg border transition-all duration-300 ${!uiState.isMobilePanLocked ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-panel-bg/80 border-glass-border text-text-secondary'}`}
                        aria-label={uiState.isMobilePanLocked ? 'Unlock canvas pan' : 'Lock canvas pan'}
                        title={uiState.isMobilePanLocked ? 'Unlock canvas pan' : 'Lock canvas pan'}
                    >
                        {uiState.isMobilePanLocked ? <LockIcon className="w-6 h-6" /> : <UnlockIcon className="w-6 h-6" />}
                    </button>
                )}
            </div>

            {/* Mobile Agent Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && !isBoardView && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 left-4 right-4 z-40 max-h-72 overflow-y-auto bg-panel-bg/95 backdrop-blur-2xl border border-glass-border rounded-2xl p-2 space-y-1 shadow-2xl custom-scrollbar"
                    >
                        {Object.values(canvasProps.agents as Record<string, any>)
                            .filter((a: any) => !uiState.searchQuery || a.name.toLowerCase().includes(uiState.searchQuery.toLowerCase()))
                            .map((agent: any) => (
                                <MobileAgentListItem
                                    key={agent.id}
                                    agent={agent}
                                    onSelect={(id) => { uiState.setSelectedAgentId(id); setIsSearchOpen(false); }}
                                    onRunAgent={(id) => actions.runAgent(id)}
                                    onStartConnection={(id) => canvasProps.onStartConnection(id)}
                                    onCompleteConnection={(id) => canvasProps.onCompleteConnection(id)}
                                    isConnectionMode={!!canvasProps.connectionSourceId}
                                    connectionSourceId={canvasProps.connectionSourceId}
                                    connectedOutputPorts={canvasProps.connections?.filter((c: any) => c.sourceAgentId === agent.id).map((c: any) => c.sourcePortId) || []}
                                />
                            ))}
                        {Object.values(canvasProps.agents as Record<string, any>).length === 0 && (
                            <p className="text-center py-4 text-xs text-text-tertiary">No agents found in workspace.</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content area — canvas OR board */}
            <AnimatePresence mode="wait">
                {isBoardView ? (
                    <motion.div
                        key="board"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.22 }}
                        className="flex-grow relative z-0 pt-16"
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
                        transition={{ duration: 0.18 }}
                        className="flex-grow relative z-0 flex flex-col h-full"
                        onTouchStart={(e) => { if (!uiState.isMobilePanLocked) actions.handleMouseDown(e); }}
                        onTouchMove={(e) => { if (!uiState.isMobilePanLocked) actions.handleMouseMove(e); }}
                        onTouchEnd={actions.handleMouseUp}
                        onClick={actions.onCanvasClick}
                    >
                        <div className="pt-16 z-10 relative">
                            <MobileToolbar 
                                onAddAgentClick={() => uiState.setIsCreationModalOpen(true)}
                                onRunAllAgents={actions.runAllAgents}
                            />
                        </div>
                        <div className="flex-grow relative overflow-hidden">
                            <WeaverCanvasCore {...canvasProps} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button (Add Agent) */}
            <AnimatePresence>
                {!uiState.selectedAgentId && (
                    <motion.button 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            uiState.setIsCreationModalOpen(true);
                        }}
                        className="absolute bottom-48 right-4 w-14 h-14 bg-patina-green text-black rounded-full shadow-glass flex items-center justify-center z-30 pointer-events-auto hover:scale-110 transition-transform active:scale-95 border-2 border-white/20"
                    >
                        <span className="text-3xl leading-none pb-1 font-light">+</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Bar (Command Bar) */}
            <div className="absolute bottom-24 left-0 right-0 z-30 flex justify-center pointer-events-none px-2">
                 <div className="pointer-events-auto w-full max-w-md">
                    <CommandBar 
                        onRunAll={actions.runAllAgents}
                        onToggleCrewMode={uiState.handleToggleCrewMode}
                        isCrewMode={uiState.isCrewMode}
                        isSimulationActive={uiState.isSimulationActive}
                        onToggleSimulation={() => uiState.setIsSimulationActive((p: boolean) => !p)}
                        isWorkflowRunning={false}
                        isGlobalWorkflowExecuting={actions.isGlobalWorkflowExecuting}
                        onUndo={actions.undo}
                        onRedo={actions.redo}
                        canUndo={actions.canUndo}
                        canRedo={actions.canRedo}
                        onResetWorkspace={actions.resetWorkspace}
                        onConnectAll={actions.connectAllAgents}
                        onLayoutAgents={actions.layoutAgents}
                        mode={canvasProps.mode} 
                        onOpenCreator={() => uiState.setIsCreationModalOpen(true)}
                        onSave={() => uiState.setIsSaveVersionModalOpen(true)}
                    />
                </div>
            </div>

            {/* Mobile Add Agent Sheet */}
            <MobileAddAgentSheet 
                isOpen={uiState.isCreationModalOpen} 
                onClose={() => uiState.setIsCreationModalOpen(false)} 
                onAddAgent={actions.handleQuickAdd}
                templates={[]} 
                onDeleteTemplate={() => {}}
            />

            {/* Mobile Inspector Sheet */}
            <AnimatePresence>
                {uiState.selectedAgentId && canvasProps.agents[uiState.selectedAgentId] && (
                    <MobileInspector 
                        agent={canvasProps.agents[uiState.selectedAgentId]}
                        onUpdate={(updates) => actions.updateAgent(uiState.selectedAgentId!, updates)}
                        onDelete={() => { actions.deleteAgent(uiState.selectedAgentId!); uiState.setSelectedAgentId(null); }}
                        onClose={() => uiState.setSelectedAgentId(null)}
                        onRun={() => actions.runAgent(uiState.selectedAgentId!)}
                        onStartConnection={(id) => canvasProps.onStartConnection(id)}
                    />
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {uiState.isSaveVersionModalOpen && (
                    <SaveVersionModal 
                        isOpen={uiState.isSaveVersionModalOpen}
                        onClose={() => uiState.setIsSaveVersionModalOpen(false)}
                        onSave={canvasProps.onSaveVersion}
                    />
                )}
            </AnimatePresence>

            <ShareModal
                isOpen={uiState.isShareModalOpen}
                onClose={() => uiState.setIsShareModalOpen(false)}
                syndicateId={currentUser?.syndicateId || ''}
                users={users || {}}
            />
        </div>
    );
};
