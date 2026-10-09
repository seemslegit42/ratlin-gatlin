
/**
 * @file components/ambient/Background.tsx
 * @description The Iridescent Aurora — Book I §1.3 "Digital Wabi-Sabi".
 *
 * Three independently-animated aurora layers produce an unpredictable,
 * never-perfectly-symmetric color field. A grain overlay (wabi-grain)
 * adds organic noise that drifts on a random step pattern, preventing the
 * surface from ever feeling machine-rendered or sterile.
 */

import React from 'react';
import { motion } from 'framer-motion';
import AuroraLayer from './AuroraLayer.js';
import LeyLines from './LeyLines.js';
import GlassOverlay from './GlassOverlay.js';

const Background: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-50 bg-[#09090b] overflow-hidden pointer-events-none" aria-hidden>
            <AuroraLayer />
            <LeyLines />
            <GlassOverlay />

            {/* ── Layer 1: Primary triadic aurora — slow rotation ── */}
            <motion.div
                className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] mix-blend-screen"
                animate={{
                    rotate: [0, 38, -12, 0],
                    scale:  [1, 1.08, 0.96, 1],
                    x:      [0, 20, -10, 0],
                    y:      [0, -15, 10, 0],
                }}
                transition={{ duration: 55, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    opacity: 0.38,
                    background: `
                        radial-gradient(circle at 28% 28%, #6A0DAD 0%, transparent 42%),
                        radial-gradient(circle at 72% 26%, #20B2AA 0%, transparent 40%),
                        radial-gradient(circle at 50% 72%, #3EB991 0%, transparent 38%)
                    `
                }}
            />

            {/* ── Layer 2: Secondary counter-rotation (wabi-sabi asymmetry) ── */}
            <motion.div
                className="absolute top-[-30%] left-[-15%] w-[130%] h-[130%] mix-blend-screen"
                animate={{
                    rotate: [0, -22, 15, 0],
                    scale:  [1, 0.93, 1.05, 1],
                    x:      [0, -25, 15, 0],
                    y:      [0, 20, -8, 0],
                }}
                transition={{ duration: 70, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
                style={{
                    opacity: 0.18,
                    background: `
                        radial-gradient(ellipse at 60% 20%, #6A0DAD 0%, transparent 50%),
                        radial-gradient(ellipse at 25% 75%, #20B2AA 0%, transparent 45%)
                    `
                }}
            />

            {/* ── Layer 3: Slow drift — gilded accent pulse (use sparingly) ── */}
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] mix-blend-screen"
                animate={{
                    rotate: [0, 8, -5, 0],
                    scale:  [1, 1.04, 1, 1],
                    opacity:[0.04, 0.09, 0.04, 0.04],
                }}
                transition={{ duration: 90, repeat: Infinity, ease: 'easeInOut', delay: 20 }}
                style={{
                    background: `radial-gradient(ellipse at 50% 50%, #FFD700 0%, transparent 55%)`
                }}
            />

            {/* ── Structural grid (ultra-faint) ── */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '80px 80px'
                }}
            />

            {/* ── Wabi-Sabi grain overlay (Book I §1.3) ── */}
            <div className="wabi-grain" />

            {/* ── Depth vignette ── */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.82)_100%)]" />
        </div>
    );
};

export default Background;
