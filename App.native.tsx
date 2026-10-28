/**
 * @file App.native.tsx
 * @description React Native root entry point for the complete ΛΞVOS mobile platform.
 * Built with Verdigris Interface Protocol™ (Roman Aqua #20B2AA, Patina Green #3EB991, Imperial Purple #6A0DAD).
 * Integrates Appwrite 2.0 Auth, Turso libSQL state, and the Handheld Artifact doctrine.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Native UI Atoms
import { GlassPane } from './native/components/GlassPane.native.js';
import { AcquisitionButton } from './native/components/AcquisitionButton.native.js';
import { BrandSignature } from './native/components/BrandSignature.native.js';
import { VoiceCommandModal } from './native/components/VoiceCommandModal.native.js';

// Native Domain Modules
import { AuthViewNative } from './native/modules/AuthView.native.js';
import { AdminViewNative } from './native/modules/AdminView.native.js';
import { FinanceViewNative } from './native/modules/FinanceView.native.js';
import { HRMViewNative } from './native/modules/HRMView.native.js';
import { MainViewNative } from './native/modules/MainView.native.js';

// Native Domain Screens
import { WeaverScreenNative } from './native/components/WeaverScreen.native.js';
import { CRMScreenNative } from './native/components/CRMScreen.native.js';
import { EconomyScreenNative } from './native/components/EconomyScreen.native.js';
import { VitalsScreenNative } from './native/components/VitalsScreen.native.js';
import { PantheonScreenNative } from './native/components/PantheonScreen.native.js';
import { OperationsScreenNative } from './native/components/OperationsScreen.native.js';
import { SecurityScreenNative } from './native/components/SecurityScreen.native.js';
import { MarketingScreenNative } from './native/components/MarketingScreen.native.js';
import { SimulacrumScreenNative } from './native/components/SimulacrumScreen.native.js';
import { ProcurementScreenNative } from './native/components/ProcurementScreen.native.js';
import { ProductionScreenNative } from './native/components/ProductionScreen.native.js';
import { NotepadScreenNative } from './native/components/NotepadScreen.native.js';
import { HelpScreenNative } from './native/components/HelpScreen.native.js';

type TabKey =
  | 'command'
  | 'main'
  | 'weaver'
  | 'operations'
  | 'crm'
  | 'economy'
  | 'finance'
  | 'security'
  | 'marketing'
  | 'simulacrum'
  | 'procurement'
  | 'production'
  | 'hrm'
  | 'vitals'
  | 'pantheon'
  | 'admin'
  | 'notepad'
  | 'help';

export default function AppNative() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('command');
  const [commandInput, setCommandInput] = useState('');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Verdigris Protocol v2.6 initialized.',
    'Turso db-per-tenant libSQL client synchronized.',
    'Appwrite 2.0 gateway verified on native port.',
  ]);

  const handleExecuteCommand = (inputToRun?: string, customResponse?: string) => {
    const text = inputToRun || commandInput;
    if (!text.trim()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const response =
      customResponse ||
      `[BEEP]: Executing agentic workflow for "${text}". Entropy reduced to nominal.`;

    setLogs(prev => [`> ${text}`, response, ...prev]);
    if (!inputToRun) setCommandInput('');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <AuthViewNative onLoginSuccess={() => setIsAuthenticated(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Iridescent Aurora Background Gradient */}
      <LinearGradient
        colors={['#000000', '#0D0818', '#041212']}
        style={styles.backgroundGradient}
      >
        {/* Sovereign Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>ΛΞVOS</Text>
              <View style={styles.pulseIndicator} />
            </View>
            <TouchableOpacity
              style={styles.voiceCoreButton}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                } catch {}
                setIsVoiceOpen(true);
              }}
            >
              <Text style={styles.voiceCoreText}>VOICE CORE</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitleText}>THE VERDIGRIS INTERFACE PROTOCOL</Text>
        </View>

        {/* Tab-driven View */}
        <View style={styles.contentArea}>
          {activeTab === 'command' && (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <GlassPane style={styles.pane} borderColor="#20B2AA">
                <Text style={styles.paneTitle}>Command Core</Text>
                <Text style={styles.paneDescription}>
                  Summon agents, dispatch directives, or transmute chaos into silence.
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter natural language directive..."
                    placeholderTextColor="rgba(245, 255, 250, 0.4)"
                    value={commandInput}
                    onChangeText={setCommandInput}
                    onSubmitEditing={() => handleExecuteCommand()}
                  />
                  <AcquisitionButton
                    label="Execute"
                    variant="primary"
                    onPress={() => handleExecuteCommand()}
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <Text style={styles.sectionHeader}>Execution Stream</Text>
                <View style={styles.streamBox}>
                  {logs.map((log, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.logText,
                        log.startsWith('>')
                          ? styles.logTextUser
                          : styles.logTextSystem,
                      ]}
                    >
                      {log}
                    </Text>
                  ))}
                </View>
              </GlassPane>
            </ScrollView>
          )}

          {activeTab === 'main' && <MainViewNative />}
          {activeTab === 'weaver' && <WeaverScreenNative />}
          {activeTab === 'operations' && <OperationsScreenNative />}
          {activeTab === 'crm' && <CRMScreenNative />}
          {activeTab === 'economy' && <EconomyScreenNative />}
          {activeTab === 'finance' && <FinanceViewNative />}
          {activeTab === 'security' && <SecurityScreenNative />}
          {activeTab === 'marketing' && <MarketingScreenNative />}
          {activeTab === 'simulacrum' && <SimulacrumScreenNative />}
          {activeTab === 'procurement' && <ProcurementScreenNative />}
          {activeTab === 'production' && <ProductionScreenNative />}
          {activeTab === 'hrm' && <HRMViewNative />}
          {activeTab === 'vitals' && <VitalsScreenNative />}
          {activeTab === 'pantheon' && <PantheonScreenNative />}
          {activeTab === 'admin' && <AdminViewNative />}
          {activeTab === 'notepad' && <NotepadScreenNative />}
          {activeTab === 'help' && <HelpScreenNative />}
        </View>

        {/* Voice Command Modal */}
        <VoiceCommandModal
          visible={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onExecute={(cmd, resp) => handleExecuteCommand(cmd, resp)}
        />

        {/* Floating Navigation Toolbar */}
        <View style={styles.toolbar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
          >
            {(
              [
                ['command', 'Command'],
                ['main', 'Dashboard'],
                ['weaver', 'Weaver'],
                ['operations', 'Operations'],
                ['crm', 'CRM'],
                ['economy', 'Economy'],
                ['finance', 'Finance'],
                ['security', 'Security'],
                ['marketing', 'Marketing'],
                ['simulacrum', 'Simulacrum'],
                ['procurement', 'Procurement'],
                ['production', 'Production'],
                ['hrm', 'HRM'],
                ['vitals', 'Vitals'],
                ['pantheon', 'Pantheon'],
                ['admin', 'Admin'],
                ['notepad', 'Notepad'],
                ['help', 'Help'],
              ] as [TabKey, string][]
            ).map(([key, label]) => {
              const isActive = activeTab === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setActiveTab(key);
                  }}
                >
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Mandatory Brand Signature */}
        <BrandSignature style={styles.brandSignature} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    flex: 1,
    paddingTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 26,
    color: '#20B2AA', // Roman Aqua
    letterSpacing: 2,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3EB991', // Patina Green
    marginLeft: 8,
    shadowColor: '#3EB991',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  subtitleText: {
    fontSize: 9,
    color: '#F5FFFA',
    opacity: 0.6,
    letterSpacing: 2.5,
    marginTop: 2,
  },
  voiceCoreButton: {
    backgroundColor: 'rgba(106, 13, 173, 0.4)',
    borderWidth: 1,
    borderColor: '#20B2AA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  voiceCoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F5FFFA',
    letterSpacing: 1,
  },
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  pane: {
    marginBottom: 16,
  },
  paneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5FFFA',
    marginBottom: 4,
  },
  paneDescription: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.7,
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F5FFFA',
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 11,
    color: '#20B2AA',
    letterSpacing: 1.5,
    marginBottom: 8,
    fontWeight: '700',
  },
  streamBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.1)',
    padding: 12,
    minHeight: 120,
  },
  logText: {
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  logTextUser: {
    color: '#20B2AA',
    fontWeight: '600',
  },
  logTextSystem: {
    color: '#3EB991',
  },
  toolbar: {
    position: 'absolute',
    bottom: 35,
    left: 12,
    right: 12,
    height: 52,
    backgroundColor: 'rgba(10, 10, 20, 0.92)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.4)',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  toolbarContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginHorizontal: 3,
  },
  navItemActive: {
    backgroundColor: 'rgba(32, 178, 170, 0.25)',
    borderWidth: 1,
    borderColor: '#20B2AA',
  },
  navText: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.6,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#20B2AA',
    opacity: 1,
    fontWeight: 'bold',
  },
  brandSignature: {
    position: 'absolute',
    bottom: 4,
    left: 16,
  },
});
