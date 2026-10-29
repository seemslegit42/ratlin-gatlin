/**
 * @file components/shared/BrandSignature.tsx
 * @description Mandatory Brand Signature instrument for ΛΞV Inc / BEEP.
 * Anchors the interface in our reality.
 *
 * Specification:
 * - Enterprise: ΛΞV Inc
 * - Tagline: The Future Needs Context
 * - Motto: Innovate, Automate, Dominate
 * - Placement: Fixed Bottom-Left of the Canvas or Sidebar (z-index: 9999)
 * - Micro-scale: Line 1 approx 10px; Line 2 approx 8px
 * - Opacity: 40% (0.4)
 * - Blend Mode: mix-blend-mode: overlay
 * - Typography:
 *     Line 1: Comfortaa Bold (Kerning: Normal)
 *     Line 2: Lexend Thin (Kerning: Wide / Tracking: 0.2em)
 * - Behavior: Dynamic stamp, permanent.
 */

import React from 'react';

export const BrandSignature: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`fixed bottom-2 left-3 z-[9999] pointer-events-none select-none ${className}`}
      style={{
        opacity: 0.4,
        mixBlendMode: 'overlay',
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col leading-tight tracking-normal">
        <span className="font-comfortaa font-bold text-[10px] text-vitreous-white uppercase">
          ΛΞV Inc
        </span>
        <span className="font-lexend font-thin text-[8px] text-roman-aqua tracking-[0.2em] uppercase">
          The Future Needs Context
        </span>
      </div>
    </div>
  );
};

export default BrandSignature;
