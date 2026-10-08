
import React from 'react';
import { motion } from 'framer-motion';

const SimulacrumBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-obsidian-black pointer-events-none -z-10">
            {/* Base Radial Gradient for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1A1A21_0%,_#0D0D12_100%)]" />

            {/* Isometric Grid Lines */}
            <div 
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(30deg, #20B2AA 1px, transparent 1px),
                        linear-gradient(150deg, #20B2AA 1px, transparent 1px)
                    `,
                    backgroundSize: '100px 100px',
                    backgroundPosition: 'center'
                }}
            />

            {/* Secondary Grid for texture */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `
                        linear-gradient(30deg, #6A0DAD 0.5px, transparent 0.5px),
                        linear-gradient(150deg, #6A0DAD 0.5px, transparent 0.5px)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: 'center'
                }}
            />

            {/* Ambient "Data Clouds" */}
            <motion.div 
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-roman-aqua/10 rounded-full blur-[100px]"
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                    x: [0, 50, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-imperial-purple/10 rounded-full blur-[100px]"
                animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.1, 0.2, 0.1],
                    x: [0, -50, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
        </div>
    );
};

export default SimulacrumBackground;
