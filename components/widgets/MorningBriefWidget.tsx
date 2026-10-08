
/**
 * @file components/widgets/MorningBriefWidget.tsx
 * @description Displays a personalized morning briefing summary.
 * Features a gradient header, security status, operational highlights, and financial outlook.
 * Animations are staggered for a "live data feed" feel.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { MorningBriefWidgetData } from '../../types';
import { TrendingUpIcon, ZapIcon } from '../icons/VitalsIcons';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

interface MorningBriefWidgetProps {
  data: MorningBriefWidgetData;
  onInteraction?: (cmd: string) => void;
}

const MorningBriefWidget: React.FC<MorningBriefWidgetProps> = ({ data, onInteraction }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-panel-bg/80 backdrop-blur-2xl border border-glass-border rounded-xl p-0 overflow-hidden w-full max-w-md shadow-2xl ring-1 ring-white/10"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-imperial-purple to-roman-aqua p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
        <h3 className="font-comfortaa font-bold text-white text-lg relative z-10 flex items-center gap-2">
            <span>Morning Briefing</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">Daily</span>
        </h3>
        <p className="text-xs text-white/80 font-mono opacity-90 mt-1 relative z-10">{data.date}</p>
      </div>
      
      <div className="p-5 space-y-5">
        {/* Security Status */}
        <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg border border-white/5"
        >
            <div className="text-patina-green p-2 bg-patina-green/10 rounded-full">
                <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">System Security</div>
                <div className="text-sm text-white font-bold">{data.securityStatus}</div>
            </div>
        </motion.div>

        {/* Operational Highlights */}
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
        >
            <div className="flex items-center space-x-2 mb-3 text-roman-aqua">
                <ZapIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Operational Focus</span>
            </div>
            <ul className="space-y-2.5">
                {data.operationalHighlights.map((highlight, idx) => (
                    <motion.li 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        onClick={() => onInteraction?.(`Tell me more about: ${highlight}`)}
                        className={`text-xs text-text-secondary pl-3 border-l-2 border-white/10 transition-colors ${onInteraction ? 'hover:border-roman-aqua/50 hover:text-white cursor-pointer' : 'cursor-default'}`}
                    >
                        {highlight}
                    </motion.li>
                ))}
            </ul>
        </motion.div>

        {/* Financial Outlook */}
        <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="pt-4 border-t border-white/10"
        >
             <div className="flex items-center space-x-2 mb-2 text-yellow-400">
                <TrendingUpIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Financial Pulse</span>
            </div>
            <p className="text-xs text-vitreous-white leading-relaxed bg-yellow-400/5 p-2 rounded border border-yellow-400/10">
                {data.financialOutlook}
            </p>
        </motion.div>
      </div>
      
      {/* Footer Action */}
      <div className="p-3 bg-black/40 text-center border-t border-white/5">
        <button className="text-xs text-roman-aqua font-bold hover:text-white transition-colors flex items-center justify-center w-full gap-1 group">
            <span>View Full Intelligence Report</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </button>
      </div>
    </motion.div>
  );
};

export default MorningBriefWidget;
