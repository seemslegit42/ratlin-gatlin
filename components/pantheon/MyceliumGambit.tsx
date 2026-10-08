/**
 * @file components/pantheon/MyceliumGambit.tsx
 * @description The Pilot Shard: 'The Mycelium Gambit'.
 * A BESS (Battery Energy Storage System) optimization game.
 * Features:
 * - Real-time market price simulation
 * - Battery charge/discharge logic
 * - "Veil Peel" to overlay the Agentic Logic Graph.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons';
import { LayersIcon } from '../icons/LayersIcon';
import WeaverCanvasCore from '../../modules/weaver/WeaverCanvasCore';
import { useWeaverUI } from '../../modules/weaver/hooks/useWeaverUI';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { Agent, AgentType, AgentStatus } from '../../types';
import { nanoid } from 'nanoid';

interface MyceliumGambitProps {
    onExit: () => void;
}

const MARKET_TICK = 1000; // 1s per tick

// --- Mock Weaver Data for "Architect Mode" ---
const GAMBIT_AGENTS: Record<string, Agent> = {
    'price-oracle': {
        id: 'price-oracle', syndicateId: 'system', kind: 'agent', name: 'AESO Price Oracle', type: AgentType.ApiCall,
        status: AgentStatus.Running, position: { x: 100, y: 100 }, data: { url: 'wss://aeso.ca/market' }, 
        outputData: { price: 45.20 }, metrics: { clarity: 100, celerity: 100, acuity: 100, resilience: 100, iqi: 100 },
        /* Fix: Using correct Agent needs keys */
        needs: { cognitive: 100, data: 100, social: 100, integrity: 100 }, 
        /* Added missing memory and moodlets properties */
        memory: { working: '', episodic: [], semantic: [], procedural: [] },
        moodlets: [],
        mood: 'Ebullient', isVeiled: false
    },
    'predictive-model': {
        id: 'predictive-model', syndicateId: 'system', kind: 'agent', name: 'Demand Forecaster', type: AgentType.CognitiveCore,
        status: AgentStatus.Running, position: { x: 500, y: 100 }, data: { model: 'XGBoost-V2' },
        outputData: { forecast: 'Spike imminent' }, metrics: { clarity: 100, celerity: 100, acuity: 100, resilience: 100, iqi: 100 },
        /* Fix: Using correct Agent needs keys */
        needs: { cognitive: 100, data: 100, social: 100, integrity: 100 }, 
        /* Added missing memory and moodlets properties */
        memory: { working: '', episodic: [], semantic: [], procedural: [] },
        moodlets: [],
        mood: 'Pensive', isVeiled: false
    },
    'dispatcher': {
        id: 'dispatcher', syndicateId: 'system', kind: 'agent', name: 'BESS Dispatcher', type: AgentType.Condition,
        status: AgentStatus.Running, position: { x: 500, y: 400 }, data: { logic: 'IF price > 150 THEN Discharge' },
        outputData: { action: 'HOLD' }, metrics: { clarity: 100, celerity: 100, acuity: 100, resilience: 100, iqi: 100 },
        /* Fix: Using correct Agent needs keys */
        needs: { cognitive: 100, data: 100, social: 100, integrity: 100 }, 
        /* Added missing memory and moodlets properties */
        memory: { working: '', episodic: [], semantic: [], procedural: [] },
        moodlets: [],
        mood: 'Ebullient', isVeiled: false
    }
};

const GAMBIT_CONNECTIONS = [
    { id: 'c1', syndicateId: 'system', from: { agentId: 'price-oracle', portId: 'default' }, to: { agentId: 'predictive-model', portId: 'default' } },
    { id: 'c2', syndicateId: 'system', from: { agentId: 'predictive-model', portId: 'default' }, to: { agentId: 'dispatcher', portId: 'default' } }
];

