
/**
 * @file components/vitalshud/FinancialPulse.tsx
 * @description Displays real-time financial metrics from the Obelisk Treasury.
 * Features Pact tier awareness and CogniOps capacity tracking.
 * Enhanced with manifestation cues for boons.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinsIcon } from '../icons/EconomyIcons';
import type { XiFlowData } from '../../services/xiEconomyService';
import { GlassPane } from '../shared/GlassPane';
import { useAuth } from '../../contexts/AuthContext';

interface FinancialPulseProps {
    data: XiFlowData | null;
    onNavigate: () => void;
}

const FinancialPulse: React.FC<FinancialPulseProps> = ({ data, onNavigate }) => {
    const { currentUser } = useAuth();
    const [pulse, setPulse] = useState(false);
    const prevBalance = useRef(currentUser?.xiBalance || 0);
    const prevPhi = useRef(currentUser?.phiBalance || 0);
    
    // Detect balance increases for diegetic cues
    useEffect(() => {
        if (!currentUser) return;
        const xiIncreased = currentUser.xiBalance > prevBalance.current;
        const phiIncreased = currentUser.phiBalance > prevPhi.current;

        if (xiIncreased || phiIncreased) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 2000);
            prevBalance.current = currentUser.xiBalance;
            prevPhi.current = currentUser.phiBalance;
            return () => clearTimeout(timer);
        }
    }, [currentUser?.xiBalance, currentUser?.phiBalance]);
    
    if (!data || !currentUser) return (
        <GlassPane className="min-w-[85vw] md:min-w-0 snap-center md:col-span-2 p-2.5 flex items-center justify-center">
            <span className="text-[10px] text-text-tertiary animate-pulse uppercase tracking-[0.15em]">Synchronizing Obelisk...</span>
        </GlassPane>
    );

    const opsUsedPercent = currentUser.cogniOpsLimit > 0
      ? Math.max(0, Math.min(100, (currentUser.cogniOpsRemaining / currentUser.cogniOpsLimit) * 100))
      : 0;
    const isAscending = currentUser.ageOfAscension;
    const feedState = data.outputs.cogniOps > 0 ? 'CONNECTED' : 'STALE';

    return (
        <GlassPane 
            variant="default"
            onClick={onNavigate}
            className={`min-w-[85vw] md:min-w-0 snap-center md:col-span-2 p-2.5 relative overflow-hidden group transition-all duration-700 cursor-pointer flex flex-col justify-between min-h-[105px] ${
                pulse ? 'border-gilded-accent shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'hover:border-yellow-400/30'
            }`}
        >
            {/* Manifestation Backdrop */}
            <AnimatePresence>
                {pulse && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gilded-accent pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-400/5 rounded-bl-[3rem] z-0 transition-transform group-hover:scale-110 duration-500" />
            
            <div className="flex justify-between items-start mb-0.5 relative z-10">
                <div className="flex items-center space-x-1.5">
                    <div className={`p-1 rounded border transition-colors ${pulse ? 'bg-gilded-accent/20 border-gilded-accent text-gilded-accent' : 'bg-yellow-400/20 border-yellow-400/20 text-yellow-400'}`}>
                        <CoinsIcon className="w-3 h-3" />
                    </div>
                    <div>
                        <h3 className="font-comfortaa font-bold text-[10px] text-vitreous-white uppercase tracking-tight">
                            {isAscending ? "Meta Vault" : "Obelisk"}
                        </h3>
                        <div className="flex items-center gap-0.5">
                            <span className="text-[7px] font-black text-patina-green uppercase tracking-widest">{currentUser.pact}</span>
                            <div className="w-0.5 h-0.5 rounded-full bg-patina-green animate-pulse" />
                        </div>
                    </div>
                </div>
                <span className={`text-[8px] font-mono tracking-wider border px-1 rounded transition-colors ${pulse ? 'border-gilded-accent text-gilded-accent bg-black/40' : 'border-white/5 text-text-tertiary bg-black/20'}`}>
                    {feedState}
                </span>
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline space-x-1">
                    <motion.span 
                        key={isAscending ? currentUser.phiBalance : currentUser.xiBalance}
                        initial={pulse ? { scale: 1.2, color: '#FFD700' } : false}
                        animate={{ scale: 1, color: '#FFFFFF' }}
                        className="text-xl font-mono font-bold tracking-tighter"
                    >
                        {isAscending ? currentUser.phiBalance.toLocaleString() : currentUser.xiBalance.toLocaleString()}
                    </motion.span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider opacity-80 ${pulse ? 'text-gilded-accent' : 'text-yellow-400'}`}>
                        {isAscending ? "Φ" : "Ξ"}
                    </span>
                </div>
                
                <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between text-[7px] uppercase font-black text-text-tertiary tracking-[0.08em]">
                        <span>Capacity</span>
                        <span className={opsUsedPercent < 20 ? 'text-red-500' : 'text-roman-aqua'}>
                            {currentUser.cogniOpsRemaining}/{currentUser.cogniOpsLimit}
                        </span>
                    </div>
                     <div className="w-full h-0.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${opsUsedPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ 
                                backgroundColor: opsUsedPercent < 20 ? 'var(--red-500)' : 'var(--roman-aqua)', 
                                boxShadow: `0_0_6px ${opsUsedPercent < 20 ? 'var(--red-500)' : 'var(--roman-aqua)'}40` 
                            }}
                        />
                    </div>
                </div>
            </div>
        </GlassPane>
    );
};

export default FinancialPulse;
