
import React, { useRef, useLayoutEffect, useCallback, useState } from 'react';
import Draggable from 'react-draggable';
import type { ModuleData, JackPosition } from '../../types';
import JackComponent from './Jack';

interface MicroAppModuleProps {
    module: ModuleData;
    onMove: (id: string, x: number, y: number) => void;
    onJackClick: (moduleId: string, jackId: string, screenPosition: JackPosition) => void; 
    registerJackPosition: (moduleId: string, jackId: string, canvasPosition: JackPosition) => void;
    scale: number;
    onOpenLivePreview: (url: string) => void; 
    canvasPan: {x: number, y: number}; 
    canvasZoom: number; 
    hoveredJackId?: string | null; // For identifying which jack to highlight during drag
}

// Screw Component for industrial look
const Screw: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`w-2.5 h-2.5 rounded-full bg-[#2a2a2a] border border-[#111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_1px_rgba(0,0,0,0.5)] flex items-center justify-center ${className}`}>
        <div className="w-full h-0.5 bg-[#111] transform rotate-45 opacity-50" />
        <div className="w-full h-0.5 bg-[#111] transform -rotate-45 opacity-50 absolute" />
    </div>
);

const MicroAppModule: React.FC<MicroAppModuleProps> = ({ module, onMove, onJackClick, registerJackPosition, scale, onOpenLivePreview, canvasPan, canvasZoom, hoveredJackId }) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const iframeUrl = (module.data?.url as string) || 'https://www.google.com/doodles/';
    const [isDragging, setIsDragging] = useState(false); 

    // Special styling for System Interface Nodes
    const isSystemInput = module.name === 'System Input';
    const isSystemOutput = module.name === 'System Output';
    const isInterface = isSystemInput || isSystemOutput;

    const handleRegisterJackScreenPosition = useCallback((jackId: string, screenPosition: JackPosition) => {
        const canvasX = (screenPosition.x - canvasPan.x) / canvasZoom;
        const canvasY = (screenPosition.y - canvasPan.y) / canvasZoom;
        registerJackPosition(module.id, jackId, { x: canvasX, y: canvasY });
    }, [module.id, canvasPan, canvasZoom, registerJackPosition]);

    // Re-register jacks on move is handled by the parent/effect loop implicitly via ref measurements in Jack.tsx

    // --- RENDER: INTERFACE NODE (The "Bus") ---
    if (isInterface) {
        const borderColor = isSystemInput ? 'border-patina-green/40' : 'border-roman-aqua/40';
        const labelColor = isSystemInput ? 'text-patina-green' : 'text-roman-aqua';
        
        return (
            <Draggable
                nodeRef={nodeRef}
                handle=".handle"
                defaultPosition={module.position}
                onStart={() => setIsDragging(true)}
                onStop={(e, data) => { onMove(module.id, data.x, data.y); setIsDragging(false); }}
                scale={scale}
            >
                <div 
                    ref={nodeRef} 
                    className={`absolute w-40 rounded bg-[#121214] border ${borderColor} flex flex-col shadow-2xl z-30`}
                >
                    {/* Mounting Screws */}
                    <Screw className="absolute top-1 left-1" />
                    <Screw className="absolute top-1 right-1" />
                    <Screw className="absolute bottom-1 left-1" />
                    <Screw className="absolute bottom-1 right-1" />

                    <div className={`handle p-3 cursor-move flex flex-col items-center justify-center bg-black/20 border-b border-white/5`}>
                         <div className={`w-12 h-1 bg-white/10 rounded mb-1`} />
                         <span className={`text-[9px] font-black font-mono uppercase tracking-widest ${labelColor}`}>
                            {isSystemInput ? 'SYS_IN' : 'SYS_OUT'}
                        </span>
                    </div>

                    <div className="p-4 flex flex-col items-center justify-center space-y-2">
                        {module.jacks.map(jack => (
                            <JackComponent
                                key={jack.id}
                                jack={jack}
                                onClick={(screenPos) => onJackClick(module.id, jack.id, screenPos)}
                                registerScreenPosition={(screenPos) => handleRegisterJackScreenPosition(jack.id, screenPos)}
                                zoom={scale}
                                isSystem={true}
                                isHovered={hoveredJackId === `${module.id}:${jack.id}`}
                            />
                        ))}
                    </div>
                </div>
            </Draggable>
        );
    }

    // --- RENDER: STANDARD MODULE (Rack Unit) ---
    return (
        <Draggable
            nodeRef={nodeRef}
            handle=".handle"
            defaultPosition={module.position}
            onStart={() => setIsDragging(true)}
            onStop={(e, data) => { onMove(module.id, data.x, data.y); setIsDragging(false); }}
            bounds={{ left: -2000, top: -2000, right: 2000, bottom: 2000 }}
            scale={scale}
        >
            <div ref={nodeRef} className="absolute w-[320px] rounded-sm bg-[#1a1a1c] border border-t-[#333] border-l-[#222] border-r-[#111] border-b-[#000] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden group flex flex-col">
                
                {/* Rack Ears / Faceplate */}
                <div className="handle h-10 px-3 bg-gradient-to-b from-[#2a2a2c] to-[#1a1a1c] cursor-move flex justify-between items-center border-b border-black shrink-0 relative">
                     {/* Screws */}
                    <Screw className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <Screw className="absolute right-2 top-1/2 -translate-y-1/2" />

                    <div className="flex-grow text-center">
                        <h3 className="font-bold text-xs font-mono text-[#ccc] tracking-widest uppercase text-shadow-sm">{module.name}</h3>
                    </div>

                    {/* Status LED */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#00ff00] animate-pulse" />
                </div>

                {/* Content Body */}
                <div className="relative h-[200px] bg-[#111] overflow-hidden border-y border-[#000]">
                     {/* Screen Glare */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none z-10" />

                    {module.name === 'Micro-App Host' ? (
                        <>
                            <iframe
                                src={iframeUrl}
                                title={module.name}
                                className="w-full h-full border-0 opacity-90 grayscale-[0.2] contrast-125"
                                sandbox="allow-scripts allow-forms allow-popups allow-pointer-lock allow-same-origin allow-geolocation"
                            />
                            <div className="absolute inset-0" style={{ pointerEvents: isDragging ? 'none' : 'auto' }} /> 
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                             <div className="text-[#333] font-mono text-[40px] opacity-20 select-none pointer-events-none">
                                 VOID
                             </div>
                             {module.name === 'Data Visualizer' && (
                                 <div className="w-full h-16 flex items-end justify-center gap-1 opacity-50">
                                     {[1,3,2,5,4,3,6,4].map((h, i) => (
                                         <div key={i} className="w-2 bg-roman-aqua" style={{ height: `${h * 10}%` }} />
                                     ))}
                                 </div>
                             )}
                        </div>
                    )}
                </div>

                {/* I/O Panel */}
                <div className="min-h-[50px] px-3 py-2 bg-[#222] border-t border-[#333] relative z-20 flex justify-between items-start shrink-0">
                    <div className="flex flex-col space-y-1 w-1/2 border-r border-[#333] pr-2">
                        <span className="text-[7px] text-[#555] uppercase font-bold mb-1 block">Inputs</span>
                        {module.jacks.filter(j => j.type === 'input').map(jack => (
                            <JackComponent
                                key={jack.id}
                                jack={jack}
                                onClick={(screenPos) => onJackClick(module.id, jack.id, screenPos)}
                                registerScreenPosition={(screenPos) => handleRegisterJackScreenPosition(jack.id, screenPos)}
                                zoom={scale}
                                isHovered={hoveredJackId === `${module.id}:${jack.id}`}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col space-y-1 w-1/2 items-end pl-2">
                        <span className="text-[7px] text-[#555] uppercase font-bold mb-1 block">Outputs</span>
                        {module.jacks.filter(j => j.type === 'output').map(jack => (
                            <JackComponent
                                key={jack.id}
                                jack={jack}
                                onClick={(screenPos) => onJackClick(module.id, jack.id, screenPos)}
                                registerScreenPosition={(screenPos) => handleRegisterJackScreenPosition(jack.id, screenPos)}
                                zoom={scale}
                                isHovered={hoveredJackId === `${module.id}:${jack.id}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Draggable>
    );
};

export default MicroAppModule;
