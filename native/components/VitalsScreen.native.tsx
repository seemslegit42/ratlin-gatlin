/**
 * @file VitalsScreen.native.tsx
 * @description React Native System Vitals HUD for ΛΞVOS.
 * Displays real-time bio-digital vein diagnostics, swarm integrity, and edge metrics.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { VeinMonitor } from './VeinMonitor.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import * as Haptics from 'expo-haptics';

export function VitalsScreenNative() {
  const [load, setLoad] = useState(28);
  const [errorRate, setErrorRate] = useState(0);

  const simulateSpike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoad(prev => (prev === 28 ? 89 : 28));
  };

  const simulateError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setErrorRate(prev => (prev === 0 ? 0.04 : 0));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>System Vitals HUD</Text>
      <Text style={styles.subtitle}>
        Bio-Digital telemetric resonance across Appwrite 2.0 & Turso nodes.
      </Text>

      {/* The Vein Bio-Digital Logic */}
      <GlassPane style={styles.pane} borderColor={load > 80 ? '#6A0DAD' : '#3EB991'}>
        <Text style={styles.paneTitle}>Bio-Digital Resonator</Text>
        <VeinMonitor
          label="Sovereign Core System Vein"
          loadPercentage={load}
          errorRate={errorRate}
        />
        <View style={styles.buttonRow}>
          <AcquisitionButton
            label={load > 80 ? 'Normalize Pulse' : 'Simulate Heavy Load'}
            variant={load > 80 ? 'secondary' : 'primary'}
            onPress={simulateSpike}
            style={styles.actionBtn}
          />
          <AcquisitionButton
            label={errorRate > 0 ? 'Clear Anomaly' : 'Trigger Anomaly'}
            variant="danger"
            onPress={simulateError}
            style={styles.actionBtn}
          />
        </View>
      </GlassPane>

      {/* Swarm & Node Integrity */}
      <GlassPane style={styles.pane} borderColor="#20B2AA">
        <Text style={styles.paneTitle}>Swarm Node Topology</Text>
        
        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>99.98%</Text>
            <Text style={styles.statLabel}>Uptime SLA</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>11 ms</Text>
            <Text style={styles.statLabel}>Turso Latency</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Anomalies</Text>
          </View>
        </View>

        <View style={styles.networkList}>
          <View style={styles.networkItem}>
            <Text style={styles.networkName}>Appwrite 2.0 Native PostgreSQL (Port 5432)</Text>
            <Text style={styles.networkStatus}>ACTIVE</Text>
          </View>
          <View style={styles.networkItem}>
            <Text style={styles.networkName}>Turso Edge AgentFS Database-per-Tenant</Text>
            <Text style={styles.networkStatus}>SYNCHRONIZED</Text>
          </View>
          <View style={styles.networkItem}>
            <Text style={styles.networkName}>BEEP Execution Engine & LLM Gateway</Text>
            <Text style={styles.networkStatus}>OPERATIONAL</Text>
          </View>
          <View style={styles.networkItem}>
            <Text style={styles.networkName}>Stripe Connect Automated Treasury Escrow</Text>
            <Text style={styles.networkStatus}>ENCRYPTED</Text>
          </View>
        </View>
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 110,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5FFFA',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.6,
    marginBottom: 16,
  },
  pane: {
    marginBottom: 16,
  },
  paneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5FFFA',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.25)',
  },
  statNum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3EB991',
  },
  statLabel: {
    fontSize: 10,
    color: '#F5FFFA',
    opacity: 0.6,
    marginTop: 2,
  },
  networkList: {
    marginTop: 8,
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 255, 250, 0.08)',
  },
  networkName: {
    fontSize: 11,
    color: '#F5FFFA',
    opacity: 0.8,
    flex: 1,
  },
  networkStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#20B2AA',
    marginLeft: 8,
  },
});
