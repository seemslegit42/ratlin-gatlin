import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type AvfInputs = {
  baseValue: number;
  agents: number;
  growthRate: number;
  carryingCapacity: number;
  midpointYear: number;
  adoption: number;
  risk: number;
  years: number;
};

const DEFAULTS: AvfInputs = {
  baseValue: 100,
  agents: 50,
  growthRate: 1,
  carryingCapacity: 1.4,
  midpointYear: 3,
  adoption: 0.15,
  risk: 0.25,
  years: 5,
};

const logisticSaturation = (t: number, l: number, k: number, t0: number) => l / (1 + Math.exp(-k * (t - t0)));

const renderTone = (risk: number) => {
  if (risk > 0.65) return 'Autonomy is vibing with chaos. Maybe add guardrails before it speed-runs compliance.';
  if (risk > 0.4) return 'System is spicy but recoverable. Tighten stability and policy checks.';
  return 'Swarm posture is clean. Keep compounding without summoning legal thunder.';
};

export const AVFCommandDeck: React.FC = () => {
  const [inputs, setInputs] = useState<AvfInputs>(DEFAULTS);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const projections = useMemo(() => {
    const rows = [];
    let agentCount = inputs.agents;
    for (let year = 1; year <= inputs.years; year += 1) {
      const s = logisticSaturation(year, inputs.carryingCapacity, inputs.growthRate, inputs.midpointYear);
      const a = Math.min(1, inputs.adoption + (year - 1) * 0.1);
      const revenue = inputs.baseValue * agentCount * s * a;
      const riskAdjusted = revenue / Math.max(inputs.risk, 0.05);
      rows.push({ year, agentCount, s, a, revenue, riskAdjusted });
      agentCount = Math.round(agentCount * 2);
    }
    return rows;
  }, [inputs]);

  const latest = projections[projections.length - 1];
  const energyFlow = Math.min(100, (latest?.s || 0) * 100);

  const onInput =
    (key: keyof AvfInputs, min?: number, max?: number) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      const next = Number.isFinite(raw) ? raw : 0;
      const clamped = Math.min(max ?? next, Math.max(min ?? next, next));
      setInputs((prev) => ({ ...prev, [key]: clamped }));
      if (hapticsEnabled && 'vibrate' in navigator) navigator.vibrate(10);
    };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="text-sm font-bold text-white">Agentic Value Simulator</h3>
        <p className="mt-1 text-xs text-text-tertiary">
          Models AVF 2.0: <code>Revenue = V x N x S(t) x A</code>, then applies risk-adjusted posture scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          ['baseValue', 'Base Value per UAV', 10, 5000],
          ['agents', 'Initial Agents', 1, 5000],
          ['growthRate', 'Saturation Growth (k)', 0.1, 3],
          ['carryingCapacity', 'Carrying Capacity (L)', 1, 5],
          ['midpointYear', 'Midpoint Year (t0)', 1, 10],
          ['adoption', 'Initial Adoption (A)', 0.01, 1],
          ['risk', 'Governance Risk Denominator', 0.05, 1],
          ['years', 'Projection Horizon (years)', 1, 10],
        ].map(([key, label, min, max]) => (
          <label key={key} className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-secondary">{label}</span>
              <span className="font-mono text-white">{(inputs as Record<string, number>)[key]}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={key === 'agents' || key === 'years' || key === 'midpointYear' ? 1 : 0.01}
              value={(inputs as Record<string, number>)[key]}
              onChange={onInput(key as keyof AvfInputs, min as number, max as number)}
              className="w-full"
            />
          </label>
        ))}
      </div>

      <div className="rounded-xl border border-imperial-purple/30 bg-imperial-purple/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Network Vitality Metaphor</p>
          <button
            type="button"
            onClick={() => setHapticsEnabled((v) => !v)}
            className="text-[11px] font-bold text-roman-aqua"
            title="Yes, this toggles tiny haptics. You're welcome."
          >
            Haptics: {hapticsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="h-4 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <motion.div
            className="h-full bg-gradient-to-r from-roman-aqua to-patina-green"
            animate={{ width: `${energyFlow}%` }}
            transition={{ type: 'spring', stiffness: 55, damping: 15 }}
          />
        </div>
        <p className="mt-2 text-xs text-text-secondary">{renderTone(inputs.risk)}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-text-tertiary">
            <tr>
              <th className="p-2">Year</th>
              <th className="p-2">Agents</th>
              <th className="p-2">S(t)</th>
              <th className="p-2">Adoption</th>
              <th className="p-2">Revenue</th>
              <th className="p-2">Risk-Adjusted</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((row) => (
              <tr key={row.year} className="border-t border-white/5">
                <td className="p-2 text-white">{row.year}</td>
                <td className="p-2">{row.agentCount.toLocaleString()}</td>
                <td className="p-2">{row.s.toFixed(3)}</td>
                <td className="p-2">{(row.a * 100).toFixed(1)}%</td>
                <td className="p-2">${Math.round(row.revenue).toLocaleString()}</td>
                <td className="p-2 text-patina-green">${Math.round(row.riskAdjusted).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AVFCommandDeck;
