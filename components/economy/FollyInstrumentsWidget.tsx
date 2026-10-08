
import React from 'react';
import { motion } from 'framer-motion';
import { LayersIcon } from '../icons/LayersIcon';
import type { View } from '../../types';

interface FollyInstrumentsWidgetProps {
    onNavigate: (view: View) => void;
}

const FollyInstrumentsWidget: React.FC<FollyInstrumentsWidgetProps> = ({ onNavigate }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-panel-bg backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-glass h-full flex flex-col justify-between"
        >
            <div>
                <h3 className="font-comfortaa font-bold text-lg text-vitreous-white">Micro-App Forge</h3>
                <p className="text-sm text-text-secondary mt-2">
                    Engage in 'Cognitive Athletics' to generate internal value ($\Xi$) for your Syndicate. Construct Sacred Instruments to offset platform costs.
                </p>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => onNavigate('microAppForge')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-imperial-purple to-roman-aqua text-white font-bold rounded-lg shadow-lg hover:shadow-imperial-purple/30 transition-all"
                >
                    <LayersIcon className="w-5 h-5" />
                    <span>Enter Forge</span>
                </button>
            </div>
        </motion.div>
    );
};

export default FollyInstrumentsWidget;
