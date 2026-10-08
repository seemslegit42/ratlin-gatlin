
/**
 * @file components/economy/GovernancePanel.tsx
 * @description The "Loom of Fates" - Interface for the HPVC protocol.
 * Controls RTR, SRE (Sine-Rhythm) amplitude, and Pity Boon logic.
 */

import React, { useState } from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ScaleIcon } from '../icons/EconomyIcons';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons';
import { motion } from 'framer-motion';

const Dial: React.FC<{
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  onChange: (val: number) => void;
  color: string;
}> = ({ label, symbol, value, min, max, step, description, onChange, color }) => (
  <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-roman-aqua/20 transition-all group relative overflow-hidden">
    {/* Subtle Glow background */}
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-3xl pointer-events-none transition-opacity" style={{ backgroundColor: color }} />
    
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div>
        <h4 className="font-bold text-[11px] text-vitreous-white uppercase tracking-widest">{label}</h4>
        <p className="text-[9px] text-text-tertiary mt-1 leading-relaxed max-w-[160px]">{description}</p>
      </div>
      <div className="text-right">
        <span className="text-[9px] font-mono font-black opacity-40 uppercase">{symbol}</span>
        <div className="text-xl font-mono font-bold text-white group-hover:text-vitreous-white transition-colors">
            {typeof value === 'number' && value < 1 ? value.toFixed(2) : value}
        </div>
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-roman-aqua mt-2 transition-opacity"
      style={{ accentColor: color }}
    />
  </div>
);

export const GovernancePanel: React.FC = () => {
  // HPVC Core Controls (PDF Section 1.3, 4.1)
  const [baseRTR, setBaseRTR] = useState(0.18); // Base Retained Tribute Ratio
  const [pityThreshold, setPityThreshold] = useState(3); // Pity Boon Threshold
  const [sreAmplitude, setSreAmplitude] = useState(0.5); // Sine-Rhythm Engine modulation
  const [vcr, setVcr] = useState(98.5); // Validator Consensus Rate

  return (
    <ModuleCard title="The Loom of Fates" icon={<ScaleIcon className="w-6 h-6 text-imperial-purple" />}>
      <div className="flex flex-col h-full space-y-5">
        <div className="flex items-center space-x-4 p-4 bg-imperial-purple/10 border border-imperial-purple/30 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-imperial-purple to-transparent opacity-40" />
            <div className="p-2.5 rounded-xl bg-imperial-purple/20 border border-imperial-purple/40 text-imperial-purple animate-pulse shadow-lg">
                <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">HPVC Protocol Active</h4>
                <p className="text-[10px] text-text-secondary mt-1 max-w-sm leading-relaxed">
                    Automated calibration of behavioral levers. Modification of economic constants is logged to <span className="text-white font-bold font-mono">THE SCROLL</span>.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dial
            label="Base RTR"
            symbol="RTR"
            value={baseRTR}
            min={0.05}
            max={0.35}
            step={0.01}
            description="The 'House Edge' for all Instruments of Folly and Transmutations."
            onChange={setBaseRTR}
            color="var(--imperial-purple)"
          />
          <Dial
            label="Pity Boon"
            symbol="PBT"
            value={pityThreshold}
            min={1}
            max={10}
            step={1}
            description="Loss-streak tolerance before a guaranteed 'Earned Win' is generated."
            onChange={setPityThreshold}
            color="var(--patina-green)"
          />
          <Dial
            label="SRE Amplitude"
            symbol="\lambda_{Luck}"
            value={sreAmplitude}
            min={0.1}
            max={1.0}
            step={0.05}
            description="Dilation of the Sine-Rhythm Engine's personalized waves of luck."
            onChange={setSreAmplitude}
            color="var(--roman-aqua)"
          />
          <Dial
            label="Consensus Root"
            symbol="VCR"
            value={vcr}
            min={90}
            max={100}
            step={0.1}
            description="Required network consensus for Proof-of-Attribution ($\Xi$ minting)."
            onChange={setVcr}
            color="var(--yellow-400)"
          />
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[8px] font-bold text-text-tertiary uppercase">Tribute Velocity</span>
                <span className="text-sm font-mono text-patina-green font-bold">42.8 $\Xi$/min</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-bold text-text-tertiary uppercase">Network Latency</span>
                <span className="text-sm font-mono text-roman-aqua font-bold">12ms</span>
             </div>
          </div>
          
          <button className="px-6 py-2.5 bg-white/10 hover:bg-imperial-purple text-white border border-white/10 hover:border-imperial-purple rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-imperial-purple/40">
            Submit Governance Proposal
          </button>
        </div>
      </div>
    </ModuleCard>
  );
};
