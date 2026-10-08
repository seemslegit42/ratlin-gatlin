
/**
 * @file components/switchboard/Jack.tsx
 * @description Renders a single input or output jack on a module.
 * Styled to look like a physical eurorack/server port with hex-nut detailing.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Jack, JackPosition } from '../../types.js';

interface JackProps {
    jack: Jack;
    onClick: (position: JackPosition) => void;
    registerScreenPosition: (screenPosition: JackPosition) => void; 
    zoom: number; 
    isSystem?: boolean; 
    isHovered?: boolean; // New prop for drag-snapping feedback
}

const JackComponent: React.FC<JackProps> = ({ jack, onClick, registerScreenPosition, zoom, isSystem, isHovered }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInput = jack.type === 'input';
    const [localHover, setLocalHover] = useState(false);

    const calculateAndRegisterScreenPosition = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        // Report the center of the jack in screen coordinates
        registerScreenPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }, [registerScreenPosition]);

    // Update position on mount and whenever layout might change (e.g., parent module moves)
    useEffect(() => {
        const timer = setTimeout(calculateAndRegisterScreenPosition, 50);
        return () => clearTimeout(timer);
    }, [calculateAndRegisterScreenPosition]); 

    const handleJackClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        onClick({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }, [onClick]);

    // Styling logic
    const baseColor = isInput ? 'border-patina-green' : 'border-roman-aqua';
    const activeColor = isInput ? 'bg-patina-green' : 'bg-roman-aqua';
    const glowColor = isInput ? 'rgba(62,185,145,0.6)' : 'rgba(32,178,170,0.6)';

    const showHighlight = isHovered || localHover;

    return (
        <div 
            className={`flex items-center group py-2 ${isInput ? 'flex-row' : 'flex-row-reverse'} ${isSystem ? 'justify-center' : 'justify-between'}`}
            onMouseEnter={() => setLocalHover(true)}
            onMouseLeave={() => setLocalHover(false)}
        >
            {/* The Jack Physical Interface */}
            <div
                ref={ref}
                onClick={handleJackClick}
                className={`
                    relative w-6 h-6 flex items-center justify-center cursor-crosshair transition-all duration-200 z-20
                `}
                title={jack.label}
            >
                {/* Highlight Halo */}
                <div 
                    className={`absolute inset-0 rounded-full transition-all duration-200 ${showHighlight ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`}
                    style={{ backgroundColor: glowColor, filter: 'blur(4px)' }}
                />

                {/* Hex Nut Graphic */}
                <div className={`
                    w-full h-full border-2 ${baseColor} bg-[#1a1a1a]
                    flex items-center justify-center
                    relative
                    ${isInput ? 'rounded-full' : 'rounded-sm'} // Visual distinction: Inputs round, Outputs square-ish
                    shadow-md
                `}>
                    {/* Inner Port Hole */}
                    <div className="w-2.5 h-2.5 bg-black rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] border border-white/10" />
                    
                    {/* Metallic Shine */}
                    <div className="absolute top-0 right-0 w-full h-full rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
            </div>
            
            <span className={`text-[10px] font-mono uppercase tracking-wider text-text-tertiary transition-colors ${showHighlight ? 'text-white' : ''} ${isInput ? 'ml-3' : 'mr-3'}`}>
                {jack.label}
            </span>
        </div>
    );
};

export default React.memo(JackComponent);
