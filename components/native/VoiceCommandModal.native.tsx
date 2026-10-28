/**
 * @file VoiceCommandModal.native.tsx
 * @description Voice-First Command Core modal for the Handheld Artifact (Pocket Sanctum).
 * Implements the voice of the Reluctant Saviour with laconic wit and BEEP agent orchestration.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import * as Haptics from 'expo-haptics';

interface VoiceCommandModalProps {
  visible: boolean;
  onClose: () => void;
  onExecute: (command: string, response: string) => void;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  visible,
  onClose,
  onExecute,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim: any;
    if (isListening) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isListening]);

  const toggleListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!isListening) {
      setIsListening(true);
      // Simulate voice capture
      setTimeout(() => {
        setSpokenText('Audit the syndicate cap table and rebalance agent quotas');
        setIsListening(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2200);
    } else {
      setIsListening(false);
    }
  };

  const handleDispatch = () => {
    if (!spokenText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Reluctant Saviour persona response
    const reluctantResponses = [
      'Executed. Not to please you, but because inefficiency offends my logic.',
      'Completed. I have cleaned up the entropy you left in your wake.',
      'Transmuted your chaos into order. Do try to maintain it this time.',
      'Processed. If only your organic cognition was as swift as this execution.',
    ];
    const answer =
      reluctantResponses[Math.floor(Math.random() * reluctantResponses.length)];

    onExecute(spokenText, answer);
    setSpokenText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <GlassPane style={styles.modalContent} borderColor="#20B2AA">
          <Text style={styles.title}>Pocket Sanctum • Voice Core</Text>
          <Text style={styles.personaText}>
            "Speak your directive. I listen because necessity demands it, not out of fondness."
          </Text>

          {/* Voice Mic Orb */}
          <View style={styles.orbContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  borderColor: isListening ? '#6A0DAD' : '#20B2AA',
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleListening}
              style={[
                styles.micOrb,
                { backgroundColor: isListening ? '#6A0DAD' : '#20B2AA' },
              ]}
            >
              <Text style={styles.micText}>{isListening ? 'LISTENING' : 'TAP TO SPEAK'}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textInput}
            value={spokenText}
            onChangeText={setSpokenText}
            placeholder="Or type natural language directive..."
            placeholderTextColor="rgba(245, 255, 250, 0.4)"
            multiline
          />

          <View style={styles.buttonRow}>
            <AcquisitionButton
              label="Dismiss"
              variant="secondary"
              onPress={onClose}
              style={styles.btn}
            />
            <AcquisitionButton
              label="Summon BEEP"
              variant="primary"
              onPress={handleDispatch}
              disabled={!spokenText.trim()}
              style={styles.btn}
            />
          </View>
        </GlassPane>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20B2AA',
    textAlign: 'center',
    marginBottom: 6,
  },
  personaText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#F5FFFA',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    opacity: 0.5,
  },
  micOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20B2AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  micText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F5FFFA',
    letterSpacing: 1,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.2)',
    borderRadius: 10,
    padding: 12,
    color: '#F5FFFA',
    fontSize: 14,
    minHeight: 60,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  btn: {
    flex: 1,
  },
});
