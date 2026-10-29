/**
 * @file components/beep/MarketSenseRadar.tsx
 * @description Perpetual Market Sensing & Shaping Engine.
 * Continuously senses weak market signals, regulatory vectors, and competitor
 * vulnerabilities, orchestrating anticipatory strikes to guarantee insurmountable leads.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { MarketWeakSignal, AnticipatoryManeuver } from '../../services/beepOperatingSystem';
import { sounds } from '../../utils/soundEffects';

interface MarketSenseRadarProps {
  signals: MarketWeakSignal[];
  maneuvers: AnticipatoryManeuver[];
  onExecuteManeuver: (id: string) => void;
}

export const MarketSenseRadar: React.FC<MarketSenseRadarProps> = ({
  signals,
  maneuvers,
  onExecuteManeuver,
}) => {
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'MANEUVERS'>('SIGNALS');

  return (
    <div className="flex flex-col space-y-4">
      {/* Radar Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          {/* Animated Sweeping Radar Ring */}
          <div className="relative w-10 h-10 rounded-full border border-roman-aqua/40 flex items-center justify-center overflow-hidden bg-black/60 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-roman-aqua/20 to-transparent animate-spin" style={{ animationDuration: '4s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-roman-aqua shadow-[0_0_8px_rgba(32,178,170,1)]" />
            <div className="absolute inset-0 border border-roman-aqua/10 rounded-full scale-75" />
          </div>

          <div>
            <h3 className="font-comfortaa font-bold text-base text-vitreous-white tracking-tight">
              Perpetual Market Sensing & Shaping Radar
            </h3>
            <p className="text-[10px] font-lexend text-text-tertiary">
              Weak signal interception across regulatory, competitor, and liquidity horizons
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
          <button
            onClick={() => {
              setActiveTab('SIGNALS');
              sounds.playCrystallineChime(1100);
            }}
            className={`px-3 py-1 rounded transition-colors uppercase ${
              activeTab === 'SIGNALS' ? 'bg-roman-aqua text-black font-bold' : 'text-text-tertiary hover:text-white'
            }`}
          >
            Weak Signals ({signals.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('MANEUVERS');
              sounds.playCrystallineChime(1200);
            }}
            className={`px-3 py-1 rounded transition-colors uppercase ${
              activeTab === 'MANEUVERS' ? 'bg-patina-green text-black font-bold' : 'text-text-tertiary hover:text-white'
            }`}
          >
            Anticipatory Strikes ({maneuvers.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'SIGNALS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signals.map(signal => {
            const isArbitrage = signal.threatVsOpportunity === 'ASYMMETRIC_ARBITRAGE';
            const isOpp = signal.threatVsOpportunity === 'OPPORTUNITY';
            return (
              <div
                key={signal.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-2 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-text-tertiary mb-1">
                    <span>{signal.category}</span>
                    <span className="text-roman-aqua">{signal.detectionHorizon}</span>
                  </div>

                  <h4 className="font-comfortaa font-bold text-xs text-vitreous-white leading-tight mb-1">
                    {signal.headline}
                  </h4>

                  <p className="text-[10px] font-lexend text-text-secondary leading-normal">
                    <span className="text-roman-aqua font-semibold">Recommended Strike:</span> {signal.recommendedStrike}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-mono">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      isArbitrage
                        ? 'bg-yellow-400/20 text-yellow-300'
                        : isOpp
                        ? 'bg-patina-green/20 text-patina-green'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {signal.threatVsOpportunity} · {signal.confidencePct}% CONF
                  </span>

                  <span className="text-yellow-300 font-bold">
                    +{(signal.potentialXiImpact / 1000).toFixed(0)}k Ξ Alpha
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {maneuvers.map(maneuver => {
            const isDeployed = maneuver.status === 'DEPLOYED';
            const isCompleted = maneuver.status === 'COMPLETED';

            return (
              <div
                key={maneuver.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-patina-green/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-text-tertiary mb-1">
                    <span>{maneuver.targetMarket}</span>
                    <span className={isCompleted ? 'text-patina-green' : isDeployed ? 'text-roman-aqua' : 'text-yellow-300'}>
                      {maneuver.status}
                    </span>
                  </div>

                  <h4 className="font-comfortaa font-bold text-xs text-vitreous-white leading-tight mb-1.5">
                    {maneuver.title}
                  </h4>

                  <p className="text-[10px] font-lexend text-text-secondary mb-2">
                    {maneuver.description}
                  </p>

                  {/* Sassy BEEP Fourth Wall Verdict */}
                  <div className="p-2 rounded bg-white/5 border border-white/5 text-[9px] font-lexend italic text-roman-aqua/90">
                    "{maneuver.fourthWallVerdict}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="text-[10px] font-mono text-text-tertiary">
                    Req: <span className="text-white">{maneuver.swarmRequiredCount} Agents</span> · <span className="text-yellow-300 font-bold">{(maneuver.capitalCommitmentXi / 1000).toFixed(0)}k Ξ</span>
                  </div>

                  <button
                    onClick={() => onExecuteManeuver(maneuver.id)}
                    disabled={isDeployed || isCompleted}
                    className={`px-3 py-1 rounded text-[9px] font-comfortaa font-bold uppercase tracking-wider transition-all ${
                      isCompleted
                        ? 'bg-patina-green/20 text-patina-green border border-patina-green/30'
                        : isDeployed
                        ? 'bg-roman-aqua/20 text-roman-aqua border border-roman-aqua/30 animate-pulse'
                        : 'bg-patina-green hover:bg-patina-green/80 text-black font-bold active:scale-95'
                    }`}
                  >
                    {isCompleted ? 'Dominance Secured' : isDeployed ? 'Striking...' : 'Execute Strike'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketSenseRadar;
