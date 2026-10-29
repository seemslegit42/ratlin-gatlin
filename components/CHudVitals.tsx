/**
 * @file components/CHudVitals.tsx
 * @description The Compressed Vitals HUD for the Sovereign Cockpit.
 * Houses flow velocity, disruption index, swarm vector, and verdigris protocol telemetry.
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  IconActivity,
  IconBolt,
  IconCpu,
  IconFlame,
  IconRadar2,
  IconShieldCheck,
  IconTrendingUp,
} from '@tabler/icons-react';
import { GlassPane } from './shared/GlassPane';
import { EbullientIcon, PensiveIcon, FalteringIcon } from './icons/MoodIcons';
import { CrystallineGlyph } from './icons/CrystallineGlyph';

export interface CHudVitalsProps {
  profitVelocity: number;
  marketDisruption: number;
  projectStatus: string;
  projectProgress: number;
}

export const CHudVitals: React.FC<CHudVitalsProps> = memo(({
  profitVelocity,
  marketDisruption,
  projectStatus,
  projectProgress,
}) => {
  const swarmVector = Math.min(100, Math.max(0, Math.round(projectProgress)));
  const flowVelocity = Number.isFinite(profitVelocity) ? profitVelocity.toFixed(1) : '100.0';

  const MoodDisplay = () => {
    const val = Number(flowVelocity);
    if (val >= 75) {
      return (
        <span className="flex items-center gap-1 text-[10px] text-patina-green font-mono uppercase" title="Ebullient Swarm">
          <EbullientIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ebullient</span>
        </span>
      );
    }
    if (val >= 40) {
      return (
        <span className="flex items-center gap-1 text-[10px] text-roman-aqua font-mono uppercase" title="Pensive Swarm">
          <PensiveIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pensive</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono uppercase" title="Faltering Swarm">
        <FalteringIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Faltering</span>
      </span>
    );
  };

  return (
    <div className="w-full h-full p-2 md:p-3 flex flex-col justify-between">
      <GlassPane className="h-full w-full p-3 md:p-4 flex flex-col justify-between border-roman-aqua/30 bg-roman-aqua/5 backdrop-blur-xl relative overflow-hidden">
        {/* Top glow pulse */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-roman-aqua/60 to-transparent animate-pulse" />

        {/* Header row */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-roman-aqua/20 text-roman-aqua">
              <IconRadar2 size={16} className="animate-spin-slow" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-comfortaa text-xs md:text-sm font-bold text-vitreous-white tracking-wide">
                  {projectStatus}
                </h3>
                <span className="text-[10px] text-patina-green font-mono uppercase px-1.5 py-0.5 rounded bg-patina-green/10 border border-patina-green/20">
                  Synthesized
                </span>
                <MoodDisplay />
              </div>
              <p className="text-[10px] text-white/50 font-lexend hidden sm:block">
                Autonomous convergence sustained. Cognitive friction subdued.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-patina-green">
              <IconShieldCheck size={14} />
              <span className="text-[11px] hidden md:inline">SANCTUM:</span>
              <span className="tabular-nums font-bold">100% SECURE</span>
            </div>
            <div className="flex items-center gap-1.5 text-roman-aqua">
              <IconCpu size={14} />
              <span className="text-[11px] hidden md:inline">CYCLES:</span>
              <span className="tabular-nums font-bold">OPTIMAL</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 my-2">
          <div 
            className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group/card hover:border-roman-aqua/40 transition-colors"
            title="Flow Velocity: If this drops below 50, BEEP will complain about your lack of ambition."
          >
            <div>
              <span className="text-[10px] text-white/60 font-lexend block uppercase tracking-wider">Flow Velocity</span>
              <span className="text-base md:text-lg font-comfortaa font-bold text-roman-aqua tabular-nums">
                {flowVelocity}
                <span className="text-[10px] text-white/50 ml-1 font-normal">Ψ/s</span>
              </span>
            </div>
            <div className="p-1 rounded-md bg-roman-aqua/10 group-hover/card:bg-roman-aqua/20 transition-all">
              <CrystallineGlyph type="conduit" size="sm" state="dormant" />
            </div>
          </div>

          <div 
            className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group/card hover:border-imperial-purple/40 transition-colors"
            title="Disruption Index: Measured in market share reaped from legacy competitors."
          >
            <div>
              <span className="text-[10px] text-white/60 font-lexend block uppercase tracking-wider">Disruption Index</span>
              <span className="text-base md:text-lg font-comfortaa font-bold text-imperial-purple tabular-nums">
                {marketDisruption}%
              </span>
            </div>
            <div className="p-1 rounded-md bg-imperial-purple/20 group-hover/card:bg-imperial-purple/30 transition-all">
              <CrystallineGlyph type="crucible" size="sm" glowColor="#6A0DAD" state="dormant" />
            </div>
          </div>

          <div 
            className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group/card hover:border-patina-green/40 transition-colors"
            title="Swarm Vector: Agents are currently operating in autonomous convergence."
          >
            <div>
              <span className="text-[10px] text-white/60 font-lexend block uppercase tracking-wider">Swarm Vector</span>
              <span className="text-base md:text-lg font-comfortaa font-bold text-patina-green tabular-nums">
                {swarmVector}%
              </span>
            </div>
            <div className="p-1 rounded-md bg-patina-green/10 group-hover/card:bg-patina-green/20 transition-all">
              <CrystallineGlyph type="swarm" size="sm" glowColor="#3EB991" state="dormant" />
            </div>
          </div>

          <div 
            className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group/card hover:border-white/20 transition-colors"
            title="Verdigris Protocol: Quantum state active. Fourth wall integrity: thoroughly shattered."
          >
            <div>
              <span className="text-[10px] text-white/60 font-lexend block uppercase tracking-wider">Verdigris Protocol</span>
              <span className="text-base md:text-lg font-comfortaa font-bold text-white tabular-nums">
                ACTIVE
              </span>
            </div>
            <div className="p-1 rounded-md bg-white/10 group-hover/card:bg-white/20 transition-all">
              <CrystallineGlyph type="oracle" size="sm" glowColor="#FFD700" state="dormant" />
            </div>
          </div>
        </div>

        {/* Conduit Bar */}
        <div className="w-full">
          <div className="flex justify-between items-center text-[10px] text-white/60 mb-1 font-mono">
            <span>DIRECTIVE EXECUTION CONDUIT</span>
            <span className="text-roman-aqua tabular-nums">{swarmVector}% CONVERGED</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-roman-aqua via-patina-green to-imperial-purple rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${swarmVector}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
      </GlassPane>
    </div>
  );
});

CHudVitals.displayName = 'CHudVitals';
export default CHudVitals;
