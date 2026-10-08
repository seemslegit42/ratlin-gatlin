import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { ChronicleEvent } from '../../types';
import { PlayIcon } from '../icons/CommandPaletteIcons';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ClockIcon } from '../icons/AetheriumIcons';
import { JSONTree } from './Node';

interface TimelinePanelProps {
    events: ChronicleEvent[];
    onClose: () => void;
    dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ events, onClose, dragConstraintsRef }) => {
    const dragControls = useDragControls();
    const sortedEvents = useMemo(() => [...events].sort((a, b) => a.timestamp - b.timestamp), [events]);
    const [currentIndex, setCurrentIndex] = useState(Math.max(0, sortedEvents.length - 1));
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isGlitching, setIsGlitching] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isPlaying) setCurrentIndex(sortedEvents.length - 1);
    }, [sortedEvents.length]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= sortedEvents.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000 / playbackSpeed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, sortedEvents.length]);

    const activeEvent = sortedEvents[currentIndex];
    
    const parsedPayload = useMemo(() => {
        if (!activeEvent) return null;
        try {
            // Detect if message is JSON
            if (activeEvent.message.trim().startsWith('{') || activeEvent.message.trim().startsWith('[')) {
                return JSON.parse(activeEvent.message);
            }
            return activeEvent.message;
        } catch {
            return activeEvent.message;
        }
    }, [activeEvent]);

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsPlaying(false);
        setIsGlitching(true);
        setCurrentIndex(parseInt(e.target.value));
        setTimeout(() => setIsGlitching(false), 150);
    };

    return (
        <motion.div
            drag dragListener={false} dragControls={dragControls} dragMomentum={false} dragConstraints={dragConstraintsRef}
            initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute top-20 left-20 bottom-20 w-96 bg-panel-bg/95 backdrop-blur-2xl border border-glass-border rounded-xl shadow-2xl flex flex-col z-40 overflow-hidden ${isGlitching ? 'animate-pulse' : ''}`}
        >
            {/* VHS Glitch Overlay */}
            {isGlitching && (
                <div className="absolute inset-0 z-50 pointer-events-none bg-white/5 mix-blend-overlay opacity-30">
                    <div className="w-full h-[2px] bg-roman-aqua absolute top-1/4 animate-ping" />
                    <div className="w-full h-[2px] bg-red-500 absolute top-2/3 animate-ping" />
                </div>
            )}

            <header onPointerDown={(e) => dragControls.start(e)} className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing">
                <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-roman-aqua" />
                    <div>
                        <h3 className="font-bold font-comfortaa text-sm text-vitreous-white">Causality Scrub</h3>
                        <p className="text-[9px] font-mono text-text-tertiary uppercase">Temporal Stream Active</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-text-tertiary hover:text-white transition-colors">
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
            </header>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 relative" ref={scrollRef}>
                <div className="absolute top-4 bottom-4 left-6 w-px bg-white/10" />
                {sortedEvents.map((event, idx) => (
                    <div 
                        key={event.id} onClick={() => { setIsPlaying(false); setCurrentIndex(idx); }}
                        className={`relative pl-8 pb-6 cursor-pointer transition-all ${idx === currentIndex ? 'opacity-100 scale-[1.02]' : 'opacity-40 hover:opacity-70'}`}
                    >
                        <div className={`absolute left-[20px] top-1.5 w-3 h-3 rounded-full border-2 border-black transition-all ${idx === currentIndex ? 'bg-patina-green scale-150 shadow-[0_0_8px_var(--patina-green)]' : 'bg-white/20'}`} />
                        <div className="flex justify-between items-baseline mb-1">
                            <div className="text-[10px] font-bold text-white uppercase tracking-wider">{event.source || 'SYSTEM'}</div>
                            <div className="text-[9px] font-mono text-text-tertiary">{new Date(event.timestamp).toLocaleTimeString()}</div>
                        </div>
                        <div className="text-[11px] text-text-secondary font-mono truncate bg-black/20 p-1.5 rounded border border-white/5">
                            {event.message.length > 50 ? `${event.message.slice(0, 50)}...` : event.message}
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-64 border-t border-glass-border bg-black/60 p-4 overflow-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Historical State</h4>
                    <span className="text-[9px] font-mono text-patina-green">SIG_ID: {activeEvent?.id.slice(0, 8)}</span>
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5">
                    <JSONTree data={parsedPayload} />
                </div>
            </div>

            <div className="p-4 bg-black/80 border-t border-white/10 flex items-center space-x-4">
                <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    className={`p-3 rounded-full transition-all ${isPlaying ? 'bg-patina-green text-black scale-110 shadow-[0_0_15px_var(--patina-green)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    <PlayIcon className="w-4 h-4" />
                </button>
                <div className="flex-grow flex flex-col">
                    <input 
                        type="range" min="0" max={Math.max(0, sortedEvents.length - 1)} 
                        value={currentIndex} 
                        onChange={handleScrub} 
                        className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-roman-aqua" 
                    />
                    <div className="flex justify-between text-[8px] text-text-tertiary font-mono mt-2 tracking-widest">
                        <span>GENESIS</span>
                        <span className="text-vitreous-white font-bold">{currentIndex + 1} / {sortedEvents.length}</span>
                        <span>NOW</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};