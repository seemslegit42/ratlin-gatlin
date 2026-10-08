
/**
 * @file modules/weaver/hooks/useWeaverUI.ts
 * @description Encapsulates the ephemeral UI state for the unified Weaver Workspace.
 * Refactored to serve exclusively as the Architect Mode UI state manager.
 */

import { useState, useCallback } from 'react';

export const useWeaverUI = () => {
    // Panel Visibility
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [isChronicleOpen, setIsChronicleOpen] = useState(false);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false); 
    const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] = useState(false);
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false); 
    const [isLibraryOpen, setIsLibraryOpen] = useState(false); // Added Library Panel state
    const [isConsoleOpen, setIsConsoleOpen] = useState(false); // Added Console Panel state
    
    // Modal States
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [isCrewCreatorOpen, setIsCrewCreatorOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSaveVersionModalOpen, setIsSaveVersionModalOpen] = useState(false); 
    const [quickAddMenu, setQuickAddMenu] = useState<{x: number, y: number} | null>(null);
    
    // Modes & Tools
    const [isCrewMode, setIsCrewMode] = useState(false);
    const [isSimulationActive, setIsSimulationActive] = useState(true);
    
    const [isMobilePanLocked, setIsMobilePanLocked] = useState(true);
    
    // Search
    const [searchQuery, setSearchQuery] = useState('');

    // View mode: 'canvas' = node graph, 'board' = Kanban status board
    const [viewMode, setViewMode] = useState<'canvas' | 'board'>('canvas');

    // Selection
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [selectedAgentIdsForCrew, setSelectedAgentIdsForCrew] = useState<string[]>([]);
    const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

    // Handlers
    const handleToggleCrewMode = useCallback(() => {
        setIsCrewMode(prev => !prev);
        // Reset selection when toggling
        setSelectedAgentIdsForCrew([]);
    }, []);

    const handleToggleChronicle = useCallback(() => {
        setIsChronicleOpen(prev => !prev);
    }, []);

    const closeAllModals = useCallback(() => {
        setIsTemplatesOpen(false);
        setIsCreationModalOpen(false);
        setIsCrewCreatorOpen(false);
        setIsShareModalOpen(false);
        setIsSaveVersionModalOpen(false);
        setQuickAddMenu(null);
    }, []);

    return {
        // State
        isTemplatesOpen, setIsTemplatesOpen,
        isChronicleOpen, setIsChronicleOpen,
        isTimelineOpen, setIsTimelineOpen, 
        isCollaborationPanelOpen, setIsCollaborationPanelOpen,
        isVersionHistoryOpen, setIsVersionHistoryOpen,
        isLibraryOpen, setIsLibraryOpen,
        isConsoleOpen, setIsConsoleOpen,
        isCreationModalOpen, setIsCreationModalOpen,
        isCrewCreatorOpen, setIsCrewCreatorOpen,
        isShareModalOpen, setIsShareModalOpen,
        isSaveVersionModalOpen, setIsSaveVersionModalOpen,
        quickAddMenu, setQuickAddMenu,
        isCrewMode, setIsCrewMode,
        isSimulationActive, setIsSimulationActive,
        
        isMobilePanLocked, setIsMobilePanLocked,
        searchQuery, setSearchQuery,
        viewMode, setViewMode,
        selectedAgentId, setSelectedAgentId,
        selectedAgentIdsForCrew, setSelectedAgentIdsForCrew,
        hoveredAgentId, setHoveredAgentId,

        // Handlers
        handleToggleCrewMode,
        handleToggleChronicle,
        closeAllModals
    };
};
