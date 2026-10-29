/**
 * @file contexts/RouteGuardContext.tsx
 * @description React Context Provider for Authentication RouteGuard.
 * Verifies backend session validity on initial render and provides global route protection state.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { account, tablesDB, DATABASE_ID, TABLES } from '../services/appwriteClient';
import type { CurrentUser } from '../types';
import { useAuth } from './AuthContext';

export interface RouteGuardContextType {
  isAuthenticated: boolean;
  user: CurrentUser | null;
  isValidating: boolean;
  sessionError: string | null;
  verifySession: () => Promise<boolean>;
  redirectToLogin: (redirectUrl?: string) => void;
}

const RouteGuardContext = createContext<RouteGuardContextType | undefined>(undefined);

interface RouteGuardProviderProps {
  children: ReactNode;
  loginPath?: string;
  publicPaths?: string[];
}

export const RouteGuardProvider: React.FC<RouteGuardProviderProps> = ({
  children,
  loginPath = '/login',
  publicPaths = ['/', '/login', '/verify', '/recovery']
}) => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState<CurrentUser | null>(currentUser);
  const [isValidating, setIsValidating] = useState<boolean>(!currentUser);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const isMounted = useRef<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with AuthContext currentUser when it updates
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setIsValidating(false);
      setSessionError(null);
    }
  }, [currentUser]);

  /**
   * Directly verifies active session validity against the Appwrite backend
   */
  const verifySession = useCallback(async (): Promise<boolean> => {
    try {
      if (isMounted.current) {
        setIsValidating(true);
        setSessionError(null);
      }

      // Step 1: Query the Appwrite Account API to confirm valid active session
      const appwriteUser = await account.get();
      if (!appwriteUser || !appwriteUser.$id) {
        throw new Error('No active backend session found');
      }

      // Step 2: Fetch and verify corresponding user document from database if available
      let verifiedUser: CurrentUser;
      try {
        const userProfile = await tablesDB.getRow(
          DATABASE_ID,
          TABLES.USERS,
          appwriteUser.$id
        );

        const syndId = userProfile.syndicate_id || `syn-${appwriteUser.$id}`;
        verifiedUser = {
          id: appwriteUser.$id,
          tenantId: syndId,
          name: appwriteUser.name || userProfile.name || appwriteUser.email?.split('@')[0] || 'Sovereign',
          color: userProfile.color || '#6A0DAD',
          syndicateId: syndId,
          covenant: userProfile.covenant || 'motion',
          xiBalance: userProfile.xi_balance ?? 1000,
          phiBalance: userProfile.phi_balance ?? 0,
          resonanceScore: userProfile.resonance_score ?? 50,
          mythosTitles: userProfile.mythos_titles || [],
          ageOfAscension: Boolean(userProfile.age_of_ascension ?? userProfile.ageOfAscension ?? true),
          titheRate: userProfile.tithe_rate ?? 0.03,
          calibrationScore: userProfile.calibration_score ?? 50,
          pact: userProfile.pact || 'Apprentice',
          hasOnboarded: Boolean(userProfile.has_onboarded ?? userProfile.hasOnboarded ?? true),
          cogniOpsRemaining: userProfile.cogni_ops_remaining ?? 100,
          cogniOpsLimit: userProfile.cogni_ops_limit ?? 100
        };
      } catch {
        // Fallback to base Appwrite account identity
        const syndId = `syn-${appwriteUser.$id}`;
        verifiedUser = {
          id: appwriteUser.$id,
          tenantId: syndId,
          name: appwriteUser.name || appwriteUser.email?.split('@')[0] || 'Sovereign',
          color: '#6A0DAD',
          syndicateId: syndId,
          covenant: 'motion',
          xiBalance: 1000,
          phiBalance: 0,
          resonanceScore: 50,
          mythosTitles: [],
          ageOfAscension: true,
          titheRate: 0.03,
          calibrationScore: 50,
          pact: 'Apprentice',
          hasOnboarded: true,
          cogniOpsRemaining: 100,
          cogniOpsLimit: 100
        };
      }

      if (isMounted.current) {
        setUser(verifiedUser);
        setIsValidating(false);
        setSessionError(null);
      }
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Session verification failed';
      if (isMounted.current) {
        setUser(null);
        setSessionError(errorMessage);
        setIsValidating(false);
      }
      return false;
    }
  }, []);

  const redirectToLogin = useCallback((redirectUrl?: string) => {
    const target = redirectUrl || loginPath;
    navigate(target, { replace: true, state: { from: location.pathname } });
  }, [navigate, loginPath, location.pathname]);

  // Check backend session validity without locking the user into any route
  useEffect(() => {
    isMounted.current = true;

    void (async () => {
      // If we already have an active authenticated user in context, do not block or redirect
      if (currentUser) {
        setIsValidating(false);
        return;
      }

      const isPublicRoute = publicPaths.some(path => location.pathname === path || (path !== '/' && location.pathname.startsWith(path)));
      if (isPublicRoute) {
        setIsValidating(false);
        return;
      }

      const isValid = await verifySession();
      if (!isValid && !isPublicRoute && isMounted.current) {
        redirectToLogin();
      }
    })();

    return () => {
      isMounted.current = false;
    };
  }, [verifySession, redirectToLogin, publicPaths, location.pathname, currentUser]);

  const value = {
    isAuthenticated: !!user,
    user,
    isValidating,
    sessionError,
    verifySession,
    redirectToLogin
  };

  return (
    <RouteGuardContext.Provider value={value}>
      {children}
    </RouteGuardContext.Provider>
  );
};

export const useRouteGuard = (): RouteGuardContextType => {
  const context = useContext(RouteGuardContext);
  if (!context) {
    throw new Error('useRouteGuard must be used within a RouteGuardProvider');
  }
  return context;
};
