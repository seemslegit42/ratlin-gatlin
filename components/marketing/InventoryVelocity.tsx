
/**
 * @file components/marketing/InventoryVelocity.tsx
 * @description Tracks product inventory levels against sales velocity to alert
 * marketers when to push (High Stock / Low Velocity) or pull (Low Stock / High Velocity) ads.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ChartBarIcon } from '../icons/EconomyIcons';

interface Product {
    name: string;
    stock: number;
    velocity: number; // units per day
    status: 'Push' | 'Pull' | 'Stable';
}

const PRODUCTS: Product[] = [
    { name: 'Neural Link V2', stock: 1200, velocity: 15, status: 'Push' },
    { name: 'Haptic Gloves', stock: 45, velocity: 12, status: 'Pull' },
    { name: 'Vision Pro Lens', stock: 450, velocity: 40, status: 'Stable' },
    { name: 'Cyberdeck Case', stock: 2200, velocity: 8, status: 'Push' },
];

export const InventoryVelocity: React.FC = () => {
    return (
        <div className="h-full">
            <div className="space-y-3">
                {PRODUCTS.map((prod, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 group hover:bg-white/5 transition-colors">
                        <div>
                            <div className="text-sm font-bold text-white">{prod.name}</div>
                            <div className="text-[10px] text-text-tertiary font-mono">
                                Stock: {prod.stock} • Vel: {prod.velocity}/day
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-[9px] uppercase text-text-secondary">Action</div>
                                <div className={`text-xs font-bold uppercase ${
                                    prod.status === 'Push' ? 'text-patina-green' : 
                                    prod.status === 'Pull' ? 'text-red-400' : 'text-roman-aqua'
                                }`}>
                                    {prod.status} Ads
                                </div>
                            </div>
                            
                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100">
                                <ChartBarIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 p-3 bg-imperial-purple/10 border border-imperial-purple/30 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-imperial-purple/20 rounded-full text-imperial-purple">
                    <ChartBarIcon className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-white">Inventory Sync Active</h4>
                    <p className="text-[10px] text-text-secondary">
                        Ad spend automatically adjusts based on real-time stock levels.
                    </p>
                </div>
            </div>
        </div>
    );
};
