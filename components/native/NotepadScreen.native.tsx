/**
 * @file NotepadScreen.native.tsx
 * @description React Native Notepad for the Sovereign.
 * Stores ephemeral context, drafting directives, and personal agentic notes.
 */

import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { GlassPane } from './GlassPane.native.js';

export function NotepadScreenNative() {
  const [text, setText] = useState('');
  return (
    <View style={styles.container}>
      <GlassPane style={styles.pane} borderColor="#6A0DAD">
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Draft thoughts for the Command Core..."
          placeholderTextColor="rgba(245, 255, 250, 0.3)"
          multiline
        />
      </GlassPane>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  pane: { flex: 1 },
  input: { color: '#F5FFFA', fontSize: 14, textAlignVertical: 'top', height: '100%' }
});
