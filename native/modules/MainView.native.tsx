/**
 * @file MainView.native.tsx
 * @description React Native Main Dashboard for ΛΞVOS.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';

export function MainViewNative() {
  return (
    <View style={styles.container}>
      <GlassPane borderColor="#F5FFFA">
        <Text style={styles.title}>ΛΞVOS Dashboard</Text>
        <Text style={styles.text}>Core syndicate oversight.</Text>
      </GlassPane>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  text: { color: '#fff' }
});
