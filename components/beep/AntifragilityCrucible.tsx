/**
 * @file components/beep/AntifragilityCrucible.tsx
 * @description Antifragility & Controlled Chaos Crucible.
 * Injects deliberate systemic shocks (Black Swan, Price Wars, Outages) to stress
 * the enterprise, verifying that BEEP's value streams convert disorder into net profit (Phi > 1.0).
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CHAOS_SCENARIOS,
  type ChaosStressScenario,
  type ChaosEventRecord,
} from '../../services/beepOperatingSystem';
import { sounds } from '../../utils/soundEffects';

interface AntifragilityCrucibleProps {
  systemPhi: number;
  activeShock: ChaosStressScenario | null;
  countdown: number | null;
  chaosHistory: ChaosEventRecord[];
  onInjectShock: (scenario: ChaosStressScenario) => void;
}

export const AntifragilityCrucible: React.FC<AntifragilityCrucibleProps> = ({
  systemPhi,
  activeShock,
  countdown,
  chaosHistory,
  onInjectShock,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Crucible Header & Current Antifragility Coefficient */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-4 rounded-xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-comfortaa font-bold text-base text-vitreous-white tracking-tight">
              Antifragility Crucible & Chaos Stress Engine
            </h3>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-imperial-purple/30 text-purple-200 border border-imperial-purple/40">
              Taleb Antifragility Protocol
            </span>
          </div>
          <p className="text-[10px] font-lexend text-text-tertiary">
            Controlled disorder injection to prove that systemic shocks expand syndicate capital rather than contract it
          </p>
        </div>

        {/* Big Antifragility Coefficient Badge */}
        <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-patina-green/30">
          <div className="text-right">
            <div className="text-[8px] font-mono text-text-tertiary uppercase">Disorder Conversion (Phi)</div>
            <div className="text-xl font-comfortaa font-bold text-patina-green">
              {systemPhi}Φ
            </div>
          </div>
          <div className="text-[10px] font-mono text-patina-green/80 max-w-[90px] leading-tight">
            Gaining {(systemPhi * 100 - 100).toFixed(0)}% more value per unit shock
          </div>
        </div>
      </div>

      {/* Active Chaos Countdown Banner if running */}
      <AnimatePresence>
        {activeShock && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-gradient-to-r from-red-950/70 via-black to-red-950/70 border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center animate-ping text-xs">
                ⚠️
              </div>
              <div>
                <h4 className="font-comfortaa font-bold text-sm text-red-200">
                  ACTIVE SHOCK: {activeShock.name}
                </h4>
                <p className="text-xs font-lexend text-red-300/80">
                  Disorder Delta: -{activeShock.disorderDeltaPct}% · BEEP dynamically absorbing volatility...
                </p>
              </div>
            </div>

            <div className="text-center font-comfortaa font-bold text-lg text-yellow-300">
              Auto-Rebound in {countdown ?? 0}s
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chaos Stress Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {CHAOS_SCENARIOS.map(scenario => {
          const isCurrent = activeShock?.id === scenario.id;
          return (
            <div
              key={scenario.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isCurrent
                  ? 'bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-text-tertiary mb-1">
                  <span>{scenario.intensity}</span>
                  <span className="text-purple-300">+{((scenario.antifragileGainFactor - 1) * 100).toFixed(0)}% Net Gain</span>
                </div>

                <h4 className="font-comfortaa font-bold text-xs text-vitreous-white leading-tight mb-1">
                  {scenario.name}
                </h4>

                <p className="text-[10px] font-lexend text-text-secondary leading-normal">
                  {scenario.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-text-tertiary">
                  Shock: <span className="text-red-400">-{scenario.disorderDeltaPct}%</span>
                </span>

                <button
                  onClick={() => onInjectShock(scenario)}
                  disabled={activeShock !== null}
                  className="px-3 py-1 rounded text-[9px] font-comfortaa font-bold uppercase tracking-wider bg-imperial-purple hover:bg-imperial-purple/80 text-white transition-all active:scale-95 disabled:opacity-40"
                  title="Inject this stress scenario into the live value streams"
                >
                  Inject Shock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chaos Absorption History Log */}
      <div className="p-4 rounded-xl bg-black/60 border border-white/10">
        <h4 className="font-comfortaa font-bold text-xs text-vitreous-white uppercase tracking-wider mb-2">
          Antifragile Shock Absorption Ledger
        </h4>

        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {chaosHistory.map(record => (
            <div
              key={record.id}
              className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-lexend"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-comfortaa font-bold text-vitreous-white">{record.scenarioName}</span>
                  <span className="text-[9px] font-mono text-text-tertiary">{record.timestamp}</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">{record.note}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-patina-green/20 text-patina-green font-bold">
                  +{record.reboundGainXi.toLocaleString()} Ξ Reaped
                </span>
                <span className="text-[10px] font-mono text-roman-aqua">{record.phiResult}Φ</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AntifragilityCrucible;
