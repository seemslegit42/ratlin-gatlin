/**
 * @file components/rites/PulsingSigil.tsx
 * @description A pulsating red glyph that appears when Aegis detects "doomscrolling".
 */

import React from 'react';
import { motion } from 'framer-motion';

interface PulsingSigilProps {
    onClick: () => void;
}

export const PulsingSigil: React.FC<PulsingSigilProps> = ({ onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-8 right-8 z-[200] w-16 h-16 flex items-center justify-center cursor-pointer group"
        >
            {/* Outer Ripple */}
            <motion.div 
                className="absolute inset-0 rounded-full border-2 border-red-500/50"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Core */}
            <div className="w-12 h-12 bg-red-900/80 backdrop-blur-md rounded-full border border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="#EF4444" />
                </svg>
            </div>
            
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-red-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Interdiction Active
            </div>
        </motion.button>
    );
};
