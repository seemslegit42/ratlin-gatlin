/**
 * @file HelpScreen.native.tsx
 * @description Help and documentation for the ΛΞVOS Mobile interface.
 */

import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';

export function HelpScreenNative() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>System Documentation</Text>
      <GlassPane style={styles.pane} borderColor="#3EB991">
        <Text style={styles.text}>The Handheld Artifact is designed for high-fidelity agentic control. Use the Command Core for all natural language tasks.</Text>
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F5FFFA', marginBottom: 16 },
  pane: { marginBottom: 16 },
  text: { color: '#F5FFFA', opacity: 0.8 }
});
