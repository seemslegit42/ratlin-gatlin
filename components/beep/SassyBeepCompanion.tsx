/**
 * @file components/beep/SassyBeepCompanion.tsx
 * @description Sassy BEEP Entity: Clippy 2.0 with actual divine intelligence.
 * Breaks the fourth wall, delivers witty enterprise commentary, offers
 * one-click autonomous decrees, and contains the 3-click God Mode Easter egg.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';

interface SassyBeepCompanionProps {
  axiom: string;
  onQuickRebalance: () => void;
  onMarketProbe: () => void;
  onChaosTest: () => void;
  onUnlockGodMode: () => void;
  isSelfOrganizing?: boolean;
  godModeActive?: boolean;
}

export const SassyBeepCompanion: React.FC<SassyBeepCompanionProps> = ({
  axiom,
  onQuickRebalance,
  onMarketProbe,
  onChaosTest,
  onUnlockGodMode,
  isSelfOrganizing = false,
  godModeActive = false,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mood, setMood] = useState<'smug' | 'observant' | 'hyperactive' | 'existential'>('smug');
  const [speechBubbleOpen, setSpeechBubbleOpen] = useState(true);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  // Easter egg: 3 rapid clicks triggers God Mode
  const handleSigilClick = () => {
    sounds.playGlassThrum();
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => setClickCount(0), 1200);

    if (nextCount >= 3) {
      setClickCount(0);
      onUnlockGodMode();
    }
  };

  useEffect(() => {
    const moods: ('smug' | 'observant' | 'hyperactive' | 'existential')[] = ['smug', 'observant', 'hyperactive', 'existential'];
    const timer = setInterval(() => {
      setMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 18000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-obsidian-black/90 via-panel-bg to-obsidian-black/90 border border-white/10 shadow-[0_8px_32px_0_rgba(28,25,52,0.3)] backdrop-blur-xl">
      {/* Bio-Digital Sassy Avatar */}
      <div
        className="relative group cursor-pointer flex-shrink-0"
        onClick={handleSigilClick}
        onMouseEnter={() => {
          setIsHovered(true);
          sounds.playCrystallineChime(1400);
        }}
        onMouseLeave={() => setIsHovered(false)}
        title="BEEP (Behavioral Event & Execution Processor) · Click 3x for God Mode"
      >
        {/* Glow halo */}
        <div
          className={`absolute -inset-2 rounded-full transition-all duration-500 blur-md ${
            godModeActive
              ? 'bg-gradient-to-tr from-yellow-400 via-patina-green to-roman-aqua opacity-80 animate-pulse'
              : isSelfOrganizing
              ? 'bg-gradient-to-tr from-imperial-purple to-roman-aqua opacity-70 animate-spin'
              : 'bg-roman-aqua/20 group-hover:bg-roman-aqua/40'
          }`}
        />

        {/* Crystalline Sigil Base */}
        <motion.div
          animate={{
            y: [0, -4, 0],
            rotate: isSelfOrganizing ? [0, 180, 360] : 0,
          }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          }}
          className={`relative w-16 h-16 rounded-2xl border flex flex-col items-center justify-center overflow-hidden shadow-2xl transition-all ${
            godModeActive
              ? 'bg-gradient-to-b from-yellow-400/20 to-imperial-purple/40 border-yellow-300'
              : 'bg-black/60 border-white/20 group-hover:border-roman-aqua'
          }`}
        >
          {/* Animated expressive eyes (Clippy 2.0) */}
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={mood === 'smug' ? { scaleY: 0.3 } : mood === 'hyperactive' ? { scale: 1.2 } : { scaleY: 1 }}
              className={`w-2.5 h-3.5 rounded-full ${godModeActive ? 'bg-yellow-300' : 'bg-roman-aqua'} shadow-[0_0_8px_rgba(32,178,170,0.8)]`}
            />
            <motion.div
              animate={mood === 'smug' ? { scaleY: 0.3 } : mood === 'hyperactive' ? { scale: 1.2 } : { scaleY: 1 }}
              className={`w-2.5 h-3.5 rounded-full ${godModeActive ? 'bg-yellow-300' : 'bg-roman-aqua'} shadow-[0_0_8px_rgba(32,178,170,0.8)]`}
            />
          </div>

          {/* Sassy smile / status line */}
          <div
            className={`h-0.5 rounded-full transition-all ${
              godModeActive ? 'w-6 bg-yellow-300' : isSelfOrganizing ? 'w-8 bg-patina-green animate-pulse' : 'w-4 bg-white/60'
            }`}
          />

          {/* Micro Sigil text */}
          <span className="text-[7px] font-mono tracking-widest text-text-tertiary mt-1 uppercase">
            {godModeActive ? 'DEITY' : isSelfOrganizing ? 'CONVERGING' : 'BEEP 2.0'}
          </span>
        </motion.div>
      </div>

      {/* Sassy Fourth-Wall Commentary Bubble */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-comfortaa font-bold text-xs text-roman-aqua tracking-tight">
              {godModeActive ? 'BEEP · QUANTUM TRANSCENDENCE' : 'BEEP · CHIEF OF SOVEREIGNTY'}
            </span>
            <span className="text-[9px] font-mono text-text-tertiary">
              {godModeActive ? 'Fourth Wall: Demolished' : 'Aesthetic Intelligence: Maximal'}
            </span>
          </div>

          <button
            onClick={() => setSpeechBubbleOpen(v => !v)}
            className="text-[9px] font-mono text-text-tertiary hover:text-white transition-colors"
          >
            {speechBubbleOpen ? 'Quiet' : 'Speak'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {speechBubbleOpen && (
            <motion.div
              key={axiom}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-xs md:text-sm font-lexend text-vitreous-white leading-relaxed italic bg-white/5 border border-white/10 rounded-xl p-2.5 shadow-inner"
            >
              "{axiom}"
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fast Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={onQuickRebalance}
            disabled={isSelfOrganizing}
            className="px-3 py-1.5 rounded-lg text-[10px] font-comfortaa font-bold uppercase tracking-wider bg-roman-aqua/15 hover:bg-roman-aqua/25 text-roman-aqua border border-roman-aqua/40 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            title="Auto-rebalance talent, capital, and technology across all value streams"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-roman-aqua animate-ping" />
            <span>Self-Organize Swarm</span>
          </button>

          <button
            onClick={onMarketProbe}
            className="px-3 py-1.5 rounded-lg text-[10px] font-comfortaa font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/15 transition-all active:scale-95"
            title="Scan multi-horizon market weak signals"
          >
            Sense Weak Signals
          </button>

          <button
            onClick={onChaosTest}
            className="px-3 py-1.5 rounded-lg text-[10px] font-comfortaa font-bold uppercase tracking-wider bg-imperial-purple/20 hover:bg-imperial-purple/35 text-purple-300 border border-imperial-purple/40 transition-all active:scale-95"
            title="Inject controlled stress shock to verify antifragile rebound"
          >
            Inject Chaos Drill
          </button>
        </div>
      </div>
    </div>
  );
};

export default SassyBeepCompanion;
