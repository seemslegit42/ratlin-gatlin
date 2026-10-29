/**
 * @file components/AiChatDock.tsx
 * @description The BEEP Unified Command Dock.
 *
 * Mobile  : A native-feel bottom sheet with three snap states driven by a
 *           drag-handle gesture (peek → half → full). Velocity-based snapping
 *           mirrors iOS / Material Design bottom-sheet UX conventions.
 *
 *           peek : composer only (no transcript) — default resting state
 *           half : partial transcript (≈40dvh) — activates on new messages
 *           full : full transcript (≈70dvh) — user-initiated or maximised
 *
 * Desktop : Centred floating glass card (max-w-3xl) with collapsible transcript.
 *
 * Verdigris Protocol references:
 *   Book I §1.2 — Ancient Roman Glass glassmorphism (.glass-live)
 *   Book I §1.3 — Digital Wabi-Sabi (.wabi-grain, .scanlines)
 *   Book III §3.1 — The Sovereign's Halo ambient awareness
 */

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { logInteraction } from '../services/appLogger.js';

// ─── Snap state ──────────────────────────────────────────────────────────────

type SnapState = 'peek' | 'half' | 'full';

const SNAP_ORDER: SnapState[] = ['peek', 'half', 'full'];

/** Approx transcript visible heights per snap state (px). Used only for animation. */
const TRANSCRIPT_H: Record<SnapState, number> = {
  peek: 0,
  half: Math.round(Math.min(window.innerHeight * 0.38, 360)),
  full: Math.round(Math.min(window.innerHeight * 0.65, 580)),
};

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'beep-dock-snap';

function readSnap(): SnapState {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v === 'half' || v === 'full') return v;
  } catch { /* private mode */ }
  return 'peek';
}

