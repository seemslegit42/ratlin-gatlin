
/**
 * @file components/chaos/ChaosLayer.tsx
 * @description A global visual layer that applies CSS filters and overlays 
 * based on active Chaos Cards.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveChaosEffect } from '../../types';

interface ChaosLayerProps {
    effects: ActiveChaosEffect[];
}

const FractalEffect: React.FC = () => {
    const [fractals, setFractals] = useState<{ id: string; x: number; y: number }[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const id = Math.random().toString(36).substr(2, 9);
            setFractals(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
            setTimeout(() => {
                setFractals(prev => prev.filter(f => f.id !== id));
            }, 1000);
        };
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[200]">
            <AnimatePresence>
                {fractals.map(f => (
                    <motion.div
                        key={f.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 2, opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        className="absolute w-32 h-32 flex items-center justify-center"
                        style={{ left: f.x - 64, top: f.y - 64 }}
                    >
                        {/* Recursive Snowflake SVG */}
                        <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                            <circle cx="50" cy="50" r="5" fill="currentColor" />
                            {[0, 60, 120, 180, 240, 300].map(angle => (
                                <line 
                                    key={angle} 
                                    x1="50" y1="50" 
                                    x2={50 + 40 * Math.cos(angle * Math.PI / 180)} 
                                    y2={50 + 40 * Math.sin(angle * Math.PI / 180)} 
                                    stroke="currentColor" strokeWidth="1"
                                />
                            ))}
                        </svg>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export const ChaosLayer: React.FC<ChaosLayerProps> = ({ effects }) => {
    const [styles, setStyles] = useState<React.CSSProperties>({});
    const [globalClasses, setGlobalClasses] = useState<string>('');

    useEffect(() => {
        let currentFilter = '';
        let currentClasses = '';
        const currentStyles: React.CSSProperties = {};

        effects.forEach(e => {
            if (e.visualKey === 'geo-time') {
                currentClasses += ' chaos-slow-mo';
            }
            if (e.visualKey === 'marble-skin') {
                currentClasses += ' chaos-marble';
            }
            if (e.visualKey === 'owl-vision') {
                currentClasses += ' chaos-owl';
            }
            if (e.visualKey === 'weeping') {
                currentClasses += ' chaos-weeping';
            }
        });

        setGlobalClasses(currentClasses);
        setStyles(currentStyles);

        // Inject classes into body for global overrides
        const body = document.body;
        body.className = body.className.replace(/\bchaos-\S+/g, '') + ' ' + currentClasses;
        
        return () => {
            body.className = body.className.replace(/\bchaos-\S+/g, '');
        };
    }, [effects]);

    const hasFractals = effects.some(e => e.visualKey === 'fractals');

    return (
        <>
            <style>
                {`
                    .chaos-slow-mo * {
                        transition-duration: 4s !important;
                        transition-delay: 0s !important;
                    }
                    
                    .chaos-marble main {
                        background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png') !important;
                        background-color: #f5f5f5 !important;
                        color: #1a1a1a !important;
                    }
                    .chaos-marble * { border-color: rgba(0,0,0,0.1) !important; }
                    .chaos-marble .bg-panel-bg { background-color: rgba(255,255,255,0.8) !important; }

                    .chaos-owl main {
                        filter: invert(1) hue-rotate(180deg) brightness(0.6) contrast(1.2) !important;
                        background: black !important;
                    }

                    .chaos-weeping .bg-panel-bg {
                        animation: weep 10s ease-in-out infinite alternate;
                    }
                    
                    @keyframes weep {
                        0% { border-bottom-left-radius: 1rem; border-bottom-right-radius: 1rem; }
                        100% { border-bottom-left-radius: 4rem; border-bottom-right-radius: 3rem; }
                    }
                `}
            </style>
            
            {hasFractals && <FractalEffect />}
            
            {/* Global Overlay for Marble/Owl if needed */}
            <AnimatePresence>
                {effects.some(e => e.visualKey === 'geo-time') && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.05 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black pointer-events-none z-[100] mix-blend-multiply"
                    />
                )}
            </AnimatePresence>
        </>
    );
};
