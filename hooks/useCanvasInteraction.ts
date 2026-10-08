
import React, { useState, useRef, useCallback, useEffect } from 'react';

const ZOOM_SPEED = 0.1;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.0;

// Helper function to calculate distance between two touch points
const getTouchDistance = (touches: TouchList) => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
};

// Helper function to calculate midpoint between two touch points
const getTouchMidpoint = (touches: TouchList) => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
    };
};


export const useCanvasInteraction = (canvasRef: React.RefObject<HTMLDivElement>) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(0.75);
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    // Refs for touch interactions
    const pinchStartDistance = useRef(0);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const activeGesture = useRef<'none' | 'pan' | 'pinch'>('none');


    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Pan with middle mouse button or Alt + left click
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            isPanning.current = true;
            panStart.current = { x: e.clientX, y: e.clientY };
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.cursor = 'grabbing';
            }
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning.current) {
            const dx = e.clientX - panStart.current.x;
            const dy = e.clientY - panStart.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            panStart.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (isPanning.current) {
          isPanning.current = false;
          if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.cursor = 'default';
          }
        }
    }, []);
    
    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
        if (isPanning.current) {
          isPanning.current = false;
          if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.cursor = 'default';
          }
        }
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const zoomFactor = 1 - e.deltaY * ZOOM_SPEED * 0.01;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Position on canvas before zoom
        const canvasX = (mouseX - pan.x) / zoom;
        const canvasY = (mouseY - pan.y) / zoom;
        
        // New pan position to keep mouse position stable
        const newPanX = mouseX - canvasX * newZoom;
        const newPanY = mouseY - canvasY * newZoom;

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    }, [zoom, pan, canvasRef]);
    
    // Touch Handlers
    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            activeGesture.current = 'pinch';
            pinchStartDistance.current = getTouchDistance(e.touches);
        } else if (e.touches.length === 1) {
            e.preventDefault();
            activeGesture.current = 'pan';
            lastPanPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (activeGesture.current === 'pinch' && e.touches.length === 2) {
            e.preventDefault();
            const newDist = getTouchDistance(e.touches);
            const zoomFactor = newDist / pinchStartDistance.current;
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));
            
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const newMidpoint = getTouchMidpoint(e.touches);
            const mouseX = newMidpoint.x - rect.left;
            const mouseY = newMidpoint.y - rect.top;
            
            const canvasX = (mouseX - pan.x) / zoom;
            const canvasY = (mouseY - pan.y) / zoom;

            const newPanX = mouseX - canvasX * newZoom;
            const newPanY = mouseY - canvasY * newZoom;

            setZoom(newZoom);
            setPan({ x: newPanX, y: newPanY });

            pinchStartDistance.current = newDist;

        } else if (activeGesture.current === 'pan' && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const dx = touch.clientX - lastPanPoint.current.x;
            const dy = touch.clientY - lastPanPoint.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanPoint.current = { x: touch.clientX, y: touch.clientY };
        }
    }, [zoom, pan, canvasRef]);
    
    const handleTouchEnd = useCallback((e: TouchEvent) => {
        activeGesture.current = 'none';
    }, []);

    const resetView = useCallback(() => {
        setPan({ x: 0, y: 0 });
        setZoom(0.75);
    }, []);
    
    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        
        const touchOptions = { passive: false };
        canvasEl.addEventListener('touchstart', handleTouchStart, touchOptions);
        canvasEl.addEventListener('touchmove', handleTouchMove, touchOptions);
        canvasEl.addEventListener('touchend', handleTouchEnd, touchOptions);
        canvasEl.addEventListener('touchcancel', handleTouchEnd, touchOptions);

        return () => {
            canvasEl.removeEventListener('touchstart', handleTouchStart);
            canvasEl.removeEventListener('touchmove', handleTouchMove);
            canvasEl.removeEventListener('touchend', handleTouchEnd);
            canvasEl.removeEventListener('touchcancel', handleTouchEnd);
        }
    }, [canvasRef, handleTouchStart, handleTouchMove, handleTouchEnd]);


    const screenToCanvas = useCallback((screenPos: { x: number, y: number }): { x: number, y: number } => {
        if (!canvasRef.current) return screenPos;
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (screenPos.x - rect.left - pan.x) / zoom,
            y: (screenPos.y - rect.top - pan.y) / zoom,
        };
    }, [pan, zoom, canvasRef]);

    return {
        pan,
        zoom,
        setZoom,
        setPan,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        handleWheel,
        screenToCanvas,
        resetView,
    };
};
