
/**
 * @file components/VitalsHUD.tsx
 * @description The Vitals HUD (Heads-Up Display) container.
 * Orchestrates the display of modular "Pods" (System, Swarm, Finance, Network).
 * Optimized for mobile responsiveness.
 */

import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, View, KlepsydraMetric } from '../types.js';
import type { XiFlowData } from '../services/xiEconomyService.js';
import { useSwarmVitals } from '../hooks/useSwarmVitals.js';

// Pod Imports
import { SwarmIntegrityPanel } from './vitalshud/SwarmIntegrity.js';
import PulseProfile from './vitalshud/PulseProfile.js';
import { SystemResourcesPanel } from './vitalshud/SystemResources.js';
import NetworkUplinks from './vitalshud/NetworkUplinks.js';
import FinancialPulse from './vitalshud/FinancialPulse.js';
import { ChevronDownIcon } from './icons/ChevronDownIcon.js';

interface VitalsHUDProps {
  agents: Record<string, Agent>;
  onNavigate: (view: View) => void;
  klepsydra: KlepsydraMetric;
  economyData?: XiFlowData | null;
}

const SystemDeco: React.FC = memo(() => {
  const [hex, setHex] = useState('0x00');

  useEffect(() => {
    const interval = setInterval(() => {
      setHex(`0x${Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden xl:flex flex-col justify-between items-end h-full py-1.5 px-2.5 border-l border-white/5 opacity-50 bg-white/5 backdrop-blur-md rounded-r-lg select-none">
      <span className="text-[8px] font-mono text-text-tertiary">SYS.CYCLE</span>
      <span className="text-[9px] font-mono text-patina-green">{hex}</span>
      <div className="flex space-x-0.5">
        <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" />
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse delay-75" />
      </div>
    </div>
  );
});
SystemDeco.displayName = 'SystemDeco';

const VitalsHUD: React.FC<VitalsHUDProps> = ({ agents, onNavigate, klepsydra, economyData }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasEconomyFeed = Boolean(economyData);
  const swarmVitals = useSwarmVitals(agents);
  const handleToggleCollapse = useCallback(() => setIsCollapsed((current) => !current), []);
  const navigateEconomy = useCallback(() => onNavigate('economy'), [onNavigate]);

  return (
    <div className="flex flex-col z-10 relative pointer-events-auto w-full high-density">
      <div className="glass-panel rounded-lg overflow-hidden shadow-xl transition-all duration-500 ease-in-out holo-flicker">
        
        {/* HUD title bar — always visible */}
        <div className="relative flex items-center justify-between px-2.5 h-6 border-b border-white/5">
          {/* Desktop label */}
          <div className="hidden md:flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${hasEconomyFeed ? 'bg-patina-green animate-pulse' : 'bg-yellow-400 animate-pulse-slow'}`} />
            <span className="text-[7px] font-mono text-text-tertiary uppercase tracking-widest">AOS_VITALS_STREAMING</span>
          </div>

          {/* Mobile row — title + collapse button */}
          <div className="flex md:hidden items-center gap-1.5 flex-1">
            <div className="w-1 h-1 rounded-full bg-patina-green animate-pulse" />
            <span className="text-[7px] font-comfortaa font-bold text-text-tertiary uppercase tracking-widest">AOS_VITALS</span>
          </div>

          <button
            type="button"
            onClick={handleToggleCollapse}
            className="one-tap p-1 rounded-full hover:bg-white/10 text-text-tertiary hover:text-white transition-colors z-20"
            aria-label={isCollapsed ? 'Expand Vitals HUD' : 'Collapse Vitals HUD'}
            title={isCollapsed ? 'Expand Vitals' : 'Collapse Vitals'}
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
            >
              <div className="p-2 md:p-2.5 pt-1.5">
                <div className="flex overflow-x-auto md:grid md:grid-cols-12 gap-2 pb-1.5 md:pb-0 custom-scrollbar snap-x snap-mandatory">
                  <div className="min-w-[260px] md:min-w-0 md:col-span-3 snap-center">
                    <SwarmIntegrityPanel vitals={swarmVitals} onNavigate={onNavigate} />
                  </div>
                  <div className="min-w-[260px] md:min-w-0 md:col-span-3 snap-center">
                    <PulseProfile klepsydra={klepsydra} />
                  </div>
                  <div className="min-w-[200px] md:min-w-0 md:col-span-2 snap-center">
                    <FinancialPulse data={economyData || null} onNavigate={navigateEconomy} />
                  </div>
                  <div className="min-w-[200px] md:min-w-0 md:col-span-2 snap-center">
                    <SystemResourcesPanel vitals={swarmVitals} />
                  </div>
                  <div className="min-w-[200px] md:min-w-0 md:col-span-2 flex gap-1 snap-center">
                    <div className="flex-grow">
                      <NetworkUplinks hasEconomyFeed={hasEconomyFeed} swarmHealthPercent={swarmVitals.coherenceScore} />
                    </div>
                    <SystemDeco />
                  </div>
                </div>
              </div>
              {/* Scanline texture on the expanded pod area */}
              <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.04] rounded-b-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VitalsHUD;
