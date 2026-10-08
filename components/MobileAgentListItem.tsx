/**
 * @file components/MobileAgentListItem.tsx
 * @description A mobile-optimized list item for displaying an agent's status and providing quick actions
 * like running the agent or initiating a connection. It adapts its appearance based on connection mode.
 */

import React, { memo, useCallback } from 'react';
import type { Agent } from '../types';
import { AgentStatus, AgentType } from '../types';
import { AGENT_ICONS, AGENT_STATUS_STYLES } from '../utils/agent-visuals';

/**
 * Props for the MobileAgentListItem component.
 * @interface
 */
interface MobileAgentListItemProps {
    /** The agent data to display. */
    agent: Agent;
    /** Callback function to select (open inspector for) the agent. */
    onSelect: (id: string) => void;
    /** Callback function to run the individual agent. */
    onRunAgent: (id: string) => void;
    /** Callback function to start a new connection from this agent. */
    onStartConnection: (id: string) => void;
    /** Callback function to complete a pending connection to this agent. */
    onCompleteConnection: (id: string) => void;
    /** Indicates if the canvas is currently in connection-making mode. */
    isConnectionMode: boolean;
    /** The ID of the agent that is the source of the current pending connection, or `null`. */
    connectionSourceId: string | null;
    /** A list of output ports that are currently connected from this agent. */
    connectedOutputPorts: string[];
}

/**
 * The MobileAgentListItem component.
 * Renders a compact, interactive representation of an agent for mobile views.
 * Supports quick actions and visual feedback for connection mode.
 * @param {MobileAgentListItemProps} props - The component props.
 * @returns {React.FC} The MobileAgentListItem UI.
 */
const MobileAgentListItem: React.FC<MobileAgentListItemProps> = memo(({ agent, onSelect, onRunAgent, onStartConnection, onCompleteConnection, isConnectionMode, connectionSourceId, connectedOutputPorts }) => {
    const statusStyle = AGENT_STATUS_STYLES[agent.status];
    const isSelfSource = connectionSourceId === agent.id;
    const isValidTarget = isConnectionMode && !isSelfSource && agent.type !== AgentType.Input;

    /**
     * Handles tap events on the list item, either completing a connection or selecting the agent.
     */
    const handleTap = useCallback(() => {
        if (isConnectionMode) {
            if (isValidTarget) onCompleteConnection(agent.id);
        } else {
            onSelect(agent.id);
        }
    }, [isConnectionMode, isValidTarget, onCompleteConnection, agent.id, onSelect]);

    /**
     * Handles the click event for the "Start Connection" button.
     * @param {React.MouseEvent} e - The mouse event.
     */
    const handleConnectClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onStartConnection(agent.id);
    }, [agent.id, onStartConnection]);
    
    /**
     * Handles the click event for the "Run Agent" button.
     * @param {React.MouseEvent} e - The mouse event.
     */
    const handleRunClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (agent.status !== AgentStatus.Running) onRunAgent(agent.id);
    }, [agent.id, agent.status, onRunAgent]);

    const isDefaultOutputConnected = connectedOutputPorts.includes('default') || connectedOutputPorts.includes('true') || connectedOutputPorts.includes('false');

    const containerClasses = `p-4 w-full rounded-xl transition-all duration-300 border-2 bg-conchoidal-gray shadow-glass shadow-glass-edge ${isConnectionMode ? (isValidTarget ? 'border-patina-green cursor-pointer py-6 scale-105 shadow-lg shadow-patina-green/20' : 'border-transparent opacity-40') : 'border-transparent'} ${isSelfSource ? 'border-roman-aqua ring-2 ring-roman-aqua scale-105 shadow-lg shadow-roman-aqua/20' : ''}`;
    const actionButtonClasses = "w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white/70 transition-colors disabled:opacity-30";
    const connectButtonExtraClass = (agent.type !== AgentType.Output && isDefaultOutputConnected && !isSelfSource) ? 'port-connected-glow bg-patina-green' : '';

    return (
        <div onClick={handleTap} className={containerClasses}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-vitreous-white">
                    <div className="p-2 rounded-full bg-black/20">{AGENT_ICONS[agent.type]}</div>
                    <div>
                        <div className="flex items-center space-x-2.5">
                            <h3 className="font-comfortaa text-lg">{agent.name}</h3>
                            <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></div>
                        </div>
                        <p className={`text-xs font-lexend ${statusStyle.text} mt-1`}>{agent.status}</p>
                    </div>
                </div>
                {!isConnectionMode && (
                    <div className="flex items-center space-x-2">
                        {agent.type !== AgentType.Output && (
                             <button 
                                onClick={handleConnectClick} 
                                title="Start Connection" 
                                className={`${actionButtonClasses} hover:bg-roman-aqua ${connectButtonExtraClass}`}
                                aria-label={`Connect ${agent.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                             </button>
                        )}
                        <button 
                          onClick={handleRunClick} 
                          title={`Run ${agent.name}`} 
                          disabled={agent.status === AgentStatus.Running} 
                          className={`${actionButtonClasses} hover:bg-patina-green`}
                          aria-label={`Run ${agent.name}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});
MobileAgentListItem.displayName = 'MobileAgentListItem';

export default MobileAgentListItem;