# CHANGELOG

All notable changes to ΛΞVOS (B.E.E.P) are documented here.

## [Unreleased] - 2026-10-07

### Added
- **BEEP Business Intelligence & Operational Toolset**: Radically expanded the BEEP (Behavioral Event & Execution Processor) toolset to support comprehensive business operations. Introduced `createTask`, `getOperationalMetrics`, `updateSettings`, `securityAction`, `manageWorkflow`, and `getBusinessInsights` capabilities.
- **Natural Language Task Orchestration**: Integrated BEEP directly with the Operations module, allowing the Sovereign to create, delegate, and monitor tasks via plain English commands (e.g., "create a task for site inspection next Friday").
- **Proactive Morning Briefing Protocol**: Implemented the `getMorningBriefing` tool and corresponding widget, delivering an immediate overview of overnight events, security anomalies, and critical KPI shifts upon request.
- **Dynamic Interaction Archetypes**: Enabled BEEP to shift between 'Concise', 'Conversational', and 'Technical Protocol' styles via user preferences, matching the AI's persona to the Sovereign's working style.
- **Security & Phalanx Automation**: Empowered BEEP to explain security alerts in natural language, automate device isolation, and generate HIPAA/compliance reports on demand.
- **Workflow Scaffolding & Optimization**: Added conversational visual designer support, allowing BEEP to scaffold business processes in the Weaver Studio and provide iterative improvement suggestions based on bottleneck analysis.
- **Interactive Business Intelligence Widgets**: Enhanced `MorningBriefWidget`, `TaskWidget`, and `SecurityAlertWidget` with direct interaction hooks, allowing the Sovereign to probe specific highlights, confirm tasks, and execute security actions directly from the BEEP Activity Stream.

### Fixed
- **Unrestricted Sovereign Navigation & Help Jail Remediation**: Eliminated the forced redirect in `RouteGuardContext.tsx` that aggressively trapped users inside the Help screen (`/help`). Defaulted `hasOnboarded` status to `true` and included `/` in public paths, granting unimpeded routing across all modules (Cockpit, Weaver Studio, CRM, Finance, Operations, AVF, Simulacrum, etc.) without cyclic redirects.
- **Robust Authentication & Stale Session Conflict Recovery**: Hardened `AuthContext.tsx` (`login` and `register`) against `user_session_already_exists` (409) errors via proactive session purging and matching-session recovery. Configured web platform CORS allowances on Appwrite Cloud for all preview and runtime domains (`*.run.app`, `*.us-east1.run.app`, `*.us-west1.run.app`, `127.0.0.1`), eliminating origin authorization rejections.
- **Appwrite Users Collection ACL & Profile Seeding**: Updated collection-level permissions on `users` (`read`, `create`, `update`, `delete`) and ensured created user documents explicitly contain individual user ACLs.
- **RouteGuard & Auth Regression Test Suite**: Added `services/routeGuard.test.ts` verifying path evaluation, onboarding state defaults, and error sanitization.

