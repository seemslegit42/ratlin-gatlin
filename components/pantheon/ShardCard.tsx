
import React from 'react';
import { motion } from 'framer-motion';

interface ShardCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string; // e.g., 'text-patina-green'
    borderColor: string; // e.g., 'border-patina-green'
    onClick: () => void;
    isActive: boolean;
    description: string;
}

export const ShardCard: React.FC<ShardCardProps> = ({ title, subtitle, icon, color, borderColor, onClick, isActive, description }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-72 w-full text-left overflow-hidden group ${isActive ? `bg-black/60 ${borderColor} shadow-[0_0_30px_rgba(0,0,0,0.5)]` : 'bg-white/5 border-white/5 hover:border-white/20'}`}
        >
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700 ${color}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-32 h-32' })}
            </div>

            <div className="relative z-10">
                <div className={`mb-4 p-3 rounded-xl bg-black/40 w-fit border border-white/10 ${color}`}>
                    {icon}
                </div>
                <h3 className="text-2xl font-bold font-comfortaa text-white mb-1">{title}</h3>
                <p className={`text-xs font-mono font-bold uppercase tracking-widest ${color}`}>{subtitle}</p>
            </div>

            <div className="relative z-10">
                <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">
                    {description}
                </p>
                <div className={`w-full py-3 rounded-lg flex items-center justify-center text-xs font-bold uppercase tracking-[0.2em] transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-black/20 text-text-tertiary group-hover:text-white'}`}>
                    {isActive ? 'Engaged' : 'Select Shard'}
                </div>
            </div>
            
            {isActive && (
                <motion.div 
                    layoutId="active-shard-glow"
                    className={`absolute inset-0 border-2 ${borderColor} rounded-2xl pointer-events-none`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
        </motion.button>
    );
};
