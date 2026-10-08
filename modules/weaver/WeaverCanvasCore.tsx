
/**
 * @file modules/weaver/WeaverCanvasCore.tsx
 * @description The visual engine of the Weaver Studio.
 */

import React, { memo, useMemo } from 'react';
// Fix: Added missing motion import from framer-motion
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, Connection, Crew, User, WeaverMode } from '../../types';
import { AgentStatus } from '../../types';

import Node from '../../components/weaver/Node';
import Thread from '../../components/weaver/Thread';
import MultiplayerCursors from '../../components/MultiplayerCursors';
import SimulationLayer from '../../components/SimulationLayer';
import GridBackground from '../../components/weaver/GridBackground';
import CrewBox from '../../components/weaver/CrewBox';
import { useDependencyMap } from '../../hooks/useDependencyMap';
import TutorialHint from '../../components/shared/TutorialHint';

// --- CONSTANTS ---
const Z_INDEX = {
    GRID: 0,
    CONNECTIONS: 10,
    CONNECTION_PREVIEW: 15,
    CREWS: 18,
    NODES: 20,
    EFFECTS: 30,
    CURSORS: 40
};

interface WeaverCanvasCoreProps {
  agents: Record<string, Agent>;
  connections: Connection[];
  crews: Record<string, Crew>;
  users: Record<string, User>;
  selfId?: string;
  connectionPreview: { from: Agent; to: { x: number; y: number }; portId: string } | null;
  hoveredAgentId: string | null;
  selectedAgentId: string | null;
  selectedAgentIdsForCrew: string[];
  isSimulationActive: boolean;
  isDependencyViewActive?: boolean; // New prop for dependency mapping
  isMobile: boolean;
  isMobilePanLocked: boolean;
  searchQuery: string;
  onSelectAgent: (id: string) => void;
  onDragAgent: (id: string, pos: { x: number; y: number }) => void;
  onDragEndAgent: (id: string) => void;
  onRunAgent: (id: string) => void;
  onStartConnection: (id: string, portId: string) => void;
  onCompleteConnection: (id: string, portId: string) => void;
  onEnterAgent: (id: string) => void;
  onLeaveAgent: () => void;
  onDeleteConnection: (connectionId: string) => void;
  onCanvasClick: () => void;
  zoom: number;
  pan: { x: number; y: number };
  mode: WeaverMode;
  onVeilPeel: () => void;
  currentBubbles: Record<string, string>;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  /** Capture-phase handlers so palette HTML5 drops work over nested nodes/tools. */
  onDropCapture?: (e: React.DragEvent) => void;
  onDragOverCapture?: (e: React.DragEvent) => void;
  onRunCrew?: (crewId: string) => void;
  onEditCrew?: (crewId: string) => void;
  tutorial?: any;
  onNodeContextMenu?: (id: string, e: React.MouseEvent) => void;
}

// --- LAYER COMPONENTS ---

const ConnectionsLayer = memo(({ connections, agents, onDeleteConnection, mode, criticalPathIds, isDependencyViewActive }: { 
    connections: Connection[], 
    agents: Record<string, Agent>, 
    onDeleteConnection: (id: string) => void,
    mode: WeaverMode,
    criticalPathIds: Set<string>,
    isDependencyViewActive: boolean
}) => {
    return (
        <svg className="absolute overflow-visible pointer-events-none" style={{ width: 1, height: 1, zIndex: Z_INDEX.CONNECTIONS }}>
            {connections.map((conn: Connection) => {
                const fromAgent = agents[conn.from.agentId];
                const toAgent = agents[conn.to.agentId];
                if (!fromAgent || !toAgent) return null;
                
                const isFlowing = fromAgent.status === AgentStatus.Running || fromAgent.status === AgentStatus.Success;
                const isHighlighted = isDependencyViewActive && criticalPathIds.has(fromAgent.id) && criticalPathIds.has(toAgent.id);
                const isDimmed = isDependencyViewActive && criticalPathIds.size > 0 && !isHighlighted;

                return (
                    <Thread
                        key={conn.id}
                        id={conn.id}
                        from={fromAgent}
                        to={toAgent}
                        fromPortId={conn.from.portId}
                        toPortId={conn.to.portId}
                        isFlowing={isFlowing || isHighlighted}
                        onDeleteConnection={onDeleteConnection}
                        mode={mode}
                        // Added path props
                        style={{ 
                            opacity: isDimmed ? 0.1 : 1, 
                            strokeWidth: isHighlighted ? 3 : undefined,
                            filter: isHighlighted ? 'drop-shadow(0 0 8px var(--roman-aqua))' : undefined
                        }}
                    />
                );
            })}
        </svg>
    );
});
ConnectionsLayer.displayName = 'ConnectionsLayer';

