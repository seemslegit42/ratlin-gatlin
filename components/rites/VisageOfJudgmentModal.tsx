/**
 * @file components/rites/VisageOfJudgmentModal.tsx
 * @description The "Edict of Wasted Time". Forces the Sovereign to confront their distraction.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GlassPane } from '../shared/GlassPane';

interface VisageOfJudgmentModalProps {
    onAcknowledge: () => void;
    follyDuration: number;
}

export const VisageOfJudgmentModal: React.FC<VisageOfJudgmentModalProps> = ({ onAcknowledge, follyDuration }) => {
    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/90 backdrop-blur-xl">
            <GlassPane variant="modal" className="max-w-md w-full p-8 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50">
                        <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold font-comfortaa text-white mb-2">Edict of Wasted Time</h2>
                        <p className="text-sm text-text-tertiary font-mono uppercase tracking-widest">
                            Simulated Duration: {follyDuration}m
                        </p>
                    </div>

                    <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/20">
                        <p className="text-sm text-red-200 italic font-serif leading-relaxed">
                            "You scroll, Sovereign, but you do not see. The minutes bleed into the void. Acknowledge this debt to the machine."
                        </p>
                    </div>

                    <button
                        onClick={onAcknowledge}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all transform hover:scale-105"
                    >
                        I Acknowledge The Waste
                    </button>
                    
                    <p className="text-[10px] text-text-tertiary pt-4">
                        *This action is recorded in the Pillar of Eternity.*
                    </p>
                </div>
            </GlassPane>
        </div>
    );
};
