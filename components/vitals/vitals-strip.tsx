/**
 * @file components/vitals/vitals-strip.tsx
 * @description Read-only summary strip: flow velocity, disruption index, primary project status.
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassPane } from '../shared/GlassPane.js';

export interface VitalsStripProps {
  profitVelocity: number;
  marketDisruption: number;
  projectStatus: string;
  projectProgress?: number;
}

const ProfitVelocityWaveform: React.FC<{ velocity: number }> = memo(({ velocity }) => {
  const amplitude = Math.min(1, Math.max(0.15, velocity / 100));
  const bars = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  return (
    <div className="flex items-end gap-[2px] h-8 w-full max-w-[140px]" aria-hidden>
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-roman-aqua/90"
          style={{ boxShadow: '0 0 6px rgba(32,178,170,0.45)' }}
          animate={{
            height: [
              `${8 + amplitude * 12}px`,
              `${14 + amplitude * 22 * (0.4 + Math.sin(i * 0.55) * 0.6)}px`,
              `${8 + amplitude * 12}px`,
            ],
          }}
          transition={{
            duration: 1.2 + (i % 5) * 0.08,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  );
});
ProfitVelocityWaveform.displayName = 'ProfitVelocityWaveform';

export const VitalsStrip: React.FC<VitalsStripProps> = memo(({
  profitVelocity,
  marketDisruption,
  projectStatus,
  projectProgress = 0,
}) => {
  const flowLabel = Number.isFinite(profitVelocity) ? profitVelocity.toFixed(1) : '—';
  const progress = Math.min(100, Math.max(0, Math.round(projectProgress)));

  return (
    <div className="w-full h-full p-2 md:p-3 select-none pointer-events-none high-density" aria-label="System vitals at a glance">
      <GlassPane className="h-full w-full px-3 py-2 md:px-4 md:py-3 flex flex-col justify-center border-roman-aqua/25 bg-roman-aqua/[0.04] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-roman-aqua/50 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-center">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-text-tertiary block mb-1">
                Profit velocity
              </span>
              <ProfitVelocityWaveform velocity={profitVelocity} />
            </div>
            <div>
              <span className="text-lg md:text-xl font-comfortaa font-bold text-roman-aqua tabular-nums">
                {flowLabel}
              </span>
              <span className="text-[10px] text-white/50 ml-1 font-lexend">Ψ/s</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-center min-w-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-tertiary mb-1">
              Market disruption index
            </span>
            <span className="text-2xl md:text-3xl font-comfortaa font-bold text-imperial-purple tabular-nums">
              {marketDisruption}
              <span className="text-sm text-white/40 ml-0.5">%</span>
            </span>
          </div>

          <div className="flex flex-col items-start md:items-end min-w-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-tertiary mb-1">
              Primary project
            </span>
            <span className="text-xs md:text-sm font-comfortaa font-bold text-vitreous-white truncate max-w-full">
              {projectStatus}
            </span>
            <div className="mt-1.5 w-full max-w-[160px] h-1 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-roman-aqua to-patina-green rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </GlassPane>
    </div>
  );
});
VitalsStrip.displayName = 'VitalsStrip';

export default VitalsStrip;
