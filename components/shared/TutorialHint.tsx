
/**
 * @file components/shared/TutorialHint.tsx
 * @description A stylized overlay component for displaying onboarding hints.
 * Features a holographic aesthetic and interactive controls.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface TutorialHintProps {
  message: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  onNext: () => void;
  onDismiss: () => void;
  stepIndex: number;
  totalSteps: number;
}

const TutorialHint: React.FC<TutorialHintProps> = ({ message, position, onNext, onDismiss, stepIndex, totalSteps }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute z-[200] pointer-events-auto"
      style={{
          ...position,
          transform: 'translate(-50%, -50%)' // Center anchor
      }}
    >
      <div className="relative w-80">
        {/* Holographic Beam Effect */}
        <div className="absolute -inset-4 bg-roman-aqua/20 blur-xl rounded-full opacity-50 animate-pulse" />
        
        <div className="relative bg-black/90 border border-roman-aqua/50 rounded-xl p-5 shadow-[0_0_30px_rgba(32,178,170,0.3)] backdrop-blur-xl overflow-hidden">
            {/* Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(32,178,170,0.05)_50%)] bg-[size:100%_4px] pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black font-mono text-roman-aqua uppercase tracking-widest">
                        Protocol Guide [{stepIndex + 1}/{totalSteps}]
                    </span>
                    <button onClick={onDismiss} className="text-text-tertiary hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <p className="text-sm text-vitreous-white leading-relaxed font-lexend mb-6">
                    {message}
                </p>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div 
                        className="h-full bg-roman-aqua" 
                        initial={{ width: 0 }}
                        animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <button onClick={onDismiss} className="text-[10px] text-text-tertiary hover:text-white uppercase tracking-wider font-bold">
                        Skip
                    </button>
                    <button 
                        onClick={onNext}
                        className="px-6 py-2 bg-roman-aqua text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-all shadow-[0_0_15px_rgba(32,178,170,0.4)]"
                    >
                        {stepIndex === totalSteps - 1 ? 'Calibrate' : 'Next'}
                    </button>
                </div>
            </div>
        </div>

        {/* Decorative Connection Line */}
        <div className="absolute left-1/2 -bottom-8 w-px h-8 bg-gradient-to-b from-roman-aqua to-transparent -translate-x-1/2" />
        <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-roman-aqua rounded-full -translate-x-1/2 shadow-[0_0_10px_var(--roman-aqua)]" />
      </div>
    </motion.div>
  );
};

export default TutorialHint;
