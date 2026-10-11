/**
 * @file services/authService.ts
 * @description Centralized authentication service for ΛΞVOS OS.
 */

import { account } from './appwriteClient.js';
import { toAuthUiMessage } from './authErrors.js';
import { ID, type Models } from 'appwrite';

export interface CreateAccountParams {
    userId?: string;
    email: string;
    password: string;
    name?: string;
}

export interface CreateSessionParams {
    email: string;
    password: string;
}

export interface AuthResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * 1. Signup: Creates a new Appwrite account using email and password.
 */
export async function createAccount(params: CreateAccountParams): Promise<AuthResult<Models.User<Models.Preferences>>> {
    const email = params.email?.trim().toLowerCase();
    const password = params.password;

    if (!email || !password) {
        return { success: false, error: 'Email and password are required.' };
    }

    if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters (Appwrite default minimum).' };
    }

    try {
        const user = await account.create({
            userId: params.userId || ID.unique(),
            email,
            password,
            ...(params.name?.trim() ? { name: params.name.trim() } : {}),
        });
        return { success: true, data: user };
    } catch (error: unknown) {
        return { success: false, error: toAuthUiMessage(error) };
    }
}

/**
 * 2. Login: Creates an email password session in Appwrite.
 */
export async function createEmailPasswordSession(params: CreateSessionParams): Promise<AuthResult<Models.Session>> {
    const email = params.email?.trim().toLowerCase();
    const password = params.password;

    if (!email || !password) {
        return { success: false, error: 'Email and password are required.' };
    }

    try {
        // Clear active session first if one exists
        try {
            await account.deleteSession('current');
        } catch {
            /* no active session */
        }

        const session = await account.createEmailPasswordSession({
            email,
            password,
        });
        return { success: true, data: session };
    } catch (error: unknown) {
        return { success: false, error: toAuthUiMessage(error) };
    }
}

/**
 * 3. Check Authentication State: Gets the current active user account.
 * Stateless check via account.get() - returns null if unauthenticated.
 */
export async function getCurrentAccount(): Promise<Models.User<Models.Preferences> | null> {
    try {
        const user = await account.get();
        return user;
    } catch {
        return null;
    }
}

/**
 * Convenience helper to check if a user session is active.
 */
export async function isUserLoggedIn(): Promise<boolean> {
    const user = await getCurrentAccount();
    return !!user;
}

/**
 * Deletes the current active session (Logout).
 */
export async function deleteCurrentSession(): Promise<AuthResult> {
    try {
        await account.deleteSession('current');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: toAuthUiMessage(error) };
    }
}

/**
 * Deletes all sessions for the user across all devices (Global Logout).
 */
export async function deleteSessions(): Promise<AuthResult> {
    try {
        await account.deleteSessions();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: toAuthUiMessage(error) };
    }
}

/**
 * 4. React Router Auth Loader factory per official Appwrite pattern.
 */
export function createReactRouterAuthLoader(loginPath: string = '/login') {
    return async (): Promise<{ user: Models.User<Models.Preferences> }> => {
        try {
            const user = await account.get();
            return { user };
        } catch {
            if (typeof window !== 'undefined') {
                window.location.href = loginPath;
            }
            throw new Error(`Unauthenticated: redirecting to ${loginPath}`);
        }
    };
}

/**
 * Initiates an Appwrite password recovery flow for the given user.
 * @param email - The user's email address.
 * @param url - Optional redirection URL (defaults to /recovery in app).
 * @returns Standardized success/error payload.
 */
export async function requestPasswordReset(email: string, url?: string): Promise<{ success: boolean; error?: string }> {
    if (!email || !email.trim()) {
        return { success: false, error: 'Email address is required for password recovery.' };
    }
    try {
        const defaultUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/recovery`
            : 'http://localhost:3000/recovery';
        const targetUrl = url || defaultUrl;
        await account.createRecovery({
            email: email.trim().toLowerCase(),
            url: targetUrl
        });
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: toAuthUiMessage(error) };
    }
}

/** Aliases for Appwrite password recovery flow */
export const requestPasswordRecovery = requestPasswordReset;
export const createPasswordRecovery = requestPasswordReset;
export const updatePasswordRecovery = completePasswordRecovery;

/**
 * Completes the Appwrite password recovery process using userId, secret, and new password.
 * @param userId - The user's ID received in the recovery URL.
 * @param secret - The verification secret received in the recovery URL.
 * @param password - The new password.
 * @param passwordAgain - Confirmation of the new password.
 */
export async function completePasswordRecovery(
    userId: string,
    secret: string,
    password: string,
    passwordAgain?: string
): Promise<AuthResult> {
    if (!userId || !secret) {
        return { success: false, error: 'Missing recovery credentials (userId or secret).' };
    }
    if (!password || password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    if (passwordAgain && password !== passwordAgain) {
        return { success: false, error: 'Passwords do not match.' };
    }
    try {
        try {
            await account.updateRecovery({
                userId,
                secret,
                password,
                passwordAgain: passwordAgain || password,
            });
        } catch {
            await (account.updateRecovery as any)(userId, secret, password, passwordAgain || password);
        }
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: toAuthUiMessage(error) };
    }
}

/**
 * Completes email verification for a user.
 * @param userId - The user's ID.
 * @param secret - The verification secret.
 * @returns Standardized success/error payload.
 */
export async function confirmEmailVerification(userId: string, secret: string): Promise<{ success: boolean; error?: string }> {
    try {
        await account.updateVerification(userId, secret);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: toAuthUiMessage(error) };
    }
}
