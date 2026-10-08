/**
 * @file components/rites/BurnoutFuneral.tsx
 * @description A minimalist, timed ritual interface for the Burnout.exe Termination Protocol.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BurnoutFuneralProps {
    onComplete: () => void;
}

const PHASES = [
    "Initiating Purgation Protocol...",
    "Identify the Hustle. The false urgency.",
    "Breathe. It does not serve you.",
    "Deleting 'burnout.exe' from neural substrate...",
    "Process Terminated.",
    "Welcome back, Sovereign."
];

export const BurnoutFuneral: React.FC<BurnoutFuneralProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        if (phase < PHASES.length) {
            const timer = setTimeout(() => {
                setPhase(prev => prev + 1);
            }, 3000); // 3 seconds per phase
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(onComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [phase, onComplete]);

    return (
        <div className="fixed inset-0 z-[250] bg-black flex flex-col items-center justify-center cursor-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={phase}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="max-w-xl text-center px-6"
                >
                    <h1 className="text-3xl md:text-5xl font-comfortaa text-white font-light tracking-tighter">
                        {phase < PHASES.length ? PHASES[phase] : ""}
                    </h1>
                </motion.div>
            </AnimatePresence>
            
            {/* Progress Bar */}
            <div className="absolute bottom-20 left-1/4 right-1/4 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${(phase / PHASES.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            
            {/* Audio visualizer simulation */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                 <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
        </div>
    );
};
