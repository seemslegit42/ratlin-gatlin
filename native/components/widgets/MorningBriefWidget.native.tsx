/**
 * @file MorningBriefWidget.native.tsx
 * @description React Native Morning Brief Widget for ΛΞVOS.
 * Summarizes syndicate status, liquidity reserves, and critical directives.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassPane } from '../GlassPane.native.js';

export function MorningBriefWidgetNative() {
  return (
    <GlassPane style={styles.container} borderColor="#20B2AA">
      <Text style={styles.title}>Morning Brief • Epoch 2026.10</Text>
      <Text style={styles.text}>
        "Entropy is low. Turso and Appwrite nodes operating within nominal thresholds. All 12 autonomous agent cohorts are synchronized."
      </Text>
    </GlassPane>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#20B2AA', marginBottom: 6 },
  text: { fontSize: 12, color: '#F5FFFA', opacity: 0.85, lineHeight: 16 },
});
