/**
 * @file modules/weaver/Weaver.tsx
 * @description Agent orchestration canvas (Architect mode). Former product name: Loom Studio.
 */

import React, { useRef, useState } from 'react';
import type { Agent, AgentTemplate, Connection, WeaverMode, View, CurrentUser, KlepsydraMetric, ChronicleEvent } from '../../types';
import { AgentType } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { useWeaverUI } from './hooks/useWeaverUI';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { DesktopLayout } from './layout/DesktopLayout';
import { MobileLayout } from './layout/MobileLayout';
import { executeViaLoom } from '../../services/ollamaService';
import { applyAutoLayout } from '../../services/layoutService';
import { nanoid } from 'nanoid';
import { AgentContextMenu } from '../../components/weaver/AgentContextMenu';
import SaveTemplateModal from '../../components/weaver/SaveTemplateModal';

interface WeaverProps {
    agents: Record<string, Agent>;
    setAgents: React.Dispatch<React.SetStateAction<Record<string, Agent>>>;
    connections: Connection[];
    setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
    updateAgent: (id: string, updates: Partial<Agent>, options?: { snapshot?: boolean, persist?: boolean }) => void;
    addAgent: (type: any, template?: any, dropAnchor?: { x: number; y: number }) => Promise<any>; 
    deleteAgent: (id: string) => Promise<void>; 
    duplicateAgent: (id: string) => Promise<void>; 
    resetWorkspace: () => Promise<void>; 
    resetAllAgents: () => Promise<void>;
    addConnection: (conn: Connection) => Promise<void>;
    deleteConnection: (id: string) => Promise<void>; 
    currentUser: CurrentUser;
    onNavigate: (view: View) => void;
    mode: WeaverMode;
    setMode: (mode: WeaverMode) => void;
    syndicateId: string;
    addTask: any;
    klepsydra: KlepsydraMetric;
    economyData: any;
    tutorial?: any;
    versions?: any[];
    saveVersion: (name: string, desc: string) => void;
    restoreVersion: (id: string) => void;
    deleteVersion: (id: string) => void;
    saveTemplate: (agent: Agent, name: string) => void;
    synthesizeAgentAvatar: (agent: Agent) => Promise<void>;
    /** Workflow templates from useWorkflowState — passed via spread. */
    templates?: AgentTemplate[];
    /** Chronicle events from useWorkflowState — passed via spread. */
    chronicle?: ChronicleEvent[];
}

