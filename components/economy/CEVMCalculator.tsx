
/**
 * @file components/economy/CEVMCalculator.tsx
 * @description The "Cognitive Efficacy Value Model" (CEVM) Interactive Engine.
 * Allows the user to simulate the exponential value creation of agentic systems
 * based on the formula: Revenue = V * N * E_CO(t) * (P * F) * G_Trust.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { BrainIcon } from '../icons/BrainIcon';
import { InfinityIcon, RecursionIcon, ScaleUpIcon } from '../icons/StrategyIcons';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

const CEVMSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  description: string;
  onChange: (val: number) => void;
  color: string;
}> = ({ label, value, min, max, step, unit = '', description, onChange, color }) => (
  <div className="mb-4">
    <div className="flex justify-between items-end mb-1">
      <label className="text-xs font-bold text-vitreous-white uppercase tracking-wider">{label}</label>
      <span className="font-mono text-sm font-bold" style={{ color }}>{value}{unit}</span>
    </div>
    <p className="text-[10px] text-text-tertiary mb-2 h-4 leading-none">{description}</p>
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: color }}
    />
  </div>
);

export const CEVMCalculator: React.FC = () => {
  // CEVM Variables
  const [baseValue, setBaseValue] = useState(150); // V_CO
  const [agentCount, setAgentCount] = useState(50); // N
  const [iqi, setIqi] = useState(1.2); // Introspection Quality Index (Driver for E_CO)
  const [trust, setTrust] = useState(0.95); // G_Trust
  const [adoption, setAdoption] = useState(0.4); // P_M

  // Calculated Projections (simulating 5 years/cycles)
  const [projection, setProjection] = useState<{ linear: number[], exponential: number[] }>({ linear: [], exponential: [] });

  useEffect(() => {
    const cycles = [1, 2, 3, 4, 5];

    // Linear (Tool World): V * N * A (Static)
    const linearData = cycles.map(t => baseValue * agentCount * adoption * t);

    // Exponential (Agent World): V * N * E_CO(t) * A * G
    // E_CO(t) modeled as (1 + IQI_Growth)^t
    // Using simplified logic for demo visualization
    const exponentialData = cycles.map(t => {
      const eco = Math.pow(1 + (iqi * 0.2), t); // Compounding efficiency
      return baseValue * agentCount * eco * adoption * trust;
    });

    setProjection({ linear: linearData, exponential: exponentialData });
  }, [baseValue, agentCount, iqi, trust, adoption]);

  const maxVal = Math.max(...projection.exponential);

  return (
    <ModuleCard title="Cognitive Efficacy Engine (CEVM)" icon={<BrainIcon className="w-6 h-6 text-imperial-purple" />} className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">

        {/* Controls */}
        <div className="space-y-2">
          <CEVMSlider
            label="Base Cognitive Value (V)"
            value={baseValue} min={10} max={1000} step={10} unit="$"
            description="Economic value of a single autonomous task."
            onChange={setBaseValue} color="#20B2AA"
          />
          <CEVMSlider
            label="Collaborative Agents (N)"
            value={agentCount} min={1} max={500} step={1}
            description="Total count of agents in the swarm."
            onChange={setAgentCount} color="#3EB991"
          />
          <CEVMSlider
            label="Introspection Index (IQI)"
            value={iqi} min={0.1} max={2.0} step={0.1}
            description="Quality of recursive self-correction (E_CO driver)."
            onChange={setIqi} color="#6A0DAD"
          />
          <CEVMSlider
            label="Trust Multiplier (G)"
            value={trust} min={0.1} max={1.0} step={0.05}
            description="Governance & Safety dampener."
            onChange={setTrust} color="#FFD700"
          />
          <CEVMSlider
            label="Market Adoption (P)"
            value={adoption} min={0.1} max={1.0} step={0.1}
            description="Degree of workflow integration."
            onChange={setAdoption} color="#F0F2F5"
          />
        </div>

        {/* Visualization */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 relative flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <ScaleUpIcon className="w-5 h-5 text-patina-green" />
              <span className="text-xs font-bold uppercase text-white">Value Projection</span>
            </div>
            <div className="text-[10px] text-text-tertiary">5-Cycle Horizon</div>
          </div>

          <div className="flex-grow flex items-end space-x-4 relative pl-8 pb-6">
            {/* Y-Axis Label */}
            <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[8px] text-text-tertiary font-mono py-1">
              <span>${(maxVal / 1000).toFixed(0)}k</span>
              <span>$0</span>
            </div>

            {/* Bars */}
            {projection.exponential.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full relative group">
                {/* Linear Bar (Ghost) */}
                <div
                  className="w-full bg-white/10 absolute bottom-0 rounded-t-sm"
                  style={{ height: `${(projection.linear[i] / maxVal) * 100}%` }}
                />
                {/* Exponential Bar */}
                <motion.div
                  className="w-full bg-gradient-to-t from-imperial-purple to-roman-aqua rounded-t-md relative z-10 opacity-90 group-hover:opacity-100 transition-opacity"
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / maxVal) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none border border-white/10">
                    ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </motion.div>
                <div className="text-[9px] text-text-tertiary text-center mt-2 font-mono">C{i + 1}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center space-x-2">
              <RecursionIcon className="w-4 h-4 text-roman-aqua" />
              <span className="text-[10px] text-text-secondary uppercase font-bold">Compounding Lift</span>
            </div>
            <span className="text-lg font-mono font-bold text-patina-green">
              {((projection.exponential[4] / projection.linear[4]) || 1).toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};
