/**
 * @file SecurityScreen.native.tsx
 * @description React Native Security & Threat Map screen for ΛΞVOS.
 * Monitors Aegis security sentinels, unauthorized access attempts, and encryption seals.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import { useHaptics } from '../../hooks/native/useHaptics.native.js';

export function SecurityScreenNative() {
  const { glassThrum, notifyHarmonicSuccess } = useHaptics();
  const [threatLevel, setThreatLevel] = useState<'LOW' | 'ELEVATED' | 'CRITICAL'>('LOW');

  const threats = [
    {
      id: 'th-1',
      source: '198.51.100.24',
      type: 'GraphQL Introspection Probe',
      status: 'NEUTRALIZED',
      time: '2m ago',
    },
    {
      id: 'th-2',
      source: 'Internal Worker Node 3',
      type: 'Abnormal libSQL Batch Volume',
      status: 'QUARANTINED',
      time: '14m ago',
    },
    {
      id: 'th-3',
      source: '203.0.113.89',
      type: 'OAuth 2.1 Credential Stuffing',
      status: 'BLOCKED',
      time: '1h ago',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Aegis Security Sentinel</Text>
      <Text style={styles.subtitle}>
        Real-time telemetry and intrusion countermeasures.
      </Text>

      {/* Threat Level GlassPane */}
      <GlassPane
        style={styles.pane}
        borderColor={threatLevel === 'LOW' ? '#3EB991' : '#EF4444'}
      >
        <Text style={styles.paneTitle}>Defensive Posture</Text>
        <View style={styles.postureRow}>
          <Text style={styles.postureLabel}>Current Threat Level:</Text>
          <Text
            style={[
              styles.postureValue,
              { color: threatLevel === 'LOW' ? '#3EB991' : '#EF4444' },
            ]}
          >
            {threatLevel}
          </Text>
        </View>

        <View style={styles.securityStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>TLS 1.3 Strict</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>Zero</Text>
            <Text style={styles.statLabel}>Breaches</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>Active</Text>
            <Text style={styles.statLabel}>OAuth Guard</Text>
          </View>
        </View>

        <AcquisitionButton
          label="Rotate Syndicate Encryption Keys"
          variant="primary"
          onPress={() => {
            glassThrum();
            notifyHarmonicSuccess();
          }}
          style={{ marginTop: 12 }}
        />
      </GlassPane>

      {/* Threat Interception Log */}
      <GlassPane style={styles.pane} borderColor="#6A0DAD">
        <Text style={styles.paneTitle}>Neutralized Intrusions</Text>
        {threats.map(threat => (
          <View key={threat.id} style={styles.threatRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.threatType}>{threat.type}</Text>
              <Text style={styles.threatSource}>
                {threat.source} • {threat.time}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{threat.status}</Text>
            </View>
          </View>
        ))}
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
  postureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postureLabel: {
    fontSize: 13,
    color: '#F5FFFA',
    opacity: 0.8,
  },
  postureValue: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  securityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.1)',
  },
  statNum: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3EB991',
  },
  statLabel: {
    fontSize: 9,
    color: '#F5FFFA',
    opacity: 0.6,
    marginTop: 2,
  },
  threatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 255, 250, 0.08)',
  },
  threatType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5FFFA',
  },
  threatSource: {
    fontSize: 11,
    color: '#20B2AA',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: 'rgba(62, 185, 145, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3EB991',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#3EB991',
  },
});
