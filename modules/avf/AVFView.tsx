import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import BackButton from '../../components/shared/BackButton';
import { ModuleCard } from '../shared/ModuleCard';
import type { View } from '../../types';
import AVFCommandDeck from '../../components/finance/foundersfocus/AVFCommandDeck';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { ChartBarIcon, CoinsIcon } from '../../components/icons/EconomyIcons';
import { ShieldIcon } from '../../components/icons/SecurityIcons';

interface AVFViewProps {
  onNavigate: (view: View) => void;
}

type Tab = 'cevm' | 'economy' | 'governance';

const AVFView: React.FC<AVFViewProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<Tab>('cevm');
  const [governanceScore, setGovernanceScore] = useState(0.82);
  const [efficacyScore, setEfficacyScore] = useState(1.28);

  const riskAdjustedValue = useMemo(() => {
    return efficacyScore * governanceScore;
  }, [efficacyScore, governanceScore]);

  return (
    <div className="h-full w-full overflow-y-auto bg-obsidian-black/80 p-3 md:p-5 high-density">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
          <div>
            <h1 className="bg-gradient-to-r from-roman-aqua to-patina-green bg-clip-text text-3xl font-bold text-transparent">
              Cognitive Efficacy Imperative
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-text-tertiary">
              Agentic Value Framework Execution Console
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ModuleCard title="Cognitive Efficacy" icon={<BrainIcon className="h-5 w-5 text-roman-aqua" />}>
            <p className="text-xs text-text-secondary">
              Efficacy score models introspection quality and recursive self-improvement velocity.
            </p>
            <input
              className="mt-3 w-full"
              type="range"
              min={1}
              max={2}
              step={0.01}
              value={efficacyScore}
              onChange={(e) => setEfficacyScore(Number(e.target.value))}
              aria-label="Adjust cognitive efficacy score"
            />
            <p className="mt-2 font-mono text-sm text-white">{efficacyScore.toFixed(2)}x</p>
          </ModuleCard>

          <ModuleCard title="Governance Trust" icon={<ShieldIcon className="h-5 w-5 text-yellow-400" />}>
            <p className="text-xs text-text-secondary">
              Trust multiplier protects value from drift, bias, and compliance shocks.
            </p>
            <input
              className="mt-3 w-full"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={governanceScore}
              onChange={(e) => setGovernanceScore(Number(e.target.value))}
              aria-label="Adjust governance trust multiplier"
            />
            <p className="mt-2 font-mono text-sm text-white">{(governanceScore * 100).toFixed(0)}%</p>
          </ModuleCard>

          <ModuleCard title="Risk-Adjusted Signal" icon={<ChartBarIcon className="h-5 w-5 text-patina-green" />}>
            <p className="text-xs text-text-secondary">
              If this value drops, your growth story becomes expensive science fiction.
            </p>
            <p className="mt-4 text-3xl font-bold text-white">{riskAdjustedValue.toFixed(2)}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-black/40">
              <motion.div
                className="h-full bg-gradient-to-r from-imperial-purple to-roman-aqua"
                animate={{ width: `${Math.min(100, riskAdjustedValue * 50)}%` }}
              />
            </div>
          </ModuleCard>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-2">
          {[
            { id: 'cevm', label: 'CEVM Engine' },
            { id: 'economy', label: 'Xi Economy Model' },
            { id: 'governance', label: 'Trust & Governance' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as Tab)}
              className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                tab === item.id ? 'bg-roman-aqua/20 text-white' : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'cevm' && (
          <ModuleCard title="CEVM Projection Model" icon={<ChartBarIcon className="h-5 w-5 text-roman-aqua" />}>
            <AVFCommandDeck />
          </ModuleCard>
        )}

        {tab === 'economy' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModuleCard title="Xi Mint vs Burn Flow" icon={<CoinsIcon className="h-5 w-5 text-yellow-400" />}>
              <p className="text-xs text-text-secondary">
                Story mode: left is fiat inflow, center is Xi pool, right is either revenue burn or strategic minting.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-text-tertiary">
                    <span>Customer Fiat Inflow</span>
                    <span>100%</span>
                  </div>
                  <div className="h-3 rounded bg-white/10">
                    <div className="h-3 w-full rounded bg-roman-aqua/80" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-text-tertiary">
                    <span>Burned to Revenue</span>
                    <span>68%</span>
                  </div>
                  <div className="h-3 rounded bg-white/10">
                    <div className="h-3 w-[68%] rounded bg-patina-green/80" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-text-tertiary">
                    <span>Minted to PoA / R&D</span>
                    <span>32%</span>
                  </div>
                  <div className="h-3 rounded bg-white/10">
                    <div className="h-3 w-[32%] rounded bg-imperial-purple/80" />
                  </div>
                </div>
              </div>
            </ModuleCard>
            <ModuleCard title="Execution Notes" icon={<BrainIcon className="h-5 w-5 text-patina-green" />}>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li>- Use stable Xi peg for billing predictability and lower churn pressure.</li>
                <li>- Tie reward issuance to measured efficacy lift, not raw data volume.</li>
                <li>- Expose real-time budget alerts or users will call it “creative invoicing.”</li>
              </ul>
            </ModuleCard>
          </div>
        )}

        {tab === 'governance' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModuleCard title="GTrust Scorecard" icon={<ShieldIcon className="h-5 w-5 text-yellow-400" />}>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li>- Transparency: rationale logging for autonomous decisions.</li>
                <li>- Bias Controls: continuous metric checks + counterfactual tests.</li>
                <li>- Boundary Management: policy guardrails + kill switch readiness.</li>
                <li>- Resilience: anomaly detection and rollback procedure coverage.</li>
              </ul>
            </ModuleCard>
            <ModuleCard title="Operational Doctrine" icon={<BrainIcon className="h-5 w-5 text-roman-aqua" />}>
              <p className="text-xs text-text-secondary">
                AVF is only credible when efficacy and trust rise together. If one climbs while the other tanks,
                congratulations, you built a very expensive liability.
              </p>
            </ModuleCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AVFView;
