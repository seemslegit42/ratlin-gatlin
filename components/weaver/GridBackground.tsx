
import React, { memo } from 'react';

interface GridBackgroundProps {
    pan: { x: number; y: number };
    zoom: number;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ pan, zoom }) => {
    const gridSize = 40 * zoom;
    const bgSize = `${gridSize}px ${gridSize}px`;
    const bgPos = `${pan.x}px ${pan.y}px`;

    return (
        <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: bgSize,
                backgroundPosition: bgPos,
            }}
        >
            {/* Secondary larger grid for depth */}
            <div 
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(106, 13, 173, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(106, 13, 173, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize * 10}px ${gridSize * 10}px`,
                    backgroundPosition: bgPos,
                }}
            />
            
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0D0D12_100%)] opacity-80" />
        </div>
    );
};

// Strict comparison for grid background
const arePropsEqual = (prev: GridBackgroundProps, next: GridBackgroundProps) => {
    return prev.pan.x === next.pan.x && prev.pan.y === next.pan.y && prev.zoom === next.zoom;
};

export default memo(GridBackground, arePropsEqual);
