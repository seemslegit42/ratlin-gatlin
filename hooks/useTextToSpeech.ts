import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * A custom hook for handling Text-to-Speech functionality using the Web Speech API.
 * It provides a function to play synthesized speech, stop playback, and track speaking state.
 *
 * @param isMuted A boolean to control whether the audio should play.
 * @returns An object containing `playSpeech`, `stopSpeech`, and `isSpeaking`.
 */
export const useTextToSpeech = (isMuted: boolean) => {
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    /**
     * Stops the currently playing audio immediately.
     */
    const stopSpeech = useCallback(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel();
        currentUtteranceRef.current = null;
        setIsSpeaking(false);
    }, []);

    /**
     * Generates and plays audio from the provided text.
     * Stops any currently playing audio to prevent overlapping speech.
     * @param text The string to be converted to speech.
     */
    const playSpeech = useCallback((text: string) => {
        if (isMuted || !text) return;
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        stopSpeech();
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtteranceRef.current = utterance;
        setIsSpeaking(true);

        utterance.onend = () => {
            if (currentUtteranceRef.current === utterance) {
                setIsSpeaking(false);
                currentUtteranceRef.current = null;
            }
        };
        utterance.onerror = () => {
            if (currentUtteranceRef.current === utterance) {
                setIsSpeaking(false);
                currentUtteranceRef.current = null;
            }
        };

        window.speechSynthesis.speak(utterance);
    }, [isMuted, stopSpeech]);

    // Stop speech if muted toggles to true
    useEffect(() => {
        if (isMuted) {
            stopSpeech();
        }
    }, [isMuted, stopSpeech]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, [stopSpeech]);

    return { playSpeech, stopSpeech, isSpeaking };
};
