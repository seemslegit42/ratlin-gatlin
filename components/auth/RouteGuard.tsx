/**
 * @file components/auth/RouteGuard.tsx
 * @description RouteGuard and ProtectedRoute components for guarding authenticated paths.
 * Enforces session validity against backend, sets global auth state, and redirects unauthorized users.
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRouteGuard, RouteGuardProvider } from '../../contexts/RouteGuardContext';

export { RouteGuardProvider, useRouteGuard };

interface RouteGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loginPath?: string;
  requireAuth?: boolean;
}

/**
 * Standard loading indicator matching the Verdigris Interface Protocol
 */
export const RouteGuardLoading: React.FC = () => (
  <div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian-black/95 backdrop-blur-2xl"
    role="status"
    aria-live="polite"
    aria-label="Validating Sovereign Credentials"
  >
    <div className="relative flex items-center justify-center">
      {/* Outer Pulse Ring */}
      <div className="w-20 h-20 rounded-full border border-roman-aqua/20 animate-ping absolute" />
      {/* Spinning Dual Arcs */}
      <div className="w-16 h-16 border-2 border-imperial-purple/20 border-t-imperial-purple border-r-roman-aqua rounded-full animate-spin" />
      {/* Center Sigil Dot */}
      <div className="w-2 h-2 rounded-full bg-patina-green shadow-[0_0_12px_#3EB991]" />
    </div>
    <div className="mt-6 flex flex-col items-center gap-1.5">
      <span className="text-xs font-comfortaa font-bold text-vitreous-white tracking-widest uppercase">
        Verifying Session
      </span>
      <span className="text-[10px] font-mono text-roman-aqua/70 tracking-[0.25em] uppercase animate-pulse">
        Syncing Neural Lattice
      </span>
    </div>
  </div>
);

/**
 * RouteGuard Component
 * Wraps routes to guarantee backend session validity before rendering children.
 * Automatically redirects unauthenticated requests to the designated login route.
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  fallback,
  loginPath = '/login',
  requireAuth = true
}) => {
  const { isAuthenticated, isValidating } = useRouteGuard();
  const location = useLocation();

  if (isValidating) {
    return <>{fallback || <RouteGuardLoading />}</>;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

/**
 * ProtectedRoute Component (Alias for RouteGuard for familiar API patterns)
 */
export const ProtectedRoute: React.FC<RouteGuardProps> = (props) => {
  return <RouteGuard {...props} />;
};

/**
 * PublicOnlyRoute Component
 * Redirects already-authenticated users away from auth-only pages (e.g. login) to dashboard.
 */
export const PublicOnlyRoute: React.FC<{ children: ReactNode; redirectPath?: string }> = ({
  children,
  redirectPath = '/'
}) => {
  const { isAuthenticated, isValidating } = useRouteGuard();

  if (isValidating) {
    return <RouteGuardLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
