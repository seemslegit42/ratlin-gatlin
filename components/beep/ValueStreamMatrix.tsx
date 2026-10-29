/**
 * @file components/beep/ValueStreamMatrix.tsx
 * @description Autonomous Purpose-Driven Value Stream Matrix.
 * Visualizes the convergence of Talent, Capital, and Technology into
 * self-organizing streams with Antifragility tracking (Phi > 1.0).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ValueStream } from '../../services/beepOperatingSystem';
import { sounds } from '../../utils/soundEffects';

interface ValueStreamMatrixProps {
  streams: ValueStream[];
  onTriggerRebalance: (mode?: 'BALANCED' | 'GROWTH_SURGE' | 'SHOCK_FORTRESS' | 'HYPER_YIELD') => void;
  isSelfOrganizing?: boolean;
}

export const ValueStreamMatrix: React.FC<ValueStreamMatrixProps> = ({
  streams,
  onTriggerRebalance,
  isSelfOrganizing = false,
}) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string>(streams[0]?.id || '');
  const [streamFilter, setStreamFilter] = useState<'ALL' | 'ACTIVE' | 'SURGING'>('ALL');

  const filteredStreams = streams.filter(s => {
    if (streamFilter === 'ACTIVE') return s.status === 'Active';
    if (streamFilter === 'SURGING') return s.status === 'Surging';
    return true;
  });

  const activeStream = streams.find(s => s.id === selectedStreamId) || streams[0];

  return (
    <div className="flex flex-col space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/10">
        <div>
          <h3 className="font-comfortaa font-bold text-base text-vitreous-white tracking-tight">
            Autonomous Value Stream Mesh
          </h3>
          <p className="text-[10px] font-lexend text-text-tertiary">
            Real-time convergence of talent swarms, Xi capital, and MCP technology conduits
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-black/60 p-1 rounded-lg border border-white/10 text-[9px] font-mono">
            {(['ALL', 'ACTIVE', 'SURGING'] as const).map(f => (
              <button
                key={f}
                onClick={() => {
                  setStreamFilter(f);
                  sounds.playCrystallineChime(1100);
                }}
                className={`px-2.5 py-1 rounded transition-colors uppercase ${
                  streamFilter === f ? 'bg-roman-aqua text-black font-bold' : 'text-text-tertiary hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => onTriggerRebalance('GROWTH_SURGE')}
            disabled={isSelfOrganizing}
            className="px-3 py-1.5 rounded-lg text-[10px] font-comfortaa font-bold uppercase tracking-wider bg-patina-green/20 hover:bg-patina-green/30 text-patina-green border border-patina-green/40 transition-all disabled:opacity-50"
          >
            {isSelfOrganizing ? 'Converging...' : 'Rebalance Swarms'}
          </button>
        </div>
      </div>

      {/* Stream Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredStreams.map(stream => {
          const isSelected = stream.id === selectedStreamId;
          return (
            <motion.div
              key={stream.id}
              onClick={() => {
                setSelectedStreamId(stream.id);
                sounds.playCrystallineChime(950);
              }}
              whileHover={{ y: -2 }}
              className={`cursor-pointer rounded-xl p-3.5 transition-all relative overflow-hidden border ${
                isSelected
                  ? 'bg-gradient-to-b from-white/10 to-white/5 border-roman-aqua shadow-[0_0_24px_rgba(32,178,170,0.25)]'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Corner badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-mono tracking-widest text-text-tertiary uppercase">
                  {stream.mandate}
                </span>
                <span
                  className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    stream.status === 'Surging'
                      ? 'bg-roman-aqua/20 text-roman-aqua'
                      : 'bg-white/10 text-text-secondary'
                  }`}
                >
                  {stream.status}
                </span>
              </div>

              {/* Title & Purpose */}
              <h4 className="font-comfortaa font-bold text-sm text-vitreous-white leading-tight mb-1">
                {stream.name}
              </h4>
              <p className="text-[10px] font-lexend text-text-tertiary line-clamp-2 mb-3">
                {stream.purpose}
              </p>

              {/* Vital Metrics Pill Strip */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-center">
                <div className="bg-black/30 p-1 rounded">
                  <div className="text-[8px] font-mono text-text-tertiary uppercase">Talent</div>
                  <div className="text-[11px] font-comfortaa font-bold text-vitreous-white">
                    {stream.talent.agentSwarmCount} Agents
                  </div>
                </div>

                <div className="bg-black/30 p-1 rounded">
                  <div className="text-[8px] font-mono text-text-tertiary uppercase">Capital</div>
                  <div className="text-[11px] font-comfortaa font-bold text-yellow-300">
                    {(stream.capital.xiAllocated / 1000).toFixed(0)}k Ξ
                  </div>
                </div>

                <div className="bg-black/30 p-1 rounded">
                  <div className="text-[8px] font-mono text-text-tertiary uppercase">Antifragile</div>
                  <div className="text-[11px] font-comfortaa font-bold text-patina-green">
                    {stream.antifragilityPhi}Φ
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Stream Deep Inspector */}
      {activeStream && (
        <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-comfortaa font-bold text-lg text-roman-aqua">
                  {activeStream.name}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-patina-green/20 text-patina-green">
                  Resonance {activeStream.resonanceScore}%
                </span>
              </div>
              <p className="text-xs font-lexend text-text-secondary mt-0.5">
                Objective: {activeStream.strategicObjective}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-text-tertiary">
                Autonomous Executions: <span className="text-white font-bold">{activeStream.autonomousExecutionsCount}</span>
              </span>
            </div>
          </div>

          {/* Three-column inspection: Talent Swarm | Capital Yield | Tech Conduits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Talent Swarm */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-comfortaa font-bold text-vitreous-white uppercase">Talent Dynamic Swarm</span>
                <span className="text-[10px] font-mono text-roman-aqua">{activeStream.talent.autonomyLevel}</span>
              </div>

              <div className="text-xs text-text-secondary">
                {activeStream.talent.humanOperatorsCount} Human Operator · {activeStream.talent.agentSwarmCount} Specialized Agents
              </div>

              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-roman-aqua h-full rounded-full transition-all"
                  style={{ width: `${activeStream.talent.cognitiveLoadPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-text-tertiary">
                <span>Cognitive Load</span>
                <span>{activeStream.talent.cognitiveLoadPct}%</span>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {activeStream.talent.keySpecialists.map((spec, i) => (
                  <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-secondary border border-white/10">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Column 2: Capital Allocation */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-comfortaa font-bold text-yellow-300 uppercase">Capital Treasury Flow</span>
                <span className="text-[10px] font-mono text-patina-green">{activeStream.capital.realizedRoiMultiplier}x ROI</span>
              </div>

              <div className="text-lg font-comfortaa font-bold text-yellow-400">
                {activeStream.capital.xiAllocated.toLocaleString()} <span className="text-xs font-mono text-text-tertiary">Ξ Total Pool</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-text-secondary pt-1">
                <div>
                  <span className="text-text-tertiary">Monthly Burn:</span> {activeStream.capital.monthlyBurnXi.toLocaleString()} Ξ
                </div>
                <div>
                  <span className="text-text-tertiary">Hedged Margin:</span> {activeStream.capital.hedgedMarginPct}%
                </div>
              </div>

              <div className="text-[9px] font-mono text-patina-green bg-patina-green/10 p-1.5 rounded border border-patina-green/20">
                ✓ Guaranteed Antifragility Margin Buffer: {activeStream.capital.liquidityBufferPct}%
              </div>
            </div>

            {/* Column 3: Tech Conduits */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-comfortaa font-bold text-imperial-purple uppercase">Technology Conduits</span>
                <span className="text-[10px] font-mono text-purple-300">{activeStream.conduits.length} Active</span>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                {activeStream.conduits.map(conduit => (
                  <div key={conduit.id} className="flex items-center justify-between p-1.5 rounded bg-white/5 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-1.5 h-1.5 rounded-full bg-patina-green animate-pulse" />
                      <span className="truncate text-vitreous-white">{conduit.name}</span>
                    </div>
                    <span className="text-roman-aqua shrink-0 ml-1">{conduit.latencyMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValueStreamMatrix;
