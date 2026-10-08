/**
 * @file components/shared/PerilousLegalStrip.tsx
 * @description A decorative and humorous legal disclaimer strip, typically displayed
 * at the bottom of the screen. It reinforces the fictional lore of ΛΞVON OS
 * with a subtle, ominous message.
 */


import React from 'react';
import { MapleLeafIcon } from '../icons/MapleLeafIcon.js'; // Assuming MapleLeafIcon is defined

/**
 * The PerilousLegalStrip component.
 * Displays a mock legal disclaimer as a subtle footer element.
 * @returns {React.FC} The PerilousLegalStrip UI.
 */
const PerilousLegalStrip: React.FC = () => {
    return (
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 px-4 py-2 text-text-tertiary text-xs pointer-events-none z-0 justify-end items-center">
            <div className="flex items-center space-x-1 font-mono uppercase tracking-wider">
                <MapleLeafIcon className="w-4 h-4 text-red-500" />
                <span>Legally Binding / Class 4 Protocol</span>
            </div>
        </div>
    );
};

export default PerilousLegalStrip;
