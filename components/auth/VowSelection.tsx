
/**
 * @file components/auth/VowSelection.tsx
 * @description Phase 2: The Covenant Forged & The Crossing.
 * Allows the Initiate to declare their fundamental archetype (Vow).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { VOWS, STEP_VARIANTS, type VowType } from '../../modules/auth/auth.types';
import { GlassPane } from '../shared/GlassPane';

interface VowSelectionProps {
  onSelectVow: (vow: VowType) => void;
  onBack: () => void;
}

export const VowSelection: React.FC<VowSelectionProps> = ({ onSelectVow, onBack }) => {
  return (
    <motion.div
      key="step1"
      variants={STEP_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative z-10 w-full"
    >
      <GlassPane variant="modal" className="p-8">
        <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-2 font-comfortaa text-white">The Covenant Forged</h2>
            <p className="text-xs text-patina-green font-mono uppercase tracking-wider mb-4">Identity Forged in Nexus</p>
            <p className="text-sm text-text-secondary leading-relaxed">
                Your signature is verified. Prepare to make your Vow.
            </p>
        </div>

        <div className="space-y-4">
            {VOWS.map(vow => (
            <button
                key={vow.id}
                onClick={() => onSelectVow(vow.id)}
                className="w-full text-left p-5 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group relative overflow-hidden flex items-start space-x-4"
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${vow.color.replace('text-', 'bg-')} opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className={`mt-1 p-2 rounded-lg bg-white/5 ${vow.color} group-hover:scale-110 transition-transform`}>
                    {vow.icon}
                </div>
                
                <div>
                    <h3 className="font-bold text-white text-lg font-comfortaa group-hover:text-vitreous-white transition-colors">{vow.title}</h3>
                    <p className="text-sm text-text-secondary mt-1 italic font-serif opacity-80">
                        {vow.description}
                    </p>
                </div>
            </button>
            ))}
        </div>
      </GlassPane>
    </motion.div>
  );
};