function writeSnap(s: SnapState) {
  try { sessionStorage.setItem(STORAGE_KEY, s); } catch { /* private mode */ }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated BEEP status sigil — pulses green when idle, aqua+animated when processing. */
const BeepSigil: React.FC<{ isProcessing: boolean }> = ({ isProcessing }) => (
  <div className="relative flex items-center justify-center w-7 h-7 flex-shrink-0">
    {/* Outer ring */}
    <div className={`absolute inset-0 rounded-full border transition-colors duration-500 ${
      isProcessing ? 'border-roman-aqua/60' : 'border-patina-green/30'
    }`} />
    {/* Processing pulse ring */}
    {isProcessing && (
      <motion.div
        className="absolute inset-0 rounded-full border border-roman-aqua/30"
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
    )}
    {/* Inner dot */}
    <div
      className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
        isProcessing ? 'bg-roman-aqua' : 'bg-patina-green'
      }`}
      style={{
        boxShadow: isProcessing
          ? '0 0 10px var(--roman-aqua), 0 0 20px rgba(32,178,170,0.3)'
          : '0 0 8px var(--patina-green)',
      }}
    />
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AiChatDockProps {
  transcript: React.ReactNode;
  composer: React.ReactNode;
  onClearTranscript?: () => void;
  /** When true, transcript lives elsewhere (C-HUD main); dock is composer-only. */
  composerOnly?: boolean;
  /** Passed from App to light the sigil during BEEP processing. */
  isProcessing?: boolean;
  /** Total message count — used to auto-promote to 'half' on new messages. */
  messageCount?: number;
  /** Last message text snippet — shown in peek state as a preview. */
  lastMessagePreview?: string;
  /** Source of the last message for accent color in peek. */
  lastMessageSource?: 'BEEP' | 'USER' | 'SYSTEM' | 'AEGIS';
}

// ─── Component ────────────────────────────────────────────────────────────────

const AiChatDock: React.FC<AiChatDockProps> = ({
  transcript,
  composer,
  onClearTranscript,
  composerOnly = false,
  isProcessing = false,
  messageCount = 0,
  lastMessagePreview,
  lastMessageSource = 'BEEP',
}) => {
  const isMobile = useBreakpoint();
  const [snap, setSnapRaw] = useState<SnapState>(readSnap);

  const setSnap = useCallback((s: SnapState) => {
    setSnapRaw(s);
    writeSnap(s);
  }, []);

  // ── Drag gesture (mobile handle) ────────────────────────────────────────────
  const dragStartY = useRef(0);

  const onHandleDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    const dy = info.offset.y;
    const vy = info.velocity.y;

    if (dy < -40 || vy < -220) {
      // Swipe UP → promote snap
      setSnap(snap === 'peek' ? 'half' : 'full');
    } else if (dy > 40 || vy > 220) {
      // Swipe DOWN → demote snap
      setSnap(snap === 'full' ? 'half' : 'peek');
    }
  }, [snap, setSnap]);

  // ── Auto-promote to half when new messages arrive and dock is peeking ───────
  const prevCount = useRef(messageCount);
  useEffect(() => {
    if (messageCount > prevCount.current && snap === 'peek') {
      setSnap('half');
    }
    prevCount.current = messageCount;
  }, [messageCount, snap, setSnap]);

  // ── Keyboard shortcut: ⌘/ focuses the composer input ───────────────────────
  useEffect(() => {
    const focusInput = () => {
      const el = document.getElementById('beep-chat-input') as HTMLTextAreaElement | null;
      if (!el) return;
      try { el.focus(); const len = el.value?.length ?? 0; el.setSelectionRange(len, len); }
      catch { /* noop */ }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        if (snap === 'peek') setSnap('half');
        focusInput();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [snap, setSnap]);

  const handleClear = useCallback(() => {
    onClearTranscript?.();
    logInteraction('chat.clear_transcript', {});
  }, [onClearTranscript]);

  const cycleSnap = useCallback(() => {
    const idx = SNAP_ORDER.indexOf(snap);
    setSnap(SNAP_ORDER[(idx + 1) % SNAP_ORDER.length]);
  }, [snap, setSnap]);

  /** Stream lives in the home shell; dock is composer-only (mic, input, attach, command core). */
  if (composerOnly) {
    return (
      <div
        className="fixed left-0 right-0 z-[110] pointer-events-none high-density"
        style={{
          bottom: isMobile
            ? 'calc(var(--mobile-nav-h, 4rem) + env(safe-area-inset-bottom, 0px))'
            : '0',
        }}
        aria-label="Command composer"
      >
        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-3 pb-3 md:px-4 md:pb-5">
          <div className="glass-live rounded-2xl border border-roman-aqua/20 shadow-[0_0_32px_rgba(32,178,170,0.1)] overflow-hidden relative">
            <div className="wabi-grain rounded-2xl" />
            <div className="scanlines absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl" />
            <div className="relative p-2 md:p-2.5 border-t border-white/5">{composer}</div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT — bottom sheet with drag handle
  // ════════════════════════════════════════════════════════════════════════════

  if (isMobile) {
    const transcriptH = TRANSCRIPT_H[snap];
    const showTranscript = snap !== 'peek';

    return (
      <div
        className="fixed left-0 right-0 z-[110] pointer-events-none"
        style={{ bottom: 'calc(var(--mobile-nav-h) + var(--safe-bottom))' }}
        aria-label="BEEP command dock"
      >
        <div className="pointer-events-auto flex flex-col">

          {/* ── Drag Handle ─────────────────────────────────────────────── */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.12, bottom: 0.12 }}
            onDragEnd={onHandleDragEnd}
            onPointerDown={() => { dragStartY.current = Date.now(); }}
            onClick={cycleSnap}
            className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none"
            aria-label={`Drag to ${snap === 'full' ? 'collapse' : 'expand'} BEEP transcript`}
          >
            <div className={`w-10 h-1 rounded-full transition-colors duration-300 ${
              snap !== 'peek' ? 'bg-roman-aqua/60' : 'bg-white/20'
            }`} />
          </motion.div>

          {/* ── Dock body ───────────────────────────────────────────────── */}
          <div className="glass-live rounded-t-2xl overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.55)] border border-white/10 border-b-0 high-density">

            {/* Wabi-sabi grain */}
            <div className="wabi-grain rounded-t-2xl" />
            {/* Scanline texture */}
            <div className="scanlines absolute inset-0 opacity-[0.04] pointer-events-none rounded-t-2xl" />

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between px-3 py-2 border-b border-white/8">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <BeepSigil isProcessing={isProcessing} />
                <div className="flex flex-col leading-none min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-comfortaa font-bold"
                      style={{ background: 'linear-gradient(90deg, var(--patina-green), var(--roman-aqua))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      BEEP
                    </span>
                    <span className="text-[8px] font-mono text-text-tertiary uppercase tracking-[0.18em]">
                      {isProcessing ? 'thinking…' : 'uplink'}
                    </span>
                    {messageCount > 0 && snap === 'peek' && (
                      <span className="text-[8px] font-mono font-bold text-roman-aqua bg-roman-aqua/10 border border-roman-aqua/20 px-1.5 py-0.5 rounded-full">
                        {messageCount}
                      </span>
                    )}
                  </div>
                  {/* Last message preview in peek state */}
                  {snap === 'peek' && lastMessagePreview && !isProcessing && (
                    <span className="text-[10px] text-text-tertiary truncate max-w-[200px] mt-0.5"
                      style={{ color: lastMessageSource === 'BEEP' ? 'var(--patina-green)' : undefined }}>
                      {lastMessagePreview.slice(0, 60)}{lastMessagePreview.length > 60 ? '…' : ''}
                    </span>
                  )}
                  {snap === 'peek' && isProcessing && (
                    <span className="text-[10px] text-roman-aqua font-mono italic">Processing…</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Snap state indicator dots */}
                <div className="hidden sm:flex items-center gap-1 mr-2">
                  {SNAP_ORDER.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSnap(s)}
                      aria-label={`Set dock to ${s}`}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        snap === s ? 'bg-roman-aqua scale-125' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                {snap !== 'peek' && onClearTranscript && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 uppercase tracking-wide"
                  >
                    Clear
                  </button>
                )}

                {/* Expand / collapse icon */}
                <button
                  type="button"
                  onClick={cycleSnap}
                  aria-label={snap === 'full' ? 'Collapse transcript' : 'Expand transcript'}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-roman-aqua hover:bg-roman-aqua/10 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${snap === 'full' ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Transcript ────────────────────────────────────────────── */}
            <motion.div
              initial={false}
              animate={{ height: transcriptH, opacity: showTranscript ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.8 }}
              className="overflow-hidden"
            >
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    key="transcript"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    id="beep-ai-transcript-panel"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions text"
                    className="overflow-y-auto overflow-x-hidden custom-scrollbar px-3 py-2"
                    style={{ height: transcriptH }}
                  >
                    {transcript}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Composer ──────────────────────────────────────────────── */}
            <div className="p-2 border-t border-white/6">
              {composer}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT — centred floating card
  // ════════════════════════════════════════════════════════════════════════════

  const desktopExpanded = snap !== 'peek';

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-5 z-[80] w-full max-w-3xl px-4 pointer-events-none flex flex-col gap-2 high-density"
      aria-label="BEEP command dock"
    >
      <div className="pointer-events-auto flex flex-col glass-live rounded-2xl border border-white/10 shadow-[0_-4px_40px_rgba(0,0,0,0.5)] overflow-hidden high-density">

        {/* Wabi-sabi grain */}
        <div className="wabi-grain" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-2 border-b border-white/8 bg-black/20">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <BeepSigil isProcessing={isProcessing} />
            <div className="flex flex-col leading-none min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-comfortaa font-bold"
                  style={{ background: 'linear-gradient(90deg, var(--patina-green), var(--roman-aqua))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  BEEP
                </span>
                <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-[0.14em]">
                  {isProcessing ? 'synthesising…' : 'command bridge'}
                </span>
                {messageCount > 0 && (
                  <span className="text-[8px] font-mono text-roman-aqua bg-roman-aqua/10 border border-roman-aqua/20 px-1.5 py-0.5 rounded-full">
                    {messageCount}
                  </span>
                )}
              </div>
              {/* Preview in collapsed state */}
              {!desktopExpanded && lastMessagePreview && !isProcessing && (
                <span className="text-[10px] text-text-tertiary truncate max-w-[260px] mt-0.5"
                  style={{ color: lastMessageSource === 'BEEP' ? 'rgba(62,185,145,0.7)' : undefined }}>
                  {lastMessagePreview.slice(0, 80)}{lastMessagePreview.length > 80 ? '…' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] text-text-tertiary font-mono mr-1 hidden sm:inline" title="Focus input">⌘/</span>

            {desktopExpanded && onClearTranscript && (
              <button type="button" onClick={handleClear}
                className="text-[11px] font-mono px-2 py-1 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 uppercase tracking-wide">
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={cycleSnap}
              aria-label={desktopExpanded ? 'Collapse transcript' : 'Expand transcript'}
              className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-lg text-patina-green hover:bg-patina-green/10 uppercase tracking-wide transition-colors"
            >
              {desktopExpanded ? 'Hide' : 'Stream'}
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${desktopExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Transcript */}
        <motion.div
          initial={false}
          animate={{ height: desktopExpanded ? 'auto' : 0, opacity: desktopExpanded ? 1 : 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
          style={{ maxHeight: desktopExpanded ? 'min(52vh, 520px)' : 0 }}
        >
          <div
            id="beep-ai-transcript-panel"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            className="overflow-y-auto overflow-x-hidden custom-scrollbar px-4 py-3"
            style={{ maxHeight: 'min(52vh, 520px)' }}
          >
            {transcript}
          </div>
        </motion.div>

        {/* Composer */}
        <div className="p-2 md:p-3 border-t border-white/6">
          {composer}
        </div>
      </div>

      {/* Desktop shortcut hint */}
      <div className="pointer-events-none text-center">
        <p className="text-[10px] text-text-tertiary font-mono opacity-50 tracking-wide">
          ⌘/ to focus · Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
};

export default AiChatDock;