interface NodesLayerProps {
    agents: Record<string, Agent>;
    crews: Record<string, Crew>;
    zoom: number;
    onSelectAgent: (id: string) => void;
    onDragAgent: (id: string, pos: { x: number; y: number }) => void;
    onDragEndAgent: (id: string) => void;
    onRunAgent: (id: string) => void;
    onStartConnection: (id: string, portId: string) => void;
    onCompleteConnection: (id: string, portId: string) => void;
    onEnterAgent: (id: string) => void;
    onLeaveAgent: () => void;
    connectionSourceId?: string;
    hoveredAgentId: string | null;
    selectedAgentId: string | null;
    selectedAgentIdsForCrew: string[];
    mode: WeaverMode;
    onVeilPeel: () => void;
    searchQuery: string;
    currentBubbles: Record<string, string>;
    onRunCrew?: (crewId: string) => void;
    onEditCrew?: (crewId: string) => void;
    // Dependency Specific
    dependencyData: any;
    isDependencyViewActive: boolean;
    isConnectionMode: boolean; // New prop passed down
    onNodeContextMenu?: (id: string, e: React.MouseEvent) => void;
}

const NodesLayer = memo(({
    agents, crews, zoom, onSelectAgent, onDragAgent, onDragEndAgent, onRunAgent, 
    onStartConnection, onCompleteConnection, onEnterAgent, onLeaveAgent, connectionSourceId, 
    hoveredAgentId, selectedAgentId, selectedAgentIdsForCrew,
    mode, onVeilPeel, searchQuery, currentBubbles, onRunCrew, onEditCrew,
    dependencyData, isDependencyViewActive, isConnectionMode, onNodeContextMenu
}: NodesLayerProps) => {
    const agentList = useMemo(() => Object.values(agents) as Agent[], [agents]);

    return (
        <div className="pointer-events-auto">
            {mode === 'architect' && (
                <div style={{ zIndex: Z_INDEX.CREWS, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {Object.values(crews).map((crew: Crew) => (
                        <CrewBox key={crew.id} crew={crew} agents={agents} onRunCrew={onRunCrew} onEditCrew={onEditCrew} />
                    ))}
                </div>
            )}
            
            <div style={{ zIndex: Z_INDEX.NODES, position: 'relative' }}>
                {agentList.map((agent: Agent) => {
                    const isFocusDimmed = isDependencyViewActive && dependencyData.criticalPathIds.size > 0 && !dependencyData.criticalPathIds.has(agent.id);
                    const isSearchDimmed = searchQuery.trim() && !(
                        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        agent.type.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    const isDimmed = isFocusDimmed || isSearchDimmed;
                    const isConnectionSource = connectionSourceId === agent.id;
                    const isHoveredAsTarget = hoveredAgentId === agent.id && !!connectionSourceId;
                    const isHighlighted = selectedAgentId === agent.id || selectedAgentIdsForCrew.includes(agent.id) || (isDependencyViewActive && dependencyData.criticalPathIds.has(agent.id));
                    
                    const isConflict = isDependencyViewActive && dependencyData.conflicts.includes(agent.id);
                    const stageRank = isDependencyViewActive ? dependencyData.stages[agent.id] : undefined;

                    return (
                        <Node
                            key={agent.id}
                            id={`agent-node-${agent.id}`}
                            agent={agent}
                            zoom={zoom}
                            onSelect={onSelectAgent}
                            onDrag={onDragAgent}
                            onDragEnd={onDragEndAgent}
                            onRunAgent={onRunAgent}
                            onStartConnection={(id, pId) => onStartConnection(id, pId || 'default')}
                            onCompleteConnection={(id, pId) => onCompleteConnection(id, pId || 'default')}
                            onEnterAgent={onEnterAgent}
                            onLeaveAgent={onLeaveAgent}
                            isConnectionSource={isConnectionSource}
                            isHoveredAsTarget={isHoveredAsTarget}
                            isHighlighted={isHighlighted}
                            isDimmed={!!isDimmed}
                            mode={mode}
                            onVeilPeel={onVeilPeel}
                            currentGossip={currentBubbles[agent.id]}
                            // Dependency View Props
                            isConflict={isConflict}
                            stageRank={stageRank}
                            isConnectionMode={isConnectionMode} // Pass connection mode down
                            onContextMenu={onNodeContextMenu}
                        />
                    );
                })}
            </div>
        </div>
    );
});
NodesLayer.displayName = 'NodesLayer';

const WeaverCanvasCore: React.FC<WeaverCanvasCoreProps> = memo(({
  agents, connections, crews, users, selfId, connectionPreview, hoveredAgentId, selectedAgentId,
  selectedAgentIdsForCrew, isSimulationActive, isDependencyViewActive = false, isMobile, isMobilePanLocked, searchQuery,
  onSelectAgent, onDragAgent, onDragEndAgent, onRunAgent, onStartConnection, onCompleteConnection,
  onEnterAgent, onLeaveAgent, onDeleteConnection, onCanvasClick, zoom, pan, mode, onVeilPeel,
  currentBubbles,
  onDrop,
  onDragOver,
  onDropCapture,
  onDragOverCapture,
  onRunCrew,
  onEditCrew,
  tutorial,
  onNodeContextMenu,
}) => {

  const connectionSourceId = connectionPreview?.from.id;
  const isConnectionMode = !!connectionSourceId;

  // Visual Dependency Analysis
  const dependencyData = useDependencyMap(agents, connections, isDependencyViewActive ? selectedAgentId : null);

  return (
    <div
      className="w-full h-full cursor-default relative touch-none pointer-events-auto outline-none overflow-hidden"
      onClick={onCanvasClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDropCapture={onDropCapture}
      onDragOverCapture={onDragOverCapture}
      tabIndex={-1}
    >
        {/* Layer 1: Background Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: Z_INDEX.GRID }}>
            <GridBackground pan={pan} zoom={zoom} />
        </div>

        {/* Layer 2: Transformation Substrate */}
        <div
            className="absolute top-0 left-0 w-full h-full transform-gpu"
            style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                transformOrigin: '0 0'
            }}
        >
            <ConnectionsLayer 
                connections={connections} 
                agents={agents} 
                onDeleteConnection={onDeleteConnection} 
                mode={mode}
                criticalPathIds={dependencyData.criticalPathIds}
                isDependencyViewActive={isDependencyViewActive}
            />
            
            {connectionPreview && mode === 'architect' && (
                <svg className="absolute overflow-visible pointer-events-none" style={{ width: 1, height: 1, zIndex: Z_INDEX.CONNECTION_PREVIEW }}>
                    <Thread 
                        from={connectionPreview.from} 
                        to={connectionPreview.to} 
                        fromPortId={connectionPreview.portId}
                        toPortId="preview"
                        isPreview 
                        mode={mode} 
                    />
                </svg>
            )}

            <NodesLayer 
                agents={agents} crews={crews} zoom={zoom}
                onSelectAgent={onSelectAgent} onDragAgent={onDragAgent} onDragEndAgent={onDragEndAgent}
                onRunAgent={onRunAgent} 
                onStartConnection={onStartConnection} 
                onCompleteConnection={onCompleteConnection} 
                onEnterAgent={onEnterAgent} 
                onLeaveAgent={onLeaveAgent} connectionSourceId={connectionSourceId}
                hoveredAgentId={hoveredAgentId}
                selectedAgentId={selectedAgentId} selectedAgentIdsForCrew={selectedAgentIdsForCrew}
                mode={mode} onVeilPeel={onVeilPeel} searchQuery={searchQuery} currentBubbles={currentBubbles}
                onRunCrew={onRunCrew} onEditCrew={onEditCrew}
                dependencyData={dependencyData}
                isDependencyViewActive={isDependencyViewActive}
                isConnectionMode={isConnectionMode} // Pass down to layer
                onNodeContextMenu={onNodeContextMenu}
            />

            <div className="pointer-events-none" style={{ zIndex: Z_INDEX.EFFECTS, position: 'absolute', inset: 0 }}>
                <AnimatePresence>
                    {isSimulationActive && mode === 'architect' && <SimulationLayer agents={agents} />}
                </AnimatePresence>
                <div style={{ zIndex: Z_INDEX.CURSORS }}>
                    <MultiplayerCursors users={users} selfId={selfId} isMobile={isMobile} />
                </div>
            </div>
      </div>

      {/* ── DEPTH-OF-FIELD SPOTLIGHT (Book IV §4.2) ───────────────
          When a connection is being drawn or dependency view is active,
          a semi-opaque dim layer blankets the canvas.
          The active node is elevated via .node-peel-elevated z-index.
      ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(isConnectionMode) && (
          <motion.div
            key="canvas-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(2px)',
              zIndex: 25
            }}
          />
        )}
      </AnimatePresence>

      {/* Dependency Legend Overlay */}
      {isDependencyViewActive && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] bg-panel-bg/90 backdrop-blur-md border border-roman-aqua/30 rounded-full px-6 py-2 shadow-2xl flex items-center gap-6"
          >
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-roman-aqua shadow-[0_0_8px_var(--roman-aqua)]" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Logic Flow Active</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase">Max Rank:</span>
                  <span className="text-xs font-mono font-bold text-roman-aqua">{dependencyData.maxStage + 1}</span>
              </div>
              {dependencyData.conflicts.length > 0 && (
                  <>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Deadlock Detected</span>
                    </div>
                  </>
              )}
          </motion.div>
      )}
      
      <AnimatePresence>
          {tutorial && tutorial.isActive && tutorial.currentStep && <TutorialHint {...tutorial} />}
      </AnimatePresence>

      {/* Diegetic Framing */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 z-50 rounded-xl m-1" />
    </div>
  );
});

export default WeaverCanvasCore;
