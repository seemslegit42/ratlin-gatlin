
/**
 * @file components/ambient/DiegeticOverlay.tsx
 * @description Applies global screen effects to simulate a high-tech "Diegetic" display.
 * Includes CRT scanlines, a vignette for depth, digital noise for texture, and corner sigils
 * to frame the viewport as a physical device or neural interface.
 */

import React from 'react';

export const DiegeticOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden select-none">
      {/* Optical Vignette: Focuses attention on the center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.5)_100%)]" />

      {/* Scanlines: Simulates refresh rate/interlacing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-50" />

      {/* Digital Sensor Noise: Adds tactile grit */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Interface Frame Sigils (Corner Brackets) */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t border-l border-white/20 rounded-tl-xl opacity-50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t border-r border-white/20 rounded-tr-xl opacity-50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-white/20 rounded-bl-xl opacity-50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b border-r border-white/20 rounded-br-xl opacity-50" />

      {/* Technical Readouts (Static Greebles) */}
      <div className="absolute bottom-6 left-24 text-[9px] font-mono text-white/20 tracking-[0.2em] hidden md:block">
        SYS.V.9.4.2 // NEURAL_LINK: STABLE
      </div>
      <div className="absolute bottom-6 right-24 text-[9px] font-mono text-white/20 tracking-[0.2em] hidden md:block">
        RENDER_ENGINE: AETHER
      </div>
    </div>
  );
};
