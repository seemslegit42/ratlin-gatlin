
/**
 * @file components/operations/ExecutionLog.tsx
 * @description A scrolling terminal-style log of live agent operations and system events.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'SUCCESS' | 'CRIT';
    source: string;
    message: string;
}

export const ExecutionLog: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const generateLog = () => {
            const levels: LogEntry['level'][] = ['INFO', 'INFO', 'INFO', 'SUCCESS', 'WARN', 'SUCCESS'];
            const sources = ['Operations Core', 'Dispatcher', 'Agent-007', 'Logistics Net', 'Aegis Sentinel'];
            const messages = [
                'Optimizing route efficiency...',
                'Task #8821 assigned to queue.',
                'Telemetry packet received.',
                'Latency spike detected in sector 4.',
                'Protocol handshake complete.',
                'Resource allocation updated.',
                'Workflow synchronized.',
            ];

            const newLog: LogEntry = {
                id: Math.random().toString(36),
                timestamp: new Date().toLocaleTimeString(),
                level: levels[Math.floor(Math.random() * levels.length)],
                source: sources[Math.floor(Math.random() * sources.length)],
                message: messages[Math.floor(Math.random() * messages.length)]
            };

            setLogs(prev => [...prev.slice(-19), newLog]);
        };

        const interval = setInterval(generateLog, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLevelColor = (level: LogEntry['level']) => {
        switch (level) {
            case 'INFO': return 'text-blue-400';
            case 'SUCCESS': return 'text-patina-green';
            case 'WARN': return 'text-yellow-400';
            case 'CRIT': return 'text-red-500';
            default: return 'text-text-tertiary';
        }
    };

    return (
        <ModuleCard title="Live Execution Stream">
            <div className="bg-black/80 rounded-lg border border-white/10 p-3 h-80 font-mono text-xs overflow-y-auto custom-scrollbar relative" ref={scrollRef}>
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
                
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-1.5 last:mb-0"
                        >
                            <span className="text-text-tertiary opacity-50 mr-2">[{log.timestamp}]</span>
                            <span className={`font-bold mr-2 w-12 inline-block ${getLevelColor(log.level)}`}>{log.level}</span>
                            <span className="text-imperial-purple mr-2">@{log.source}:</span>
                            <span className="text-white/80">{log.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {logs.length === 0 && (
                    <div className="flex h-full items-center justify-center text-text-tertiary animate-pulse">
                        Waiting for system signals...
                    </div>
                )}
            </div>
        </ModuleCard>
    );
};
