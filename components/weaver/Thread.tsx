
import React, { useState, memo, useMemo } from 'react';
import type { Agent, WeaverMode } from '../../types.js';
import { AgentType } from '../../types.js';
import { motion } from 'framer-motion';

const CONNECTION_COLORS: Record<AgentType, string> = {
    [AgentType.Input]: '#A0AEC0',
    [AgentType.Start]: '#3EB991',
    [AgentType.End]: '#EF4444',
    [AgentType.Trigger]: '#FACC15',
    [AgentType.ManualTask]: '#F59E0B',
    [AgentType.CognitiveCore]: '#6A0DAD',
    [AgentType.DataTransformer]: '#20B2AA',
    [AgentType.Output]: '#3EB991',
    [AgentType.ApiCall]: '#3B82F6',
    [AgentType.Condition]: '#FACC15',
    [AgentType.CronTrigger]: '#FFD700',
    [AgentType.KnowledgeRetrieval]: '#9333EA',
    [AgentType.WebScraper]: '#3B82F6',
    [AgentType.Router]: '#22D3EE',
    [AgentType.EmailAction]: '#F472B6',
    [AgentType.CampaignManager]: '#F59E0B',
    [AgentType.Copywriter]: '#FF7171',
    [AgentType.SEOAnalyzer]: '#10B981',
    [AgentType.SocialPoster]: '#38BDF8',
    [AgentType.BrandGuard]: '#EF4444',
    [AgentType.CMSPublisher]: '#6366F1',
    [AgentType.AnalyticsTracker]: '#8B5CF6',
    [AgentType.ImageGeneration]: '#EC4899',
    [AgentType.ImageEditing]: '#EC4899',
    [AgentType.VisionAnalysis]: '#EC4899',
    [AgentType.CodeExecution]: '#10B981',
    [AgentType.WasmExecutor]: '#A855F7',
    [AgentType.MicroApp]: '#F472B6',
    [AgentType.Notification]: '#E11D48',
    [AgentType.Prompt]: '#8B5CF6',
    [AgentType.MCP_Bridge]: '#20B2AA',
    [AgentType.Vortex_Vanguard]: '#6A0DAD',
};

interface ThreadProps {
    from: Agent;
    to: Agent | { x: number; y: number };
    fromPortId: string;
    toPortId: string;
    isPreview?: boolean;
    isFlowing?: boolean;
    onDeleteConnection?: (connectionId: string) => void;
    id?: string;
    mode?: WeaverMode;
    style?: React.CSSProperties;
}

const Thread: React.FC<ThreadProps> = ({ id, from, to, fromPortId, isPreview = false, isFlowing = false, onDeleteConnection, mode = 'architect', style }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Dynamic Bezier Path Calculation
    const pathInfo = useMemo(() => {
        let fromYOffset = 0;
        if (from.type === AgentType.Condition) {
            if (fromPortId === 'true') fromYOffset = -20;
            if (fromPortId === 'false') fromYOffset = 20;
        }

        const startX = from.position.x + 256;
        const startY = from.position.y + 56 + fromYOffset;
        
        const endX = 'position' in to ? to.position.x : to.x;
        const endY = 'position' in to ? to.position.y + 56 : to.y;

        const dx = Math.abs(endX - startX);
        const curve = Math.max(dx * 0.45, 80); // Distance-based tension
        
        return {
            path: `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`,
            id: `path-${from.id}-${fromPortId}-${'id' in to ? to.id : 'preview'}`
        };
    }, [from.position, to, fromPortId]);

    const strokeColor = isPreview ? 'var(--roman-aqua)' : (CONNECTION_COLORS[from.type] || 'var(--patina-green)');
    const flowDuration = `${Math.max(0.8, 3 - (from.metrics?.celerity || 50) / 30)}s`;

    return (
        <g 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            style={style}
        >
            <defs>
                <filter id="threadGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            
            {/* Wide interaction area */}
            <path
                d={pathInfo.path}
                fill="none"
                stroke="transparent"
                strokeWidth="20"
                style={{ pointerEvents: 'auto', cursor: mode === 'architect' ? 'pointer' : 'default' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (id && onDeleteConnection && mode === 'architect') {
                    if (window.confirm('Dissolve logical connection?')) onDeleteConnection(id);
                  }
                }}
            />
            
            {/* Outer Glow Path */}
            <path
                d={pathInfo.path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHovered ? 4 : 2}
                className="transition-all duration-300 opacity-20"
                filter="url(#threadGlow)"
            />

            {/* Core Logic Cable with subtle flow animation for active connections */}
            <motion.path
                id={pathInfo.id}
                d={pathInfo.path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isPreview ? '1.5' : (isHovered ? '2' : '1.2')}
                // Preview gets standard dash, established gets customized dash
                strokeDasharray={isPreview ? '4 4' : '6 4'} 
                className="transition-all duration-300"
                style={{ opacity: isPreview ? 0.4 : (isHovered ? 1 : 0.7) }}
                // Animate dash offset to show "Live Wire" effect for established connections
                animate={!isPreview ? { strokeDashoffset: -20 } : {}}
                transition={!isPreview ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            />

            {/* Active Data Particles (High-Velocity Flow) */}
            {(isFlowing || isHovered) && !isPreview && (
                <>
                    <circle r="2.5" fill="#FFF" className="shadow-[0_0_8px_white]">
                        <animateMotion dur={flowDuration} repeatCount="indefinite" rotate="auto">
                            <mpath href={`#${pathInfo.id}`} />
                        </animateMotion>
                    </circle>
                    <motion.path 
                        d={pathInfo.path} 
                        fill="none" 
                        stroke={strokeColor} 
                        strokeWidth="3" 
                        opacity="0.3"
                        initial={{ pathLength: 0, pathOffset: 0 }}
                        animate={{ pathLength: 0.15, pathOffset: 1 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                </>
            )}
        </g>
    );
};

export default memo(Thread);
