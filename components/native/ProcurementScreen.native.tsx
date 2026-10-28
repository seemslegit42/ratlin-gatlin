/**
 * @file ProcurementScreen.native.tsx
 * @description React Native Procurement & Supplier Risk Management screen for ΛΞVOS.
 * Monitors purchase orders, supplier risk matrices, and spend analytics.
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import { useHaptics } from '../../hooks/native/useHaptics.native.js';

export function ProcurementScreenNative() {
  const { glassThrum } = useHaptics();

  const pos = [
    { id: 'po-1', supplier: 'Aetherium Supply Co.', total: '$42,500', status: 'SHIPPED' },
    { id: 'po-2', supplier: 'Verdigris Node Fabs', total: '$18,200', status: 'PENDING' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Procurement & Supplier Risk</Text>
      <Text style={styles.subtitle}>Automated purchase order lifecycle and supplier risk analysis.</Text>

      <GlassPane style={styles.pane} borderColor="#6A0DAD">
        <Text style={styles.paneTitle}>Spend Analytics</Text>
        <Text style={styles.statValue}>$184,500 <Text style={{fontSize: 12, opacity: 0.6}}>YTD Spend</Text></Text>
        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>Average Supplier Risk:</Text>
          <Text style={[styles.riskValue, {color: '#3EB991'}]}>LOW (0.12)</Text>
        </View>
      </GlassPane>

      <GlassPane style={styles.pane} borderColor="#20B2AA">
        <Text style={styles.paneTitle}>Active Purchase Orders</Text>
        {pos.map(po => (
          <View key={po.id} style={styles.poCard}>
            <View>
              <Text style={styles.poSupplier}>{po.supplier}</Text>
              <Text style={styles.poTotal}>{po.total}</Text>
            </View>
            <View style={[styles.statusPill, {borderColor: po.status === 'SHIPPED' ? '#3EB991' : '#20B2AA'}]}>
              <Text style={[styles.statusText, {color: po.status === 'SHIPPED' ? '#3EB991' : '#20B2AA'}]}>{po.status}</Text>
            </View>
          </View>
        ))}
        <AcquisitionButton label="Create New Purchase Order" variant="primary" onPress={glassThrum} style={{marginTop: 10}} />
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 110 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F5FFFA', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#F5FFFA', opacity: 0.6, marginBottom: 16 },
  pane: { marginBottom: 16 },
  paneTitle: { fontSize: 16, fontWeight: '700', color: '#F5FFFA', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#F5FFFA' },
  riskRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  riskLabel: { color: '#F5FFFA', opacity: 0.8 },
  riskValue: { fontWeight: 'bold' },
  poCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 8, marginBottom: 8 },
  poSupplier: { fontWeight: '600', color: '#F5FFFA' },
  poTotal: { color: '#20B2AA', fontWeight: 'bold' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' }
});
