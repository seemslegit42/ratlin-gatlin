/**
 * @file ProductionScreen.native.tsx
 * @description React Native Production, Inventory & Logistics screen for ΛΞVOS.
 * Monitors smart factory throughput, inventory velocity, and logistics tracking.
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';

export function ProductionScreenNative() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Production & Logistics Command</Text>
      <Text style={styles.subtitle}>Smart factory throughput monitoring and supply chain visualization.</Text>

      <GlassPane style={styles.pane} borderColor="#3EB991">
        <Text style={styles.paneTitle}>Throughput Metrics</Text>
        <Text style={styles.statValue}>1,402 <Text style={{fontSize: 12, opacity: 0.6}}>Units / Hour</Text></Text>
        <View style={styles.metricRow}>
            <Text style={styles.label}>Logistics Latency:</Text>
            <Text style={styles.val}>42 mins</Text>
        </View>
      </GlassPane>

      <GlassPane style={styles.pane} borderColor="#20B2AA">
        <Text style={styles.paneTitle}>Inventory Velocity</Text>
        <Text style={styles.label}>Current Stock Turn Ratio: 8.4x</Text>
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 110 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F5FFFA', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#F5FFFA', opacity: 0.6, marginBottom: 16 },
  pane: { marginBottom: 16 },
  paneTitle: { fontSize: 16, fontWeight: '700', color: '#F5FFFA', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#F5FFFA' },
  metricRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  label: { color: '#F5FFFA', opacity: 0.8 },
  val: { color: '#20B2AA', fontWeight: 'bold' }
});
