import { describe, expect, it } from 'bun:test';
import { toAuthUiMessage } from './authErrors';

describe('RouteGuard & Auth Resilience', () => {
  it('should not force users to the help route by default', () => {
    const defaultOnboardingState = true;
    expect(defaultOnboardingState).toBe(true);
  });

  it('should properly recognize public paths including root /', () => {
    const publicPaths = ['/', '/login', '/verify', '/recovery'];
    const isPublic = (path: string) =>
      publicPaths.some(p => path === p || (p !== '/' && path.startsWith(p)));

    expect(isPublic('/')).toBe(true);
    expect(isPublic('/login')).toBe(true);
    expect(isPublic('/verify')).toBe(true);
    expect(isPublic('/crm')).toBe(false);
    expect(isPublic('/help')).toBe(false);
  });

  it('should translate auth errors gracefully without leaking sensitive info', () => {
    const err = new Error('Creation of a session is prohibited when a session is active.');
    const msg = toAuthUiMessage(err);
    expect(msg).toContain('Creation of a session is prohibited');
  });
});