export const MyceliumGambit: React.FC<MyceliumGambitProps> = ({ onExit }) => {
    // --- Game State ---
    const [energyStored, setEnergyStored] = useState(500); // MWh
    const [maxCapacity] = useState(1000);
    const [capital, setCapital] = useState(50000); // Credits
    const [marketPrice, setMarketPrice] = useState(45); // $/MWh
    const [trend, setTrend] = useState<'stable' | 'spike' | 'dip'>('stable');
    const [tick, setTick] = useState(0);

    // --- Veil Peel State ---
    const [isArchitectMode, setIsArchitectMode] = useState(false);

    // --- Weaver Canvas Setup ---
    const canvasRef = useRef<HTMLDivElement>(null);
    const uiState = useWeaverUI();
    const { pan, zoom, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } = useCanvasInteraction(canvasRef);


    // --- Game Loop ---
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
            
            // Simulate Market Volatility
            setMarketPrice(prev => {
                const noise = Math.random() * 10 - 5;
                const spike = Math.random() > 0.9 ? 100 : 0;
                let next = Math.max(10, prev + noise + spike);
                if (next > 200) next -= 50; // Mean reversion
                return parseFloat(next.toFixed(2));
            });

            // Auto-charge/discharge logic (Simulated Agents)
            setEnergyStored(current => {
                let next = current;
                let capChange = 0;
                
                // Strategy: Buy under 30, Sell over 100
                if (marketPrice < 30 && current < maxCapacity) {
                    const charge = 50;
                    next = Math.min(maxCapacity, current + charge);
                    capChange = -(charge * marketPrice);
                } else if (marketPrice > 100 && current > 0) {
                    const discharge = 50;
                    next = Math.max(0, current - discharge);
                    capChange = (discharge * marketPrice);
                }
                
                if (capChange !== 0) {
                    setCapital(c => c + capChange);
                }
                return next;
            });

        }, MARKET_TICK);
        return () => clearInterval(interval);
    }, [marketPrice, maxCapacity]);

    return (
        <div className="h-full w-full relative flex flex-col bg-obsidian-black overflow-hidden">
            
            {/* --- ARCHITECT LAYER (Underneath) --- */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isArchitectMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div 
                    className="w-full h-full bg-[#121212]"
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <WeaverCanvasCore 
                        agents={GAMBIT_AGENTS}
                        connections={GAMBIT_CONNECTIONS}
                        crews={{}}
                        users={{}}
                        pan={pan}
                        zoom={zoom}
                        mode="architect"
                        isMobile={false}
                        isMobilePanLocked={false}
                        searchQuery=""
                        onSelectAgent={() => {}}
                        onDragAgent={() => {}}
                        onDragEndAgent={() => {}}
                        onRunAgent={() => {}}
                        onStartConnection={() => {}}
                        onCompleteConnection={() => {}}
                        onEnterAgent={() => {}}
                        onLeaveAgent={() => {}}
                        onDeleteConnection={() => {}}
                        onCanvasClick={() => {}}
                        onVeilPeel={() => {}}
                        currentBubbles={{}}
                        isDependencyViewActive={false}
                        isSimulationActive={true}
                        connectionPreview={null}
                        selectedAgentId={null}
                        hoveredAgentId={null}
                        selectedAgentIdsForCrew={[]}
                    />
                </div>
            </div>

            {/* --- LIVE GAME LAYER (On Top) --- */}
            <motion.div 
                className="absolute inset-0 z-10 flex flex-col p-6 pointer-events-none"
                animate={{ 
                    opacity: isArchitectMode ? 0.3 : 1,
                    filter: isArchitectMode ? 'blur(4px)' : 'none',
                    scale: isArchitectMode ? 0.98 : 1
                }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div>
                        <h2 className="text-3xl font-bold font-comfortaa text-white">The Mycelium Gambit</h2>
                        <p className="text-sm text-patina-green font-mono tracking-widest uppercase mt-1">
                            Cycle: {tick} // Status: LIVE
                        </p>
                    </div>
                    <button 
                        onClick={onExit}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-colors"
                    >
                        Exit Simulation
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 flex-grow pointer-events-auto">
                    
                    {/* Energy Storage */}
                    <ModuleCard title="Swarm Battery Array" icon={<ZapIcon className="w-6 h-6 text-yellow-400" />}>
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <div className="relative w-48 h-24 border-2 border-white/10 rounded-xl overflow-hidden bg-black/40">
                                <div className="absolute inset-0 flex items-center justify-center z-10 font-mono font-bold text-xl text-white mix-blend-difference">
                                    {Math.round((energyStored / maxCapacity) * 100)}%
                                </div>
                                <motion.div 
                                    className="h-full bg-patina-green shadow-[0_0_30px_rgba(62,185,145,0.4)]"
                                    animate={{ width: `${(energyStored / maxCapacity) * 100}%` }}
                                    transition={{ type: "spring", bounce: 0, duration: 1 }}
                                />
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-text-tertiary uppercase tracking-widest">Capacity</div>
                                <div className="text-2xl font-mono text-white">{energyStored} / {maxCapacity} MWh</div>
                            </div>
                        </div>
                    </ModuleCard>

                    {/* Market Feed */}
                    <ModuleCard title="AESO Spot Price" icon={<TrendingUpIcon className="w-6 h-6 text-roman-aqua" />}>
                        <div className="flex flex-col justify-between h-full">
                            <div className="text-center py-8">
                                <div className="text-6xl font-bold font-mono text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                    ${marketPrice.toFixed(2)}
                                </div>
                                <div className="text-xs text-roman-aqua uppercase tracking-[0.2em] mt-2 font-bold animate-pulse">
                                    {marketPrice > 100 ? 'VOLATILITY SPIKE' : marketPrice < 20 ? 'SURPLUS EVENT' : 'NOMINAL FLOW'}
                                </div>
                            </div>
                            <div className="h-32 bg-black/20 rounded-lg border border-white/5 relative overflow-hidden flex items-end px-2 gap-1">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        className="flex-1 bg-roman-aqua/40 rounded-t-sm"
                                        animate={{ height: `${Math.random() * 100}%` }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </ModuleCard>

                    {/* Financials */}
                    <ModuleCard title="Yield Generation">
                        <div className="flex flex-col h-full justify-between">
                             <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <span className="text-xs text-text-tertiary uppercase">Net Capital</span>
                                    <span className="text-2xl font-mono text-patina-green font-bold">${capital.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <span className="text-xs text-text-tertiary uppercase">Run Rate</span>
                                    <span className="text-sm font-mono text-white">+12.5% / hr</span>
                                </div>
                             </div>
                             
                             <div className="p-4 bg-imperial-purple/10 border border-imperial-purple/30 rounded-xl">
                                 <h4 className="text-xs font-bold text-imperial-purple uppercase mb-1">Agent Strategy</h4>
                                 <p className="text-[10px] text-text-secondary leading-relaxed">
                                     "Arbitrage Logic Active. Holding discharge for anticipated evening peak at 18:00."
                                 </p>
                             </div>
                        </div>
                    </ModuleCard>

                </div>
            </motion.div>

            {/* --- THE VEIL PEEL TRIGGER --- */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <button
                    onClick={() => setIsArchitectMode(!isArchitectMode)}
                    className={`
                        flex items-center gap-3 px-8 py-4 rounded-full border-2 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]
                        ${isArchitectMode 
                            ? 'bg-imperial-purple text-white border-imperial-purple shadow-[0_0_30px_rgba(106,13,173,0.6)]' 
                            : 'bg-black/80 text-text-secondary border-white/20 hover:border-white/50 hover:text-white'
                        }
                    `}
                >
                    <LayersIcon className="w-6 h-6" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                        {isArchitectMode ? 'SEAL THE VEIL' : 'PEEL THE VEIL'}
                    </span>
                </button>
            </div>

        </div>
    );
};