import { describe, it, expect } from 'bun:test';
import { AppwriteException } from 'appwrite';
import { toAuthUiMessage } from './authErrors.js';

describe('toAuthUiMessage', () => {
  it('maps duplicate email conflicts', () => {
    expect(
      toAuthUiMessage(
        new AppwriteException(
          'A user with the same email already exists in this project.',
          409,
          '',
          '',
        ),
      ),
    ).toMatch(/already has an account|already have an account/i);
  });

  it('maps verification/session 401 hints', () => {
    expect(
      toAuthUiMessage(new AppwriteException('Unauthorized', 401, '', '{"message":"verification"}')),
    ).toMatch(/verified|verification/i);
  });

  it('maps rate limit 429 errors', () => {
    expect(
      toAuthUiMessage(new AppwriteException('Rate limit exceeded', 429, 'rate_limit_exceeded', '')),
    ).toMatch(/rate limit|too many/i);
  });

  it('maps invalid credentials errors', () => {
    expect(
      toAuthUiMessage(new AppwriteException('Invalid credentials', 401, 'user_invalid_credentials', '')),
    ).toMatch(/invalid email or password/i);
  });

  it('maps network connection failures', () => {
    expect(
      toAuthUiMessage(new TypeError('Failed to fetch')),
    ).toMatch(/network|connect|offline/i);
  });
});
