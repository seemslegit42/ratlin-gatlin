/**
 * @file EconomyScreen.native.tsx
 * @description React Native Economy, Treasury & CEVM Calculator for ΛΞVOS.
 * Provides live runway, revenue velocity, and tokenized syndicate allocation.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import * as Haptics from 'expo-haptics';

export function EconomyScreenNative() {
  const [valuationMultiple, setValuationMultiple] = useState('14');
  const [monthlyBurn, setMonthlyBurn] = useState('64200');
  const [cashReserve, setCashReserve] = useState('4892104');

  const runwayMonths = Math.floor(
    (parseFloat(cashReserve) || 0) / (parseFloat(monthlyBurn) || 1)
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Syndicate Treasury & CEVM</Text>
      <Text style={styles.subtitle}>
        Continuous Economic Value Modeling & Turso-isolated tenant ledger.
      </Text>

      {/* Primary Vitals GlassPane */}
      <GlassPane style={styles.pane} borderColor="#3EB991">
        <Text style={styles.paneTitle}>Capital Runway & Reserves</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Treasury Balance</Text>
            <Text style={styles.metricValue}>
              ${Number(cashReserve).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Runway Runway</Text>
            <Text style={[styles.metricValue, { color: '#20B2AA' }]}>
              {runwayMonths} Mo
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Current Mo. Burn</Text>
            <Text style={[styles.metricValue, { color: '#EF4444' }]}>
              -${Number(monthlyBurn).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>ARR Velocity</Text>
            <Text style={[styles.metricValue, { color: '#3EB991' }]}>
              +$1.84M
            </Text>
          </View>
        </View>
      </GlassPane>

      {/* CEVM Modeling Pane */}
      <GlassPane style={styles.pane} borderColor="#6A0DAD">
        <Text style={styles.paneTitle}>CEVM Simulation Modeler</Text>
        <Text style={styles.paneDescription}>
          Tune synthetic syndicate multiplier and stress-test liquid reserves.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Valuation Multiplier (xARR)</Text>
          <TextInput
            style={styles.textInput}
            value={valuationMultiple}
            onChangeText={setValuationMultiple}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Target Monthly Burn ($)</Text>
          <TextInput
            style={styles.textInput}
            value={monthlyBurn}
            onChangeText={setMonthlyBurn}
            keyboardType="numeric"
          />
        </View>

        <AcquisitionButton
          label="Recalculate Metronome Equilibrium"
          variant="primary"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          style={{ marginTop: 12 }}
        />
      </GlassPane>

      {/* Syndicate Instruments */}
      <GlassPane style={styles.pane}>
        <Text style={styles.paneTitle}>Folly Instruments & Sovereign Debt</Text>
        <View style={styles.instrumentRow}>
          <Text style={styles.instrumentName}>Alberta Tech Tax Credit (AITC)</Text>
          <Text style={styles.instrumentStatus}>+ $175,000</Text>
        </View>
        <View style={styles.instrumentRow}>
          <Text style={styles.instrumentName}>SR&ED Scientific Research Claim</Text>
          <Text style={styles.instrumentStatus}>+ $240,000</Text>
        </View>
        <View style={styles.instrumentRow}>
          <Text style={styles.instrumentName}>Stripe Connect Automated Escrow</Text>
          <Text style={styles.instrumentStatus}>Synchronized</Text>
        </View>
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 110,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5FFFA',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.6,
    marginBottom: 16,
    lineHeight: 16,
  },
  pane: {
    marginBottom: 16,
  },
  paneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5FFFA',
    marginBottom: 8,
  },
  paneDescription: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.7,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#F5FFFA',
    opacity: 0.6,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5FFFA',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    color: '#20B2AA',
    marginBottom: 4,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F5FFFA',
    fontSize: 14,
  },
  instrumentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 255, 250, 0.08)',
  },
  instrumentName: {
    fontSize: 13,
    color: '#F5FFFA',
    opacity: 0.85,
  },
  instrumentStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3EB991',
  },
});
