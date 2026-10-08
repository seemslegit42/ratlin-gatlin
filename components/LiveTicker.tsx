import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Agent, KlepsydraMetric } from '../types';
import type { XiFlowData } from '../services/xiEconomyService';
import { AgentStatus } from '../types';

interface TickerItem {
    id: string;
    source: string;
    data: string;
    color: string;
    /** BEEP query pre-filled when user taps this metric */
    prompt: string;
}

interface LiveTickerProps {
    agents?: Record<string, Agent>;
    economy?: XiFlowData | null;
    klepsydra?: KlepsydraMetric;
    /** Fires with a contextual BEEP prompt when the user taps a KPI metric */
    onMetricTap?: (prompt: string) => void;
}

const LiveTicker: React.FC<LiveTickerProps> = ({ agents = {}, economy, klepsydra, onMetricTap }) => {
    
    const tickerItems: TickerItem[] = useMemo(() => {
        const agentList = Object.values(agents) as Agent[];
        const activeCount = agentList.filter(a => a.status === AgentStatus.Running).length;
        const errorCount = agentList.filter(a => a.status === AgentStatus.Error).length;
        const idleCount = agentList.filter(a => a.status === AgentStatus.Idle).length;
        
        const balance = economy?.treasury.balance.toLocaleString() || '---';
        const flowState = klepsydra?.state.toUpperCase() || 'CALIBRATING';
        const flowScore = klepsydra?.flowScore.toFixed(0) || '0';
        const networkLatency = economy ? '8ms' : '12ms';

        const items: TickerItem[] = [
            { 
                id: 'sys', source: 'SYSTEM', 
                data: `FLOW: ${flowState} (${flowScore}%)`, 
                color: klepsydra?.state === 'Flow' ? 'text-patina-green' : 'text-yellow-400',
                prompt: `Give me a full Klepsydra flow analysis: current state is ${flowState} at ${flowScore}% score. What actions will maximize my flow state?`
            },
            { 
                id: 'swarm', source: 'SWARM', 
                data: `ACTIVES: ${activeCount} // ERRORS: ${errorCount} // IDLE: ${idleCount}`, 
                color: errorCount > 0 ? 'text-red-500' : 'text-roman-aqua',
                prompt: errorCount > 0 
                    ? `Diagnose the ${errorCount} agent errors in the swarm. List each affected agent and recommend recovery actions.`
                    : `Show me a swarm diagnostic: ${activeCount} agents running, ${idleCount} idle. Optimize the swarm configuration.`
            },
            { 
                id: 'econ', source: 'TREASURY', 
                data: `BALANCE: ${balance} Xi`, 
                color: 'text-yellow-400',
                prompt: 'Generate a Xi treasury status report including balance, recent transactions, tithe rate, and projected growth.'
            },
            { 
                id: 'net', source: 'NETWORK', 
                data: `UPLINK: STABLE // ${networkLatency}`, 
                color: 'text-vitreous-white',
                prompt: 'Show me the network uplink diagnostics and any MCP bridge connection status.'
            },
            { 
                id: 'aegis', source: 'AEGIS', 
                data: 'SECURITY: NOMINAL', 
                color: 'text-imperial-purple',
                prompt: 'Run an AEGIS security scan and show me the current threat landscape, anomalies, and compliance status.'
            },
        ];
        
        return items;
    }, [agents, economy, klepsydra]);

    const handleItemTap = (item: TickerItem) => {
        if (!onMetricTap) return;
        // Haptic feedback on supported devices
        if (navigator.vibrate) navigator.vibrate(8);
        onMetricTap(item.prompt);
    };

    return (
        <div className="w-full h-8 bg-obsidian-black/90 backdrop-blur-xl border-b border-white/10 overflow-hidden relative flex items-center z-50">
            {/* Live Indicator */}
            <div className="absolute left-0 z-20 h-full px-3 bg-panel-bg flex items-center space-x-2 border-r border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-text-secondary">LIVE</span>
            </div>

            {/* Scrolling Marquee — items are tappable when onMetricTap is provided */}
            <motion.div
                className="flex space-x-12 whitespace-nowrap pl-24"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            >
                {[...tickerItems, ...tickerItems].map((item, i) => (
                    onMetricTap ? (
                        <button
                            key={`${item.id}-${i}`}
                            type="button"
                            onClick={() => handleItemTap(item)}
                            title="Tap to query BEEP"
                            className="flex items-center space-x-2 text-xs font-mono tracking-widest cursor-pointer hover:opacity-80 active:scale-95 transition-all group"
                            aria-label={`Query BEEP about ${item.source}: ${item.data}`}
                        >
                            <span className="text-text-tertiary font-bold opacity-50 group-hover:opacity-80">//{item.source}</span>
                            <span className={`${item.color} drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]`}>{item.data}</span>
                            <span className="text-[8px] text-text-tertiary opacity-0 group-hover:opacity-60 ml-1">⌁</span>
                        </button>
                    ) : (
                        <div key={`${item.id}-${i}`} className="flex items-center space-x-2 text-xs font-mono tracking-widest">
                            <span className="text-text-tertiary font-bold opacity-50">//{item.source}</span>
                            <span className={`${item.color} drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]`}>{item.data}</span>
                        </div>
                    )
                ))}
            </motion.div>

            {/* Right Fade Mask */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-obsidian-black to-transparent z-10 pointer-events-none" />
        </div>
    );
};

export default LiveTicker;