
import React from 'react';
import { motion } from 'framer-motion';
import { CompassIcon } from '../icons/CompassIcon';

interface CommandCenterTriggerProps {
    onClick: () => void;
    isOpen: boolean;
    className?: string;
}

const CommandCenterTrigger: React.FC<CommandCenterTriggerProps> = ({ onClick, isOpen, className = '' }) => {
    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-glass backdrop-blur-md transition-all duration-300 group relative
                ${isOpen 
                    ? 'bg-imperial-purple text-white border-imperial-purple shadow-[0_0_20px_rgba(106,13,173,0.5)]' 
                    : 'bg-panel-bg/60 text-text-secondary border-glass-border hover:text-white hover:border-white/30 hover:bg-panel-bg/80'
                }
                ${className}
            `}
            title="Open System Core"
        >
            <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <CompassIcon className="w-7 h-7" />
            </motion.div>
            
            {/* Hover Tooltip (Left side now) */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-obsidian-black/90 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                System Core
            </div>
        </motion.button>
    );
};

export default CommandCenterTrigger;
