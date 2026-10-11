import { Client, TablesDB, Permission, Role, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const tablesDB = new TablesDB(client);
const databaseId = process.env.APPWRITE_DATABASE_ID || 'sovereign';

async function setupObeliskTreasury() {
    console.log('Initializing Obelisk Treasury 2.0 tables...');
    try {
        // 1. fiat_ledger
        await tablesDB.createTable(databaseId, 'fiat_ledger', 'Fiat Ledger', [
            Permission.read(Role.team('[TEAM_ID]')),
            Permission.write(Role.team('[TEAM_ID]', 'admin'))
        ]);
        await tablesDB.createVarcharColumn(databaseId, 'fiat_ledger', 'teamId', 255, true);
        await tablesDB.createFloatColumn(databaseId, 'fiat_ledger', 'amount', true);
        await tablesDB.createVarcharColumn(databaseId, 'fiat_ledger', 'currency', 3, true);
        await tablesDB.createVarcharColumn(databaseId, 'fiat_ledger', 'transaction_type', 20, true);
        await tablesDB.createVarcharColumn(databaseId, 'fiat_ledger', 'status', 20, true);
        await tablesDB.createIndex(databaseId, 'fiat_ledger', 'idx_fiat_team', 'key', ['teamId']);

        // 2. shadow_ledger
        await tablesDB.createTable(databaseId, 'shadow_ledger', 'Shadow Ledger', [
            Permission.read(Role.team('[TEAM_ID]')),
            Permission.write(Role.team('[TEAM_ID]', 'admin'))
        ]);
        await tablesDB.createVarcharColumn(databaseId, 'shadow_ledger', 'teamId', 255, true);
        await tablesDB.createFloatColumn(databaseId, 'shadow_ledger', 'credit_amount', true);
        await tablesDB.createVarcharColumn(databaseId, 'shadow_ledger', 'event_type', 20, true);
        await tablesDB.createVarcharColumn(databaseId, 'shadow_ledger', 'reference_fiat_id', 255, false);
        await tablesDB.createIndex(databaseId, 'shadow_ledger', 'idx_shadow_team', 'key', ['teamId']);

        // 3. ledger_reconciliation
        await tablesDB.createTable(databaseId, 'ledger_reconciliation', 'Ledger Reconciliation', [
            Permission.read(Role.team('[TEAM_ID]')),
            Permission.write(Role.team('[TEAM_ID]', 'admin'))
        ]);
        await tablesDB.createVarcharColumn(databaseId, 'ledger_reconciliation', 'teamId', 255, true);
        await tablesDB.createVarcharColumn(databaseId, 'ledger_reconciliation', 'fiat_id', 255, true);
        await tablesDB.createVarcharColumn(databaseId, 'ledger_reconciliation', 'shadow_id', 255, true);
        await tablesDB.createTextColumn(databaseId, 'ledger_reconciliation', 'audit_hash', true);
        await tablesDB.createIndex(databaseId, 'ledger_reconciliation', 'idx_recon_team', 'key', ['teamId']);

        console.log('Obelisk Treasury 2.0 table setup completed successfully.');
    } catch (error) {
        if (error.code !== 409) {
            console.error('Table setup failed:', error);
            throw error;
        } else {
            console.log('Tables already exist, skipping.');
        }
    }
}

setupObeliskTreasury();
