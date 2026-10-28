/**
 * @file FlowLiquidTransfer.native.tsx
 * @description Bio-Digital Logic instrument: "The Flow" (Data Transfer).
 * Implements fluid dynamics with wave animation and viscosity correlating to payload weight.
 * Light payload: fast, thin liquid (Roman Aqua). Heavy payload: thick, slow liquid (Patina Green).
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';

interface FlowLiquidTransferProps {
  progressPercent: number; // 0 to 100
  fileSizeBytes: number; // Bytes of transfer
  label?: string;
}

export const FlowLiquidTransfer: React.FC<FlowLiquidTransferProps> = ({
  progressPercent = 65,
  fileSizeBytes = 4500000,
  label = 'Agent Knowledge Transfer',
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;

  // Heavy files (> 2MB) = slow, viscous Patina Green. Light files = fast Roman Aqua.
  const isHeavy = fileSizeBytes > 2000000;
  const waveSpeed = isHeavy ? 2800 : 1200;
  const liquidColor = isHeavy ? '#3EB991' : '#20B2AA';

  useEffect(() => {
    // Wave oscillation loop
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: waveSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: waveSpeed,
          useNativeDriver: true,
        }),
      ])
    );
    waveLoop.start();

    // Height fill animation
    Animated.timing(fillAnim, {
      toValue: Math.min(100, Math.max(0, progressPercent)),
      duration: 600,
      useNativeDriver: false,
    }).start();

    return () => waveLoop.stop();
  }, [progressPercent, waveSpeed]);

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.progressText, { color: liquidColor }]}>
          {Math.round(progressPercent)}% • {(fileSizeBytes / 1000000).toFixed(1)}MB
        </Text>
      </View>

      <View style={styles.liquidTank}>
        <Animated.View
          style={[
            styles.liquidFill,
            {
              backgroundColor: liquidColor,
              height: fillAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.waveCrest,
              {
                backgroundColor: isHeavy ? '#2a8b6c' : '#17837d',
                transform: [{ translateX: waveTranslateX }],
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#F5FFFA',
    opacity: 0.8,
  },
  progressText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  liquidTank: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.2)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  liquidFill: {
    width: '100%',
    opacity: 0.85,
    overflow: 'hidden',
  },
  waveCrest: {
    height: 6,
    width: '150%',
    borderRadius: 3,
    opacity: 0.7,
  },
});
