/**
 * @file components/TenantLogin.tsx
 * @description Tenant-scoped login facade.
 * Routes to the standard Genesis Ritual authentication flow.
 * Preserves backward compatibility for any references to the tenant-specific login path.
 */

import Login from '../modules/auth/Login';

export default Login;
