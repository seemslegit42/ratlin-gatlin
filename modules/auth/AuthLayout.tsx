
/**
 * @file modules/auth/AuthLayout.tsx
 * @description The visual wrapper for the authentication process.
 * Implements the Verdigris Protocol with vivid animated neural fields and glassmorphic layering.
 */

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LevonLogoIcon } from '../../components/icons/LevonLogoIcon';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const prefersReducedMotion = useReducedMotion();

    const particles = useMemo(() =>
      Array.from({ length: 12 }, (_, i) => ({
        key: i,
        x: `${(i * 8.3) % 100}%`,
        y: `${(i * 13.7) % 100}%`,
        scale: 0.5 + (i % 3) * 0.5,
        duration: 10 + (i % 5) * 3,
        delay: (i % 4) * 2.5,
      }))
    , []);

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-obsidian-black overflow-hidden relative font-lexend text-vitreous-white high-density">
            
            {/* --- AMBIENT BACKGROUND LAYERS --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                
                {/* Primary Neural Field (Imperial Purple) */}
                <motion.div 
                    className="absolute top-[-25%] left-[-25%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(106,13,173,0.3)_0%,transparent_60%)]"
                    animate={prefersReducedMotion ? {} : { 
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 0.8, 0.6],
                        rotate: [0, 45, 0]
                    }}
                    transition={{ 
                        duration: 20, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />

                {/* Secondary Tactical Field (Roman Aqua) */}
                <motion.div 
                    className="absolute bottom-[-25%] right-[-25%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(32,178,170,0.2)_0%,transparent_70%)]"
                    animate={prefersReducedMotion ? {} : { 
                        scale: [1.1, 1, 1.1],
                        opacity: [0.4, 0.6, 0.4],
                        rotate: [360, 0]
                    }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                />

                {/* Vertical Data Stream Grid */}
                <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                    }}
                >
                    <motion.div 
                        className="w-full h-full"
                        style={{ 
                            background: 'linear-gradient(to bottom, transparent, rgba(62,185,145,0.15) 50%, transparent)',
                            backgroundSize: '100% 400%'
                        }}
                        animate={prefersReducedMotion ? {} : { backgroundPosition: ['0% 0%', '0% 100%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                {/* Floating Micro-Dust Particles — skipped when reduced motion preferred */}
                {!prefersReducedMotion && particles.map((p) => (
                    <motion.div
                        key={p.key}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-50"
                        initial={{ 
                            x: p.x,
                            y: p.y,
                            scale: p.scale
                        }}
                        animate={{ 
                            y: ['-10%', '110%'],
                            opacity: [0, 0.6, 0]
                        }}
                        transition={{ 
                            duration: p.duration,
                            repeat: Infinity, 
                            delay: p.delay,
                            ease: "linear" 
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-lg relative z-10 px-6">
                {/* Branding Header */}
                <motion.div 
                    className="flex flex-col items-center mb-12"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
                >
                    <motion.div 
                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="mb-6 p-4 rounded-full bg-black/40 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(106,13,173,0.4)]"
                    >
                        <LevonLogoIcon className="w-16 h-16 text-vitreous-white" />
                    </motion.div>
                    
                    {/* Canonical Branding: ΛΞVOS (Lambda Xi Vawn) */}
                    <h1 className="text-7xl font-comfortaa tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-vitreous-white to-gray-400 drop-shadow-lg flex items-baseline">
                        <span className="font-bold tracking-tight">ΛΞV</span>
                        <span className="font-light text-white/70 ml-0.5">OS</span>
                    </h1>
                    
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-roman-aqua/50" />
                            <p className="text-sm text-roman-aqua uppercase tracking-[0.2em] font-mono whitespace-nowrap">The Future Needs Context</p>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-roman-aqua/50" />
                        </div>
                    </div>
                </motion.div>

                {/* Auth Module Content */}
                <div className="relative">
                    {children}
                </div>

                {/* Footer Metadata */}
                <motion.div 
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1 }}
                >
                    <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest mb-1">
                        The Function // The Unknown // The Machine
                    </p>
                    <p className="text-[9px] font-mono text-imperial-purple/60 uppercase tracking-widest">
                        ΛΞVON & Co.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
