/**
 * @file AuthView.native.tsx
 * @description React Native Authentication module for ΛΞVOS.
 * Manages email/password sessions, team verification, and secure entry.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { GlassPane } from '../../components/native/GlassPane.native.js';
import { AcquisitionButton } from '../../components/native/AcquisitionButton.native.js';
import { useAppwriteAuth } from '../../hooks/native/useAppwriteAuth.native.js';

export function AuthViewNative({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithEmail, isLoading } = useAppwriteAuth();

  const handleLogin = async () => {
    const result = await loginWithEmail(email, password);
    if (result.success) {
      onLoginSuccess();
    }
  };

  return (
    <View style={styles.container}>
      <GlassPane borderColor="#20B2AA">
        <Text style={styles.title}>ΛΞVOS Entry Protocol</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#666" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#666" />
        <AcquisitionButton label="Verify Credential" onPress={handleLogin} disabled={isLoading} />
      </GlassPane>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#20B2AA', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' }
});
