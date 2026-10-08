
/**
 * @file components/security/LiveThreatMap.tsx
 * @description Visualizes a live multi-region threat map and edge swarm telemetry with interactive node metrics.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { RadarIcon } from '../icons/SecurityIcons';

export interface EdgeRegionNode {
    id: string;
    name: string;
    region: 'us-east' | 'eu-central' | 'ap-east';
    lat: number;
    lng: number;
    latencyMs: number;
    syncStatus: 'SYNCED' | 'REPLICATING' | 'DRIFT_DETECTED';
    activeSwarms: number;
    threatsBlocked: number;
}

const INITIAL_REGIONS: EdgeRegionNode[] = [
    { id: 'node-us-01', name: 'US-East (N. Virginia)', region: 'us-east', lat: 35, lng: 25, latencyMs: 14, syncStatus: 'SYNCED', activeSwarms: 8, threatsBlocked: 142 },
    { id: 'node-eu-01', name: 'EU-Central (Frankfurt)', region: 'eu-central', lat: 45, lng: 55, latencyMs: 38, syncStatus: 'SYNCED', activeSwarms: 12, threatsBlocked: 89 },
    { id: 'node-ap-01', name: 'AP-East (Tokyo/Singapore)', region: 'ap-east', lat: 60, lng: 80, latencyMs: 72, syncStatus: 'REPLICATING', activeSwarms: 6, threatsBlocked: 210 },
];

export const LiveThreatMap: React.FC = () => {
    const [regions, setRegions] = useState<EdgeRegionNode[]>(INITIAL_REGIONS);
    const [selectedNode, setSelectedNode] = useState<EdgeRegionNode | null>(INITIAL_REGIONS[0]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [lastBackupTime, setLastBackupTime] = useState<string>('Just now (Cloud Cron #402)');

    // Simulate live telemetry jitter
    useEffect(() => {
        const interval = setInterval(() => {
            setRegions(prev => prev.map(node => ({
                ...node,
                latencyMs: Math.max(8, node.latencyMs + Math.floor(Math.random() * 7 - 3)),
                threatsBlocked: node.threatsBlocked + (Math.random() > 0.6 ? 1 : 0),
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleTriggerBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            setIsBackingUp(false);
            setLastBackupTime(new Date().toLocaleTimeString() + ' (Manual Trigger)');
        }, 1200);
    };

    return (
        <ModuleCard title="Multi-Region Edge Sync & Threat Radar" className="min-h-[420px]">
            <div className="space-y-4 font-lexend">
                {/* Header Controls & Backup trigger */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-black/40 rounded-xl border border-white/5 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-patina-green animate-ping" />
                        <span className="font-bold text-vitreous-white uppercase tracking-wider font-comfortaa">
                            Global Edge Mesh
                        </span>
                        <span className="text-text-tertiary text-[10px] font-mono">
                            3 Nodes • Multi-Master Appwrite Engine
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-tertiary font-mono">
                            Backup: <span className="text-patina-green">{lastBackupTime}</span>
                        </span>
                        <button
                            onClick={handleTriggerBackup}
                            disabled={isBackingUp}
                            className="px-2.5 py-1 rounded bg-imperial-purple/30 border border-imperial-purple/60 hover:bg-imperial-purple/50 text-[10px] font-bold text-white transition-all disabled:opacity-50"
                        >
                            {isBackingUp ? 'Snapshotting...' : 'Trigger Backup'}
                        </button>
                    </div>
                </div>

                {/* Radar Grid & Node Visualization */}
                <div className="h-64 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                    <div 
                        className="absolute inset-0 opacity-20 pointer-events-none" 
                        style={{ backgroundImage: 'radial-gradient(#20B2AA 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
                    />

                    {/* Nodes positioning */}
                    {regions.map(node => (
                        <motion.button
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`absolute p-2 rounded-full border transition-all ${
                                selectedNode?.id === node.id 
                                    ? 'border-patina-green bg-patina-green/20 shadow-[0_0_16px_rgba(62,185,145,0.4)] z-20 scale-125' 
                                    : 'border-roman-aqua/40 bg-black/60 hover:border-roman-aqua z-10'
                            }`}
                            style={{ top: `${node.lat}%`, left: `${node.lng}%` }}
                        >
                            <span className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                    node.syncStatus === 'SYNCED' ? 'bg-patina-green' : 'bg-yellow-400'
                                }`} />
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                                    node.syncStatus === 'SYNCED' ? 'bg-patina-green' : 'bg-yellow-400'
                                }`} />
                            </span>
                        </motion.button>
                    ))}

                    <div className="text-center z-10 p-4 bg-black/70 rounded-xl backdrop-blur-md border border-roman-aqua/20 shadow-2xl">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                            <RadarIcon className="w-10 h-10 text-roman-aqua mx-auto mb-1 opacity-80" />
                        </motion.div>
                        <p className="text-roman-aqua font-mono text-[11px] tracking-widest uppercase font-bold">
                            EDGE REPLICATION ACTIVE
                        </p>
                    </div>
                </div>

                {/* Selected Node Inspector */}
                <AnimatePresence mode="wait">
                    {selectedNode && (
                        <motion.div
                            key={selectedNode.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 bg-white/5 rounded-xl border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono"
                        >
                            <div>
                                <span className="text-[9px] text-text-tertiary block">REGION NODE</span>
                                <span className="text-vitreous-white font-bold">{selectedNode.name}</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-text-tertiary block">ROUND-TRIP LATENCY</span>
                                <span className="text-patina-green font-bold">{selectedNode.latencyMs} ms</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-text-tertiary block">ACTIVE SWARMS</span>
                                <span className="text-roman-aqua font-bold">{selectedNode.activeSwarms} Swarms</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-text-tertiary block">THREATS PREVENTED</span>
                                <span className="text-red-400 font-bold">{selectedNode.threatsBlocked} Blocked</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModuleCard>
    );
};

