
/**
 * @file components/dashboard/DraggableWidget.tsx
 * @description Draggable floating glass widget for the MainView desktop.
 * Includes the Veil Peel trigger, diegetic HUD corner brackets, snap-to-grid,
 * and a visual press-ring that mirrors the Veil Peel gesture from Node.tsx.
 */

import React, { useRef, useState, useCallback } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { LayersIcon } from '../icons/LayersIcon';

/** Snap dragged widget positions to this grid (px). 0 = off. */
const GRID = 16;

function snapToGrid(value: number): number {
  if (GRID <= 0) return value;
  return Math.round(value / GRID) * GRID;
}

const PEEL_DURATION_MS = 600;
const RING_C = 2 * Math.PI * 16; // r = 16 on the 40×40 svg

interface DraggableWidgetProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  zIndex: number;
  onDragEnd: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  /** Veil Peel trigger — transitions to Architect Mode. */
  onPeel?: (id: string) => void;
  children: React.ReactNode;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id, title, position, zIndex, onDragEnd, onFocus, onClose, onPeel, children
}) => {
  const dragControls = useDragControls();

  // ── Veil-Peel press-ring on the peel button ─────────────────────────────
  const peelTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const peelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [peelProgress, setPeelProgress]   = useState(0);
  const [isPeelActive,  setIsPeelActive]  = useState(false);

  const startPeelPress = useCallback(() => {
    if (!onPeel) return;
    setIsPeelActive(true);
    const start = Date.now();
    peelIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setPeelProgress(Math.min(1, elapsed / PEEL_DURATION_MS));
      if (elapsed >= PEEL_DURATION_MS) {
        if (peelIntervalRef.current) clearInterval(peelIntervalRef.current);
        peelIntervalRef.current = null;
      }
    }, 16);
    peelTimerRef.current = setTimeout(() => {
      onPeel(id);
      setPeelProgress(0);
      setIsPeelActive(false);
    }, PEEL_DURATION_MS);
  }, [id, onPeel]);

  const cancelPeelPress = useCallback(() => {
    if (peelTimerRef.current)    { clearTimeout(peelTimerRef.current);    peelTimerRef.current    = null; }
    if (peelIntervalRef.current) { clearInterval(peelIntervalRef.current); peelIntervalRef.current = null; }
    if (peelProgress > 0) setPeelProgress(0);
    setIsPeelActive(false);
  }, [peelProgress]);

  const ringOffset = RING_C * (1 - peelProgress);

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, x: position.x, y: position.y }}
      animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
      exit={{ opacity: 0, scale: 0.85 }}
      onDragEnd={(_e, info) => {
        const nx = snapToGrid(position.x + info.offset.x);
        const ny = snapToGrid(position.y + info.offset.y);
        onDragEnd(id, nx, ny);
      }}
      onPointerDown={() => onFocus(id)}
      style={{ zIndex }}
      className="absolute min-w-[300px] bg-panel-bg/90 backdrop-blur-2xl border border-glass-border rounded-lg shadow-2xl overflow-visible flex flex-col group ring-1 ring-white/5"
    >
      {/* ── DIEGETIC CORNER BRACKETS ───────────────────────────────────── */}
      <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-roman-aqua/40 rounded-tl pointer-events-none transition-colors group-hover:border-roman-aqua/70" />
      <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-roman-aqua/40 rounded-tr pointer-events-none transition-colors group-hover:border-roman-aqua/70" />
      <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-roman-aqua/40 rounded-bl pointer-events-none transition-colors group-hover:border-roman-aqua/70" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-roman-aqua/40 rounded-br pointer-events-none transition-colors group-hover:border-roman-aqua/70" />

      {/* ── HANDLE / HEADER ─────────────────────────────────────────────── */}
      <div
        onPointerDown={(e) => { dragControls.start(e); onFocus(id); }}
        className="flex items-center justify-between p-2 pl-3 bg-white/5 border-b border-white/10 cursor-grab active:cursor-grabbing transition-colors group-hover:bg-white/10 relative rounded-t-lg overflow-hidden"
      >
        {/* Diagonal hatching background */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.018)_50%,transparent_75%)] bg-[length:4px_4px] pointer-events-none" />
        {/* Scanline */}
        <div className="absolute inset-0 scanlines opacity-[0.06] pointer-events-none" />

        <div className="flex items-center space-x-2 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-roman-aqua shadow-[0_0_8px_var(--roman-aqua)] animate-pulse" />
          <span className="text-[10px] font-bold font-comfortaa text-white uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">

          {/* ── VEIL PEEL TRIGGER with press-ring ──────────────────────── */}
          {onPeel && (
            <div className="relative flex items-center justify-center">
              {/* SVG ring — only visible during hold */}
              {isPeelActive && (
                <svg
                  className="absolute w-10 h-10 pointer-events-none"
                  viewBox="0 0 40 40"
                  style={{ filter: `drop-shadow(0 0 ${Math.round(peelProgress * 8)}px var(--roman-aqua))` }}
                >
                  <circle cx="20" cy="20" r="16" fill="none" strokeWidth="1.5" className="peel-arc-track" />
                  <circle
                    cx="20" cy="20" r="16" fill="none" strokeWidth="2"
                    strokeDasharray={RING_C}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 20 20)"
                    className="peel-arc-fill"
                  />
                </svg>
              )}
              <button
                onPointerDown={(e) => { e.stopPropagation(); startPeelPress(); }}
                onPointerUp={(e) => { e.stopPropagation(); cancelPeelPress(); }}
                onPointerLeave={cancelPeelPress}
                className={`p-1.5 rounded transition-all duration-200 border ${
                  isPeelActive
                    ? 'text-roman-aqua bg-roman-aqua/15 border-roman-aqua/40'
                    : 'text-text-tertiary hover:text-imperial-purple hover:bg-imperial-purple/10 border-transparent hover:border-imperial-purple/30'
                }`}
                title="Hold to Veil Peel → Architect Mode"
              >
                <LayersIcon className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(id); }}
            className="p-1.5 rounded text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── CONTENT BODY ─────────────────────────────────────────────────── */}
      <div className="relative bg-black/20 rounded-b-lg overflow-hidden">
        {/* Scanline overlay for live-monitor feel */}
        <div className="scanlines absolute inset-0 pointer-events-none z-10 opacity-[0.08]" />
        {children}
      </div>
    </motion.div>
  );
};

export default DraggableWidget;
