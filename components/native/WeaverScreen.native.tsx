/**
 * @file WeaverScreen.native.tsx
 * @description React Native Agent Weaver screen for ΛΞVOS.
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export function WeaverScreenNative() {
  const agents = [
    { id: '1', name: 'Demiurge Core', role: 'Syndicate Director', status: 'Active' },
    { id: '2', name: 'Aegis Sentinel', role: 'Security & Compliance', status: 'Watching' },
    { id: '3', name: 'Klepsydra Ledger', role: 'Treasury & CEVM', status: 'Synchronized' },
    { id: '4', name: 'Weaver Prime', role: 'Pipeline Orchestrator', status: 'Active' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agent Weaver Constellation</Text>
      <Text style={styles.subtitle}>Autonomous syndicate crew status and libSQL node sync.</Text>

      {agents.map(agent => (
        <TouchableOpacity 
          key={agent.id} 
          style={styles.card}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.agentName}>{agent.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{agent.status}</Text>
            </View>
          </View>
          <Text style={styles.agentRole}>{agent.role}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(245, 255, 250, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.3)',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20B2AA',
  },
  badge: {
    backgroundColor: 'rgba(62, 185, 145, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3EB991',
  },
  badgeText: {
    fontSize: 10,
    color: '#3EB991',
    fontWeight: '600',
  },
  agentRole: {
    fontSize: 13,
    color: '#F5FFFA',
    opacity: 0.8,
  },
});
