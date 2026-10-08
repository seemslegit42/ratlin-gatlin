/**
 * @file components/weaver/ConsolePanel.tsx
 * @description A professional-grade debugging console for the Weaver Studio.
 * Supports filtering by source (Pin-to-Agent), log level, and structured JSON inspection.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { ChronicleEvent, Agent } from '../../types';
import { ChronicleEventType } from '../../types';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { TrashIcon, SearchIcon } from '../icons/CommandPaletteIcons';
import { JSONTree } from './Node';

interface ConsolePanelProps {
    events: ChronicleEvent[];
    onClose: () => void;
    dragConstraintsRef: React.RefObject<HTMLDivElement>;
    agents?: Record<string, Agent>; // Optional for source mapping
}

type LogLevel = 'INFO' | 'LOG' | 'WARN' | 'ERROR';

const getLevel = (event: ChronicleEvent): LogLevel => {
    // Fix: Corrected ChronicleEventType member casing to uppercase
    if (event.type === ChronicleEventType.SYSTEM) return 'INFO';
    const msg = event.message.toLowerCase();
    if (msg.includes('error') || msg.includes('fail') || msg.includes('halted') || msg.includes('refused')) return 'ERROR';
    if (msg.includes('warn') || msg.includes('degraded') || msg.includes('latency')) return 'WARN';
    return 'LOG';
};

const LEVEL_COLORS: Record<LogLevel, string> = {
    'INFO': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    'LOG': 'text-patina-green border-patina-green/30 bg-patina-green/10',
    'WARN': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    'ERROR': 'text-red-500 border-red-500/30 bg-red-500/10',
};

const LogItem: React.FC<{ event: ChronicleEvent }> = ({ event }) => {
    const level = getLevel(event);
    
    const parsedPayload = useMemo(() => {
        try {
            const trimmed = event.message.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                return JSON.parse(trimmed);
            }
            return null;
        } catch {
            return null;
        }
    }, [event.message]);

    return (
        <div className="flex space-x-3 p-2 hover:bg-white/5 rounded border-b border-white/5 last:border-0 group transition-colors">
            <div className="flex-shrink-0 flex flex-col items-center space-y-1 w-16 pt-1">
                <span className="text-[9px] font-mono text-text-tertiary">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${LEVEL_COLORS[level]}`}>
                    {level}
                </span>
            </div>
            
            <div className="flex-grow min-w-0">
                <div className="flex items-baseline space-x-2 mb-1">
                    {event.source && (
                        <span className="text-[10px] font-bold text-vitreous-white bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                            {event.source}
                        </span>
                    )}
                    <span className="text-[9px] text-text-tertiary font-mono uppercase tracking-widest opacity-60">{event.type}</span>
                </div>
                
                <div className="text-[11px] font-mono leading-relaxed break-words whitespace-pre-wrap">
                    {parsedPayload ? (
                        <div className="bg-black/30 rounded p-2 border border-white/5 mt-1 shadow-inner">
                            <JSONTree data={parsedPayload} />
                        </div>
                    ) : (
                        <span className={level === 'ERROR' ? 'text-red-400' : 'text-text-secondary'}>
                            {event.message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ events, onClose, dragConstraintsRef, agents = {} }) => {
    const dragControls = useDragControls();
    const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
    const [pinnedSource, setPinnedSource] = useState<string | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const sources = useMemo(() => {
        const s = new Set<string>();
        events.forEach(e => e.source && s.add(e.source));
        return Array.from(s).sort();
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const level = getLevel(e);
            const matchesFilter = filter === 'ALL' || level === filter;
            const matchesSource = pinnedSource === 'ALL' || e.source === pinnedSource;
            const matchesSearch = !search || 
                e.message.toLowerCase().includes(search.toLowerCase()) || 
                (e.source && e.source.toLowerCase().includes(search.toLowerCase()));
            return matchesFilter && matchesSource && matchesSearch;
        });
    }, [events, filter, pinnedSource, search]);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredEvents, autoScroll]);

    return (
        <motion.div
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            dragConstraints={dragConstraintsRef}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute bottom-0 left-4 right-4 h-[400px] z-30 flex flex-col bg-panel-bg/95 backdrop-blur-3xl rounded-t-2xl border-t border-x border-glass-border shadow-2xl"
        >
            {/* Header / Substrate */}
            <header 
                onPointerDown={(e) => dragControls.start(e)} 
                className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center space-x-6">
                    <h3 className="font-mono font-bold text-xs text-vitreous-white flex items-center gap-2 tracking-widest uppercase">
                        <div className="w-2 h-2 rounded-full bg-roman-aqua animate-pulse shadow-[0_0_8px_var(--roman-aqua)]"/>
                        Neural_Diagnostics
                    </h3>
                    
                    {/* Log Level Filters */}
                    <div className="flex bg-black/40 rounded-lg p-1 space-x-1 border border-white/5">
                        {['ALL', 'INFO', 'LOG', 'WARN', 'ERROR'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${filter === f ? 'bg-white/10 text-white shadow-sm' : 'text-text-tertiary hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Source Pinner (Pin-to-Agent) */}
                    <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-1 border border-white/5">
                        <span className="text-[9px] font-bold text-text-tertiary uppercase pl-1">Pin:</span>
                        <select
                            value={pinnedSource}
                            onChange={(e) => setPinnedSource(e.target.value)}
                            className="bg-transparent text-[10px] font-bold text-roman-aqua focus:outline-none cursor-pointer pr-1"
                        >
                            <option value="ALL">ALL SOURCES</option>
                            {sources.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-roman-aqua" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Grep logs..."
                            className="bg-black/60 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-[11px] text-white focus:outline-none focus:border-roman-aqua w-40 focus:w-64 transition-all placeholder-white/10"
                        />
                    </div>
                    
                    <button 
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg border transition-all ${autoScroll ? 'text-patina-green border-patina-green/30 bg-patina-green/10' : 'text-text-tertiary border-white/10'}`}
                    >
                        {autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}
                    </button>

                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-text-tertiary hover:text-white transition-colors">
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Log Output Substrate */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto custom-scrollbar p-3 bg-black/40 font-mono shadow-inner">
                {filteredEvents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-tertiary opacity-30 pointer-events-none">
                        <div className="w-12 h-12 border border-dashed border-white/20 rounded-lg flex items-center justify-center mb-4">
                            <SearchIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs uppercase tracking-widest">No diagnostics detected in this scope.</span>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {filteredEvents.map((event) => <LogItem key={event.id} event={event} />)}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="px-6 py-2 border-t border-white/5 bg-white/5 flex justify-between items-center text-[9px] font-mono text-text-tertiary uppercase tracking-widest">
                <div>Captured Cycle Events: {events.length}</div>
                <div className="flex items-center gap-4">
                    <span className="text-roman-aqua">Buffer_Health: 100%</span>
                    <span className="text-patina-green">Uplink: Live</span>
                </div>
            </div>
        </motion.div>
    );
};