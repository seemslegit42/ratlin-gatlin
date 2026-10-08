

/**
 * @file components/weaver/Minimap.tsx
 * @description Displays a miniature overview of the entire Weaver Studio canvas.
 * It shows the positions of all agents and the current viewport, allowing for quick navigation.
 */


import React from 'react';
import type { Agent } from '../../types.js';

/**
 * Props for the Minimap component.
 */
interface MinimapProps {
    /** A record of all agents currently on the canvas. */
    agents: Record<string, Agent>;
    /** The current pan (translation) offset of the main canvas. */
    pan: { x: number; y: number };
    /** The current zoom level of the main canvas. */
    zoom: number;
}

/**
 * The Minimap component for Weaver Studio.
 * Renders a miniature representation of the canvas, showing agent positions
 * and the currently visible viewport.
 * @param {MinimapProps} props - The component props.
 * @returns {React.FC | null} The Minimap UI, or null if no agents are present.
 */
const Minimap: React.FC<MinimapProps> = ({ agents, pan, zoom }) => {
    const agentList = Object.values(agents) as Agent[];
    if (agentList.length === 0) return null;

    // Calculate bounds of the content
    const padding = 500;
    const minX = Math.min(...agentList.map(a => a.position.x)) - padding;
    const maxX = Math.max(...agentList.map(a => a.position.x + 256)) + padding;
    const minY = Math.min(...agentList.map(a => a.position.y)) - padding;
    const maxY = Math.max(...agentList.map(a => a.position.y + 112)) + padding;

    const worldWidth = Math.max(1, maxX - minX);
    const worldHeight = Math.max(1, maxY - minY);

    // Minimap Dimensions
    const mapWidth = 200;
    const scale = mapWidth / worldWidth;
    const mapHeight = worldHeight * scale;

    // Viewport Rect Calculation
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Convert Viewport to World Coordinates (inverse of pan/zoom)
    // WorldX = (ScreenX - PanX) / Zoom
    const viewWorldX = -pan.x / zoom;
    const viewWorldY = -pan.y / zoom;
    const viewWorldW = viewportWidth / zoom;
    const viewWorldH = viewportHeight / zoom;

    return (
        <div 
            className="absolute bottom-20 left-4 bg-panel-bg/90 backdrop-blur-lg border border-glass-border rounded-lg shadow-xl overflow-hidden pointer-events-none z-20"
            style={{ width: mapWidth, height: mapHeight }}
        >
            <div className="relative w-full h-full">
                {/* Nodes */}
                {agentList.map(agent => (
                    <div
                        key={agent.id}
                        className="absolute rounded-sm bg-patina-green opacity-50"
                        style={{
                            left: (agent.position.x - minX) * scale,
                            top: (agent.position.y - minY) * scale,
                            width: 256 * scale,
                            height: 112 * scale,
                        }}
                    />
                ))}

                {/* Viewport Box */}
                <div
                    className="absolute border-2 border-roman-aqua bg-roman-aqua/10"
                    style={{
                        left: (viewWorldX - minX) * scale,
                        top: (viewWorldY - minY) * scale,
                        width: viewWorldW * scale,
                        height: viewWorldH * scale,
                    }}
                />
            </div>
        </div>
    );
};

export default Minimap;