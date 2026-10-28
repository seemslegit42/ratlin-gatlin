/**
 * @file PasswordRecovery.native.tsx
 * @description React Native password recovery component for ΛΞVOS.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';
import { AcquisitionButton } from '../../components/native/AcquisitionButton.native.js';
import { BrandSignature } from '../../components/native/BrandSignature.native.js';
import { useHaptics } from '../../hooks/native/useHaptics.native.js';

export function PasswordRecoveryNative() {
  const { glassThrum } = useHaptics();
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <GlassPane style={styles.pane} borderColor="#6A0DAD">
        <Text style={styles.title}>Recovery Protocol</Text>
        <Text style={styles.description}>
          If you have lost your credentials, initiate recovery to reset the seal.
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Registered Identity Email"
          placeholderTextColor="rgba(245, 255, 250, 0.4)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <AcquisitionButton
          label="Dispatch Recovery Pulse"
          variant="primary"
          onPress={() => glassThrum()}
        />
      </GlassPane>
      <BrandSignature style={styles.brand} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    padding: 20,
  },
  pane: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5FFFA',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#F5FFFA',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.1)',
    borderRadius: 10,
    padding: 14,
    color: '#F5FFFA',
    marginBottom: 16,
  },
  brand: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
