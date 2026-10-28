/**
 * @file useStreamingChat.native.ts
 * @description React Native streaming chat hook for BEEP and local Ollama/Gemma models.
 */

import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useStreamingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    // Simulate streaming response with Reluctant Saviour persona
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `[BEEP Engine]: Processed directive "${prompt}". Executed with absolute precision.`,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsStreaming(false);
    }, 1000);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
  };
}
