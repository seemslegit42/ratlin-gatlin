/**
 * @file services/authErrors.ts
 * @description Turns Appwrite (and generic) failures into signup/login copy humans can act on.
 */

import { AppwriteException } from 'appwrite';

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** User-facing explanation; never echoes secrets. */
export function toAuthUiMessage(error: unknown): string {
  if (error instanceof AppwriteException) {
    const msg = (error.message || '').trim();
    const response = typeof error.response === 'string' ? error.response.toLowerCase() : '';
    const merged = `${msg} ${response}`.toLowerCase();

    // Registration / uniqueness
    if (error.code === 409 || includesAny(merged, ['already exists', 'duplicate', 'unique'])) {
      return 'That email already has an account. Try Access (login), or reset the password in Appwrite / your IdP.';
    }

    // Rate Limiting (429)
    if (error.code === 429 || includesAny(merged, ['rate limit', 'too many', 'rate_limit_exceeded'])) {
      return 'Rate limit exceeded (429). Too many authentication requests in a short period. Please wait a moment before trying again.';
    }

    // Auth / verification / credentials
    if (error.code === 401) {
      if (includesAny(merged, ['email', 'verification', 'verify']) || error.type === 'user_email_not_verified') {
        return 'Account exists but login is blocked until the email address is verified. Check your inbox, or disable “Email verification” for email/password users in Appwrite Console (Auth → Security).';
      }
      if (includesAny(merged, ['invalid credentials', 'invalid_credentials']) || error.type === 'user_invalid_credentials') {
        return 'Invalid email or password. Please verify your credentials and try again.';
      }
      if (includesAny(merged, ['blocked', 'disabled']) || error.type === 'user_blocked') {
        return 'This account is blocked or disabled. Contact your syndicate administrator.';
      }
      return 'Unauthorized (401). Wrong password or session expired. If signup just succeeded but you see this, your project may require email verification before sessions are allowed.';
    }

    // Project / ACL
    if (error.code === 403 || includesAny(merged, ['forbidden'])) {
      if (includesAny(merged, ['registration', 'create', 'users'])) {
        return 'Server rejected sign-up (403). In Appwrite Console: Auth → make sure Users can register, and Authentication methods → Email/password is enabled.';
      }
      return 'Forbidden (403). Check Appwrite Platform → Sites / allowed origins include your dev URL.';
    }

    // Payload
    if (error.code === 400) {
      if (includesAny(merged, ['password', 'characters', 'length'])) {
        return 'Password rejected: use at least Appwrite minimum length / complexity (Console → Auth → password policy). Usually 8+ characters.';
      }
      if (includesAny(merged, ['email', 'invalid'])) {
        return 'Invalid email format.';
      }
    }

    const tail = typeof error.type === 'string' && error.type ? ` (${error.type})` : '';
    return msg ? `${msg}${tail}` : `Request failed (${error.code || '?'}${tail}). Open the browser Network tab → failed request → response body for details.`;
  }

  if (error instanceof Error && error.message) {
    const msg = error.message.toLowerCase();
    if (includesAny(msg, ['failed to fetch', 'networkerror', 'network error', 'connection refused', 'econnrefused'])) {
      return 'Network connection failed. Unable to reach the authentication service.';
    }
    return error.message;
  }
  return typeof error === 'string' ? error : 'Authentication request failed.';
}
