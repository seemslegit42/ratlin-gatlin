/**
 * @file VeinMonitor.native.tsx
 * @description Bio-Digital Logic component for React Native.
 * Implements "The Vein" — breathing and pulsing system health visualization.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

interface VeinMonitorProps {
  loadPercentage?: number;
  errorRate?: number;
  label?: string;
}

export const VeinMonitor: React.FC<VeinMonitorProps> = ({
  loadPercentage = 24,
  errorRate = 0,
  label = 'Aetheric Vein (Turso & Appwrite Core)',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const jitterAnim = useRef(new Animated.Value(0)).current;

  const isUnderLoad = loadPercentage > 80;
  const isErrorState = errorRate > 0.01;

  useEffect(() => {
    const pulseDuration = isUnderLoad ? 300 : 1200;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    let jitterInterval: any = null;
    if (isErrorState) {
      jitterInterval = setInterval(() => {
        const offset = (Math.random() - 0.5) * 2;
        Animated.timing(jitterAnim, {
          toValue: offset,
          duration: 50,
          useNativeDriver: true,
        }).start();
      }, 100);
    } else {
      jitterAnim.setValue(0);
    }

    return () => {
      pulse.stop();
      if (jitterInterval) clearInterval(jitterInterval);
    };
  }, [isUnderLoad, isErrorState]);

  const veinColor = isUnderLoad ? '#6A0DAD' : '#3EB991'; // Imperial Purple under load, Patina Green when healthy
  const strokeHeight = isUnderLoad ? 2 : 4;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.statusText, { color: veinColor }]}>
          {isUnderLoad ? 'HYPERVENTILATION' : 'RESONANT'} ({loadPercentage}%)
        </Text>
      </View>
      <Animated.View
        style={[
          styles.veinTrack,
          {
            opacity: pulseAnim,
            transform: [{ translateX: jitterAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.veinCore,
            {
              backgroundColor: veinColor,
              height: strokeHeight,
              shadowColor: veinColor,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#F5FFFA',
    opacity: 0.7,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  veinTrack: {
    height: 6,
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 255, 250, 0.05)',
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  veinCore: {
    borderRadius: 2,
    width: '100%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
