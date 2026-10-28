/**
 * @file BrandSignature.native.tsx
 * @description Mandatory Brand Signature for the Verdigris Interface Protocol™ in React Native.
 * Anchors the interface with lxv Inc. certification.
 */

import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';

interface BrandSignatureProps {
  style?: StyleProp<ViewStyle>;
}

export const BrandSignature: React.FC<BrandSignatureProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Text style={styles.line1}>lxv Inc.</Text>
      <Text style={styles.line2}>The Future Needs Context</Text>
      <Text style={styles.line3}>Innovate, Automate, Dominate</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    opacity: 0.45,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  line1: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F5FFFA',
    letterSpacing: 1,
  },
  line2: {
    fontSize: 8,
    color: '#20B2AA',
    letterSpacing: 1.5,
    marginTop: 1,
  },
  line3: {
    fontSize: 7,
    color: '#3EB991',
    letterSpacing: 1.2,
    marginTop: 0.5,
  },
});
