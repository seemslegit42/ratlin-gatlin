/**
 * @file components/beep/BioDigitalFlow.tsx
 * @description Bio-Digital Logic §3.6.B: The Flow (Data Transfer / Capital Liquidity).
 * Living fluid container:
 * - Fluid Dynamics: Animated wave SVG overlay animating horizontally (translateX)
 *   while the container height fills vertically with capital/data volume.
 * - Viscosity: Speed inversely correlates to payload size:
 *   Heavy files/liquidity = thick, slow liquid (Patina Green).
 *   Light files/transactions = fast, thin liquid (Roman Aqua).
 */

import React, { useMemo } from 'react';

interface BioDigitalFlowProps {
  fillPercentage?: number; // 0 to 100%
  payloadSizeMb?: number;  // file size or capital volume (higher = more viscous)
  label?: string;
  sublabel?: string;
  className?: string;
}

export const BioDigitalFlow: React.FC<BioDigitalFlowProps> = ({
  fillPercentage = 68,
  payloadSizeMb = 12,
  label = 'Liquidity Conduit',
  sublabel = 'Real-time Flow',
  className = '',
}) => {
  // Clamped percentage
  const clampedFill = Math.min(100, Math.max(5, fillPercentage));

  // Determine viscosity and color:
  // Large files (> 50MB) -> thick, slow, Patina Green (#3EB991)
  // Small files (<= 50MB) -> fast, thin, Roman Aqua (#20B2AA)
  const isHeavy = payloadSizeMb > 50;
  const liquidColor = isHeavy ? '#3EB991' : '#20B2AA';
  const waveDuration = isHeavy ? '4.8s' : '2.0s'; // slow thick vs fast thin

  return (
    <div className={`relative flex flex-col rounded-xl overflow-hidden bg-black/40 border border-white/10 p-3 select-none ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase mb-1 z-10">
        <span className="font-bold text-vitreous-white">{label}</span>
        <span className="text-roman-aqua">{clampedFill.toFixed(0)}% FILL</span>
      </div>

      <div className="flex items-center justify-between text-[9px] text-text-tertiary font-mono mb-2 z-10">
        <span>{sublabel}</span>
        <span>{isHeavy ? `Heavy (${payloadSizeMb}M) · Viscous` : `Light (${payloadSizeMb}M) · Fast`}</span>
      </div>

      {/* Fluid Chamber */}
      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black/60 border border-white/5">
        {/* Dynamic fluid column */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
          style={{
            height: `${clampedFill}%`,
            background: `linear-gradient(to top, ${liquidColor}88, ${liquidColor}33)`,
          }}
        >
          {/* Animated Wave Crest SVG */}
          <div
            className="absolute -top-3 left-0 w-[200%] h-6 pointer-events-none"
            style={{
              animation: `flow-wave ${waveDuration} linear infinite`,
            }}
          >
            <svg
              viewBox="0 0 600 24"
              className="w-full h-full fill-current"
              style={{ color: liquidColor }}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 0 12 C 75 0, 150 24, 225 12 C 300 0, 375 24, 450 12 C 525 0, 600 24, 675 12 L 675 24 L 0 24 Z"
                opacity="0.7"
              />
              <path
                d="M 0 14 C 60 22, 140 4, 220 14 C 300 24, 380 4, 460 14 C 540 24, 620 4, 700 14 L 700 24 L 0 24 Z"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>

        {/* Ambient Bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute bottom-2 left-1/4 w-1.5 h-1.5 rounded-full bg-white/40"
            style={{ animation: 'bubble-float 3.2s ease-in infinite' }}
          />
          <div
            className="absolute bottom-1 left-2/3 w-2 h-2 rounded-full bg-white/30"
            style={{ animation: 'bubble-float 4.1s ease-in infinite 1.2s' }}
          />
        </div>

        {/* Center reading */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-comfortaa font-bold text-sm text-vitreous-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {clampedFill.toFixed(0)}%
          </span>
        </div>
      </div>

      <style>{`
        @keyframes flow-wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bubble-float {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(-70px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BioDigitalFlow;
