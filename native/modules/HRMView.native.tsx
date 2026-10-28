/**
 * @file HRMView.native.tsx
 * @description React Native HRM and Talent Constellation module.
 */

import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';

export function HRMViewNative() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Talent Constellation</Text>
      <GlassPane borderColor="#20B2AA">
        <Text style={styles.text}>Headcount analytics and talent resource optimization.</Text>
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, color: '#20B2AA', fontWeight: 'bold', marginBottom: 10 },
  text: { color: '#fff' }
});
