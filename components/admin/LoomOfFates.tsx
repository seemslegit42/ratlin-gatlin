
/**
 * @file components/admin/LoomOfFates.tsx
 * @description The "Loom of Fates" - Controls for the fundamental laws of the system (Klepsydra Engine)
 * and visualization of the Groq Swarm activity. Features improved organic threading visuals.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import Loom from '../Loom.js';
import type { Agent, Connection } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons';
import { ScaleIcon } from '../icons/EconomyIcons';

interface LoomOfFatesProps {
  agents?: Record<string, Agent>;
  connections?: Connection[];
}

const ControlDial: React.FC<{ label: string; value: number; color: string; description: string }> = ({ label, value, color, description }) => (
  <div className="flex flex-col space-y-2 group p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all">
    <div className="flex justify-between items-end">
      <div>
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
        <p className="text-[9px] text-text-tertiary mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{description}</p>
      </div>
      <span className="font-mono text-sm font-bold" style={{ color }}>{value}%</span>
    </div>
    <div className="relative pt-1">
        <input
        type="range" min="0" max="100" defaultValue={value}
        className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-current"
        style={{ color: color }}
        />
        <div className="absolute top-1 left-0 h-1.5 rounded-full pointer-events-none" style={{ backgroundColor: color, width: `${value}%`, opacity: 0.2 }} />
    </div>
  </div>
);

const EntropyVisualizer: React.FC = () => {
    return (
        <div className="h-12 w-full flex items-center justify-around gap-1 px-2">
            {[...Array(24)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-roman-aqua rounded-full opacity-30"
                    animate={{ 
                        height: [4, 16 + Math.random() * 24, 4],
                        opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{ 
                        duration: 0.8 + Math.random() * 1.2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.05
                    }}
                />
            ))}
        </div>
    );
};

const LoomOfFates: React.FC<LoomOfFatesProps> = ({ agents, connections }) => {
  const { addNotification } = useNotifications();

  const handleBlackWager = () => {
      const outcomes = [
          "Entropy Spike Detected. Volatility +15%. Opportunity Window: OPEN.",
          "Wager Accepted. The House aligns with the Swarm. Yield projected at 4.2x.",
          "Protocol Nullified. High-Risk event averted by AEGIS.",
      ];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const type = outcome.includes("Opportunity") ? "success" : outcome.includes("Nullified") ? "info" : "error";
      
      addNotification(outcome, type);
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* The Weave Visualization */}
        <div className="lg:col-span-2">
            <ModuleCard title="The Synaptic Weave" icon={<TrendingUpIcon className="w-5 h-5 text-roman-aqua" />}>
                <div className="relative h-[450px]">
                    <Loom agents={agents} connections={connections} />
                    
                    {/* Live System Pulse Overlay */}
                    <div className="absolute top-4 left-4 p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg pointer-events-none">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-patina-green animate-pulse" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">Topology Monitor</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between w-32 text-[8px] font-mono text-text-tertiary">
                                <span>NODES:</span> <span className="text-white">{Object.keys(agents || {}).length}</span>
                            </div>
                            <div className="flex justify-between w-32 text-[8px] font-mono text-text-tertiary">
                                <span>THROUGHPUT:</span> <span className="text-patina-green">HIGH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </ModuleCard>
        </div>

        {/* The Profit Dials & Engine Stats */}
        <div className="flex flex-col gap-6">
            <ModuleCard title="KLEPSYDRA Tuning" icon={<ScaleIcon className="w-5 h-5 text-imperial-purple" />}>
                <div className="space-y-4">
                    <ControlDial 
                        label="Retained Tribute (RTR)" 
                        value={18} 
                        color="#6A0DAD" 
                        description="Syndicate fee on all internal value transmutation."
                    />
                    <ControlDial 
                        label="Pity Boon Threshold" 
                        value={35} 
                        color="#3EB991" 
                        description="Threshold for automated system intervention during low-yield cycles."
                    />
                    <ControlDial 
                        label="Global Entropy" 
                        value={12} 
                        color="#EF4444" 
                        description="Controls the randomness of Agent gossip and event generation."
                    />

                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Logic Complexity</span>
                            <span className="text-[9px] font-mono text-roman-aqua">NOMINAL</span>
                        </div>
                        <EntropyVisualizer />
                    </div>

                    <div className="pt-4">
                        <button 
                        onClick={handleBlackWager}
                        className="w-full py-3 bg-imperial-purple/20 border border-imperial-purple/50 text-imperial-purple rounded-xl font-bold text-xs hover:bg-imperial-purple/30 transition-all shadow-[0_0_15px_rgba(106,13,173,0.2)] hover:shadow-[0_0_20px_rgba(106,13,173,0.4)] group overflow-hidden relative"
                        >
                        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <ZapIcon className="w-4 h-4" /> Initiate Black Wager Event
                        </span>
                        </button>
                    </div>
                </div>
            </ModuleCard>

            <ModuleCard title="System Sovereignty">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h4 className="text-[10px] font-bold text-text-secondary uppercase mb-3">Protocol Health</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-tertiary">Stability</span>
                            <span className="text-patina-green font-mono font-bold">99.98%</span>
                        </div>
                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-patina-green" style={{ width: '99%' }} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-tertiary">Coherence</span>
                            <span className="text-roman-aqua font-mono font-bold">84.5%</span>
                        </div>
                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-roman-aqua" style={{ width: '84%' }} />
                        </div>
                    </div>
                </div>
            </ModuleCard>
        </div>
        </div>
    </div>
  );
};

export default LoomOfFates;
