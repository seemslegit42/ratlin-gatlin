
/**
 * @file components/production/InventoryList.tsx
 * @description A component that displays a list of inventory items with their current levels
 * represented by progress bars. It provides a quick visual summary of stock status.
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * @interface InventoryItem
 * @description Defines the structure for a single inventory item to be displayed.
 */
interface InventoryItem {
    name: string;
    level: number; // Percentage (0-100)
    color: string; // Tailwind CSS background color class
    status: string; // e.g., 'Healthy', 'Low', 'Critical'
}

/**
 * The InventoryList component.
 * Renders a list of inventory items, each with an animated progress bar indicating its stock level.
 * 
 * @returns {React.FC} The rendered list of inventory items.
 */
export const InventoryList: React.FC = () => {
    // Mock data for inventory items.
    const items: InventoryItem[] = [
        { name: 'Raw Material A', level: 85, color: 'bg-emerald-500', status: 'Healthy' },
        { name: 'Component B', level: 40, color: 'bg-yellow-500', status: 'Low' },
        { name: 'Finished Good Z', level: 12, color: 'bg-red-500', status: 'Critical' }
    ];

    return (
        <div className="space-y-5">
            {items.map((item, index) => (
                <div key={item.name} className="group">
                    {/* Item header with name and status */}
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-vitreous-white font-bold">{item.name}</span>
                        <div className="flex space-x-2">
                            <span className={`text-[10px] uppercase font-bold ${item.level < 20 ? 'text-red-400' : 'text-text-secondary'}`}>{item.status}</span>
                            <span className="font-mono text-text-secondary">{item.level}%</span>
                        </div>
                    </div>
                    {/* Inventory level progress bar */}
                    <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.level}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className={`${item.color} h-full rounded-full relative`}
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    </div>
                </div>
            ))}
        </div>
    );
};