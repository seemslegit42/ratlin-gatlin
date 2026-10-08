import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { isPostmanConfigured, loadPostmanConfig } from './config';

describe('postman config', () => {
  const originalKey = process.env.POSTMAN_API_KEY;

  beforeEach(() => {
    delete process.env.POSTMAN_API_KEY;
  });

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.POSTMAN_API_KEY = originalKey;
    } else {
      delete process.env.POSTMAN_API_KEY;
    }
  });

  test('loadPostmanConfig returns null without API key', () => {
    expect(loadPostmanConfig()).toBeNull();
    expect(isPostmanConfigured()).toBe(false);
  });

  test('loadPostmanConfig reads POSTMAN_API_KEY', () => {
    process.env.POSTMAN_API_KEY = ' PMAK-test ';
    const config = loadPostmanConfig();
    expect(config?.apiKey).toBe('PMAK-test');
    expect(config?.baseUrl).toBe('https://api.getpostman.com');
  });
});
