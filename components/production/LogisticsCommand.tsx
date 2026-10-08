
/**
 * @file components/production/LogisticsCommand.tsx
 * @description Geo-spatial command center for fleet management and shipment tracking.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { LayersIcon } from '../icons/LayersIcon'; // Truck icon fallback
import { CheckCircleIcon } from '../icons/AgentStatusIcons';

interface Shipment {
    id: string;
    origin: string;
    destination: string;
    status: 'In Transit' | 'Customs' | 'Delivered' | 'Delayed';
    eta: string;
    cargo: string;
    progress: number;
}

const SHIPMENTS: Shipment[] = [
    { id: 'SHP-9921', origin: 'Shanghai', destination: 'Los Angeles', status: 'In Transit', eta: '2 Days', cargo: 'Micro-Processors', progress: 75 },
    { id: 'SHP-8842', origin: 'Berlin', destination: 'New York', status: 'Customs', eta: '5 Days', cargo: 'Precision Optics', progress: 40 },
    { id: 'SHP-1002', origin: 'Tokyo', destination: 'Singapore', status: 'Delivered', eta: 'Arrived', cargo: 'Rare Earth Metals', progress: 100 },
    { id: 'SHP-3321', origin: 'Seoul', destination: 'San Francisco', status: 'Delayed', eta: 'Unknown', cargo: 'Lithium Cells', progress: 20 },
];

const VectorMap: React.FC = () => {
    // Abstract map coordinates
    const routes = [
        { start: { x: 800, y: 150 }, end: { x: 200, y: 180 }, color: '#3EB991' }, // Asia -> US
        { start: { x: 550, y: 140 }, end: { x: 280, y: 160 }, color: '#20B2AA' }, // Europe -> US
        { start: { x: 820, y: 160 }, end: { x: 750, y: 280 }, color: '#6A0DAD' }, // Japan -> Singapore
    ];

    return (
        <div className="absolute inset-0 overflow-hidden bg-[#050505]">
            {/* Map Background (Abstract Grid) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Continents (Simplified Shapes) */}
            <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 pointer-events-none">
                <path d="M150,100 Q250,50 350,150 T550,150 T750,100" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M100,200 Q200,350 300,300" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M600,100 Q700,50 800,100 T950,150" fill="none" stroke="white" strokeWidth="0.5" />
                
                {/* Active Routes */}
                {routes.map((route, i) => {
                    const midX = (route.start.x + route.end.x) / 2;
                    const midY = Math.min(route.start.y, route.end.y) - 50; // Curve up
                    const d = `M${route.start.x},${route.start.y} Q${midX},${midY} ${route.end.x},${route.end.y}`;
                    
                    return (
                        <g key={i}>
                            <path d={d} fill="none" stroke={route.color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />
                            <motion.circle 
                                r="3" 
                                fill={route.color}
                                initial={{ offsetDistance: "0%" }}
                                animate={{ offsetDistance: "100%" }}
                                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                                style={{ offsetPath: `path('${d}')` }}
                            />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export const LogisticsCommand: React.FC = () => {
    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* The Vector Map */}
            <div className="relative h-80 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <VectorMap />
                
                {/* Map Overlay UI */}
                <div className="absolute top-4 left-4 p-3 bg-black/80 backdrop-blur-md rounded-lg border border-white/10">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-patina-green animate-pulse" />
                        Global Fleet
                    </h3>
                    <div className="mt-2 space-y-1 text-[10px] text-text-secondary font-mono">
                        <div className="flex justify-between w-32"><span>ACTIVE:</span> <span className="text-white">142</span></div>
                        <div className="flex justify-between w-32"><span>IDLE:</span> <span className="text-white">12</span></div>
                        <div className="flex justify-between w-32"><span>ERR:</span> <span className="text-red-400">1</span></div>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] text-white hover:bg-white/10 transition-colors">
                        View Asia
                    </button>
                    <button className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] text-white hover:bg-white/10 transition-colors">
                        View Americas
                    </button>
                    <button className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] text-white hover:bg-white/10 transition-colors">
                        View EMEA
                    </button>
                </div>
            </div>

            {/* Shipment Manifest */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                <ModuleCard title="Active Manifest" className="lg:col-span-2">
                    <div className="space-y-3">
                        {SHIPMENTS.map((shp) => (
                            <div key={shp.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-black/40 rounded-lg text-text-secondary group-hover:text-roman-aqua transition-colors">
                                        <LayersIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-bold text-white">{shp.id}</span>
                                            <span className="text-[10px] text-text-tertiary bg-white/5 px-1.5 rounded uppercase tracking-wider">{shp.cargo}</span>
                                        </div>
                                        <div className="text-[10px] text-text-secondary mt-0.5">
                                            {shp.origin} &rarr; {shp.destination}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-6">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] text-text-tertiary uppercase">ETA</div>
                                        <div className="text-xs font-mono text-white">{shp.eta}</div>
                                    </div>
                                    
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase w-20 text-center ${
                                        shp.status === 'In Transit' ? 'bg-blue-500/20 text-blue-400' :
                                        shp.status === 'Delivered' ? 'bg-patina-green/20 text-patina-green' :
                                        shp.status === 'Delayed' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-400/20 text-yellow-400'
                                    }`}>
                                        {shp.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ModuleCard>

                <ModuleCard title="Route Optimization">
                    <div className="h-full flex flex-col justify-center items-center text-center p-4">
                        <div className="w-16 h-16 rounded-full border-4 border-t-roman-aqua border-r-transparent border-b-imperial-purple border-l-transparent animate-spin mb-4" />
                        <h4 className="text-sm font-bold text-white mb-2">AI Logistics Core</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Analyzing weather patterns and port congestion. 
                            <br/>
                            <span className="text-patina-green font-bold">Optimization Active.</span>
                        </p>
                        
                        <div className="mt-6 w-full bg-white/5 rounded-lg p-3 text-left">
                            <div className="flex items-center space-x-2 text-[10px] text-text-tertiary uppercase mb-2">
                                <CheckCircleIcon className="w-3 h-3 text-patina-green" />
                                <span>Recent Action</span>
                            </div>
                            <p className="text-xs text-white">Rerouted <span className="text-roman-aqua">SHP-8842</span> via Rotterdam to avoid Atlantic storm front.</p>
                        </div>
                    </div>
                </ModuleCard>
            </div>
        </div>
    );
};