const Weaver: React.FC<WeaverProps> = (props) => {
    const { 
        agents, updateAgent, addAgent, deleteAgent, duplicateAgent,
        connections, addConnection, deleteConnection,
        currentUser, mode, setMode, tutorial, resetWorkspace, resetAllAgents,
        versions = [], saveVersion, restoreVersion, deleteVersion, saveTemplate, synthesizeAgentAvatar,
        templates = [], chronicle = [],
    } = props;

    const { addNotification } = useNotifications();
    const isMobile = useBreakpoint();
    const canvasRef = useRef<HTMLDivElement>(null);
    const dragConstraintsRef = useRef<HTMLDivElement>(null);
    const [isWorkflowExecuting, setIsWorkflowExecuting] = useState(false);

    const uiState = useWeaverUI();
    const { 
        pan, zoom, setZoom, 
        handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleWheel,
        resetView 
    } = useCanvasInteraction(canvasRef);

    const [connectionSource, setConnectionSource] = useState<{ agentId: string; portId: string } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number; agentId: string | null }>({
        isOpen: false, x: 0, y: 0, agentId: null
    });
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [agentToSaveAsTemplate, setAgentToSaveAsTemplate] = useState<string | null>(null);

    const handleStartConnection = (agentId: string, portId: string = 'default') => {
        setConnectionSource({ agentId, portId });
    };

    const handleCompleteConnection = (targetAgentId: string, targetPortId: string = 'default') => {
        if (!connectionSource || connectionSource.agentId === targetAgentId) {
            setConnectionSource(null);
            return;
        }

        const newConnection: Connection = {
            id: nanoid(),
            syndicateId: currentUser.syndicateId,
            from: { agentId: connectionSource.agentId, portId: connectionSource.portId },
            to: { agentId: targetAgentId, portId: targetPortId }
        };

        addConnection(newConnection);
        setConnectionSource(null);
    };

    const handleNodeContextMenu = (id: string, e: React.MouseEvent) => {
        setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, agentId: id });
    };

    const handleContextMenuAction = (action: 'delete' | 'duplicate' | 'saveTemplate' | 'run' | 'connect') => {
        if (!contextMenu.agentId) return;
        const agentId = contextMenu.agentId;

        switch (action) {
            case 'delete':
                deleteAgent(agentId);
                break;
            case 'duplicate':
                duplicateAgent(agentId);
                break;
            case 'saveTemplate':
                setAgentToSaveAsTemplate(agentId);
                setIsSaveTemplateModalOpen(true);
                break;
            case 'run':
                addNotification(`Executing unit: ${agentId.slice(0, 8)}`, "info");
                break;
            case 'connect':
                handleStartConnection(agentId);
                break;
        }
        setContextMenu({ isOpen: false, x: 0, y: 0, agentId: null });
    };

    const handleSaveTemplateConfirm = (name: string) => {
        if (agentToSaveAsTemplate && agents[agentToSaveAsTemplate]) {
            saveTemplate(agents[agentToSaveAsTemplate], name);
            addNotification(`Template "${name}" saved.`, "success");
        }
        setIsSaveTemplateModalOpen(false);
        setAgentToSaveAsTemplate(null);
    };

    const isPaletteHtmlDrag = (dt: DataTransfer | null) =>
        !!dt && Array.from(dt.types).includes('application/json');

    /** Matches workflow collision box centering (NODE ~340×240). */
    const PALETTE_DROP_HALF = { w: 170, h: 120 };

    const clientToCanvas = (clientX: number, clientY: number): { x: number; y: number } | null => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return {
            x: (clientX - rect.left - pan.x) / zoom,
            y: (clientY - rect.top - pan.y) / zoom,
        };
    };

    const handlePaletteDragOverCapture = (e: React.DragEvent) => {
        if (!isPaletteHtmlDrag(e.dataTransfer)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handlePaletteDropCapture = (e: React.DragEvent) => {
        if (!isPaletteHtmlDrag(e.dataTransfer)) return;
        e.preventDefault();
        e.stopPropagation();
        if (mode !== 'architect') return;

        let payload: { type?: string; template?: AgentTemplate };
        try {
            payload = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            return;
        }
        if (!payload.type || !(Object.values(AgentType) as string[]).includes(payload.type)) return;

        const c = clientToCanvas(e.clientX, e.clientY);
        if (!c) return;

        const anchor = {
            x: c.x - PALETTE_DROP_HALF.w,
            y: c.y - PALETTE_DROP_HALF.h,
        };

        void (async () => {
            try {
                const agent = await addAgent(payload.type as AgentType, payload.template, anchor);
                if (agent?.id) uiState.setSelectedAgentId(agent.id);
            } catch (err) {
                console.warn(err);
                addNotification('Could not place node from palette.', 'info');
            }
        })();
    };

    const canvasProps = {
        agents,
        connections,
        crews: {},
        users: {},
        connectionPreview: connectionSource && mousePos && agents[connectionSource.agentId] ? {
            from: agents[connectionSource.agentId],
            to: mousePos,
            portId: connectionSource.portId
        } : null,
        hoveredAgentId: uiState.hoveredAgentId,
        selectedAgentId: uiState.selectedAgentId,
        selectedAgentIdsForCrew: uiState.selectedAgentIdsForCrew,
        isSimulationActive: uiState.isSimulationActive,
        isMobile,
        isMobilePanLocked: uiState.isMobilePanLocked,
        searchQuery: uiState.searchQuery,
        onSelectAgent: uiState.setSelectedAgentId,
        onDragAgent: (id: string, pos: {x: number, y: number}) => updateAgent(id, { position: pos }, { persist: false, snapshot: false }),
        onDragEndAgent: (id: string) => updateAgent(id, {}, { persist: true, snapshot: true }),
        onRunAgent: (id: string) => addNotification(`Executing unit: ${id.slice(0,8)}`, "info"),
        onStartConnection: handleStartConnection,
        onCompleteConnection: handleCompleteConnection,
        onEnterAgent: uiState.setHoveredAgentId,
        onLeaveAgent: () => uiState.setHoveredAgentId(null),
        onDeleteConnection: deleteConnection,
        onCanvasClick: () => { uiState.setSelectedAgentId(null); setConnectionSource(null); },
        zoom,
        pan,
        mode,
        onVeilPeel: (id: string) => updateAgent(id, { isVeiled: !agents[id].isVeiled }),
        currentBubbles: {},
        tutorial,
        onNodeContextMenu: handleNodeContextMenu,
        onDragOverCapture: handlePaletteDragOverCapture,
        onDropCapture: handlePaletteDropCapture,
    };

    const actions = {
        handleQuickAdd: (type: AgentType, template?: AgentTemplate) => addAgent(type, template),
        handleMouseDown, 
        handleMouseMove: (e: any) => {
            handleMouseMove(e);
            if (connectionSource) {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                    setMousePos({ 
                        x: (e.clientX - rect.left - pan.x) / zoom, 
                        y: (e.clientY - rect.top - pan.y) / zoom 
                    });
                }
            }
        }, 
        handleMouseUp, 
        handleMouseLeave, 
        handleWheel,
        setZoom, resetView,
        addAgent, updateAgent, deleteAgent, duplicateAgent,
        runAllAgents: async () => {
            setIsWorkflowExecuting(true);
            try { await executeViaLoom(Object.values(agents), {}); }
            finally { setIsWorkflowExecuting(false); }
        },
        resetWorkspace, resetAllAgents,
        undo: () => {},
        redo: () => {},
        canUndo: false,
        canRedo: false,
        /** Auto-connect all agents in creation order (sequential chain). */
        connectAllAgents: () => {
            const agentList = Object.values(agents);
            if (agentList.length < 2) { addNotification('Need ≥ 2 agents to chain-connect.', 'info'); return; }
            agentList.forEach((agent, i) => {
                if (i < agentList.length - 1) {
                    void addConnection({
                        id: nanoid(),
                        syndicateId: currentUser.syndicateId,
                        from: { agentId: agent.id, portId: 'default' },
                        to: { agentId: agentList[i + 1].id, portId: 'default' },
                    });
                }
            });
            addNotification(`Chained ${agentList.length - 1} connection${agentList.length > 2 ? 's' : ''}.`, 'success');
        },
        /** Auto-arrange all agents using the layout service DAG algorithm. */
        layoutAgents: () => {
            const layouted = applyAutoLayout({ ...agents }, connections);
            Object.entries(layouted).forEach(([id, agent]) => {
                updateAgent(id, { position: agent.position }, { persist: true, snapshot: false });
            });
            addNotification('Canvas auto-arranged.', 'success');
        },
        onCanvasClick: canvasProps.onCanvasClick,
        runAgent: (id: string) => addNotification(`Executing unit: ${id.slice(0,8)}`, "info"),
        saveAgentAsTemplate: (agent: Agent, name: string) => { saveTemplate(agent, name); addNotification(`Template "${name}" saved.`, "success"); },
        /** Delete template — no-op with feedback (no server delete endpoint yet). */
        deleteTemplate: (_id: string) => { addNotification('Template deletion not yet supported.', 'info'); },
        isWorkflowExecuting,
        synthesizeAgentAvatar,
    };

    return (
        <div className="h-full w-full relative high-density">
            {isMobile ? (
                <MobileLayout
                    canvasRef={canvasRef}
                    uiState={uiState}
                    actions={actions}
                    canvasProps={canvasProps}
                    currentUser={currentUser}
                    users={{}}
                />
            ) : (
                <DesktopLayout 
                    canvasRef={canvasRef}
                    dragConstraintsRef={dragConstraintsRef}
                    uiState={uiState}
                    actions={actions}
                    canvasProps={{ ...canvasProps, onSaveVersion: saveVersion }}
                    currentUser={currentUser}
                    users={{}}
                    allTemplates={templates}
                    chronicleEvents={chronicle}
                    versions={versions}
                    onSaveVersion={saveVersion}
                    onRestoreVersion={restoreVersion}
                    onDeleteVersion={deleteVersion}
                    onOpenCreator={() => uiState.setIsCreationModalOpen(true)}
                    onContextMenu={(e: React.MouseEvent) => {
                        e.preventDefault();
                        uiState.setQuickAddMenu({ x: e.clientX, y: e.clientY });
                    }}
                    tutorial={tutorial}
                    collaborationProps={{ self: currentUser, users: {}, messages: [], onSendMessage: () => {}, onMentionAgent: () => {}, isMobile: false }}
                />
            )}
            
            {contextMenu.isOpen && (
                <AgentContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
                    onAction={handleContextMenuAction}
                />
            )}

            <SaveTemplateModal
                isOpen={isSaveTemplateModalOpen}
                onClose={() => setIsSaveTemplateModalOpen(false)}
                onSave={handleSaveTemplateConfirm}
            />
        </div>
    );
};

export default Weaver;
