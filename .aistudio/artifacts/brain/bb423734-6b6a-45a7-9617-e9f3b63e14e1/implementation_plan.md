# Revised Implementation Plan: Obelisk Treasury 2.0 (Appwrite-Native)

## 1. Objective
Implement the Janus Protocol (Dual-Ledger architecture) within the Obelisk Treasury. This system bridges Fiat (GAAP) and Sovereign (Ξ Credit) economies, utilizing Ethereum (L2) for RWA tokenization, exclusively via Appwrite SDK and Appwrite Cloud Functions.

## 2. Technical Stack
- **Database**: Appwrite TablesDB
- **Backend Logic**: Appwrite Cloud Functions (Node.js/TypeScript)
- **Tokenization**: Ethers.js (installed in Function environment)
- **SDK**: `node-appwrite`
- **Compliance**: Zod for runtime schema validation

## 3. Implementation Roadmap

### Phase 1: Data Architecture & Multi-Tenancy
- Update `appwrite.config.json` to define new Tables in the `sovereign` database:
    - `fiat_ledger` (Table)
    - `shadow_ledger` (Table)
    - `ledger_reconciliation` (Table)
- Implement deployment scripts using `node-appwrite` (`TablesDB` service) to enforce table constraints and indices.

### Phase 2: Logic Layer (Appwrite Functions)
- Develop `backend/functions/treasury-reconciler.ts`:
    - Utilize `TablesDB` service for atomic CRUD operations on Tables.
    - Implement reconciliation logic within the function to ensure `fiat_ledger` and `shadow_ledger` consistency.
    - Integrate `ethers` to manage Ethereum (L2) RWA token interactions.
    - Validate all inputs with Zod.

### Phase 3: Service Integration
- Update `services/treasuryService.ts` to execute `treasury-reconciler` function calls.

## 4. Multi-Tenancy & Security
- **Tenant Isolation**: Every row in `fiat_ledger`, `shadow_ledger`, and `ledger_reconciliation` MUST include `teamId`.
- **Permissions**: Apply `Permission.read(Role.team(teamId))` and `Permission.write(Role.team(teamId, 'admin'))`.
- **Querying**: Every list/query operation must enforce a filter by `teamId`.
