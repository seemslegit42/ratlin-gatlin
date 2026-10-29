/**
 * @file components/VitalsHUD.tsx
 * @description Sole Sovereign vitals surface — compressed strip or expanded pod deck.
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCpu, IconRadar2, IconShieldCheck } from '@tabler/icons-react';
import type { Agent, View, KlepsydraMetric } from '../types.js';
import type { XiFlowData } from '../services/xiEconomyService.js';
import { computeAgentResourceMetrics } from '../utils/agentResourceMetrics.js';
import PulseProfile from './vitalshud/PulseProfile.js';
import { SystemResourcesPanel } from './vitalshud/SystemResources.js';
import NetworkUplinks from './vitalshud/NetworkUplinks.js';
import FinancialPulse from './vitalshud/FinancialPulse.js';
import { ChevronDownIcon } from './icons/ChevronDownIcon.js';
import { GlassPane } from './shared/GlassPane.js';
import { EbullientIcon, PensiveIcon, FalteringIcon } from './icons/MoodIcons.js';
import { CrystallineGlyph } from './icons/CrystallineGlyph.js';

export type VitalsHUDMode = 'compressed' | 'expanded';

export interface VitalsHUDProps {
  mode: VitalsHUDMode;
  agents: Record<string, Agent>;
  onNavigate: (view: View) => void;
  klepsydra: KlepsydraMetric;
  economyData?: XiFlowData | null;
  profitVelocity?: number;
  marketDisruption?: number;
  projectStatus?: string;
  projectProgress?: number;
}

const SystemDeco: React.FC = memo(() => (
  <div className="hidden xl:flex flex-col justify-between items-end h-full py-1.5 px-2.5 border-l border-white/5 opacity-50 bg-white/5 backdrop-blur-md rounded-r-lg select-none">
    <span className="text-[8px] font-mono text-text-tertiary">SYS.CYCLE</span>
    <span className="text-[9px] font-mono text-patina-green">NOMINAL</span>
    <div className="flex space-x-0.5">
      <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" />
      <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse delay-75" />
    </div>
  </div>
));
SystemDeco.displayName = 'SystemDeco';

const CompressedVitals: React.FC<{
  profitVelocity: number;
  marketDisruption: number;
  projectStatus: string;
  projectProgress: number;
}> = memo(({ profitVelocity, marketDisruption, projectStatus, projectProgress }) => {
  const executionVector = Math.min(100, Math.max(0, Math.round(projectProgress)));
  const flowVelocity = Number.isFinite(profitVelocity) ? profitVelocity.toFixed(1) : '100.0';

  const MoodDisplay = () => {
    const val = Number(flowVelocity);
    if (val >= 75) {
      return (
        <span className="flex items-center gap-1 text-[10px] text-patina-green font-mono uppercase" title="Ebullient flow">
          <EbullientIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ebullient</span>
        </span>
      );
    }
    if (val >= 40) {
      return (
        <span className="flex items-center gap-1 text-[10px] text-roman-aqua font-mono uppercase" title="Pensive flow">
          <PensiveIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pensive</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono uppercase" title="Faltering flow">
        <FalteringIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Faltering</span>
      </span>
    );
  };

  return (
    <div className="w-full h-full p-2 md:p-3 flex flex-col justify-between">
      <GlassPane className="h-full w-full p-3 md:p-4 flex flex-col justify-between border-roman-aqua/30 bg-roman-aqua/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-roman-aqua/60 to-transparent animate-pulse" />

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 my-2">
          <div
            className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group/card hover:border-roman-aqua/40 transition-colors"
            title="Flow Velocity"
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
            title="Disruption Index"
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
            title="Execution vector"
          >
            <div>
              <span className="text-[10px] text-white/60 font-lexend block uppercase tracking-wider">Execution Vector</span>
              <span className="text-base md:text-lg font-comfortaa font-bold text-patina-green tabular-nums">
                {executionVector}%
              </span>
            </div>
            <div className="p-1 rounded-md bg-patina-green/10 group-hover/card:bg-patina-green/20 transition-all">
              <CrystallineGlyph type="lattice" size="sm" glowColor="#3EB991" state="dormant" />
            </div>
          </div>

          <div
            className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group/card hover:border-white/20 transition-colors"
            title="Verdigris Protocol"
          >
            <div>
              <span className="text-[10px] text-white/60 font-lexend block uppercase tracking-wider">Verdigris Protocol</span>
              <span className="text-base md:text-lg font-comfortaa font-bold text-white tabular-nums">ACTIVE</span>
            </div>
            <div className="p-1 rounded-md bg-white/10 group-hover/card:bg-white/20 transition-all">
              <CrystallineGlyph type="oracle" size="sm" glowColor="#FFD700" state="dormant" />
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between items-center text-[10px] text-white/60 mb-1 font-mono">
            <span>DIRECTIVE EXECUTION CONDUIT</span>
            <span className="text-roman-aqua tabular-nums">{executionVector}% CONVERGED</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-roman-aqua via-patina-green to-imperial-purple rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${executionVector}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
      </GlassPane>
    </div>
  );
});
CompressedVitals.displayName = 'CompressedVitals';

const ExpandedVitalsDeck: React.FC<{
  agents: Record<string, Agent>;
  klepsydra: KlepsydraMetric;
  economyData?: XiFlowData | null;
  onNavigate: (view: View) => void;
}> = ({ agents, klepsydra, economyData, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasEconomyFeed = Boolean(economyData);
  const resourceMetrics = useMemo(() => computeAgentResourceMetrics(agents), [agents]);
  const handleToggleCollapse = useCallback(() => setIsCollapsed((current) => !current), []);
  const navigateEconomy = useCallback(() => onNavigate('economy'), [onNavigate]);

  return (
    <div className="flex flex-col z-10 relative pointer-events-auto w-full high-density h-full">
      <div className="glass-panel rounded-lg overflow-hidden shadow-xl transition-all duration-500 ease-in-out holo-flicker h-full flex flex-col">
        <div className="relative flex items-center justify-between px-2.5 h-6 border-b border-white/5 flex-shrink-0">
          <div className="hidden md:flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${hasEconomyFeed ? 'bg-patina-green animate-pulse' : 'bg-yellow-400 animate-pulse-slow'}`} />
            <span className="text-[7px] font-mono text-text-tertiary uppercase tracking-widest">AOS_VITALS</span>
          </div>
          <div className="flex md:hidden items-center gap-1.5 flex-1">
            <div className="w-1 h-1 rounded-full bg-patina-green animate-pulse" />
            <span className="text-[7px] font-comfortaa font-bold text-text-tertiary uppercase tracking-widest">AOS_VITALS</span>
          </div>
          <button
            type="button"
            onClick={handleToggleCollapse}
            className="one-tap p-1 rounded-full hover:bg-white/10 text-text-tertiary hover:text-white transition-colors z-20"
            aria-label={isCollapsed ? 'Expand Vitals HUD' : 'Collapse Vitals HUD'}
          >
            <ChevronDownIcon className={`w-2.5 h-2.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 min-h-0"
            >
              <div className="p-2 md:p-2.5 pt-1.5">
                <div className="flex overflow-x-auto md:grid md:grid-cols-12 gap-2 pb-1.5 md:pb-0 custom-scrollbar snap-x snap-mandatory">
                  <div className="min-w-[260px] md:min-w-0 md:col-span-4 snap-center">
                    <PulseProfile klepsydra={klepsydra} />
                  </div>
                  <div className="min-w-[200px] md:min-w-0 md:col-span-3 snap-center">
                    <FinancialPulse data={economyData ?? null} onNavigate={navigateEconomy} />
                  </div>
                  <div className="min-w-[200px] md:min-w-0 md:col-span-3 snap-center">
                    <SystemResourcesPanel vitals={resourceMetrics} />
                  </div>
                  <div className="min-w-[200px] md:min-w-0 md:col-span-2 flex gap-1 snap-center">
                    <div className="flex-grow">
                      <NetworkUplinks
                        hasEconomyFeed={hasEconomyFeed}
                        coherencePercent={resourceMetrics.coherenceScore}
                      />
                    </div>
                    <SystemDeco />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const VitalsHUD: React.FC<VitalsHUDProps> = ({
  mode,
  agents,
  onNavigate,
  klepsydra,
  economyData,
  profitVelocity = 0,
  marketDisruption = 68,
  projectStatus = 'Project Genesis',
  projectProgress = 45,
}) => {
  if (mode === 'compressed') {
    return (
      <CompressedVitals
        profitVelocity={profitVelocity}
        marketDisruption={marketDisruption}
        projectStatus={projectStatus}
        projectProgress={projectProgress}
      />
    );
  }

  return (
    <ExpandedVitalsDeck
      agents={agents}
      klepsydra={klepsydra}
      economyData={economyData}
      onNavigate={onNavigate}
    />
  );
};

export default VitalsHUD;
