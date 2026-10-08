
/**
 * @file modules/economy/ChaosDeckView.tsx
 * @description The "Deck of Fates" - interface for purchasing and activating Chaos Cards.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CHAOS_CARDS } from '../../services/chaosService';
import { ChaosCard, ChaosCardClass } from '../../types';
import { ModuleCard } from '../shared/ModuleCard';
import { SparkIcon } from '../../components/icons/SparkIcon';

interface ChaosDeckViewProps {
    onActivate: (card: ChaosCard) => void;
    activeCardIds: string[];
    xiBalance: number;
}

const CardItem: React.FC<{ card: ChaosCard; onActivate: () => void; isActive: boolean; canAfford: boolean }> = ({ card, onActivate, isActive, canAfford }) => {
    return (
        <motion.div
            layout
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between h-56 relative overflow-hidden group ${
                isActive ? 'bg-imperial-purple/20 border-imperial-purple shadow-[0_0_20px_rgba(106,13,173,0.3)]' : 
                'bg-black/40 border-white/5 hover:border-white/20'
            }`}
        >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <SparkIcon className="w-20 h-20 text-white" />
            </div>

            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-roman-aqua">{card.class}</span>
                    <span className="text-[10px] font-mono font-bold text-patina-green">{card.cost} Ξ</span>
                </div>
                <h3 className="font-bold text-white text-lg font-comfortaa leading-tight">{card.name}</h3>
                <p className="text-[10px] text-text-tertiary mt-2 italic leading-relaxed">"{card.description}"</p>
            </div>

            <div className="mt-auto">
                <p className="text-[9px] text-text-secondary mb-3 leading-snug opacity-70 group-hover:opacity-100 transition-opacity">
                    {card.systemEffect}
                </p>
                <button
                    onClick={(e) => { e.stopPropagation(); onActivate(); }}
                    disabled={isActive || !canAfford}
                    className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        isActive ? 'bg-patina-green text-black' : 
                        !canAfford ? 'bg-white/5 text-text-tertiary cursor-not-allowed' :
                        'bg-white/10 hover:bg-white text-white hover:text-black border border-white/10'
                    }`}
                >
                    {isActive ? 'Active' : canAfford ? 'Manifest' : 'Insufficient \Xi'}
                </button>
            </div>
        </motion.div>
    );
};

export const ChaosDeckView: React.FC<ChaosDeckViewProps> = ({ onActivate, activeCardIds, xiBalance }) => {
    return (
        <div className="space-y-6 animate-fade-in pb-16 high-density">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold font-comfortaa text-white mb-3">The Chaos Deck</h2>
                    <p className="text-sm text-text-secondary leading-relaxed opacity-80">
                        Crafted chaos for the artisan who appreciates a temporary, controlled distortion of the senses. 
                        Choose your brand of madness. All disruptions are temporary and reversible.
                    </p>
                </div>
                <div className="bg-black/60 border border-white/10 p-4 rounded-2xl text-right">
                    <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Syndicate Power</div>
                    <div className="text-3xl font-mono font-bold text-yellow-400">{xiBalance.toLocaleString()} Ξ</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {CHAOS_CARDS.map(card => (
                    <CardItem 
                        key={card.id} 
                        card={card} 
                        onActivate={() => onActivate(card)} 
                        isActive={activeCardIds.includes(card.id)}
                        canAfford={xiBalance >= card.cost}
                    />
                ))}
            </div>

            <ModuleCard title="Deck Protocols">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-text-secondary leading-relaxed">
                    <div className="space-y-3">
                        <p><span className="text-white font-bold">Strategic Choice:</span> Spending Ξ on a Chaos Card is a tactical decision, not a random whim.</p>
                        <p><span className="text-white font-bold">Psychological Modulation:</span> Chaos Cards challenge user adaptability and foster a mythology of "glitched odds".</p>
                    </div>
                    <div className="space-y-3">
                        <p><span className="text-white font-bold">Controlled Disruption:</span> Disruptions are reversible and designed to reveal new insights, never causing data loss.</p>
                        <p><span className="text-white font-bold">Narrative Integration:</span> Every card's effect is wrapped in ΛΞVOS mythos, transforming tech into scripture.</p>
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
};
