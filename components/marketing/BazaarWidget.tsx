
/**
 * @file components/marketing/BazaarWidget.tsx
 * @description Widget displaying e-commerce metrics and automated merchandising actions.
 */

import React from 'react';
import { CoinsIcon } from '../icons/EconomyIcons';

export const BazaarWidget: React.FC = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded-lg border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-8 h-8 bg-patina-green/10 rounded-bl-xl transition-transform group-hover:scale-150" />
                <div className="text-xs text-text-tertiary uppercase relative z-10">Storefront Revenue</div>
                <div className="text-xl font-bold text-white relative z-10">$12,405</div>
                <div className="text-[10px] text-patina-green mt-1 relative z-10">+8% vs last week</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400/10 rounded-bl-xl transition-transform group-hover:scale-150" />
                <div className="text-xs text-text-tertiary uppercase relative z-10">Cart Abandonment</div>
                <div className="text-xl font-bold text-white relative z-10">64%</div>
                <div className="text-[10px] text-yellow-400 mt-1 relative z-10">Recovery Agent Active</div>
            </div>
        </div>
        <div className="bg-imperial-purple/10 border border-imperial-purple/30 p-3 rounded-lg flex items-center space-x-3">
            <div className="w-8 h-8 bg-imperial-purple/20 rounded-full flex items-center justify-center text-imperial-purple animate-pulse">
                <CoinsIcon className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-white">Merchandising Agent</h4>
                <p className="text-[10px] text-text-tertiary">Optimizing product sorting based on inventory levels from The Forge.</p>
            </div>
        </div>
    </div>
);
