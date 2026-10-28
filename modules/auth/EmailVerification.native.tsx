/**
 * @file EmailVerification.native.tsx
 * @description React Native email verification component for ΛΞVOS.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';
import { AcquisitionButton } from '../../components/native/AcquisitionButton.native.js';
import { BrandSignature } from '../../components/native/BrandSignature.native.js';
import { useHaptics } from '../../hooks/native/useHaptics.native.js';

export function EmailVerificationNative() {
  const { glassThrum } = useHaptics();

  return (
    <SafeAreaView style={styles.container}>
      <GlassPane style={styles.pane} borderColor="#3EB991">
        <Text style={styles.title}>Awaiting Verification</Text>
        <Text style={styles.description}>
          A digital seal has been dispatched to your identity mailbox. Confirm to proceed.
        </Text>
        <AcquisitionButton
          label="Resend Digital Seal"
          variant="secondary"
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
  brand: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
