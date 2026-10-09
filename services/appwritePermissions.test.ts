import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { TABLES_SCHEMA, DATABASE_ID, AppwritePermission, AppwriteRole, type TableSpec } from '../scripts/appwrite-schema';
import { buildSovereignTables } from '../scripts/generate-appwrite-types';

describe('Appwrite Database Permissions & Row Security Architecture', () => {
  const rootDir = process.cwd();

  it('should have authoritative Database Permissions article in docs/database-permissions.md', () => {
    const docPath = path.join(rootDir, 'docs/database-permissions.md');
    expect(fs.existsSync(docPath)).toBe(true);

    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('title: Database permissions');
    expect(content).toContain('Permissions define who can access rows in a table');
    expect(content).toContain('By default **no permissions** are granted to any users');
    expect(content).toContain('# Table level');
    expect(content).toContain('# Row level');
    expect(content).toContain('Row security');
    expect(content).toContain('# Common use cases');
  });

  it('should cross-reference Database Permissions in docs/appwrite-tables.md', () => {
    const tablesDocPath = path.join(rootDir, 'docs/appwrite-tables.md');
    expect(fs.existsSync(tablesDocPath)).toBe(true);

    const content = fs.readFileSync(tablesDocPath, 'utf8');
    expect(content).toContain('Database Permissions');
    expect(content).toContain('Row Security');
  });

  it('should support rowSecurity and permissions in TableSpec within appwrite-schema.ts', () => {
    expect(TABLES_SCHEMA.syndicates).toBeDefined();
    expect(TABLES_SCHEMA.users).toBeDefined();

    // Verify rowSecurity configuration on tables that require row-level protection
    expect(TABLES_SCHEMA.users.rowSecurity).toBe(true);
    expect(TABLES_SCHEMA.crm_contacts.rowSecurity).toBe(true);
    expect(TABLES_SCHEMA.secrets.rowSecurity).toBe(true);

    // Verify table level permissions array exists
    expect(Array.isArray(TABLES_SCHEMA.users.permissions)).toBe(true);
  });

  it('should provide helper utilities for building standard Appwrite permission strings', () => {
    expect(typeof AppwritePermission.read).toBe('function');
    expect(typeof AppwritePermission.create).toBe('function');
    expect(typeof AppwritePermission.update).toBe('function');
    expect(typeof AppwritePermission.delete).toBe('function');

    expect(AppwriteRole.any()).toBe('any');
    expect(AppwriteRole.users()).toBe('users');
    expect(AppwriteRole.user('usr_123')).toBe('user:usr_123');
    expect(AppwriteRole.team('syn_alpha')).toBe('team:syn_alpha');

    expect(AppwritePermission.read(AppwriteRole.users())).toBe('read("users")');
    expect(AppwritePermission.update(AppwriteRole.user('usr_123'))).toBe('update("user:usr_123")');
    expect(AppwritePermission.delete(AppwriteRole.team('syn_alpha'))).toBe('delete("team:syn_alpha")');
  });

  it('should propagate rowSecurity and permissions properly in buildSovereignTables', () => {
    const cliTables = buildSovereignTables();
    expect(cliTables.length).toBeGreaterThanOrEqual(37);

    const usersTable = cliTables.find((t) => t.$id === 'users');
    expect(usersTable).toBeDefined();
    expect(usersTable?.rowSecurity).toBe(true);
    expect(Array.isArray(usersTable?.$permissions)).toBe(true);

    const secretsTable = cliTables.find((t) => t.$id === 'secrets');
    expect(secretsTable).toBeDefined();
    expect(secretsTable?.rowSecurity).toBe(true);
  });
});
