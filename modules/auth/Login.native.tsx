/**
 * @file Login.native.tsx
 * @description React Native Login screen for ΛΞVOS.
 * Gateway to the Handheld Artifact, protected by Appwrite 2.0 Auth.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';
import { AcquisitionButton } from '../../components/native/AcquisitionButton.native.js';
import { BrandSignature } from '../../components/native/BrandSignature.native.js';
import { useAppwriteAuth } from '../../hooks/native/useAppwriteAuth.native.js';
import { useHaptics } from '../../hooks/native/useHaptics.native.js';

export function LoginNative() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithEmail, isLoading } = useAppwriteAuth();
  const { breakGlassSeal, notifyDissonantError } = useHaptics();

  const handleLogin = async () => {
    if (!email || !password) return;
    
    const result = await loginWithEmail(email, password);
    if (result.success) {
      breakGlassSeal();
    } else {
      notifyDissonantError();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlassPane style={styles.loginPane} borderColor="#20B2AA">
        <Text style={styles.logo}>ΛΞVOS</Text>
        <Text style={styles.title}>Handheld Artifact Access</Text>
        <Text style={styles.description}>Authenticate with your Syndicate Credentials to initialize the Pocket Sanctum.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email/Identity"
          placeholderTextColor="rgba(245, 255, 250, 0.4)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="rgba(245, 255, 250, 0.4)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AcquisitionButton
          label={isLoading ? 'Authenticating...' : 'Break Glass Seal'}
          variant="primary"
          onPress={handleLogin}
          disabled={isLoading}
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
  loginPane: {
    padding: 24,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#20B2AA',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5FFFA',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#F5FFFA',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.1)',
    borderRadius: 10,
    padding: 14,
    color: '#F5FFFA',
    fontSize: 14,
    marginBottom: 12,
  },
  brand: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
