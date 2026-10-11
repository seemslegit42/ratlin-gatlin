import { describe, expect, it } from 'bun:test';
import {
  createAccount,
  createEmailPasswordSession,
  getCurrentAccount,
  isUserLoggedIn,
  deleteCurrentSession,
  deleteSessions,
  createReactRouterAuthLoader,
  completePasswordRecovery,
} from './authService';
import fs from 'node:fs';
import path from 'node:path';
import { requestPasswordReset, requestPasswordRecovery, createPasswordRecovery, updatePasswordRecovery } from './authService';
import { NotificationContext, useNotifications, useNotification } from '../contexts/NotificationContext';

describe('Appwrite Authentication Service - Core Contracts', () => {
  it('validates missing email or password on signup', async () => {
    const resNoEmail = await createAccount({ email: '', password: 'password123' });
    expect(resNoEmail.success).toBe(false);
    expect(resNoEmail.error).toContain('Email and password are required');

    const resNoPass = await createAccount({ email: 'test@example.com', password: '' });
    expect(resNoPass.success).toBe(false);
    expect(resNoPass.error).toContain('Email and password are required');
  });

  it('validates password length on signup', async () => {
    const resShortPass = await createAccount({ email: 'test@example.com', password: '123' });
    expect(resShortPass.success).toBe(false);
    expect(resShortPass.error).toContain('at least 8 characters');
  });

  it('validates missing email or password on login', async () => {
    const resNoEmail = await createEmailPasswordSession({ email: '', password: 'password123' });
    expect(resNoEmail.success).toBe(false);
    expect(resNoEmail.error).toContain('Email and password are required');
  });

  it('getCurrentAccount gracefully returns null or User without throwing unhandled exceptions', async () => {
    const accountResult = await getCurrentAccount();
    // In headless test without active session, it should catch error and return null
    expect(accountResult === null || typeof accountResult === 'object').toBe(true);
  });

  it('isUserLoggedIn returns boolean representation of session state', async () => {
    const loggedIn = await isUserLoggedIn();
    expect(typeof loggedIn).toBe('boolean');
  });

  it('createReactRouterAuthLoader returns an executable loader function', async () => {
    const loader = createReactRouterAuthLoader('/login');
    expect(typeof loader).toBe('function');
  });

  it('has authoritative Appwrite Authentication documentation in docs/appwrite-authentication.md', () => {
    const docPath = path.resolve(process.cwd(), 'docs/appwrite-authentication.md');
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('title: Start with Authentication');
    expect(content).toContain('account.create');
    expect(content).toContain('account.createEmailPasswordSession');
    expect(content).toContain('account.get()');
    expect(content).toContain('React router');
  });

  it('validates parameters in completePasswordRecovery', async () => {
    // Missing credentials
    const resNoCreds = await completePasswordRecovery('', '', 'password123');
    expect(resNoCreds.success).toBe(false);
    expect(resNoCreds.error).toContain('Missing recovery credentials');

    // Short password
    const resShort = await completePasswordRecovery('usr_123', 'sec_456', '123');
    expect(resShort.success).toBe(false);
    expect(resShort.error).toContain('at least 8 characters');

    // Mismatched passwords
    const resMismatch = await completePasswordRecovery('usr_123', 'sec_456', 'password123', 'password456');
    expect(resMismatch.success).toBe(false);
    expect(resMismatch.error).toContain('do not match');
  });

  it('has dedicated PasswordRecovery component in modules/auth/PasswordRecovery.tsx', () => {
    const recoveryPath = path.resolve(process.cwd(), 'modules/auth/PasswordRecovery.tsx');
    expect(fs.existsSync(recoveryPath)).toBe(true);
    const content = fs.readFileSync(recoveryPath, 'utf8');
    expect(content).toContain('PasswordRecovery');
    expect(content).toContain('completePasswordRecovery');
    expect(content).toContain('requestPasswordRecovery');
  });

  it('validates email requirement in requestPasswordReset', async () => {
    const resEmpty = await requestPasswordReset('');
    expect(resEmpty.success).toBe(false);
    expect(resEmpty.error).toContain('Email address is required');

    const resWhitespace = await requestPasswordReset('   ');
    expect(resWhitespace.success).toBe(false);
    expect(resWhitespace.error).toContain('Email address is required');
  });

  it('exposes aliases createPasswordRecovery and updatePasswordRecovery', () => {
    expect(typeof createPasswordRecovery).toBe('function');
    expect(typeof updatePasswordRecovery).toBe('function');
    expect(typeof requestPasswordRecovery).toBe('function');
    expect(requestPasswordRecovery).toBe(requestPasswordReset);
    expect(createPasswordRecovery).toBe(requestPasswordReset);
    expect(updatePasswordRecovery).toBe(completePasswordRecovery);
  });

  it('configures both /recovery and /forgot-password routes in App.tsx', () => {
    const appPath = path.resolve(process.cwd(), 'App.tsx');
    expect(fs.existsSync(appPath)).toBe(true);
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).toContain('path="/recovery"');
    expect(content).toContain('path="/forgot-password"');
  });

  it('has Forgot Password trigger and recovery mode in IdentityForm.tsx', () => {
    const formPath = path.resolve(process.cwd(), 'components/auth/IdentityForm.tsx');
    expect(fs.existsSync(formPath)).toBe(true);
    const content = fs.readFileSync(formPath, 'utf8');
    expect(content).toContain('Forgot Password');
    expect(content).toContain('/recovery');
  });

  it('documents Section 4 Password Recovery with SDK examples in docs/appwrite-authentication.md', () => {
    const docPath = path.resolve(process.cwd(), 'docs/appwrite-authentication.md');
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('## 4. Password Recovery (Forgot Password Flow)');
    expect(content).toContain('account.createRecovery');
    expect(content).toContain('account.updateRecovery');
  });

  it('exports NotificationContext and useNotification hook', () => {
    expect(NotificationContext).toBeDefined();
    expect(typeof useNotifications).toBe('function');
    expect(typeof useNotification).toBe('function');
    expect(useNotification).toBe(useNotifications);
  });

  it('integrates Appwrite password recovery response with NotificationContext in PasswordRecovery.tsx', () => {
    const componentPath = path.resolve(process.cwd(), 'modules/auth/PasswordRecovery.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('NotificationContext');
    expect(content).toContain('requestPasswordRecovery');
    expect(content).toContain('notify');
    expect(content).toContain('Recovery email has been successfully sent to your inbox');
  });

  it('integrates Appwrite password recovery response with NotificationContext in IdentityForm.tsx', () => {
    const componentPath = path.resolve(process.cwd(), 'components/auth/IdentityForm.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('NotificationContext');
    expect(content).toContain('onRequestRecovery');
    expect(content).toContain('addNotification');
  });
});
