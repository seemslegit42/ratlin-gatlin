/**
 * @file AdminView.native.tsx
 * @description React Native Admin Console for ΛΞVOS system infrastructure.
 */

import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';

export function AdminViewNative() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Demiurge Console</Text>
      <GlassPane borderColor="#6A0DAD">
        <Text style={styles.text}>Infrastructure control panel for syndicate admins.</Text>
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, color: '#6A0DAD', fontWeight: 'bold', marginBottom: 10 },
  text: { color: '#fff' }
});
