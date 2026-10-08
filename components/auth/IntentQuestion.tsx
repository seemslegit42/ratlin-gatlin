
/**
 * @file components/auth/IntentQuestion.tsx
 * @description The third step of the ritual: capturing the specific goal based on the Vow.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { INTENT_QUESTIONS, VOWS, STEP_VARIANTS, type VowType } from '../../modules/auth/auth.types';
import { GlassPane } from '../shared/GlassPane';

interface IntentQuestionProps {
  vow: VowType;
  onSelectIntent: (intent: string) => void;
  onBack: () => void;
}

export const IntentQuestion: React.FC<IntentQuestionProps> = ({ vow, onSelectIntent, onBack }) => {
  const vowConfig = VOWS.find(v => v.id === vow);
  if (!vowConfig) return null;

  return (
    <motion.div
      key="step2"
      variants={STEP_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative z-10"
    >
      <GlassPane variant="modal" className="p-8">
        <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-black/40 border border-white/10 flex items-center justify-center ${vowConfig.color}`}>
            {vowConfig.icon}
        </div>

        <h2 className="text-xl font-bold mb-2 font-comfortaa text-center text-white">The Intent</h2>
        <p className="text-sm text-text-secondary mb-8 text-center">{INTENT_QUESTIONS[vow].question}</p>

        <div className="space-y-3">
            {INTENT_QUESTIONS[vow].options.map(option => (
            <button
                key={option}
                onClick={() => onSelectIntent(option)}
                className="w-full p-4 rounded-xl bg-black/40 border border-white/5 hover:border-patina-green/50 hover:bg-patina-green/10 hover:text-patina-green text-white transition-all text-sm font-bold text-left"
            >
                {option}
            </button>
            ))}
        </div>

        <button onClick={onBack} className="mt-6 text-xs text-text-tertiary hover:text-white transition-colors flex items-center justify-center space-x-1 mx-auto w-full">
            <span>← Reshape Vow</span>
        </button>
      </GlassPane>
    </motion.div>
  );
};
