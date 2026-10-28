# ΛΞVOS — React Native Migration Manifest

## Architectural Layout (`/native/` & Root Coordinator)

| Module / Component | Native Location | Status |
| :--- | :--- | :--- |
| **Root Entry** | `/App.native.tsx` & `/native/App.native.tsx` | Complete (Root Tab Coordinator, Haptics, Aurora) |
| **Authentication** | `/native/modules/AuthView.native.tsx` | Complete (Appwrite 2.0 Credentials & Sessions) |
| **Admin Console** | `/native/modules/AdminView.native.tsx` | Complete (Demiurge Console, Infrastructure) |
| **Finance / Treasury** | `/native/modules/FinanceView.native.tsx` | Complete (Ledger, Health Diagnostics) |
| **HRM / Talent** | `/native/modules/HRMView.native.tsx` | Complete (Talent Constellation, Headcount) |
| **Main Dashboard** | `/native/modules/MainView.native.tsx` | Complete (Sovereign Dashboard Overview) |
| **Agent Weaver** | `/native/components/WeaverScreen.native.tsx` | Complete (Agent Constellation & Node Sync) |
| **Operations** | `/native/components/OperationsScreen.native.tsx` | Complete (Task Dispatch, Mission Timeline) |
| **CRM Pipeline** | `/native/components/CRMScreen.native.tsx` | Complete (Deal Pipeline, Relationship Matrix) |
| **Economy & CEVM** | `/native/components/EconomyScreen.native.tsx` | Complete (Runway, Burn Rate, AITC/SR&ED) |
| **Security Sentinel** | `/native/components/SecurityScreen.native.tsx` | Complete (Aegis Threat Map, Key Rotation) |
| **Marketing Ops** | `/native/components/MarketingScreen.native.tsx` | Complete (Growth Velocity, Persona Alchemist) |
| **Simulacrum** | `/native/components/SimulacrumScreen.native.tsx` | Complete (Swarm Gossip & Entropy Tuning) |
| **Procurement** | `/native/components/ProcurementScreen.native.tsx` | Complete (PO Lifecycle & Supplier Risk) |
| **Production** | `/native/components/ProductionScreen.native.tsx` | Complete (Throughput & Logistics Command) |
| **Vitals HUD** | `/native/components/VitalsScreen.native.tsx` | Complete (Bio-Digital Vein, Node Latency) |
| **Pantheon** | `/native/components/PantheonScreen.native.tsx` | Complete (Shards of Logos, Nomos, Kairos) |
| **Notepad** | `/native/components/NotepadScreen.native.tsx` | Complete (Drafting & Ephemeral Directives) |
| **Help & Docs** | `/native/components/HelpScreen.native.tsx` | Complete (Pocket Sanctum Documentation) |
| **Voice Command Core** | `/native/components/VoiceCommandModal.native.tsx` | Complete (Speech Input, Reluctant Saviour) |
| **Bio-Digital "The Vein"** | `/native/components/VeinMonitor.native.tsx` | Complete (Pulsing Health, Load Constriction) |
| **Bio-Digital "The Flow"** | `/native/components/FlowLiquidTransfer.native.tsx` | Complete (Wave Payload Viscosity Dynamics) |
| **Glass UI Atoms** | `/native/components/GlassPane.native.tsx` & `AcquisitionButton.native.tsx` | Complete (Roman Glass Sheen, Haptic Thrum) |
| **Brand Signature** | `/native/components/BrandSignature.native.tsx` | Complete (lxv Inc. Permanent Anchor Stamp) |
| **Native Hooks** | `/native/hooks/` & `/hooks/native/` | Complete (useHaptics, useTursoTenant, useAppwriteAuth, useStreamingChat) |
| **Native Services** | `/native/services/` & `/services/` | Complete (Turso libSQL, Appwrite 2.0, Stripe Escrow) |

## Verification & Execution
- **Web Applet Build**: Verified via Vite (`bun run build` / `compile_applet`).
- **Expo Mobile Server**: `npx expo start` (supports iOS, Android, and Expo Go).
