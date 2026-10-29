/**
 * @file modules/simulacrum/SimulacrumView.tsx
 * @description The Agentic Operations Digital Twin — Glass House Protocol.
 * Implements spec §4.2: 2.5D spatial interface mapping departments as switchable
 * "rooms", agents as moving entities, real state telemetry, natural language
 * logging, and wired Director Tray actions.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, View, GossipLogEntry } from '../../types';
import { AgentStatus } from '../../types';
import SimulacrumBackground from '../../components/simulacrum/SimulacrumBackground';
import BackButton from '../../components/shared/BackButton';
import GossipTicker from '../../components/simulacrum/GossipTicker';
import SimulacrumEntity from '../../components/simulacrum/SimulacrumEntity';
import TetherLayer from '../../components/simulacrum/TetherLayer';
import { DirectorTray } from '../../components/simulacrum/DirectorTray';

// ─── Department Room Config (spec §4.2) ──────────────────────────────────────

interface RoomConfig {
    id: string;
    label: string;
    color: string;
    accentVar: string;
    description: string;
    filterFn: (a: Agent) => boolean;
}

const ROOMS: RoomConfig[] = [
    {
        id: 'all',
        label: 'Galaxy View',
        color: 'border-roman-aqua/40 text-roman-aqua',
        accentVar: 'var(--roman-aqua)',
        description: 'Immersive, 3D strategic overview of your enterprise swarm.',
        filterFn: () => true,
    },
    {
        id: 'finance',
        label: 'Finance',
        color: 'border-patina-green/40 text-patina-green',
        accentVar: 'var(--patina-green)',
        description: 'Finance & treasury agents',
        filterFn: (a) => /finance|treasury|accounting|ledger|stripe|invoice/i.test(a.name + ' ' + (a.specialization ?? '')),
    },
    {
        id: 'hr',
        label: 'HR',
        color: 'border-yellow-400/40 text-yellow-400',
        accentVar: '#FFD700',
        description: 'HR & onboarding agents',
        filterFn: (a) => /hr|human|onboard|talent|recruit|people/i.test(a.name + ' ' + (a.specialization ?? '')),
    },
    {
        id: 'marketing',
        label: 'Marketing',
        color: 'border-imperial-purple/40 text-imperial-purple',
        accentVar: 'var(--imperial-purple)',
        description: 'Growth & marketing agents',
        filterFn: (a) => /campaign|market|growth|seo|social|email|copywrite/i.test(a.name + ' ' + (a.specialization ?? '')),
    },
    {
        id: 'it',
        label: 'IT / Ops',
        color: 'border-blue-400/40 text-blue-400',
        accentVar: '#60A5FA',
        description: 'Infrastructure & operations agents',
        filterFn: (a) => /ops|infra|security|code|execution|wasm|api/i.test(a.name + ' ' + (a.specialization ?? '')),
    },
];

interface SimulacrumViewProps {
    agents: Record<string, Agent>;
    onNavigate: (view: View) => void;
    gossipLog: GossipLogEntry[];
    activeTethers: GossipLogEntry[];
    currentBubbles: Record<string, string>;
    updateAgent: (id: string, updates: Partial<Agent>) => void;
}

const SimulacrumView: React.FC<SimulacrumViewProps> = ({ 
    agents, onNavigate, gossipLog, activeTethers, currentBubbles, updateAgent
}) => {
    const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [nlLog, setNlLog] = useState<{ ts: number; text: string; level: 'info' | 'warn' | 'error' }[]>([]);

    const selectedRoom = ROOMS.find(r => r.id === selectedRoomId) ?? ROOMS[0];
    const allAgentList = useMemo(() => Object.values(agents) as Agent[], [agents]);

    // Apply room filter — fall back to full swarm if room filter yields nothing
    const roomAgents = useMemo(() => {
        const filtered = allAgentList.filter(selectedRoom.filterFn);
        return filtered.length > 0 ? filtered : allAgentList;
    }, [allAgentList, selectedRoom]);

    // ── Centroid offset ──────────────────────────────────────────────────────
    const { offsetX, offsetY } = useMemo(() => {
        if (roomAgents.length === 0) return { offsetX: 0, offsetY: 0 };
        const sumX = roomAgents.reduce((s, a) => s + a.position.x, 0);
        const sumY = roomAgents.reduce((s, a) => s + a.position.y, 0);
        return {
            offsetX: 600 - sumX / roomAgents.length,
            offsetY: 400 - sumY / roomAgents.length,
        };
    }, [roomAgents]);

    // ── Natural Language Logging (spec §4.2) ─────────────────────────────────
    const nlPush = useCallback((text: string, level: 'info' | 'warn' | 'error' = 'info') => {
        setNlLog(prev => [{ ts: Date.now(), text, level }, ...prev].slice(0, 20));
    }, []);

    // ── Wired Director actions (spec §4.2) ───────────────────────────────────
    const handleNudge = useCallback(() => {
        const idle = roomAgents.filter(a => a.status === AgentStatus.Idle);
        if (idle.length === 0) { nlPush('All agents in this sector are already active.', 'info'); return; }
        idle.forEach(a => updateAgent(a.id, { status: AgentStatus.Pending }));
        nlPush(`Nudged ${idle.length} idle agent${idle.length > 1 ? 's' : ''} in ${selectedRoom.label} → Pending`, 'info');
    }, [roomAgents, updateAgent, selectedRoom.label, nlPush]);

    const handleBroadcast = useCallback(() => {
        const msg = `[BROADCAST] All ${selectedRoom.label} agents: recalibrate and report status.`;
        roomAgents.forEach(a => updateAgent(a.id, { data: { ...a.data, lastBroadcast: msg, broadcastAt: Date.now() } }));
        nlPush(`Broadcast sent to ${roomAgents.length} agent${roomAgents.length > 1 ? 's' : ''} in ${selectedRoom.label}.`, 'info');
    }, [roomAgents, updateAgent, selectedRoom.label, nlPush]);

    const handleOrganize = useCallback(() => {
        const errorAgents = roomAgents.filter(a => a.status === AgentStatus.Error);
        if (errorAgents.length === 0) { nlPush(`No errors in ${selectedRoom.label} sector — topology nominal.`, 'info'); return; }
        errorAgents.forEach(a => updateAgent(a.id, { status: AgentStatus.Idle }));
        nlPush(`Reset ${errorAgents.length} error agent${errorAgents.length > 1 ? 's' : ''} in ${selectedRoom.label} → Idle for restart.`, 'warn');
    }, [roomAgents, updateAgent, selectedRoom.label, nlPush]);

    return (
        <div className="h-full w-full relative overflow-hidden bg-obsidian-black flex high-density">
            <SimulacrumBackground />
            
            {/* ── Left Panel: Gossip Feed + NL Event Log ───────────────────── */}
            <div className="w-80 h-full border-r border-white/5 bg-black/40 backdrop-blur-xl z-20 hidden md:flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Neural Gossip</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="flex-grow overflow-hidden min-h-0">
                    <GossipTicker logs={gossipLog} agents={agents} onFocusAgent={setSelectedAgentId} />
                </div>

                {/* NL Event Log — spec §4.2 Natural Language Logging */}
                <div className="flex-shrink-0 border-t border-white/5 max-h-36 overflow-y-auto custom-scrollbar">
                    <div className="px-3 py-1.5 border-b border-white/5">
                        <span className="text-[8px] font-mono text-text-tertiary uppercase tracking-[0.2em]">Director Log</span>
                    </div>
                    {nlLog.length === 0 ? (
                        <div className="px-3 py-2 text-[9px] text-text-tertiary italic">No director actions yet.</div>
                    ) : (
                        nlLog.map(entry => (
                            <div key={entry.ts} className="flex items-start gap-2 px-3 py-1 border-b border-white/5">
                                <div className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${entry.level === 'error' ? 'bg-red-400' : entry.level === 'warn' ? 'bg-yellow-400' : 'bg-patina-green'}`} />
                                <span className="text-[9px] text-text-secondary leading-relaxed">{entry.text}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Main Visual Substrate ────────────────────────────────────── */}
            <div className="flex-grow relative flex flex-col">
                <div className="absolute top-4 left-4 z-50">
                    <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                </div>
                
                <div className="absolute top-16 left-4 z-40 text-[10px] font-mono text-text-tertiary uppercase tracking-wider bg-black/40 px-2 py-1 rounded border border-white/5">
                    Agents: {roomAgents.length} · Tethers: {activeTethers.length}
                </div>

                {/* ── Room Selector (spec §4.2 department nodes) ─────────── */}
                <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-1.5">
                    <div className="flex flex-wrap gap-1 justify-end">
                        {ROOMS.map(room => (
                            <button
                                key={room.id}
                                onClick={() => { setSelectedRoomId(room.id); setSelectedAgentId(null); }}
                                title={room.description}
                                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-all ${
                                    selectedRoomId === room.id
                                        ? `${room.color} bg-white/10`
                                        : 'border-white/10 text-text-tertiary hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {room.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-[8px] font-mono text-text-tertiary">{roomAgents.length} nodes visible</span>
                </div>

                {/* 2.5D Ant-Farm View */}
                <div className="absolute inset-0 flex items-center justify-center perspective-[1000px]">
                    <div className="relative w-[1200px] h-[800px] transform-gpu rotate-x-[30deg] border border-white/5 rounded-[4rem] bg-black/20 shadow-2xl overflow-hidden">
                        
                        {/* Floor Circuit Traces */}
                        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1"/>
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            <path className="ant-farm-line" d="M 0 400 L 1200 400" stroke={selectedRoom.accentVar} strokeWidth="2" fill="none" />
                            <path className="ant-farm-line" d="M 600 0 L 600 800" stroke="var(--patina-green)" strokeWidth="2" fill="none" />
                        </svg>

                        {/* Agents as Luminaries */}
                        <AnimatePresence>
                            <div
                                key={selectedRoomId}
                                className="absolute inset-0 transition-transform duration-700 ease-out"
                                style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
                            >
                                {roomAgents.map(a => (
                                    <SimulacrumEntity 
                                        key={a.id} 
                                        agent={a} 
                                        onSelect={(agent) => setSelectedAgentId(agent.id === selectedAgentId ? null : agent.id)}
                                        isSelected={selectedAgentId === a.id}
                                        gossip={currentBubbles[a.id]}
                                    />
                                ))}
                                <TetherLayer agents={agents} activeCommunications={activeTethers} />
                            </div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Wired Director Tray (spec §4.2) */}
                <DirectorTray 
                    onNudge={handleNudge}
                    onBroadcast={handleBroadcast}
                    onOrganize={handleOrganize}
                />
            </div>
        </div>
    );
};

export default SimulacrumView;