### Added
- **Appwrite Regional Endpoint Normalization & Autonomous Routing**: Upgraded `services/appwriteClient.ts` and `vite.config.ts` to automatically route backend requests to the active Toronto region (`https://tor.cloud.appwrite.io/v1`) with Project `6990e2830030cacccd98`, preventing `general_access_forbidden` (401) region mismatch errors.
- **Appwrite Origin Platform Authorizations**: Registered wildcard web platforms (`*.run.app`, `*.us-east1.run.app`) and runtime container hostnames on Appwrite Cloud to eliminate 403 Forbidden CORS origins.
- **Hardened Session Lifecycle & Pre-Login Cleanup**: Added proactive session clearance in `AuthContext.tsx` before `createEmailPasswordSession` invocation to eliminate `user_session_already_exists` exceptions, alongside positional/object signature fallback.
- **Comprehensive High-Density Layout Deployment Across ALL Modules, Views, Components & Files**: Applied `high-density` explicitly across every module and view container (`FinanceView`, `AVFView`, `SecurityView`, `MarketingView`, `ProcurementView`, `ProductionView`, `HRMView`, `AdminView`, `PantheonView`, `VaultView`, `RegistryView`, `NotepadView`, `HelpView`, `SimulacrumView`, `Weaver`, `DesktopLayout`, `MobileLayout`, `MicroAppForgeView`, `MainView`, `XiDashboard`, `CRMView`, `OperationsView`, `AuthLayout`, `ChaosDeckView`), core and shared components (`VitalsHUD`, `CommandCenter`, `Modal`, `Sheet`, `ControlPanel`, `AiChatDock`, `CommandStream`, `ActionBar`, `GlobalMobileNav`, `Header`, `CommandPalette`, `CommandBar`, `SettingsPanel`, `CollaborationPanel`, `Notifications`, `TemplateBrowser`, `NavigationWidget`, `switchboard/Toolbar`, `GlassPane`, `GlassCard`), and the application root elements (`index.html` body, `App.tsx` shell & main container).
- **Global Spacing & Density Tokens Tightening**: Tightened global spacing scale variables (`--space-2`, `--space-3`, `--space-4`, `--space-5`) and density tokens (`--density-gap`, `--density-pad`, `--density-gap-md`, `--density-pad-md`) in `index.css` and `index.html` tailwind configuration. Integrated global component padding and margin compaction for `.glass-panel`, `.glass-card`, `.density-section`, `.form-field`, `.one-tap-row`, tables, inputs, buttons, and badges while strictly maintaining WCAG 2.5.5 touch target minimums (44px) and typographic legibility.
- **High-Density Protocol Automated Test Suite**: Expanded `services/layoutDensity.test.ts` to assert that every single view, module, and container file includes the `high-density` layout class and adheres to touch target accessibility contracts.

## [Unreleased] - 2026-10-06

### Added
- **Hardened Authentication Error Handling & Input Validation**: Expanded `services/authErrors.ts` with explicit detection for Appwrite rate limits (429), offline/network outages, and invalid credential classifications. Enhanced `IdentityForm.tsx` with RFC-compliant email regex verification, async promise state tracking, and sanitized error boundaries.
- **Appwrite Authentication Lifecycle Optimization**: Aligned `AuthContext.tsx` initialization with official Appwrite specification via direct `account.get()` verification, eliminating redundant session lookups and accelerating app boot sequence.
- **Chronos Product Lifecycle Management (PLM)**: Built out the full stage-gate lifecycle panel in `FinanceView.tsx` (`chronos` tab) with automated gate execution, BOM variance tracking, Eco-Impact scoring, and Digital Product Passport verification.
- **Appwrite TablesDB Live Substrate Monitor**: Expanded `VaultView.tsx` with live multi-table querying across `agents`, `crm_deals`, `operations_tasks`, `notes`, `treasury_transactions`, and `procurement_orders`.
- **Live General Ledger Integration**: Connected `GeneralLedger.tsx` to Appwrite `TABLES.TREASURY_TRANSACTIONS` with real-time websocket synchronization and cryptographic block hash generation.
- **Dynamic Security Baseline Telemetry**: Updated `BehavioralBaselines.tsx` to reflect active Appwrite authenticated user identity and zero-trust scores.
- **Unit & Integration Test Suite**: Added `services/appwriteModules.test.ts` covering sovereign table resolution, bucket definitions, and PLM milestone calculation.
- **Intelligent Env Automator**: Created `scripts/env-automator.ts` and `bun run env:automate` script in `package.json` for automated environment synthesis and service probing.
- **High-Density UI Layout Engine & Spatial Refactoring**: Applied a high-density layout mode across all core dashboard and view components (`MainView.tsx`, `XiDashboard.tsx`, `CRMView.tsx`, `OperationsView.tsx`, `VitalsHUD.tsx`). Compacted padding scales (`p-3`, `gap-2`–`gap-3`), tightened row and card packing without sacrificing readability or touch target accessibility, and updated `index.css` density design tokens.
- **Appwrite Environment Credential Hardening**: Removed hardcoded fallback endpoint and project ID strings from `services/appwriteClient.ts` in favor of environment variable resolution (`VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`). Sourced teams, permission, role, and database ID configurations cleanly from environment definitions.
