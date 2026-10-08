/**
 * @file components/weaver/WorkflowKanban.tsx
 * @description HUD-style Kanban drag-and-drop board for Weaver workflow agent status
 * management. Columns map to AgentStatus values. Cards are dragged between columns
 * using the HTML5 drag-and-drop API, with framer-motion entry/exit animations.
 *
 * Tall-screen optimised: columns fill available dvh space with individual scroll.
 * Respects the Veil-Peel palette (veiled agents get a special visual treatment).
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '../../types.js';
import { AgentStatus } from '../../types.js';
import { getAgentAvatar, AGENT_STATUS_STYLES } from '../../utils/agent-visuals.js';

// ─── Column definitions ────────────────────────────────────────────────────────

interface KanbanColumn {
  id: AgentStatus;
  label: string;
  colour: string;          // tailwind text colour
  borderColour: string;    // tailwind border colour
  headerBg: string;        // tailwind bg class for column header
  dotColour: string;       // tailwind bg class for indicator dot
}

const COLUMNS: KanbanColumn[] = [
  {
    id: AgentStatus.Idle,
    label: 'Dormant',
    colour: 'text-text-secondary',
    borderColour: 'border-white/10',
    headerBg: 'bg-white/5',
    dotColour: 'bg-white/30',
  },
  {
    id: AgentStatus.Running,
    label: 'Running',
    colour: 'text-roman-aqua',
    borderColour: 'border-roman-aqua/30',
    headerBg: 'bg-roman-aqua/10',
    dotColour: 'bg-roman-aqua',
  },
  {
    id: AgentStatus.Pending,
    label: 'Pending',
    colour: 'text-yellow-400',
    borderColour: 'border-yellow-400/30',
    headerBg: 'bg-yellow-400/10',
    dotColour: 'bg-yellow-400',
  },
  {
    id: AgentStatus.Success,
    label: 'Resolved',
    colour: 'text-patina-green',
    borderColour: 'border-patina-green/30',
    headerBg: 'bg-patina-green/10',
    dotColour: 'bg-patina-green',
  },
  {
    id: AgentStatus.Error,
    label: 'Blocked',
    colour: 'text-red-400',
    borderColour: 'border-red-400/30',
    headerBg: 'bg-red-400/10',
    dotColour: 'bg-red-400',
  },
];

// Map any non-primary status to the closest column
const STATUS_TO_COLUMN: Partial<Record<AgentStatus, AgentStatus>> = {
  [AgentStatus.OPERATIONAL]:       AgentStatus.Running,
  [AgentStatus.DEGRADED]:          AgentStatus.Error,
  [AgentStatus.TERMINATED]:        AgentStatus.Error,
  [AgentStatus.COMPILING]:         AgentStatus.Pending,
  [AgentStatus.WAITING_FOR_HUMAN]: AgentStatus.Pending,
};

function resolveColumn(status: AgentStatus): AgentStatus {
  return STATUS_TO_COLUMN[status] ?? status;
}

// ─── Card component ────────────────────────────────────────────────────────────

interface KanbanCardProps {
  agent: Agent;
  isDragging: boolean;
  onDragStart: (agentId: string) => void;
  onToggleVeil: (agentId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ agent, isDragging, onDragStart, onToggleVeil }) => {
  const statusStyle = AGENT_STATUS_STYLES[agent.status] ?? AGENT_STATUS_STYLES[AgentStatus.Idle];

  return (
    <motion.div
      layout
      layoutId={`kanban-card-${agent.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0, scale: isDragging ? 0.97 : 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      draggable
      onDragStart={(e) => {
        const dragEvt = e as unknown as React.DragEvent;
        dragEvt.dataTransfer.setData('text/plain', agent.id);
        dragEvt.dataTransfer.effectAllowed = 'move';
        onDragStart(agent.id);
      }}
      className={`group relative rounded-xl border bg-black/40 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none overflow-hidden transition-shadow hover:shadow-lg ${
        agent.isVeiled
          ? 'border-imperial-purple/40 veil-glow'
          : 'border-white/8 hover:border-white/18'
      }`}
    >
      {/* Veil overlay on card */}
      {agent.isVeiled && (
        <div className="absolute inset-0 veil-overlay rounded-xl pointer-events-none">
          <div className="scanlines absolute inset-0 opacity-20 rounded-xl" />
        </div>
      )}

      {/* Scanline texture */}
      <div className="absolute inset-0 scanlines opacity-[0.07] pointer-events-none rounded-xl" />

      <div className="relative p-3 flex items-start gap-3">
        {/* Avatar / icon */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-black/50 border border-white/8"
          style={{ color: statusStyle.glowColor }}
        >
          <span className="scale-75">{getAgentAvatar(agent)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusStyle.dot}`} />
            <span className="text-[11px] font-bold text-white font-comfortaa truncate">{agent.name}</span>
          </div>
          <p className="text-[9px] font-mono text-text-tertiary truncate leading-relaxed">
            {agent.type}
          </p>
          {agent.outputData && (
            <p className="text-[9px] font-mono text-patina-green/70 mt-1 truncate">
              {JSON.stringify(agent.outputData).slice(0, 48)}…
            </p>
          )}
        </div>

        {/* Veil toggle button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleVeil(agent.id); }}
          title={agent.isVeiled ? 'Unveil agent' : 'Veil agent'}
          className={`opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-lg transition-all duration-200 ${
            agent.isVeiled
              ? 'text-imperial-purple bg-imperial-purple/15 border border-imperial-purple/30 opacity-100'
              : 'text-text-tertiary hover:text-imperial-purple hover:bg-imperial-purple/10 border border-transparent hover:border-imperial-purple/25'
          }`}
        >
          {/* Eye / eye-slash icon */}
          {agent.isVeiled ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Column component ──────────────────────────────────────────────────────────

interface KanbanColProps {
  col: KanbanColumn;
  agents: Agent[];
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDrop: (targetColId: AgentStatus) => void;
  onToggleVeil: (agentId: string) => void;
}

const KanbanCol: React.FC<KanbanColProps> = ({ col, agents, draggingId, onDragStart, onDrop, onToggleVeil }) => {
  const [isOver, setIsOver] = useState(false);
  const overTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
    if (overTimer.current) clearTimeout(overTimer.current);
    overTimer.current = setTimeout(() => setIsOver(false), 200);
  }, [isOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(col.id);
  }, [col.id, onDrop]);

  const handleDragLeave = useCallback(() => {
    overTimer.current = setTimeout(() => setIsOver(false), 80);
  }, []);

  return (
    <div
      className={`flex flex-col min-w-[200px] flex-1 rounded-xl border transition-all duration-200 ${col.borderColour} ${
        isOver ? 'kanban-col-over' : 'bg-black/20'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b ${col.borderColour} ${col.headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${col.dotColour} ${col.id === AgentStatus.Running ? 'animate-pulse' : ''}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${col.colour}`}>{col.label}</span>
        </div>
        <span className="text-[10px] font-mono text-text-tertiary bg-black/30 px-1.5 py-0.5 rounded-full">
          {agents.length}
        </span>
      </div>

      {/* Drop indicator when hovering */}
      {isOver && (
        <div className="kanban-drop-indicator mx-2 mt-1" />
      )}

      {/* Cards */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 min-h-[80px]">
        <AnimatePresence mode="popLayout">
          {agents.map((agent) => (
            <KanbanCard
              key={agent.id}
              agent={agent}
              isDragging={draggingId === agent.id}
              onDragStart={onDragStart}
              onToggleVeil={onToggleVeil}
            />
          ))}
          {agents.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 gap-2 pointer-events-none"
            >
              <div className={`w-6 h-6 rounded-full border-2 ${col.borderColour} opacity-30`} />
              <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-widest opacity-40">
                empty
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Main board ───────────────────────────────────────────────────────────────

export interface WorkflowKanbanProps {
  agents: Record<string, Agent>;
  onUpdateAgentStatus: (agentId: string, newStatus: AgentStatus) => void;
  onToggleVeil: (agentId: string) => void;
}

const WorkflowKanban: React.FC<WorkflowKanbanProps> = ({ agents, onUpdateAgentStatus, onToggleVeil }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const agentList = useMemo(() => Object.values(agents) as Agent[], [agents]);

  // Group agents into columns, normalising any non-primary statuses
  const columnAgents = useMemo(() => {
    const map: Record<AgentStatus, Agent[]> = {
      [AgentStatus.Idle]: [],
      [AgentStatus.Running]: [],
      [AgentStatus.Pending]: [],
      [AgentStatus.Success]: [],
      [AgentStatus.Error]: [],
      [AgentStatus.OPERATIONAL]: [],
      [AgentStatus.DEGRADED]: [],
      [AgentStatus.TERMINATED]: [],
      [AgentStatus.COMPILING]: [],
      [AgentStatus.WAITING_FOR_HUMAN]: [],
    };
    agentList.forEach((a) => {
      const col = resolveColumn(a.status);
      if (map[col]) map[col].push(a);
    });
    return map;
  }, [agentList]);

  const handleDrop = useCallback((targetColId: AgentStatus) => {
    if (!draggingId) return;
    const agent = agents[draggingId];
    if (!agent) return;
    // Only update if actually changing column
    if (resolveColumn(agent.status) !== targetColId) {
      onUpdateAgentStatus(draggingId, targetColId);
    }
    setDraggingId(null);
  }, [draggingId, agents, onUpdateAgentStatus]);

  const veiledCount = useMemo(() => agentList.filter((a) => a.isVeiled).length, [agentList]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Board header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-black/30 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-patina-green animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-roman-aqua animate-pulse delay-75" />
          </div>
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.2em]">
            Workflow · Status Board
          </span>
        </div>
        <div className="flex items-center gap-3">
          {veiledCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-imperial-purple/15 border border-imperial-purple/30">
              <svg className="w-3 h-3 text-imperial-purple/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <span className="text-[9px] font-mono text-imperial-purple/80 uppercase tracking-wider">
                {veiledCount} veiled
              </span>
            </div>
          )}
          <span className="text-[10px] font-mono text-text-tertiary">
            {agentList.length} unit{agentList.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Board columns — horizontal scroll on small screens, flex on wide */}
      <div
        className="flex-1 flex gap-3 p-3 overflow-x-auto overflow-y-hidden custom-scrollbar"
        onDragEnd={() => setDraggingId(null)}
      >
        {COLUMNS.map((col) => (
          <KanbanCol
            key={col.id}
            col={col}
            agents={columnAgents[col.id] ?? []}
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDrop={handleDrop}
            onToggleVeil={onToggleVeil}
          />
        ))}
      </div>

      {/* Board footer — drag hint */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-white/5 bg-black/20">
        <p className="text-[9px] font-mono text-text-tertiary text-center tracking-wider opacity-60">
          Drag cards between columns to update agent status · Hold a node in Live mode to veil it
        </p>
      </div>
    </div>
  );
};

export default WorkflowKanban;
