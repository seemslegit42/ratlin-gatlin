/**
 * @file hooks/useVoiceLink.ts
 * @description Web Speech API integration for live voice chat.
 * Supports speech-to-text (transcription) and voice command execution.
 * Falls back gracefully if browser doesn't support Web Speech API.
 */

import { useCallback, useState, useRef, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { ChatMessage, CurrentUser } from '../types.js';
import { MessageSource } from '../types.js';
import { logError, logVoiceEvent } from '../services/appLogger.js';

const SpeechRecognition = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

export const useVoiceLink = (
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  currentUser: CurrentUser | null,
  addNotification?: (msg: string, type?: 'success' | 'error' | 'info') => void,
  onVoiceCommand?: (command: string) => void
) => {
  const [isLive, setIsLive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const volumeAnimationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onVoiceCommandRef = useRef(onVoiceCommand);
  onVoiceCommandRef.current = onVoiceCommand;

  const pushSystemMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      id: `voice-${Date.now()}`,
      syndicateId: currentUser?.syndicateId || 'anonymous',
      content: text,
      text,
      source: MessageSource.SYSTEM,
      userName: 'System',
      timestamp: Date.now()
    }]);
  }, [setMessages, currentUser]);

  const pushUserMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      id: `user-voice-${Date.now()}`,
      syndicateId: currentUser?.syndicateId || 'anonymous',
      content: text,
      text,
      source: MessageSource.USER,
      userName: currentUser?.name || 'You',
      userColor: currentUser?.color || '#6A0DAD',
      timestamp: Date.now(),
      isInputTranscription: true
    }]);
  }, [setMessages, currentUser]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      logVoiceEvent('speech_api.unsupported', {});
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      logVoiceEvent('recognition.session_start', {});
      setIsLive(true);
      addNotification?.('Voice link active. Final phrases run as BEEP commands.', 'success');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const finalSegment = String(transcriptSegment || '').trim();
          if (!finalSegment) continue;
          setTranscript(prev => prev + finalSegment + ' ');
          const exec = onVoiceCommandRef.current;
          if (exec) {
            logVoiceEvent('voice.final_command_routed_beep', { chars: finalSegment.length });
            exec(finalSegment);
          } else {
            logVoiceEvent('voice.final_transcript_only', { chars: finalSegment.length });
            pushUserMessage(finalSegment);
          }
        } else {
          interimTranscript += transcriptSegment;
        }
      }
      const interimDebug =
        typeof import.meta !== 'undefined' &&
        (import.meta.env?.DEV === true || import.meta.env?.VITE_CLIENT_LOG_DEBUG === 'true');

      if (interimTranscript && interimDebug) {
        logVoiceEvent('voice.interim_transcript_debug', {
          peek: interimTranscript.slice(0, 80),
          chars: interimTranscript.length,
        });
      }
    };

    recognition.onerror = (event: any) => {
      logError('voice.recognition_stream_error', new Error(String(event.error)), {});
      addNotification?.(`Voice error: ${event.error}`, 'error');
    };

    recognition.onend = () => {
      logVoiceEvent('recognition.session_end', {});
      setIsLive(false);
      setVolume(0);
      if (volumeAnimationRef.current) clearInterval(volumeAnimationRef.current);
    };

    return () => {
      if (recognition) recognition.abort();
    };
  }, [addNotification, pushUserMessage]);

  const startLiveSession = useCallback(() => {
    if (!SpeechRecognition) {
      const msg = 'Web Speech API not supported. Voice chat unavailable on this browser.';
      addNotification?.(msg, 'error');
      pushSystemMessage(msg);
      return;
    }

    if (!recognitionRef.current) {
      const msg = 'Voice recognition not initialized.';
      addNotification?.(msg, 'error');
      return;
    }

    try {
      logVoiceEvent('voice.user_start_listen', {});
      recognitionRef.current.start();
      setTranscript('');
      
      // Simulate volume animation
      if (volumeAnimationRef.current) clearInterval(volumeAnimationRef.current);
      volumeAnimationRef.current = setInterval(() => {
        setVolume(prev => {
          const newVol = Math.random() * 100;
          return Math.min(newVol, 100);
        });
      }, 100);
    } catch (error) {
      logError('voice.start_listen_failed', error, {});
      addNotification?.('Failed to start voice chat.', 'error');
    }
  }, [addNotification, pushSystemMessage]);

  const stopLiveSession = useCallback(() => {
    logVoiceEvent('voice.user_stop_listen', {});
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsLive(false);
    setVolume(0);
    if (volumeAnimationRef.current) {
      clearInterval(volumeAnimationRef.current);
    }
  }, []);

  return { isLive, volume, startLiveSession, stopLiveSession, transcript };
};
