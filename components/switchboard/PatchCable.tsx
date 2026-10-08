
/**
 * @file components/switchboard/PatchCable.tsx
 * @description Renders a visual connection line (patch cable) between two jacks.
 * Features a gravity-simulated "hanging" curve, glowing core, and animated data flow pulses.
 */

import React from 'react';
import type { JackPosition } from '../../types.js';
import { motion } from 'framer-motion';

interface PatchCableProps {
  startPos: JackPosition;
  endPos: JackPosition;
  color?: string;
  isDragging?: boolean;
}

const PatchCable: React.FC<PatchCableProps> = ({ startPos, endPos, color = '#FFD700', isDragging }) => {
  // Calculate distance
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Gravity Simulation
  // We want the cable to "sag" based on distance.
  // A simple approximation is to push the control points downwards.
  const sagFactor = Math.min(200, distance * 0.6); // Cap sag for very long cables
  
  // Control Points for Cubic Bezier (M start C cp1 cp2 end)
  // Standard node editors use horizontal bias. We use vertical bias for "gravity".
  const cp1x = startPos.x + (dx * 0.1); 
  const cp1y = startPos.y + sagFactor;
  
  const cp2x = endPos.x - (dx * 0.1);
  const cp2y = endPos.y + sagFactor;

  const pathData = `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`;
  const cableId = `cable-${startPos.x.toFixed(0)}-${startPos.y.toFixed(0)}-${endPos.x.toFixed(0)}-${endPos.y.toFixed(0)}`;

  // Dynamic colors based on prop or default (Patina Green -> Roman Aqua gradient simulated via stroke)
  const strokeColor = color; 

  return (
    <g className="pointer-events-none">
      {/* 1. Invisible wide path for hover/click detection (future-proofing) */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="30"
        fill="none"
        style={{ pointerEvents: isDragging ? 'none' : 'visibleStroke' }}
      />

      {/* 2. Drop Shadow (Depth) */}
      <path
        d={pathData}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        transform="translate(2, 4)"
        style={{ filter: 'blur(2px)' }}
      />

      {/* 3. Outer Shielding (Textured look) */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth="6"
        strokeOpacity="0.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* 4. Core Cable */}
      <path
        id={cableId}
        d={pathData}
        stroke={strokeColor}
        strokeWidth="3"
        strokeOpacity="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* 5. Highlight / Sheen */}
      <path
        d={pathData}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        transform="translate(0, -1)"
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* 6. Data Flow Pulse (Only if not dragging, for performance) */}
      {!isDragging && (
        <circle r="4" fill="#FFFFFF">
          <animateMotion 
            dur="2s" 
            repeatCount="indefinite" 
            keyPoints="0;1" 
            keyTimes="0;1" 
            calcMode="linear"
          >
             <mpath href={`#${cableId}`} />
          </animateMotion>
        </circle>
      )}
      
      {/* 7. Jack Connector Heads (Visual anchor points) */}
      <circle cx={startPos.x} cy={startPos.y} r="6" fill="#1a1a1a" stroke={strokeColor} strokeWidth="2" />
      <circle cx={endPos.x} cy={endPos.y} r="6" fill="#1a1a1a" stroke={strokeColor} strokeWidth="2" />
    </g>
  );
};

export default React.memo(PatchCable);
