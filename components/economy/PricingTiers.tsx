
/**
 * @file components/economy/PricingTiers.tsx
 * @description Visualizes the "Agent Actions Billing" strategy.
 * Displays the tiered subscription model (Apprentice, Artisan, Priesthood)
 * and the rate card for CogniOps.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { DiamondIcon } from '../icons/StrategyIcons';
import { CrownIcon } from '../icons/CrownIcon';
import { LayersIcon } from '../icons/LayersIcon';
import { UserGroupIcon } from '../icons/CommandPaletteIcons'; // Fallback if not available

interface PricingTiersProps {
  onPurchase: (plan: string, amount: number) => void;
}

const TierCard: React.FC<{
  name: string;
  price: string;
  amount: number;
  quota: string;
  audience: string;
  color: string;
  icon: React.ReactNode;
  features: string[];
  onSelect: () => void;
}> = ({ name, price, amount, quota, audience, color, icon, features, onSelect }) => (
  <div className={`relative p-5 rounded-xl border bg-black/40 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${color}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-current opacity-50" />

    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-comfortaa font-bold text-lg text-white">{name}</h4>
        <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">{audience}</p>
      </div>
      <div className="p-2 rounded-lg bg-white/10 text-white">
        {icon}
      </div>
    </div>

    <div className="mb-6">
      <div className="text-3xl font-mono font-bold text-white">{price}</div>
      <div className="text-xs opacity-60">per month</div>
    </div>

    <div className="p-3 bg-white/5 rounded-lg mb-6 border border-white/5">
      <div className="text-[10px] uppercase font-bold opacity-60 mb-1">CogniOps Quota</div>
      <div className="text-xl font-bold font-mono text-white">{quota}</div>
    </div>

    <ul className="space-y-2 mb-6 flex-grow">
      {features.map((feat, i) => (
        <li key={i} className="flex items-start space-x-2 text-xs opacity-80">
          <span className="text-patina-green font-bold">✓</span>
          <span>{feat}</span>
        </li>
      ))}
    </ul>

    <button
      onClick={onSelect}
      className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors"
    >
      {amount === 0 ? 'Activate Free' : 'Initiate Transfer'}
    </button>
  </div>
);

export const PricingTiers: React.FC<PricingTiersProps> = ({ onPurchase }) => {
  return (
    <ModuleCard title="Monetization Strategy: Agent Actions" className="lg:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TierCard
          name="Apprentice"
          price="$0"
          amount={0}
          quota="100 Ops"
          audience="Individuals, Explorers"
          color="border-white/10 hover:border-white/30"
          icon={<LayersIcon className="w-6 h-6" />}
          features={["Core Canvas", "Essential First-Party Micro-Apps", "Single User", "Community Support"]}
          onSelect={() => onPurchase("Apprentice", 0)}
        />
        <TierCard
          name="Artisan"
          price="$20"
          amount={20}
          quota="2,000 Ops"
          audience="Solo Operators, Small Teams"
          color="border-roman-aqua/30 hover:border-roman-aqua/60 shadow-[0_0_20px_rgba(32,178,170,0.1)]"
          icon={<DiamondIcon className="w-6 h-6 text-roman-aqua" />}
          features={["Full Armory Access", "Loom™ Studio Unlimited", "Overage Credits Enabled", "Up to 10 Users"]}
          onSelect={() => onPurchase("Artisan", 20)}
        />
        <TierCard
          name="Priesthood"
          price="Custom"
          amount={2500} // Mock high value for demo
          quota="High/Unlimited"
          audience="Large Teams, Autonomous Orgs"
          color="border-imperial-purple/30 hover:border-imperial-purple/60 shadow-[0_0_20px_rgba(106,13,173,0.1)]"
          icon={<CrownIcon className="w-6 h-6 text-imperial-purple" />}
          features={["Advanced Security (Aegis)", "Dedicated Neural Core", "SSO & Audit Logs", "Premium Support SLAs"]}
          onSelect={() => onPurchase("Priesthood", 2500)}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-text-tertiary">
        <p>
          <span className="font-bold text-white">Rate Card:</span> Simple RAG (1 Op) • Complex Workflow (25 Ops) • Image Gen (5 Ops)
        </p>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-patina-green rounded-full animate-pulse" />
          <span className="text-patina-green">Billing Engine Active</span>
        </div>
      </div>
    </ModuleCard>
  );
};