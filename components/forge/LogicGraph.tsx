
/**
 * @file components/forge/LogicGraph.tsx
 * @description The "Loom" within the Forge. 
 * Allows visual wiring of the Micro-App's I/O to the Syndicate OS.
 * Fully interactive switchboard with drag-and-drop modules and patch cables.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useMicroAppForgeState } from '../../hooks/useMicroAppForgeState';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import GridBackground from '../weaver/GridBackground';
import MicroAppModule from '../switchboard/MicroAppModule';
import PatchCable from '../switchboard/PatchCable';
import Toolbar from '../switchboard/Toolbar';
import type { JackPosition, AvailableModule } from '../../types';
import { nanoid } from 'nanoid';
import LivePreview from '../LivePreview';
import NodeDetailView from '../switchboard/NodeDetailView';

export const LogicGraph: React.FC<{ syndicateId: string; authenticatedUserId?: string | null }> = ({
    syndicateId,
    authenticatedUserId,
}) => {
    // Reusing existing state logic but scoped to this view
    const { modules, patches, addModule, updateModule, addPatch, deletePatch, deleteModule } =
        useMicroAppForgeState(syndicateId, authenticatedUserId);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { pan, zoom, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, screenToCanvas } = useCanvasInteraction(canvasRef);

    // Local state for jack positions (needed for cable rendering)
    const [jackPositions, setJackPositions] = useState<Record<string, JackPosition>>({});
    
    // Live preview & inspection state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    
    // Connection draft state
    const [draftConnection, setDraftConnection] = useState<{ moduleId: string; jackId: string; pos: JackPosition } | null>(null);
    const [mousePos, setMousePos] = useState<JackPosition | null>(null);
    const [hoveredJackId, setHoveredJackId] = useState<string | null>(null);

    const handleRegisterJack = useCallback((moduleId: string, jackId: string, pos: JackPosition) => {
        // Position comes in as Canvas Coordinates from MicroAppModule wrapper
        setJackPositions(prev => ({
            ...prev,
            [`${moduleId}:${jackId}`]: pos
        }));
    }, []);

    const handleJackClick = (moduleId: string, jackId: string, screenPos: JackPosition) => {
        if (draftConnection) {
            // Complete connection
            if (draftConnection.moduleId === moduleId && draftConnection.jackId === jackId) {
                setDraftConnection(null); // Cancel if clicked same jack
                return;
            }
            
            // Create patch
            addPatch({
                id: nanoid(),
                syndicateId,
                startJack: { moduleId: draftConnection.moduleId, jackId: draftConnection.jackId },
                endJack: { moduleId, jackId }
            });
            setDraftConnection(null);
        } else {
            // Start connection
            // Convert screenPos to canvas pos for the cable start
            const canvasPos = screenToCanvas(screenPos);
            setDraftConnection({ moduleId, jackId, pos: canvasPos });
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        handleMouseMove(e);
        if (draftConnection) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
                setMousePos({
                    x: (e.clientX - rect.left - pan.x) / zoom,
                    y: (e.clientY - rect.top - pan.y) / zoom
                });
            }
        }
    };
    
    // Handle adding modules via Toolbar (if passed as prop or handled externally, but we can integrate Toolbar here)
    const handleAddModule = (modTemplate: AvailableModule) => {
         // This is for click-to-add from toolbar (mobile mostly)
        addModule({
            id: nanoid(),
            syndicateId,
            name: modTemplate.name,
            position: { x: -pan.x / zoom + 200, y: -pan.y / zoom + 200 },
            jacks: modTemplate.jacks.map(j => ({ ...j, id: nanoid() })),
            data: modTemplate.data || {}
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dataStr = e.dataTransfer.getData('application/json');
        if (!dataStr) return;
        
        try {
            const modTemplate: AvailableModule = JSON.parse(dataStr);
            const rect = canvasRef.current?.getBoundingClientRect();
            if(rect) {
                 const x = (e.clientX - rect.left - pan.x) / zoom;
                 const y = (e.clientY - rect.top - pan.y) / zoom;
                 
                 addModule({
                    id: nanoid(),
                    syndicateId,
                    name: modTemplate.name,
                    position: { x, y },
                    jacks: modTemplate.jacks.map(j => ({ ...j, id: nanoid() })),
                    data: modTemplate.data || {}
                 });
            }
        } catch(err) {
            console.error("Drop failed", err);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <div 
            className="w-full h-full relative bg-[#08080a] overflow-hidden" 
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.3 }}>
                <GridBackground pan={pan} zoom={zoom} />
            </div>
            
            {/* Desktop Toolbar - positioned absolutely within the Forge view */}
            <Toolbar onSelectModule={handleAddModule} />

            <div className="absolute top-4 left-72 z-10 pointer-events-none flex flex-col gap-2">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest bg-black/60 px-2 py-1 rounded w-fit">Logic Layer</span>
                <div className="text-[10px] text-text-secondary bg-black/40 px-2 py-1 rounded border border-white/5 backdrop-blur-sm">
                    <span className="text-patina-green">{modules.length}</span> Modules • <span className="text-roman-aqua">{patches.length}</span> Patches
                </div>
            </div>

            <div 
                className="absolute inset-0 transform-gpu"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
            >
                {/* Cables Layer */}
                <svg className="absolute inset-0 overflow-visible pointer-events-none" style={{ width: 1, height: 1 }}>
                    {patches.map(patch => {
                        // Create composite IDs to look up jack positions
                        const startKey = `${patch.startJack.moduleId}:${patch.startJack.jackId}`;
                        const endKey = `${patch.endJack.moduleId}:${patch.endJack.jackId}`;
                        
                        const start = jackPositions[startKey];
                        const end = jackPositions[endKey];
                        
                        if (!start || !end) return null;
                        
                        return (
                             <g key={patch.id} onClick={(e) => { e.stopPropagation(); deletePatch(patch.id); }} className="pointer-events-auto cursor-pointer hover:opacity-50">
                                <PatchCable startPos={start} endPos={end} color="#20B2AA" />
                             </g>
                        );
                    })}
                    {draftConnection && mousePos && (
                        <PatchCable startPos={draftConnection.pos} endPos={mousePos} color="#FFD700" isDragging />
                    )}
                </svg>

                {/* Modules Layer */}
                {modules.map(mod => (
                    <div key={mod.id} onClick={() => setSelectedModuleId(mod.id)}>
                        <MicroAppModule
                            module={mod}
                            onMove={(id, x, y) => updateModule(id, { position: { x, y } })}
                            onJackClick={handleJackClick}
                            registerJackPosition={handleRegisterJack}
                            scale={zoom}
                            onOpenLivePreview={(url) => setPreviewUrl(url || 'https://www.google.com/doodles/')}
                            canvasPan={pan}
                            canvasZoom={zoom}
                            hoveredJackId={hoveredJackId}
                        />
                    </div>
                ))}
            </div>

            {/* Selected Module Detail Inspector */}
            {selectedModuleId && (
                <div className="absolute top-16 right-4 z-40">
                    <NodeDetailView
                        module={modules.find(m => m.id === selectedModuleId) || null}
                        onClose={() => setSelectedModuleId(null)}
                        onUpdateModule={updateModule}
                        onDeleteModule={deleteModule}
                    />
                </div>
            )}

            {/* Live Preview Modal */}
            {previewUrl && (
                <LivePreview
                    url={previewUrl}
                    isFullScreen={isFullScreen}
                    onClose={() => setPreviewUrl(null)}
                    onToggleFullScreen={() => setIsFullScreen(prev => !prev)}
                    dragConstraintsRef={canvasRef}
                />
            )}
            
            {/* Instruction Overlay */}
            {modules.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-text-tertiary opacity-50 pointer-events-none">
                     <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-2">
                            <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse" />
                        </div>
                        <p className="text-xs">Drag instruments from the toolbar to begin forging</p>
                    </div>
                </div>
            )}
        </div>
    );
};
