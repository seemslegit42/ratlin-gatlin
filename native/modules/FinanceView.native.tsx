/**
 * @file FinanceView.native.tsx
 * @description React Native Finance/Treasury Dashboard for ΛΞVOS.
 */

import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';

export function FinanceViewNative() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Treasury Ledger</Text>
      <GlassPane borderColor="#3EB991">
        <Text style={styles.text}>Real-time general ledger and financial health diagnostics.</Text>
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, color: '#3EB991', fontWeight: 'bold', marginBottom: 10 },
  text: { color: '#fff' }
});
