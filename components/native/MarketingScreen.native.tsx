/**
 * @file MarketingScreen.native.tsx
 * @description React Native Marketing War Room & Audience Prism screen for ΛΞVOS.
 * Tracks audience segmentation, campaign ROI, and autonomous persona dispatch.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import { useHaptics } from '../../hooks/native/useHaptics.native.js';

export function MarketingScreenNative() {
  const { glassThrum, notifyHarmonicSuccess } = useHaptics();

  const campaigns = [
    {
      id: 'c-1',
      title: 'Verdigris Interface Genesis',
      channel: 'Global Developer Swarm',
      conversionRate: '4.8%',
      spend: '$18,400',
      status: 'TRANSMITTING',
    },
    {
      id: 'c-2',
      title: 'Postman MCP Bridge Adoption',
      channel: 'API Architect Outreach',
      conversionRate: '6.2%',
      spend: '$12,100',
      status: 'ACTIVE',
    },
    {
      id: 'c-3',
      title: 'Turso SQLite Sovereignty',
      channel: 'Edge Computing Leaders',
      conversionRate: '3.9%',
      spend: '$9,800',
      status: 'QUEUED',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Marketing Ops & Campaign War Room</Text>
      <Text style={styles.subtitle}>
        Continuous audience prism indexing and automated conversion funnels.
      </Text>

      {/* Campaign Performance Metrics */}
      <GlassPane style={styles.pane} borderColor="#3EB991">
        <Text style={styles.paneTitle}>Syndicate Growth Velocity</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>+38.4%</Text>
            <Text style={styles.statLbl}>MoM Influx</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>$4.12</Text>
            <Text style={styles.statLbl}>Blended CAC</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>8.6x</Text>
            <Text style={styles.statLbl}>ROAS Multiplier</Text>
          </View>
        </View>
      </GlassPane>

      {/* Active Campaigns */}
      <GlassPane style={styles.pane} borderColor="#20B2AA">
        <Text style={styles.paneTitle}>Active War Room Campaigns</Text>
        {campaigns.map(camp => (
          <View key={camp.id} style={styles.campaignCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.campTitle}>{camp.title}</Text>
              <Text style={styles.campStatus}>{camp.status}</Text>
            </View>
            <Text style={styles.campChannel}>{camp.channel}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.metricItem}>
                Spend: <Text style={{ color: '#F5FFFA' }}>{camp.spend}</Text>
              </Text>
              <Text style={styles.metricItem}>
                Conv: <Text style={{ color: '#3EB991' }}>{camp.conversionRate}</Text>
              </Text>
            </View>
          </View>
        ))}

        <AcquisitionButton
          label="Synthesize AI Persona Campaign"
          variant="primary"
          onPress={() => {
            glassThrum();
            notifyHarmonicSuccess();
          }}
          style={{ marginTop: 8 }}
        />
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(62, 185, 145, 0.25)',
  },
  statVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3EB991',
  },
  statLbl: {
    fontSize: 10,
    color: '#F5FFFA',
    opacity: 0.6,
    marginTop: 2,
  },
  campaignCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  campTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5FFFA',
    flex: 1,
  },
  campStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#20B2AA',
  },
  campChannel: {
    fontSize: 11,
    color: '#F5FFFA',
    opacity: 0.6,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    fontSize: 11,
    color: 'rgba(245, 255, 250, 0.6)',
  },
});
