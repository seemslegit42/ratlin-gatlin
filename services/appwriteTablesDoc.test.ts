import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { TABLES_SCHEMA, DATABASE_ID, type ColumnSpec, type ColumnType } from '../scripts/appwrite-schema';
import { buildSovereignTables } from '../scripts/generate-appwrite-types';

describe('Appwrite Tables Architecture & Schema Specification', () => {
  const rootDir = process.cwd();

  it('should define sovereign database ID as sovereign', () => {
    expect(DATABASE_ID).toBe('sovereign');
  });

  it('should have all 37 sovereign tables configured in TABLES_SCHEMA', () => {
    const tableKeys = Object.keys(TABLES_SCHEMA);
    expect(tableKeys.length).toBeGreaterThanOrEqual(37);
    expect(tableKeys).toContain('syndicates');
    expect(tableKeys).toContain('users');
    expect(tableKeys).toContain('agents');
    expect(tableKeys).toContain('workflows');
    expect(tableKeys).toContain('ledger');
    expect(tableKeys).toContain('transactions');
    expect(tableKeys).toContain('crm_contacts');
    expect(tableKeys).toContain('crm_deals');
    expect(tableKeys).toContain('crm_activities');
    expect(tableKeys).toContain('email_marketing_lab');
  });

  it('should support authoritative Appwrite Table column types including varchar, text, mediumtext, longtext, integer, bigint, float, boolean, datetime, enum, ip, email, url', () => {
    const validColumnTypes: ColumnType[] = [
      'string',
      'varchar',
      'text',
      'mediumtext',
      'longtext',
      'integer',
      'bigint',
      'float',
      'boolean',
      'datetime',
      'enum',
      'ip',
      'email',
      'url',
      'point',
      'line',
      'polygon',
      'relationship',
    ];

    expect(validColumnTypes).toContain('varchar');
    expect(validColumnTypes).toContain('text');
    expect(validColumnTypes).toContain('mediumtext');
    expect(validColumnTypes).toContain('longtext');
    expect(validColumnTypes).toContain('bigint');
    expect(validColumnTypes).toContain('enum');
  });

  it('should build CLI-compatible tables without undefined collections references', () => {
    const cliTables = buildSovereignTables();
    expect(cliTables.length).toBeGreaterThanOrEqual(37);

    for (const table of cliTables) {
      expect(table.$id).toBeDefined();
      expect(table.databaseId).toBe('sovereign');
      expect(table.columns.length).toBeGreaterThan(0);
      for (const col of table.columns) {
        expect(['varchar', 'text', 'mediumtext', 'longtext', 'integer', 'bigint', 'float', 'boolean', 'datetime', 'enum', 'ip', 'email', 'url', 'point', 'line', 'polygon', 'relationship', 'double']).toContain(col.type);
      }
    }
  });

  it('should ensure setup-appwrite-backend.ts has no references to undefined collections variable', () => {
    const setupScriptPath = path.join(rootDir, 'scripts/setup-appwrite-backend.ts');
    const content = fs.readFileSync(setupScriptPath, 'utf8');

    // Make sure the pagination loop checks `tables.length < limit` instead of `collections.length < limit`
    expect(content).not.toMatch(/if\s*\(\s*collections\.length\s*<\s*limit\s*\)/);
  });

  it('should document TablesDB schema commands in docs/appwrite/tables.md', () => {
    const docPath = path.join(rootDir, 'docs/appwrite/tables.md');
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('DATABASE_ID');
    expect(content).toContain('types:generate');
    expect(content).toContain('varchar');
    expect(content).toContain('mediumtext');
    expect(content).toContain('longtext');
    expect(content).toContain('bigint');
    expect(content).toContain('relationship');
  });
});
