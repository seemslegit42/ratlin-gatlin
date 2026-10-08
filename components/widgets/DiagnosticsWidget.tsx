

import React from 'react';
import { motion } from 'framer-motion';
import type { DiagnosticsWidgetData } from '../../types.js';

const StatusBlade: React.FC<{ name: string; status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE'; details: string; index: number }> = ({ name, status, details, index }) => {
    const color = status === 'OPERATIONAL' ? 'bg-patina-green' : status === 'DEGRADED' ? 'bg-yellow-400' : 'bg-red-500';
    const glow = status === 'OPERATIONAL' ? 'shadow-[0_0_10px_rgba(62,185,145,0.5)]' : status === 'DEGRADED' ? 'shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg mb-2 relative overflow-hidden"
        >
            {/* Status Bar Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${color} ${glow}`} />
            
            <div className="flex items-center space-x-3 pl-2">
                <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
                <span className="font-bold text-sm text-vitreous-white">{name}</span>
            </div>
            
            <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-text-tertiary bg-black/40 px-2 py-1 rounded">{details}</span>
                <div className="flex space-x-0.5">
                    {/* Fake activity bars */}
                    {[1,2,3].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{ duration: 1 + Math.random(), repeat: Infinity }}
                            className={`w-1 rounded-full ${color} opacity-50`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const DiagnosticsWidget: React.FC<{ data: DiagnosticsWidgetData }> = ({ data }) => {
  return (
    <div className="bg-panel-bg/60 backdrop-blur-xl p-5 rounded-2xl border border-glass-border shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-comfortaa font-bold text-vitreous-white flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-imperial-purple" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
            <span>System Diagnostics</span>
        </h4>
        <span className="text-[10px] font-mono text-patina-green bg-patina-green/10 px-2 py-0.5 rounded border border-patina-green/20 animate-pulse">LIVE</span>
      </div>
      
      <div className="space-y-1">
        {data.systems.map((system, i) => (
            <StatusBlade key={system.name} {...system} index={i} />
        ))}
      </div>
    </div>
  );
};

export default DiagnosticsWidget;