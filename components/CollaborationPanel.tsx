/**
 * @file components/CollaborationPanel.tsx
 * @description Provides a real-time chat interface for multiplayer collaboration within Weaver Studio.
 * It displays messages from different users and the BEEP AI, and allows users to send messages
 * and mention BEEP for assistance.
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, ChatMessage } from '../types.js';
import { PaperclipIcon } from './icons/PaperclipIcon.js';

/**
 * Props for the CollaborationPanel.
 * @interface
 */
interface CollaborationPanelProps {
  /** The current user's data. */
  self: User | null;
  /** A record of all participating users. */
  users: Record<string, User>;
  /** An array of chat messages to display. */
  messages: ChatMessage[];
  /** Callback function to send a general chat message. */
  onSendMessage: (content: string) => void;
  /** Callback function to send a message specifically mentioning BEEP. */
  onMentionAgent: (content: string, attachment?: { name: string, mimeType: string, data: string }) => void;
  /** Indicates if the current view is on a mobile device. */
  isMobile: boolean;
}

/**
 * Props for a single Message component in the collaboration panel.
 * @interface
 */
interface MessageProps {
  /** The message data to render. */
  msg: ChatMessage;
  /** True if the message was sent by the current user. */
  isSelf: boolean;
}

/**
 * Renders a single chat message, styling it differently based on the sender (self, agent, or other user).
 * @param {MessageProps} props - The component props.
 * @returns {React.FC} The Message UI.
 */
const Message: React.FC<MessageProps> = memo(({ msg, isSelf }) => {
  const messageClass = isSelf ? 'bg-imperial-purple/60 rounded-br-none' : (msg.isAgent ? 'bg-patina-green/50 rounded-bl-none' : 'bg-conchoidal-gray rounded-bl-none');
  const alignmentClass = isSelf ? 'items-end' : 'items-start';

  return (
    <div className={`flex flex-col w-full ${alignmentClass}`}>
      <div className="flex items-center space-x-2">
        {!isSelf && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: msg.userColor }}>
            {msg.userName?.substring(0, 1)}
          </div>
        )}
        <span className="text-xs text-vitreous-white/50">{msg.userName}</span>
      </div>
      <div className={`mt-1 p-3 rounded-xl max-w-xs md:max-w-md text-sm text-vitreous-white/90 ${messageClass}`}>
        {msg.content}
      </div>
    </div>
  );
});
Message.displayName = 'Message';

/**
 * The CollaborationPanel component.
 * Provides a chat interface for multi-user interaction within the Weaver Studio.
 * @param {CollaborationPanelProps} props - The component props.
 * @returns {React.FC} The CollaborationPanel UI.
 */
const CollaborationPanel: React.FC<CollaborationPanelProps> = memo(({ self, users, messages, onSendMessage, onMentionAgent, isMobile }) => {
  /** @state {string} input - The current value of the chat input field. */
  const [input, setInput] = useState('');
  /** @state {File | null} attachment - Currently selected file for attachment. */
  const [attachment, setAttachment] = useState<File | null>(null);
  /** @ref {HTMLDivElement} messagesEndRef - Reference to the end of the message list for auto-scrolling. */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  /** @ref {HTMLInputElement} fileInputRef - Reference to the hidden file input. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Converts a File object to a Base64 encoded string.
   * @param {File} file - The file to convert.
   * @returns {Promise<string>} A promise that resolves with the Base64 string.
   */
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Handles the submission of a new chat message.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    let attachedData = undefined;
    if (attachment) {
      try {
        const base64Data = await convertFileToBase64(attachment);
        attachedData = {
          name: attachment.name,
          mimeType: attachment.type,
          data: base64Data
        };
      } catch (err) {
        console.error("Failed to process attachment", err);
      }
    }

    // Check if message is for BEEP
    if (input.includes('@BEEP') || attachedData) {
      onMentionAgent(input, attachedData);
    } else {
      onSendMessage(input);
    }

    setInput('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [input, attachment, onMentionAgent, onSendMessage]);

  /**
   * Handles sending a message that mentions BEEP via button.
   */
  const handleMention = useCallback(() => {
    void handleSubmit({ preventDefault: () => { } } as React.FormEvent); // Handle promise
  }, [handleSubmit]);

  /**
   * Handles the selection of a file for attachment.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  const mobileAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div
      {...(isMobile ? mobileAnimation : {})}
      className={`flex flex-col z-20 bg-panel-bg backdrop-blur-xl border-l border-glass-border high-density
                       ${isMobile ? 'fixed inset-0' : 'w-96 flex-shrink-0'}`}
    >
      <header className="p-4 border-b border-glass-border flex-shrink-0">
        <h2 className="font-comfortaa text-xl text-vitreous-white">Collaborate</h2>
        <p className="text-sm text-vitreous-white/50">{Object.keys(users).length} participant(s)</p>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} isSelf={msg.userId === self?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {attachment && (
        <div className="px-4 py-2 border-t border-glass-border bg-black/20 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-patina-green truncate">
            <PaperclipIcon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[200px]">{attachment.name}</span>
          </div>
          <button 
            onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} 
            className="text-text-tertiary hover:text-white"
            aria-label="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      <footer className="p-4 border-t border-glass-border flex-shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.txt,.md,.json,.csv,.jpg,.png"
            aria-label="Attach file"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or @BEEP..."
            className="w-full p-3 pl-10 pr-24 rounded-lg bg-conchoidal-gray text-vitreous-white border border-white/20 focus:ring-1 focus:ring-imperial-purple focus:border-imperial-purple"
            aria-label="Chat input"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors ${attachment ? 'text-patina-green' : 'text-text-tertiary'}`}
            title="Attach File"
            aria-label="Attach file"
          >
            <PaperclipIcon className="w-4 h-4" />
          </button>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <button 
              type="button" 
              onClick={handleMention} 
              title="Ask BEEP" 
              className="p-2 rounded-md bg-patina-green/80 text-white hover:bg-patina-green disabled:opacity-50" 
              disabled={!input.trim() && !attachment}
              aria-label="Mention BEEP"
            >
              @BEEP
            </button>
            <button 
              type="submit" 
              title="Send Message" 
              className="p-2 rounded-md bg-imperial-purple/80 text-white hover:bg-imperial-purple disabled:opacity-50" 
              disabled={!input.trim() && !attachment}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.026 16h1.948a1 1 0 00.753-.364l5-6.667a1 1 0 00-.63-1.681l-7-1.428a1 1 0 00-.094-1.995l7-1.428a1 1 0 00.995-1.169l-1.428-7A1 1 0 0010.894 2.553z" /></svg>
            </button>
          </div>
        </form>
      </footer>
    </motion.div>
  );
});
CollaborationPanel.displayName = 'CollaborationPanel';

export default CollaborationPanel;