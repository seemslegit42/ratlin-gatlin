
/**
 * @file components/economy/COGSBreakdown.tsx
 * @description Visualizes the Cost of Goods Sold (COGS) breakdown for the internal Xi currency.
 * It shows the components contributing to the "Xi Floor" value.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { COGSComponent } from '../../services/xiEconomyService';

interface COGSBreakdownProps {
  components: COGSComponent[];
  xiFloor: number;
}

const COGSBreakdown: React.FC<COGSBreakdownProps> = ({ components, xiFloor }) => {
  return (
    <div className="bg-panel-bg backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-glass flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-comfortaa font-bold text-lg text-vitreous-white">Unit Cost Composition</h3>
          <p className="text-xs text-text-tertiary">Calculated $\Xi_{'{'}Floor{'}'}$ per CogniOp</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-roman-aqua">${xiFloor.toFixed(4)}</div>
          <div className="text-[10px] uppercase tracking-widest text-text-secondary">Current Floor</div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center space-y-4">
        {components.map((comp, index) => (
          <div key={comp.id} className="relative">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-vitreous-white">{comp.name}</span>
              <span className="font-mono text-text-secondary">{comp.metric}</span>
            </div>
            <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${comp.weight * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full rounded-full relative group"
                style={{ backgroundColor: comp.color }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-tertiary">Weight: {(comp.weight * 100).toFixed(0)}%</span>
              <span className="text-[10px] font-mono" style={{ color: comp.color }}>${comp.cost.toFixed(4)}/unit</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-glass-border">
        <div className="flex items-center space-x-2 text-[10px] text-text-tertiary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Optimization of these variables directly lowers the $\Xi_{'{'}Floor{'}'}$, increasing gross margin per token executed.</p>
        </div>
      </div>
    </div>
  );
};

export default COGSBreakdown;
