/**
 * @file GlassPane.native.tsx
 * @description Fundamental atom of the Verdigris Interface Protocol™ in React Native.
 * Mimics Ancient Roman Glass with luminous imperfection, depth, and tactile border glow.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface GlassPaneProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassPane: React.FC<GlassPaneProps> = ({
  children,
  style,
  borderColor = 'rgba(245, 255, 250, 0.25)',
  intensity = 'medium',
}) => {
  const bgOpacity = intensity === 'low' ? 0.05 : intensity === 'high' ? 0.2 : 0.12;

  return (
    <View
      style={[
        styles.pane,
        {
          backgroundColor: `rgba(245, 255, 250, ${bgOpacity})`,
          borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  pane: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#1C1934',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
});
