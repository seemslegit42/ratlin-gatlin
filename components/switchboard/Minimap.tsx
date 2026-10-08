

/**
 * @file components/switchboard/Minimap.tsx
 * @description Displays a miniature overview of the entire Micro-App Forge canvas.
 * It shows the positions of all modules and the current viewport, allowing for quick navigation.
 */

import React from 'react';
import type { ModuleData } from '../../types.js';

/**
 * Props for the Minimap component.
 */
interface MinimapProps {
    /** An array of all modules currently on the canvas. */
    modules: ModuleData[];
    /** The current visible area of the canvas in canvas coordinates. */
    viewport: { x: number; y: number; width: number; height: number; };
    /** The total conceptual width of the canvas. */
    canvasWidth: number;
    /** The total conceptual height of the canvas. */
    canvasHeight: number;
    /** Callback function to navigate the main canvas to a specific X, Y coordinate. */
    onNavigate: (x: number, y: number) => void;
}

/** The fixed width of the minimap in pixels. */
const MINIMAP_WIDTH = 200;

/**
 * Renders a miniature representation of the Micro-App Forge canvas,
 * showing module positions and the current viewport. Allows clicking to navigate.
 * @param {MinimapProps} props - The component props.
 * @returns {React.FC} The Minimap UI.
 */
const Minimap: React.FC<MinimapProps> = ({ modules, viewport, canvasWidth, canvasHeight, onNavigate }) => {
    const scale = MINIMAP_WIDTH / canvasWidth;
    const minimapHeight = canvasHeight * scale;

    /**
     * Handles a click event on the minimap, calculating the new target canvas position
     * and triggering navigation.
     * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
     */
    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Calculate the target canvas coordinates based on the click position
        const targetX = (clickX / scale) - (viewport.width / 2);
        const targetY = (clickY / scale) - (viewport.height / 2);

        onNavigate(targetX, targetY);
    };

    return (
        <div 
            className="hidden md:block fixed bottom-4 right-4 bg-panel-bg backdrop-blur-lg border border-glass-border rounded-lg shadow-2xl shadow-black/50 z-30 overflow-hidden"
            style={{ width: MINIMAP_WIDTH, height: minimapHeight }}
            onClick={handleMapClick}
        >
            {/* Module Representations */}
            {modules.map(mod => (
                <div
                    key={`map-${mod.id}`}
                    className="absolute bg-[#6A0DAD]/70 border border-[#F5FFFA]/50 rounded-sm"
                    style={{
                        left: mod.position.x * scale,
                        top: mod.position.y * scale,
                        width: 256 * scale, // Module width is 256px (w-64)
                        height: 150 * scale, // Approximate height
                    }}
                />
            ))}
            {/* Viewport Representation */}
            <div
                className="absolute border-2 border-[#FFD700] bg-[#FFD700]/10"
                style={{
                    left: viewport.x * scale,
                    top: viewport.y * scale,
                    width: viewport.width * scale,
                    height: viewport.height * scale,
                    transition: 'all 150ms ease-out',
                }}
            />
        </div>
    );
};

export default Minimap;