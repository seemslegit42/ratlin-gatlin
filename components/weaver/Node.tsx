
import React, { memo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '../../types.js';
import { AgentStatus } from '../../types.js';
import { getAgentAvatar, AGENT_STATUS_STYLES } from '../../utils/agent-visuals.js';

interface NodeProps {
    id: string;
    agent: Agent;
    zoom: number;
    onSelect: (id: string) => void;
    onDrag: (id: string, pos: { x: number, y: number }) => void;
    onDragEnd: (id: string) => void;
    onRunAgent: (id: string) => void;
    onStartConnection: (id: string, portId: string) => void;
    onCompleteConnection: (id: string, portId: string) => void;
    onEnterAgent: (id: string) => void;
    onLeaveAgent: () => void;
    isConnectionSource?: boolean;
    isHoveredAsTarget?: boolean;
    isHighlighted: boolean;
    isDimmed: boolean;
    mode: 'live' | 'architect';
    onVeilPeel: (id: string) => void;
    currentGossip?: string;
    isConflict?: boolean;
    stageRank?: number;
    isConnectionMode?: boolean;
    onContextMenu?: (id: string, e: React.MouseEvent) => void;
}

/**
 * Recursively renders a JSON object as a stylized tree.
 */
export const JSONTree: React.FC<{ data: any }> = ({ data }) => {
    if (data === null || data === undefined) return <span className="text-text-tertiary">null</span>;
    if (typeof data !== 'object') return <span className="text-patina-green">{String(data)}</span>;

    return (
        <div className="pl-2 border-l border-white/5 space-y-1">
            {Object.entries(data).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                    <span className="text-roman-aqua font-bold text-[9px] uppercase tracking-tighter">{k}:</span>
                    <div className="pl-2">
                        {typeof v === 'object' && v !== null ? <JSONTree data={v} /> : <span className="text-patina-green">{String(v)}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

/* Fix: Updated MiniRadar to use correct Agent needs keys (cognitive, data, social) */
const MiniRadar = ({ needs }: { needs: { cognitive: number; data: number; social: number } }) => {
    const size = 32;
    const center = size / 2;
    const radius = size / 2 - 2;

    const getPoint = (value: number, angle: number) => {
        const r = (value / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    };

    // Angles: Top (-90deg), Bottom Right (30deg), Bottom Left (150deg)
    /* Fix: Mapping correct need properties to radar points */
    const p1 = getPoint(needs.cognitive, -Math.PI / 2);
    const p2 = getPoint(needs.data, Math.PI / 6);
    const p3 = getPoint(needs.social, (5 * Math.PI) / 6);

    const fullP1 = getPoint(100, -Math.PI / 2);
    const fullP2 = getPoint(100, Math.PI / 6);
    const fullP3 = getPoint(100, (5 * Math.PI) / 6);

    return (
        <div className="relative group/radar cursor-help">
            <svg width={size} height={size} className="overflow-visible transform rotate-0 transition-transform group-hover/radar:scale-110">
                {/* Background Triangle (100% capacity) */}
                <polygon
                    points={`${fullP1} ${fullP2} ${fullP3}`}
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                />
                {/* Axis lines */}
                <line x1={center} y1={center} x2={fullP1.split(',')[0]} y2={fullP1.split(',')[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <line x1={center} y1={center} x2={fullP2.split(',')[0]} y2={fullP2.split(',')[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <line x1={center} y1={center} x2={fullP3.split(',')[0]} y2={fullP3.split(',')[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                
                {/* Data Shape */}
                <motion.polygon
                    points={`${p1} ${p2} ${p3}`}
                    fill="rgba(62, 185, 145, 0.4)"
                    stroke="var(--patina-green)"
                    strokeWidth="1"
                    initial={false}
                    animate={{ points: `${p1} ${p2} ${p3}` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </svg>
            
            {/* Hover Tooltip for Values */}
            <div className="absolute bottom-full right-0 mb-2 w-24 p-2 bg-black/95 border border-white/10 rounded text-[9px] font-mono text-text-secondary opacity-0 group-hover/radar:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                <div className="flex justify-between items-center mb-1"><span className="text-imperial-purple font-bold">COG</span> <span className="text-white">{needs.cognitive}</span></div>
                <div className="flex justify-between items-center mb-1"><span className="text-roman-aqua font-bold">DATA</span> <span className="text-white">{needs.data}</span></div>
                <div className="flex justify-between items-center"><span className="text-patina-green font-bold">SOC</span> <span className="text-white">{needs.social}</span></div>
            </div>
        </div>
    );
};

/** Circumference of the SVG peel-progress ring (r=22) */
const RING_CIRCUMFERENCE = 2 * Math.PI * 22;
const PEEL_DURATION_MS = 800;

const Node: React.FC<NodeProps> = ({ 
    id, agent, zoom, onSelect, onDrag, onDragEnd, 
    onStartConnection, onCompleteConnection, onEnterAgent, onLeaveAgent, 
    isHighlighted, isDimmed, mode, onVeilPeel, onContextMenu
}) => {
  const dragStartPos = useRef({ x: 0, y: 0 }); 
  const statusStyle = AGENT_STATUS_STYLES[agent.status] || AGENT_STATUS_STYLES[AgentStatus.Idle];
  
  // ── Veil-Peel gesture: hold for PEEL_DURATION_MS in live mode ────────────
  const pressTimerRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const progressRafRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [peelProgress, setPeelProgress] = useState(0);

  const startPress = useCallback(() => {
    if (mode !== 'live') return;

    const start = Date.now();

    // Tick the SVG ring every frame
    progressRafRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setPeelProgress(Math.min(1, elapsed / PEEL_DURATION_MS));
      if (elapsed >= PEEL_DURATION_MS) {
        if (progressRafRef.current) clearInterval(progressRafRef.current);
        progressRafRef.current = null;
      }
    }, 16);

    // Fire the peel after the full duration
    pressTimerRef.current = setTimeout(() => {
      onVeilPeel(agent.id);
      setPeelProgress(0);
    }, PEEL_DURATION_MS);
  }, [mode, agent.id, onVeilPeel]);

  const cancelPress = useCallback(() => {
    if (pressTimerRef.current)  { clearTimeout(pressTimerRef.current);  pressTimerRef.current  = null; }
    if (progressRafRef.current) { clearInterval(progressRafRef.current); progressRafRef.current = null; }
    if (peelProgress > 0) setPeelProgress(0);
  }, [peelProgress]);

  const handleContextMenu = (e: React.MouseEvent) => {
      if (onContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(agent.id, e);
      }
  };

  const ringOffset = RING_CIRCUMFERENCE * (1 - peelProgress);

  // Notify body of peel-active state for the canvas depth-of-field overlay (Book IV §4.2)
  const isPeeling = peelProgress > 0.05;

  return (
    <motion.div
      layout
      id={id}
      drag={mode === 'architect'}
      dragMomentum={false}
      onDragStart={() => { dragStartPos.current = { x: agent.position.x, y: agent.position.y }; }}
      onDrag={(_e, info) => onDrag(agent.id, { x: dragStartPos.current.x + info.offset.x / zoom, y: dragStartPos.current.y + info.offset.y / zoom })}
      onDragEnd={() => onDragEnd(agent.id)}
      animate={{ 
          opacity: isDimmed ? 0.15 : 1, 
          x: agent.position.x, 
          y: agent.position.y,
          /* Table 2: subtle scale transform on mode transition */
          scale: isPeeling ? 1.04 : isHighlighted ? 1.02 : 1
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseDown={(e) => { e.stopPropagation(); onSelect(agent.id); }}
      onMouseEnter={() => onEnterAgent(agent.id)}
      onMouseLeave={() => { onLeaveAgent(); cancelPress(); }}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onContextMenu={handleContextMenu}
      className={`absolute ${mode === 'live' ? 'w-80 h-auto' : 'w-64 min-h-[140px]'} ${isPeeling ? 'node-peel-elevated' : ''}`}
    >
        {/* ── VEIL-PEEL PROGRESS RING ─────────────────────────── */}
        <AnimatePresence>
            {peelProgress > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="peel-ring absolute pointer-events-none"
                    style={{ zIndex: 50 }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 56 56"
                        className="absolute inset-0 w-full h-full"
                        style={{ filter: `drop-shadow(0 0 ${Math.round(peelProgress * 14)}px var(--roman-aqua))` }}
                    >
                        <circle cx="28" cy="28" r="22" fill="none" strokeWidth="2" className="peel-arc-track" />
                        <circle
                            cx="28" cy="28" r="22" fill="none" strokeWidth="2.5"
                            strokeDasharray={RING_CIRCUMFERENCE}
                            strokeDashoffset={ringOffset}
                            transform="rotate(-90 28 28)"
                            className="peel-arc-fill"
                        />
                    </svg>
                    <motion.div
                        animate={{ opacity: peelProgress }}
                        className="absolute inset-[-6px] rounded-2xl border border-roman-aqua/50 pointer-events-none"
                        style={{ boxShadow: `0 0 ${peelProgress * 24}px var(--peel-glow)` }}
                    />
                </motion.div>
            )}
        </AnimatePresence>

        {/*
          ── COMPONENT DUALITY SHELL (Book II Table 2) ──────────
          Live Mode  : glass-live  → backdrop-filter blur(24px), bg rgba(30,30,30,0.6)
          Architect  : glass-architect → backdrop-filter blur(12px), bg rgba(30,30,30,0.3)
          Transition : 300ms cross-fade via CSS (--duration-moderate on .glass-live/.glass-architect)
        */}
        <div className={`relative w-full h-full rounded-2xl overflow-hidden luminous-imperfection ${
            mode === 'live' ? 'glass-live' : 'glass-architect'
        } ${agent.isVeiled ? 'veil-glow' : ''}`}>

            {/* ── VEILED OVERLAY (curtain-lift clip-path) ─────── */}
            <AnimatePresence>
                {agent.isVeiled && (
                    <motion.div
                        key="veil"
                        initial={{ opacity: 0, clipPath: 'inset(0% 0 100% 0 round 12px)' }}
                        animate={{ opacity: 1, clipPath: 'inset(0% 0 0% 0 round 12px)' }}
                        exit={{ opacity: 0, clipPath: 'inset(100% 0 0% 0 round 12px)' }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="veil-overlay"
                    >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
                            <svg className="w-5 h-5 text-imperial-purple/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                            <span className="text-[9px] font-mono text-imperial-purple/80 uppercase tracking-[0.2em]">Veiled</span>
                        </div>
                        <div className="absolute inset-0 scanlines opacity-30 rounded-xl" />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
            {mode === 'live' ? (
                /* ──────────────────────────────────────────────────────
                   LIVE MODE (THE SHARD) — Table 2:
                   Full micro-app UI, Comfortaa heading, connectors hidden.
                   ────────────────────────────────────────────────────── */
                <motion.div
                    key="live"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="relative group"
                >
                    {/* Wabi-sabi grain on live shard surface */}
                    <div className="wabi-grain rounded-2xl" />
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            {/* Aetheric Sigil — state-animated glyph (Book III §3.3) */}
                            <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${statusStyle.sigilClass}`}>
                                {getAgentAvatar(agent)}
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] font-black text-patina-green uppercase tracking-widest">CogniOp Active</div>
                                <span className={`text-[10px] font-mono ${statusStyle.text}`}>{agent.status}</span>
                            </div>
                        </div>
                        {/* Table 2 Header: font-heading (Comfortaa), full title */}
                        <h3 className="font-comfortaa font-bold text-base text-white mb-2 leading-tight">{agent.name}</h3>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-patina-green leading-relaxed">
                            {agent.outputData
                                ? JSON.stringify(agent.outputData, null, 2).slice(0, 100) + '…'
                                : 'Awaiting Context…'}
                        </div>
                        {/* Hold-to-veil micro-hint */}
                        {!agent.isVeiled && (
                            <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-35 transition-opacity pointer-events-none">
                                <span className="text-[8px] font-mono text-imperial-purple uppercase tracking-widest">Hold to veil</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                /* ──────────────────────────────────────────────────────
                   ARCHITECT MODE (THE NODE) — Table 2:
                   UI fades out → function glyph fades in.
                   Header uses font-body (Lexend). Connectors illuminated.
                   ────────────────────────────────────────────────────── */
                <motion.div
                    key="architect"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full flex flex-col"
                >
                    {/* Table 2 Header: font-body (Lexend), simplified, type icon */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 border-b border-white/8">
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ color: statusStyle.glowColor }}>
                                {getAgentAvatar(agent)}
                            </div>
                            {/* Lexend for Architect header per Table 2 */}
                            <span className="text-[11px] font-lexend font-medium text-white truncate max-w-[100px] tracking-tight">{agent.name}</span>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusStyle.dot}`} />
                    </div>

                    {/* Table 2 Content: full UI faded → function glyph + mini-radar */}
                    <div className="flex-grow relative flex items-center justify-center p-3">
                        {/* Aetheric Sigil — state-animated function glyph */}
                        <div className="flex flex-col items-center gap-2 opacity-80">
                            <div className={`w-10 h-10 flex items-center justify-center ${statusStyle.sigilClass}`}>
                                {getAgentAvatar(agent)}
                            </div>
                            <p className="text-[9px] font-mono text-text-tertiary text-center leading-relaxed line-clamp-2 px-2">
                                {agent.description || 'Agentic node.'}
                            </p>
                        </div>
                        {/* Mini-radar in corner */}
                        <div className="absolute bottom-1.5 right-1.5">
                            <MiniRadar needs={agent.needs} />
                        </div>
                    </div>

                    {/* ── CONNECTORS (Table 2: visible in Architect, hidden in Live) ── */}
                    {/* Input port — left edge, patina-green */}
                    <button
                        type="button"
                        aria-label="Input port"
                        className="port-input absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full cursor-crosshair z-10 transition-all"
                        onMouseDown={(e) => { e.stopPropagation(); onCompleteConnection(agent.id, 'default'); }}
                    />
                    {/* Output port — right edge, roman-aqua */}
                    <button
                        type="button"
                        aria-label="Output port"
                        className={`port-output absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full cursor-crosshair z-10 transition-all ${
                            agent.status === 'Running' ? 'port-flowing' : ''
                        }`}
                        onMouseDown={(e) => { e.stopPropagation(); onStartConnection(agent.id, 'default'); }}
                    />
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    </motion.div>
  );
};

export default memo(Node);
