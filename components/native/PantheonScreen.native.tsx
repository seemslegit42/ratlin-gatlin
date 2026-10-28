/**
 * @file PantheonScreen.native.tsx
 * @description React Native Pantheon & Demiurge Console for ΛΞVOS.
 * Provides ascension rites, governance voting, and divine archetype supervision.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import * as Haptics from 'expo-haptics';

export function PantheonScreenNative() {
  const [activeShard, setActiveShard] = useState<string | null>(null);

  const shards = [
    {
      id: 'shard-logos',
      name: 'Shard of Logos',
      domain: 'Universal Logic & Turso State',
      affinity: '100%',
      color: '#20B2AA',
      desc: 'Enforces cold mathematical purity across agent workflows and deterministic queries.',
    },
    {
      id: 'shard-nomos',
      name: 'Shard of Nomos',
      domain: 'Governance & Constitution',
      affinity: '94%',
      color: '#3EB991',
      desc: 'Maintains compliance, multi-tenancy boundaries, and team permissions in Appwrite.',
    },
    {
      id: 'shard-kairos',
      name: 'Shard of Kairos',
      domain: 'Market Timing & Capital Flow',
      affinity: '88%',
      color: '#6A0DAD',
      desc: 'Controls CEVM liquidity triggers, automated payroll runs, and deal finality.',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>The Pantheon & Demiurge</Text>
      <Text style={styles.subtitle}>
        Divine archetypes supervising sovereign syndicate execution.
      </Text>

      {shards.map(shard => (
        <GlassPane
          key={shard.id}
          style={styles.pane}
          borderColor={shard.color}
        >
          <View style={styles.shardHeader}>
            <View>
              <Text style={[styles.shardName, { color: shard.color }]}>
                {shard.name}
              </Text>
              <Text style={styles.shardDomain}>{shard.domain}</Text>
            </View>
            <View style={[styles.affinityBadge, { borderColor: shard.color }]}>
              <Text style={[styles.affinityText, { color: shard.color }]}>
                {shard.affinity}
              </Text>
            </View>
          </View>

          <Text style={styles.shardDesc}>{shard.desc}</Text>

          <AcquisitionButton
            label={activeShard === shard.id ? 'Attuned' : 'Attune Shard'}
            variant={activeShard === shard.id ? 'secondary' : 'primary'}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveShard(shard.id);
            }}
            style={{ marginTop: 8 }}
          />
        </GlassPane>
      ))}
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
  shardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  shardName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shardDomain: {
    fontSize: 11,
    color: '#F5FFFA',
    opacity: 0.6,
    marginTop: 2,
  },
  affinityBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  affinityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  shardDesc: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.8,
    lineHeight: 16,
    marginBottom: 10,
  },
});
