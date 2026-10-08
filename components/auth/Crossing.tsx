
/**
 * @file components/auth/Crossing.tsx
 * @description The final step of the ritual: system initialization.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LevonLogoIcon } from '../icons/LevonLogoIcon';
import { STEP_VARIANTS, type VowType } from '../../modules/auth/auth.types';
import { GlassPane } from '../shared/GlassPane';

interface CrossingProps {
  vow: VowType;
  message?: string;
}

export const Crossing: React.FC<CrossingProps> = ({ vow, message }) => {
  return (
    <motion.div
      key="step3"
      variants={STEP_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full max-w-lg relative z-10"
    >
      <GlassPane variant="modal" className="p-12 flex flex-col items-center justify-center text-center">
        <div className="relative w-24 h-24 mb-8">
            <motion.div
            className="absolute inset-0 border-4 border-t-imperial-purple border-r-roman-aqua border-b-patina-green border-l-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <LevonLogoIcon className="w-10 h-10 text-white opacity-50" />
            </div>
        </div>
        <h2 className="text-2xl font-bold font-comfortaa mb-4 text-white">The Crossing</h2>
        
        <div className="min-h-[3rem] flex items-center justify-center">
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-patina-green font-mono leading-relaxed italic"
            >
                {message || "Establishing neural sync..."}
            </motion.p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 w-full">
            <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-[0.4em] animate-pulse">
                Initializing {vow.toUpperCase()} Protocol
            </p>
        </div>
      </GlassPane>
    </motion.div>
  );
};
