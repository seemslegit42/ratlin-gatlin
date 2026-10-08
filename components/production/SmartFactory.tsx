
/**
 * @file components/production/SmartFactory.tsx
 * @description A Digital Twin interface for monitoring manufacturing lines, OEE, and IoT telemetry.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons';
import { CogIcon, ExclamationIcon, PowerIcon } from '../icons/AgentStatusIcons';

interface Machine {
    id: string;
    name: string;
    status: 'Running' | 'Idle' | 'Maintenance' | 'Error';
    oee: number; // 0-100
    temp: number; // Celsius
    vibration: number; // mm/s
    output: number; // units/hr
}

const MACHINES: Machine[] = [
    { id: 'cnc-01', name: 'CNC Lathe Alpha', status: 'Running', oee: 92, temp: 65, vibration: 1.2, output: 450 },
    { id: 'cnc-02', name: 'CNC Lathe Beta', status: 'Running', oee: 88, temp: 68, vibration: 1.5, output: 430 },
    { id: 'asm-01', name: 'Assembly Arm A', status: 'Error', oee: 0, temp: 85, vibration: 4.5, output: 0 },
    { id: 'asm-02', name: 'Assembly Arm B', status: 'Running', oee: 95, temp: 62, vibration: 0.8, output: 600 },
    { id: 'pkg-01', name: 'Packager Unit 1', status: 'Idle', oee: 0, temp: 24, vibration: 0.0, output: 0 },
    { id: 'qc-01', name: 'Vision Scanner', status: 'Running', oee: 99, temp: 45, vibration: 0.2, output: 1200 },
];

const StatusBadge: React.FC<{ status: Machine['status'] }> = ({ status }) => {
    const colors = {
        'Running': 'text-patina-green border-patina-green/30 bg-patina-green/10',
        'Idle': 'text-text-tertiary border-white/10 bg-white/5',
        'Maintenance': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
        'Error': 'text-red-500 border-red-500/30 bg-red-500/10',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[status]}`}>
            {status}
        </span>
    );
};

const TelemetryGraph: React.FC<{ color: string }> = ({ color }) => {
    return (
        <div className="flex items-end space-x-1 h-8">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`w-1 rounded-t-sm ${color}`}
                    animate={{ height: `${Math.random() * 100}%` }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                />
            ))}
        </div>
    );
};

export const SmartFactory: React.FC = () => {
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Factory Floor Grid */}
            <ModuleCard title="Factory Floor: Digital Twin" className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {MACHINES.map((machine) => (
                        <motion.button
                            key={machine.id}
                            onClick={() => setSelectedMachine(machine)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-32 overflow-hidden group ${
                                selectedMachine?.id === machine.id 
                                ? 'bg-white/10 border-roman-aqua shadow-[0_0_15px_rgba(32,178,170,0.2)]' 
                                : 'bg-black/40 border-white/5 hover:border-white/20'
                            }`}
                        >
                            {/* Background Pulse for Running Machines */}
                            {machine.status === 'Running' && (
                                <div className="absolute inset-0 bg-patina-green/5 animate-pulse-slow" />
                            )}
                            
                            <div className="flex justify-between items-start z-10">
                                <div className={`p-2 rounded-lg ${
                                    machine.status === 'Running' ? 'bg-patina-green/20 text-patina-green' : 
                                    machine.status === 'Error' ? 'bg-red-500/20 text-red-500' : 
                                    'bg-white/5 text-text-tertiary'
                                }`}>
                                    {machine.status === 'Error' ? <ExclamationIcon className="w-5 h-5" /> : 
                                     machine.status === 'Idle' ? <PowerIcon className="w-5 h-5" /> :
                                     <CogIcon className={`w-5 h-5 ${machine.status === 'Running' ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />}
                                </div>
                                <StatusBadge status={machine.status} />
                            </div>

                            <div className="z-10">
                                <div className="text-sm font-bold text-white truncate">{machine.name}</div>
                                <div className="flex justify-between items-end mt-1">
                                    <span className="text-[10px] text-text-tertiary font-mono">{machine.id}</span>
                                    <span className={`text-xs font-mono font-bold ${machine.oee > 90 ? 'text-patina-green' : machine.oee < 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                                        OEE: {machine.oee}%
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </ModuleCard>

            {/* Telemetry Sidebar */}
            <div className="flex flex-col gap-6">
                <ModuleCard title="Machine Telemetry">
                    <AnimatePresence mode="wait">
                        {selectedMachine ? (
                            <motion.div 
                                key={selectedMachine.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{selectedMachine.name}</h3>
                                        <p className="text-xs text-text-tertiary">Real-time Sensor Feed</p>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${selectedMachine.status === 'Running' ? 'bg-patina-green animate-pulse' : 'bg-red-500'}`} />
                                </div>

                                <div className="space-y-4">
                                    {/* Temperature */}
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-text-secondary">Core Temp</span>
                                            <span className="text-white font-mono">{selectedMachine.temp}°C</span>
                                        </div>
                                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mb-2">
                                            <div 
                                                className={`h-full rounded-full ${selectedMachine.temp > 80 ? 'bg-red-500' : 'bg-roman-aqua'}`} 
                                                style={{ width: `${(selectedMachine.temp / 100) * 100}%` }}
                                            />
                                        </div>
                                        <TelemetryGraph color={selectedMachine.temp > 80 ? 'bg-red-500' : 'bg-roman-aqua'} />
                                    </div>

                                    {/* Vibration */}
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-text-secondary">Vibration (RMS)</span>
                                            <span className="text-white font-mono">{selectedMachine.vibration} mm/s</span>
                                        </div>
                                        <TelemetryGraph color={selectedMachine.vibration > 2.0 ? 'bg-yellow-400' : 'bg-patina-green'} />
                                    </div>

                                    {/* Output Rate */}
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUpIcon className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-white">Throughput</span>
                                        </div>
                                        <span className="text-xl font-mono text-white">{selectedMachine.output} <span className="text-xs text-text-tertiary">u/hr</span></span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all uppercase tracking-wider">
                                        Initiate Emergency Stop
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary opacity-50 min-h-[300px]">
                                <CogIcon className="w-12 h-12 mb-4" />
                                <p className="text-sm">Select a machine node to view telemetry.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </ModuleCard>

                <ModuleCard title="Predictive Maintenance">
                    <div className="flex items-start space-x-3 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                        <ZapIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-white">Spindle Wear Detected</h4>
                            <p className="text-[10px] text-text-secondary mt-1">
                                CNC Lathe Beta showing harmonic resonance deviation. Schedule service within 48h.
                            </p>
                            <button className="mt-2 text-[10px] font-bold text-yellow-400 hover:text-white underline">
                                Auto-Schedule Technician
                            </button>
                        </div>
                    </div>
                </ModuleCard>
            </div>
        </div>
    );
};
