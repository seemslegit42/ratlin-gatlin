/**
 * @file CRMScreen.native.tsx
 * @description React Native CRM & Deal Pipeline screen for ΛΞVOS.
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export function CRMScreenNative() {
  const deals = [
    { id: '1', title: 'Aetherium Syndicate Expansion', value: '$250,000', stage: 'Negotiation' },
    { id: '2', title: 'Verdigris Node Deployment', value: '$120,000', stage: 'Closing' },
    { id: '3', title: 'Turso Database Migration', value: '$85,000', stage: 'Discovery' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Syndicate CRM Pipeline</Text>
      <Text style={styles.subtitle}>High-value deals and strategic relationship matrix.</Text>

      {deals.map(deal => (
        <TouchableOpacity 
          key={deal.id} 
          style={styles.card}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.dealTitle}>{deal.title}</Text>
            <Text style={styles.dealValue}>{deal.value}</Text>
          </View>
          <Text style={styles.dealStage}>Stage: {deal.stage}</Text>
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
    borderColor: 'rgba(106, 13, 173, 0.4)', // Imperial Purple accent
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dealTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5FFFA',
    flex: 1,
    marginRight: 10,
  },
  dealValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3EB991', // Patina Green
  },
  dealStage: {
    fontSize: 12,
    color: '#20B2AA', // Roman Aqua
    fontWeight: '500',
  },
});
