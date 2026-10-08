/**
 * @file services/authService.ts
 * @description Centralized authentication service for ΛΞVOS OS.
 */

import { account } from './appwriteClient.js';
import { toAuthUiMessage } from './authErrors.js';

/**
 * Initiates a password reset for the given user.
 * @param email - The user's email address.
 * @param url - The redirection URL to handle the reset in the app.
 * @returns Standardized success/error payload.
 */
export async function requestPasswordReset(email: string, url: string): Promise<{ success: boolean; error?: string }> {
    try {
        await account.createRecovery({
            email: email.trim().toLowerCase(),
            url
        });
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
