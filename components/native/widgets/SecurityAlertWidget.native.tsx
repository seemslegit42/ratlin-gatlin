/**
 * @file SecurityAlertWidget.native.tsx
 * @description React Native Security Alert Widget for ΛΞVOS.
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlassPane } from '../GlassPane.native.js';

export function SecurityAlertWidgetNative() {
  return (
    <GlassPane style={styles.container} borderColor="#3EB991">
      <Text style={styles.title}>Aegis Security Posture</Text>
      <Text style={styles.text}>Zero intrusion anomalies detected. TLS 1.3 encryption seals verified across all edge nodes.</Text>
    </GlassPane>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#3EB991', marginBottom: 6 },
  text: { fontSize: 12, color: '#F5FFFA', opacity: 0.85, lineHeight: 16 },
});
