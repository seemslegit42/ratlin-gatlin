
/**
 * @file components/forge/LivePreviewFrame.tsx
 * @description Renders the "Artifact" - the live output of the Micro-App code.
 * Uses a safe evaluation strategy (mocked for this environment) to render React components.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LivePreviewFrameProps {
    code: string;
    lastCompiled: number;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({ code, lastCompiled }) => {
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0);

    // In a real implementation, this would use a bundler like esbuild-wasm or a secure iframe eval.
    // For this simulation, we'll create a visual placeholder that "reacts" to code changes.
    
    useEffect(() => {
        // Flash effect on compile
        setKey(prev => prev + 1);
        setError(null);
    }, [lastCompiled]);

    return (
        <div className="w-full h-full max-w-md max-h-[600px] relative">
            {/* Device Frame */}
            <div className="absolute inset-0 border border-white/20 rounded-3xl bg-black/80 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
                <div className="h-6 bg-black border-b border-white/10 flex justify-center items-center">
                    <div className="w-16 h-4 bg-black rounded-b-lg border-b border-l border-r border-white/10" />
                </div>
                
                <div className="flex-grow relative overflow-auto p-4 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                        >
                            {/* 
                                SIMULATION: Since we can't safely eval arbitrary React code 
                                in this specific constrained output without a bundler, 
                                we visualize the "Spirit" of the app.
                            */}
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="p-4 rounded-full bg-white/5 border border-white/10 animate-pulse">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-roman-aqua" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M3 12l2-1m0 0l2-1m-2 1v2.5M7 20l2-1m0 0l2-1m-2 1v2.5M17 20l2-1m0 0l2-1m-2 1v2.5M9 12l2 1m0 0l2-1m-2 1v2.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">Preview Protocol</h3>
                                    <p className="text-xs text-text-tertiary px-8">
                                        Code compiled at {new Date(lastCompiled).toLocaleTimeString()}.
                                        <br/>
                                        Visual artifacts rendering...
                                    </p>
                                </div>
                                <div className="text-[10px] font-mono text-patina-green border border-patina-green/20 bg-patina-green/5 px-2 py-1 rounded">
                                    STATUS: LIVE
                                </div>
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Reflection/Glare */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-20" />
        </div>
    );
};
