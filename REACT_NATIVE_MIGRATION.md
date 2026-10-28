# ΛΞVOS — React Native Migration & Mobile Architecture

## Overview
ΛΞVOS has been comprehensively converted to **React Native (Expo)** while adhering strictly to the **Verdigris Interface Protocol™**.

The mobile interface is designed under the **Handheld Artifact (Pocket Sanctum)** doctrine — it behaves as a dedicated, sensor-rich remote control for the Sovereign's domain, featuring voice-first interaction, tactile glass thrums, and bio-digital health monitors.

---

## Architecture & Directory Structure

```
├── app.json                               # Expo configuration (bundle ID, permissions, splash)
├── babel.config.js                        # Babel configuration with path aliasing
├── metro.config.js                        # Metro bundler configuration
├── App.native.tsx                         # Root React Native component & tab coordinator
│
├── hooks/native/
│   ├── useHaptics.native.ts               # Custom haptic patterns (Glass Seal Breaking, Stone Wheel, Glass Thrum)
│   ├── useTursoTenant.native.ts           # Turso libSQL Database-per-Tenant hook (Zero ORM, raw SQLite)
│   └── useAppwriteAuth.native.ts          # Appwrite 2.0 Auth & Team-based permission hook
│
├── components/native/
│   ├── GlassPane.native.tsx               # Fundamental UI atom (Ancient Roman Glass aesthetic)
│   ├── AcquisitionButton.native.tsx       # Tactile button with haptic thrum & Roman Aqua glow
│   ├── BrandSignature.native.tsx          # Mandatory signature (lxv Inc., z-index anchor)
│   ├── VeinMonitor.native.tsx             # Bio-Digital Logic: "The Vein" (Health pulse & constriction)
│   ├── FlowLiquidTransfer.native.tsx      # Bio-Digital Logic: "The Flow" (Fluid wave payload dynamics)
│   ├── VoiceCommandModal.native.tsx       # Voice-first Pocket Sanctum Command Core (Reluctant Saviour)
│   ├── WeaverScreen.native.tsx            # Agent constellation & pipeline choreography
│   ├── OperationsScreen.native.tsx        # Mission timeline, task dispatch, and model sync
│   ├── CRMScreen.native.tsx               # Deal pipeline & strategic relationship matrix
│   ├── EconomyScreen.native.tsx           # CEVM calculator, capital runway, and tax incentives
│   ├── SecurityScreen.native.tsx          # Aegis Sentinel threat map and key rotation
│   ├── MarketingScreen.native.tsx         # Audience prism, campaign ROI, and persona alchemist
│   ├── SimulacrumScreen.native.tsx        # Swarm entropy and inter-agent gossip ticker
│   ├── VitalsScreen.native.tsx            # Real-time telemetry, node integrity, and SLA monitors
│   ├── PantheonScreen.native.tsx          # Shards of divine logic, governance, and Demiurge console
│   ├── ProcurementScreen.native.tsx       # PO lifecycle and supplier risk analysis
│   ├── ProductionScreen.native.tsx        # Smart factory throughput and logistics tracking
│   ├── NotepadScreen.native.tsx           # Ephemeral context drafting and agentic notes
│   └── HelpScreen.native.tsx              # Mobile interface documentation
│
└── services/
    ├── tursoNativeService.ts              # Turso libSQL client for database-per-tenant SQLite
    └── appwriteNativeService.ts           # Appwrite 2.0 Auth, TablesDB, and Teams integration
```

---

## Verdigris Interface Protocol™ Compliance

| Element | Specification | Native Implementation |
|---------|---------------|-----------------------|
| **Primary Brand** | Roman Aqua (`#20B2AA`) | Headers, key borders, and active tabs |
| **Secondary Accent** | Patina Green (`#3EB991`) | Success states, healthy Vein pulse, ARR |
| **Interactive** | Imperial Purple (`#6A0DAD`) | Action buttons, hyperventilation state |
| **Background** | Obsidian Black (`#000000`) | Iridescent Aurora linear gradient base |
| **Primary Text** | Vitreous White (`#F5FFFA`) | High contrast typography |
| **Bio-Digital "The Vein"** | Pulsing Telemetry | Modulated opacity, constriction on load (>80%), jitter on error |
| **Bio-Digital "The Flow"** | Fluid Data Transfer | Wave overlay, speed and viscosity inversely correlated to file payload size |
| **Tactile Weight** | Glass Thrum & Stone Wheel | `expo-haptics` on touch, scrolling, and command dispatch |
| **Brand Signature** | Mandatory Certification | `lxv Inc. / The Future Needs Context / Innovate, Automate, Dominate` |
| **Persona Voice** | Reluctant Saviour | Stoic, sarcastic, and laconic error & execution responses |

---

## Running on Mobile (iOS / Android / Web)

### 1. Install Expo Dependencies
```bash
npx expo install expo-status-bar expo-haptics expo-linear-gradient
```

### 2. Start the Expo Development Server
```bash
npx expo start
```
- Press `i` to launch on iOS Simulator.
- Press `a` to launch on Android Emulator.
- Scan the displayed QR code with the Expo Go app on your physical iOS or Android device.
