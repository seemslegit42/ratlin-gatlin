/**
 * @file hooks/useMultiplayer.ts
 * @description A custom React hook that manages real-time multiplayer collaboration
 * features. Uses Appwrite Realtime.
 * Currently running in localized isolated mode (Appwrite lacks ephemeral broadcast).
 */

import { useState, useEffect, useCallback } from 'react';
import type { User, ChatMessage, CurrentUser } from '../types.js';
import { MessageSource } from '../types.js';

/**
 * A custom React hook for managing multiplayer state within the application.
 * Currently stubbed to avoid crashes during Appwrite migration.
 *
 * @param currentUser The currently authenticated user object.
 * @returns An object containing multiplayer state and functions.
 */
export const useMultiplayer = (currentUser: CurrentUser | null) => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize local state immediately for responsiveness
  useEffect(() => {
    if (!currentUser?.syndicateId) return;

    setUsers(prev => ({
      ...prev,
      [currentUser.id]: {
        id: currentUser.id,
        tenantId: currentUser.tenantId || currentUser.syndicateId,
        name: currentUser.name,
        color: currentUser.color,
        syndicateId: currentUser.syndicateId,
        cursor: { x: 0, y: 0 },
        calibrationScore: currentUser.calibrationScore
      }
    }));

    // NOTE: Ephemeral presence channels use Appwrite Realtime subscriptions.

    return () => {
      // Cleanup if needed
    };
  }, [currentUser?.syndicateId, currentUser?.id, currentUser?.name, currentUser?.color, currentUser?.calibrationScore]);


  /**
   * Updates the current user's cursor position (local only for now).
   */
  const updateCursor = useCallback((x: number, y: number) => {
    if (!currentUser) return;
    
    setUsers(prev => ({
      ...prev,
      [currentUser.id]: { ...prev[currentUser.id], cursor: { x, y } },
    }));
  }, [currentUser]);
  
  const selectAgent = useCallback((agentId: string | null) => {
    if (!currentUser) return;
    setUsers(prev => ({
      ...prev,
      [currentUser.id]: { ...prev[currentUser.id], selectedAgentId: agentId },
    }));
  }, [currentUser]);

  /**
   * Sends a chat message locally.
   */
  const sendMessage = useCallback((content: string) => {
    if (!currentUser) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      syndicateId: currentUser.syndicateId,
      content,
      text: content,
      source: MessageSource.USER,
      isAgent: false,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [currentUser]);

  return { users, self: currentUser ? users[currentUser.id] : null, selfId: currentUser?.id, messages, setMessages, sendMessage, updateCursor, selectAgent };
};
