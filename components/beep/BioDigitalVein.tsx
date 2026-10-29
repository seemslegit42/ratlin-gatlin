/**
 * @file components/beep/BioDigitalVein.tsx
 * @description Bio-Digital Logic §3.6.A: The Vein (System Health).
 * Reflects server/system health as a living organism:
 * - Stroke color: Patina Green (#3EB991) when healthy, Imperial Purple (#6A0DAD) under load.
 * - Pulse: Modulates stroke-opacity between 0.6 and 1.0.
 * - Constriction (Load): If load > 80%, stroke-width reduced by 50% and pulse speed increases to 300ms (Hyperventilation).
 * - Flicker (Error): If error rate > 1%, applies random transform jitter.
 */

import React, { useMemo } from 'react';

interface BioDigitalVeinProps {
  systemLoad?: number; // 0 to 100%
  errorRate?: number;  // 0 to 100%
  className?: string;
  label?: string;
}

export const BioDigitalVein: React.FC<BioDigitalVeinProps> = ({
  systemLoad = 42,
  errorRate = 0,
  className = '',
  label = 'System Vitality'
}) => {
  const isHighLoad = systemLoad > 80;
  const hasError = errorRate > 1;

  // Determine stroke color
  const strokeColor = useMemo(() => {
    if (hasError) return '#FF6347'; // Tomato warning
    if (isHighLoad) return '#6A0DAD'; // Imperial Purple on load
    return '#3EB991'; // Patina Green healthy
  }, [hasError, isHighLoad]);

  // Constriction reduces stroke width by 50%
  const strokeWidth = isHighLoad ? 1.5 : 3;

  // Pulse animation duration: 300ms if hyperventilating, 1800ms if nominal
  const pulseDuration = isHighLoad ? '0.3s' : '1.8s';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center justify-between w-full text-[9px] font-mono tracking-widest uppercase text-text-tertiary mb-1 px-1">
        <span>{label}</span>
        <span className={isHighLoad ? 'text-imperial-purple font-bold' : hasError ? 'text-red-400 font-bold' : 'text-patina-green font-bold'}>
          {systemLoad.toFixed(0)}% LOAD · {hasError ? `ERR ${errorRate.toFixed(1)}%` : 'NOMINAL'}
        </span>
      </div>

      <div
        className={`w-full h-10 relative overflow-hidden rounded-lg bg-black/40 border border-white/10 p-1 flex items-center justify-center ${
          hasError ? 'animate-jitter' : ''
        }`}
        style={hasError ? { animation: 'vein-jitter 0.1s infinite alternate' } : undefined}
      >
        <svg
          viewBox="0 0 300 40"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id={`vein-glow-${label.replace(/\s+/g, '-')}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background trace line */}
          <path
            d="M 0 20 Q 30 10, 60 20 T 120 20 T 180 20 T 240 20 T 300 20"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Living pulsing biological vein */}
          <path
            d="M 0 20 Q 35 6, 70 20 T 140 20 T 210 20 T 280 20 T 300 20"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={`url(#vein-glow-${label.replace(/\s+/g, '-')})`}
            style={{
              animation: `vein-pulse ${pulseDuration} ease-in-out infinite alternate`,
              transition: 'stroke-width 0.4s ease, stroke 0.4s ease',
            }}
          />

          {/* Biological blood/energy pulse packet */}
          <circle
            r={isHighLoad ? 2.5 : 4}
            fill={strokeColor}
            style={{
              offsetPath: "path('M 0 20 Q 35 6, 70 20 T 140 20 T 210 20 T 280 20 T 300 20')",
              animation: `vein-flow ${isHighLoad ? '0.7s' : '2.4s'} linear infinite`,
            }}
          />
        </svg>
      </div>

      <style>{`
        @keyframes vein-pulse {
          0% { stroke-opacity: 0.6; }
          100% { stroke-opacity: 1.0; }
        }
        @keyframes vein-flow {
          0% { motion-offset: 0%; offset-distance: 0%; }
          100% { motion-offset: 100%; offset-distance: 100%; }
        }
        @keyframes vein-jitter {
          0% { transform: translateX(-1px); }
          100% { transform: translateX(1px); }
        }
      `}</style>
    </div>
  );
};

export default BioDigitalVein;
