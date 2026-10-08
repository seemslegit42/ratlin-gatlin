/**
 * @file modules/pantheon/PantheonView.tsx
 * @description The Arena of Cognitive Athletics.
 * Orchestrates the selection and execution of skill-based shards.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/shared/BackButton';
import { ShardCard } from '../../components/pantheon/ShardCard';
import { MushroomIcon, NetworkIcon, ObeliskIcon } from '../../components/icons/PantheonIcons';
import { MyceliumGambit } from '../../components/pantheon/MyceliumGambit';
import type { View, ShardType } from '../../types';
import { ModuleCard } from '../shared/ModuleCard';
import { ZapIcon, TrendingUpIcon } from '../../components/icons/VitalsIcons';
import { CoinsIcon } from '../../components/icons/EconomyIcons';
import { LayersIcon } from '../../components/icons/LayersIcon';
import { BrainIcon } from '../../components/icons/BrainIcon';

interface PantheonViewProps {
    onNavigate: (view: View) => void;
}

interface ShardInfo {
    type: ShardType;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    description: string;
    rewardXi: number;
    difficulty: 'Novice' | 'Artisan' | 'Priesthood';
    status: 'available' | 'coming_soon' | 'locked';
    unlockRequirement?: string;
    estimatedDuration: string;
}

const SHARDS: ShardInfo[] = [
    {
        type: 'Mycelium',
        title: 'The Mycelium Gambit',
        subtitle: 'Resource Optimization',
        icon: <MushroomIcon className="w-full h-full" />,
        color: 'text-patina-green',
        borderColor: 'border-patina-green',
        description: 'Command a distributed energy swarm. Buy low, sell high, and stabilize the grid against volatility. Tests spatial reasoning and resource allocation under time pressure.',
        rewardXi: 150,
        difficulty: 'Novice',
        status: 'available',
        estimatedDuration: '10–15 min',
    },
    {
        type: 'Weaver',
        title: "The Weaver's Loom",
        subtitle: 'Agentic Orchestration',
        icon: <NetworkIcon className="w-full h-full" />,
        color: 'text-imperial-purple',
        borderColor: 'border-imperial-purple',
        description: 'Architect a perfect logic graph. Solve complex data puzzles by wiring autonomous agents under strict latency budgets. Tests systems thinking and abstract reasoning.',
        rewardXi: 300,
        difficulty: 'Artisan',
        status: 'coming_soon',
        estimatedDuration: '20–30 min',
    },
    {
        type: 'Obelisk',
        title: 'The Obelisk Duel',
        subtitle: 'High-Stakes Decision',
        icon: <ObeliskIcon className="w-full h-full" />,
        color: 'text-red-500',
        borderColor: 'border-red-500',
        description: 'Trade against the Klepsydra Engine in a zero-sum arena. A test of nerve, risk management, and predictive foresight under adversarial market conditions.',
        rewardXi: 600,
        difficulty: 'Priesthood',
        status: 'locked',
        unlockRequirement: 'Complete The Mycelium Gambit and reach Artisan tier.',
        estimatedDuration: '30–45 min',
    },
];

const DIFFICULTY_COLORS: Record<string, string> = {
    Novice: 'text-patina-green bg-patina-green/10 border-patina-green/30',
    Artisan: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    Priesthood: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const ComingSoonModal: React.FC<{ shard: ShardInfo; onClose: () => void }> = ({ shard, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-lg bg-obsidian-black border ${shard.borderColor} rounded-2xl p-8 shadow-2xl`}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">{shard.subtitle}</div>
                    <h2 className={`text-2xl font-bold font-comfortaa ${shard.color}`}>{shard.title}</h2>
                </div>
                <button onClick={onClose} className="text-text-tertiary hover:text-white text-2xl font-light transition-colors">×</button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-text-secondary leading-relaxed">{shard.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Reward</div>
                    <div className={`text-lg font-mono font-bold ${shard.color}`}>{shard.rewardXi} Ξ</div>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Duration</div>
                    <div className="text-sm font-bold text-white">{shard.estimatedDuration}</div>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Tier</div>
                    <div className={`text-sm font-bold ${shard.color}`}>{shard.difficulty}</div>
                </div>
            </div>

            {shard.status === 'coming_soon' && (
                <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="text-xs font-black text-yellow-400 uppercase tracking-widest">Under Construction</span>
                    </div>
                    <p className="text-xs text-yellow-200">
                        The Architect is currently building this arena. The Weaver's Loom shard will arrive in the next deployment cycle. Your Xi reserve will be intact when the arena opens.
                    </p>
                </div>
            )}

            {shard.status === 'locked' && shard.unlockRequirement && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest">Locked</span>
                    </div>
                    <p className="text-xs text-red-200">
                        <strong>Unlock Requirement:</strong> {shard.unlockRequirement}
                    </p>
                </div>
            )}

            <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
            >
                Return to Pantheon
            </button>
        </motion.div>
    </motion.div>
);

const LeaderboardRow: React.FC<{ rank: number; name: string; shard: string; score: number; isHighlighted?: boolean }> = ({ rank, name, shard, score, isHighlighted }) => (
    <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isHighlighted ? 'bg-roman-aqua/10 border border-roman-aqua/20' : 'bg-black/20 border border-white/5 hover:border-white/10'}`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono ${rank === 1 ? 'bg-yellow-400/20 text-yellow-400' : rank === 2 ? 'bg-white/10 text-white' : rank === 3 ? 'bg-amber-700/30 text-amber-500' : 'bg-white/5 text-text-tertiary'}`}>
            {rank}
        </div>
        <div className="flex-grow">
            <div className="text-xs font-bold text-white">{name}</div>
            <div className="text-[9px] text-text-tertiary uppercase font-mono">{shard}</div>
        </div>
        <div className="text-sm font-mono font-bold text-patina-green">{score.toLocaleString()} Ξ</div>
    </div>
);

export const PantheonView: React.FC<PantheonViewProps> = ({ onNavigate }) => {
    const [selectedShard, setSelectedShard] = useState<ShardInfo | null>(null);
    const [activeGame, setActiveGame] = useState<ShardType | null>(null);
    const [lockedModal, setLockedModal] = useState<ShardInfo | null>(null);

    const handleShardSelect = (shard: ShardInfo) => {
        setSelectedShard(shard);
    };

    const handleLaunch = () => {
        if (!selectedShard) return;
        if (selectedShard.status === 'available') {
            setActiveGame(selectedShard.type);
        } else {
            setLockedModal(selectedShard);
        }
    };

    if (activeGame === 'Mycelium') {
        return <MyceliumGambit onExit={() => setActiveGame(null)} />;
    }

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 bg-obsidian-black relative high-density">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,_#20B2AA_0%,_transparent_50%)]" />

            <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                    <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                </div>

                <header className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-roman-aqua/10 border border-roman-aqua/20 rounded-full mb-4">
                        <div className="w-1.5 h-1.5 bg-roman-aqua rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-roman-aqua uppercase tracking-[0.3em]">Cognitive Athletics Arena</span>
                    </div>
                    <h1 className="text-5xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-br from-white via-vitreous-white to-text-tertiary tracking-tighter mb-2">
                        The Pantheon
                    </h1>
                    <p className="text-sm text-roman-aqua font-mono tracking-[0.4em] uppercase">Prove to Earn // Skill-Based Rewards // Ranked Play</p>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
                    {[
                        { label: 'Your Best Score', value: '840 Ξ', color: 'text-patina-green', sub: 'Mycelium Gambit' },
                        { label: 'Shards Completed', value: '3', color: 'text-roman-aqua', sub: 'Of 3 available' },
                        { label: 'Global Rank', value: '#42', color: 'text-yellow-400', sub: 'Top 15%' },
                        { label: 'Total Earned', value: '2,400 Ξ', color: 'text-imperial-purple', sub: 'All-time' },
                    ].map(({ label, value, color, sub }) => (
                        <div key={label} className="bg-black/40 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">{label}</div>
                            <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
                            <div className="text-[9px] text-text-tertiary mt-1">{sub}</div>
                        </div>
                    ))}
                </div>

                {/* Shard Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full mb-10">
                    {SHARDS.map(shard => (
                        <div key={shard.type} className="relative">
                            <ShardCard
                                title={shard.title}
                                subtitle={shard.subtitle}
                                icon={shard.icon}
                                color={shard.color}
                                borderColor={shard.borderColor}
                                onClick={() => handleShardSelect(shard)}
                                isActive={selectedShard?.type === shard.type}
                                description={shard.description}
                            />
                            {/* Status Badge Overlay */}
                            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none">
                                {shard.status === 'coming_soon' && (
                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded-full">
                                        Soon
                                    </span>
                                )}
                                {shard.status === 'locked' && (
                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-red-500/20 border border-red-500/30 text-red-400 rounded-full">
                                        Locked
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${DIFFICULTY_COLORS[shard.difficulty]}`}>
                                    {shard.difficulty}
                                </span>
                            </div>
                            {/* Reward chip */}
                            <div className="absolute bottom-3 left-3 pointer-events-none">
                                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold bg-black/60 border border-white/10 ${shard.color} rounded-full`}>
                                    +{shard.rewardXi} Ξ
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Launch Button */}
                <AnimatePresence>
                    {selectedShard && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="fixed bottom-24 md:bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none"
                        >
                            <button
                                onClick={handleLaunch}
                                className={`pointer-events-auto px-12 py-4 font-black text-sm uppercase tracking-[0.25em] rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all ${
                                    selectedShard.status === 'available'
                                        ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.4)]'
                                        : 'bg-white/10 text-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                }`}
                            >
                                {selectedShard.status === 'available' ? 'Enter The Arena' : selectedShard.status === 'coming_soon' ? 'View Details' : 'View Requirements'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Section: Leaderboard + Rules */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-8">
                    <ModuleCard title="Arena Leaderboard" icon={<TrendingUpIcon className="w-5 h-5 text-yellow-400" />}>
                        <div className="space-y-2">
                            {[
                                { rank: 1, name: 'Sovereign Axiom', shard: 'Obelisk Duel', score: 4820 },
                                { rank: 2, name: 'Nebula Collective', shard: 'Weaver\'s Loom', score: 3940 },
                                { rank: 3, name: 'Void Systems', shard: 'Mycelium Gambit', score: 2880 },
                                { rank: 4, name: 'Quantum Labs', shard: 'Mycelium Gambit', score: 2400, isHighlighted: true },
                                { rank: 5, name: 'Aether Protocol', shard: 'Obelisk Duel', score: 1960 },
                            ].map(row => (
                                <LeaderboardRow key={row.rank} {...row} />
                            ))}
                        </div>
                        <p className="text-[9px] text-text-tertiary mt-4 text-center uppercase tracking-widest">Updated every 24 hours • Your entry highlighted</p>
                    </ModuleCard>

                    <ModuleCard title="Rules of the Arena" icon={<ZapIcon className="w-5 h-5 text-roman-aqua" />}>
                        <div className="space-y-4">
                            {[
                                {
                                    title: 'Prove to Earn',
                                    body: 'Xi rewards are only issued upon verified completion of a shard. Incomplete or abandoned runs yield no reward.',
                                    color: 'text-patina-green',
                                },
                                {
                                    title: 'Difficulty Multipliers',
                                    body: 'Higher-difficulty shards apply a reward multiplier. Priesthood tier offers 4x base Xi but requires Artisan Pact level or above.',
                                    color: 'text-yellow-400',
                                },
                                {
                                    title: 'Klepsydra Bonus',
                                    body: 'Completing a shard while in Flow state applies a 1.5x Klepsydra bonus on top of base rewards.',
                                    color: 'text-roman-aqua',
                                },
                                {
                                    title: 'Daily Run Limits',
                                    body: 'Each shard can be completed once per 24-hour cycle. Repeated runs are tracked for improvement but yield diminishing Xi returns.',
                                    color: 'text-text-secondary',
                                },
                            ].map(({ title, body, color }) => (
                                <div key={title} className="flex gap-3">
                                    <div className={`w-1 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
                                    <div>
                                        <div className="text-xs font-bold text-white mb-0.5">{title}</div>
                                        <div className="text-xs text-text-secondary leading-relaxed">{body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ModuleCard>
                </div>
            </div>

            {/* Locked / Coming Soon Modal */}
            <AnimatePresence>
                {lockedModal && (
                    <ComingSoonModal shard={lockedModal} onClose={() => setLockedModal(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PantheonView;
