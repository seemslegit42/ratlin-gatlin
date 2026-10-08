# Manifest ACP

## Decision Tokens
- `TOKEN_PLM_CHRONOS_EXPANSION`: Embedded Stage-Gate product lifecycle engine directly within `FinanceView.tsx` to preserve zero-new-frontend-files constraint while completing all dashboard tabs.
- `TOKEN_APPWRITE_TABLESDB_MONITOR`: Leveraged Appwrite SDK TablesDB `listRows` API with tenant-scoped queries to expose live row metrics in `VaultView.tsx`.
- `TOKEN_LEDGER_IMMUTABILITY`: Unified Appwrite `TREASURY_TRANSACTIONS` with cryptographic block hashing in `GeneralLedger.tsx`.
- `TOKEN_GLOBAL_HIGH_DENSITY`: Applied global high-density layout class to body and app shell while tightening CSS spacing scale variables in index.css and preserving WCAG 2.5.5 touch target boundaries.
- `TOKEN_UNIVERSAL_HIGH_DENSITY_PROPAGATION`: Inoculated `high-density` class across all modules, views, components, and files (including XiDashboard, SimulacrumView, ChaosDeckView, CommandPalette, CommandBar, SettingsPanel, CollaborationPanel, Notifications, TemplateBrowser, NavigationWidget, Toolbar, GlassPane/GlassCard) combined with exhaustive CSS rules to globally tighten padding and margins while securing accessibility invariants.
- `TOKEN_APPWRITE_REGIONAL_SUBSTRATE_AUTONOMY`: Normalized client and bundler routing to route directly to Toronto cloud instance (`tor.cloud.appwrite.io`), provisioned wildcard platform origins (`*.run.app`, `*.us-east1.run.app`), and sanitized session conflict handling.
