import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { CurrentUser, Covenant } from '../types';
import { account, tablesDB, DATABASE_ID, TABLES, teardownAppwriteRealtimeSockets, client, Permission, Role } from '../services/appwriteClient';
import { Models, ID } from 'appwrite';
import { toAuthUiMessage } from '../services/authErrors';
import { runFileManagementNow } from '../hooks/useFileManagement.js';

type ProfileSeed = Partial<Pick<CurrentUser, 'covenant' | 'syndicateId' | 'name' | 'hasOnboarded'>>;

/**
 * Interface for the AuthContext's value.
 */
interface AuthContextType {
  currentUser: CurrentUser | null;
  syndicateId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, userName: string, covenant: Covenant, syndicateName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<CurrentUser>) => Promise<void>;
  onAuthStateChange: (callback: (user: CurrentUser | null) => void) => () => void;
  handleSessionExpiry: () => void;
  requestPasswordRecovery: (email: string) => Promise<{ success: boolean; error?: string }>;
  completePasswordRecovery: (userId: string, secret: string, password: string, passwordAgain?: string) => Promise<{ success: boolean; error?: string }>;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined colors for user avatars
export const USER_COLORS = [
  '#6A0DAD', // Imperial Purple
  '#20B2AA', // Roman Aqua
  '#3EB991', // Patina Green
  '#FFD700', // Gilded Accent (Yellow)
  '#FF6347', // Tomato (Red-Orange)
  '#4682B4', // Steel Blue
  '#9ACD32', // Yellow Green
  '#EE82EE', // Violet
];

/** Map Appwrite Account → app `CurrentUser`; `seed` fills signup-time profile (covenant, tenant id, display name). */
const mapAppwriteUserToCurrentUser = (
  user: Models.User<Models.Preferences>,
  seed?: ProfileSeed,
): CurrentUser => {
    const syndicateId = seed?.syndicateId ?? 'default-syndicate';
    return {
        id: user.$id,
        tenantId: syndicateId,
        name: seed?.name ?? (user.name || user.email?.split('@')[0] || 'Sovereign'),
        color: '#6A0DAD', // Default Imperial Purple
        syndicateId,
        covenant: seed?.covenant ?? 'motion',
        xiBalance: 1000, 
        phiBalance: 0,
        resonanceScore: 50,
        mythosTitles: [],
        ageOfAscension: true,
        titheRate: 0.03, 
        calibrationScore: 50, 
        pact: 'Apprentice',
        hasOnboarded: seed?.hasOnboarded ?? true,
        cogniOpsRemaining: 100,
        cogniOpsLimit: 100
    };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);
  const authCallbacks = useRef<Set<(user: CurrentUser | null) => void>>(new Set());

  // Helper to notify listeners of auth state changes
  const notifyAuthStateChange = useCallback((user: CurrentUser | null) => {
    authCallbacks.current.forEach(callback => callback(user));
  }, []);

  // Helper to update user state and notify listeners
  const updateCurrentUser = useCallback((userOrFn: CurrentUser | null | ((prev: CurrentUser | null) => CurrentUser | null)) => {
    setCurrentUser(prev => {
        const next = typeof userOrFn === 'function' ? userOrFn(prev) : userOrFn;
        // Notify listeners after state update
        setTimeout(() => notifyAuthStateChange(next), 0);
        return next;
    });
  }, [notifyAuthStateChange]);

  // Register auth state change callback
  const onAuthStateChange = useCallback((callback: (user: CurrentUser | null) => void) => {
    authCallbacks.current.add(callback);
    // Immediately call with current state
    callback(currentUser);
    
    // Return cleanup function
    return () => {
      authCallbacks.current.delete(callback);
    };
  }, [currentUser]);

  // --- Account Recovery & Self-Healing ---
  const ensureAccountExists = useCallback(async (user: Models.User<Models.Preferences>, seed?: ProfileSeed) => {
    try {
      // Check if user profile exists in database
      const userProfile = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.USERS,
        user.$id
      );

      const base = mapAppwriteUserToCurrentUser(user, seed);

      // Explicitly convert snake_case DB attributes to CurrentUser properties
      const mappedUser: CurrentUser = {
        ...base,
        id: user.$id,
        tenantId: userProfile.syndicate_id || userProfile.syndicateId || base.syndicateId,
        name: user.name || userProfile.name || base.name,
        color: userProfile.color || base.color,
        syndicateId: userProfile.syndicate_id || userProfile.syndicateId || base.syndicateId,
        covenant: userProfile.covenant || base.covenant,
        xiBalance: userProfile.xi_balance ?? userProfile.xiBalance ?? base.xiBalance,
        phiBalance: userProfile.phi_balance ?? userProfile.phiBalance ?? base.phiBalance,
        resonanceScore: userProfile.resonance_score ?? userProfile.resonanceScore ?? base.resonanceScore,
        mythosTitles: userProfile.mythos_titles || userProfile.mythosTitles || base.mythosTitles,
        titheRate: userProfile.tithe_rate ?? userProfile.titheRate ?? base.titheRate,
        calibrationScore: userProfile.calibration_score ?? userProfile.calibrationScore ?? base.calibrationScore,
        pact: userProfile.pact || base.pact,
        hasOnboarded: Boolean(userProfile.has_onboarded ?? userProfile.hasOnboarded ?? base.hasOnboarded),
        ageOfAscension: Boolean(userProfile.age_of_ascension ?? userProfile.ageOfAscension ?? base.ageOfAscension),
        cogniOpsRemaining: userProfile.cogni_ops_remaining ?? userProfile.cogniOpsRemaining ?? base.cogniOpsRemaining,
        cogniOpsLimit: userProfile.cogni_ops_limit ?? userProfile.cogniOpsLimit ?? base.cogniOpsLimit,
      };

      return mappedUser;
    } catch (error: unknown) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? Number((error as { code?: number }).code)
          : NaN;

      // Profile doesn't exist, create it
      if (code === 404) {
        const initialHasOnboarded = seed?.hasOnboarded !== undefined ? seed.hasOnboarded : true;
        const defaultProfile = {
          ...mapAppwriteUserToCurrentUser(user, seed),
          hasOnboarded: initialHasOnboarded
        };
        try {
          await tablesDB.createRow(
            DATABASE_ID,
            TABLES.USERS,
            user.$id, // Use Appwrite user ID as document ID
            {
              user_id: user.$id,
              syndicate_id: defaultProfile.syndicateId,
              covenant: defaultProfile.covenant,
              xi_balance: defaultProfile.xiBalance,
              phi_balance: defaultProfile.phiBalance,
              resonance_score: defaultProfile.resonanceScore,
              mythos_titles: defaultProfile.mythosTitles,
              tithe_rate: defaultProfile.titheRate,
              pact: defaultProfile.pact,
              cogni_ops_remaining: defaultProfile.cogniOpsRemaining,
              cogni_ops_limit: defaultProfile.cogniOpsLimit,
              has_onboarded: true,
              age_of_ascension: defaultProfile.ageOfAscension,
              color: defaultProfile.color,
              name: defaultProfile.name,
            },
            [
              Permission.read(Role.user(user.$id)),
              Permission.update(Role.user(user.$id)),
              Permission.delete(Role.user(user.$id)),
            ]
          );
          return defaultProfile;
        } catch (createError) {
          console.error("Error creating user profile (falling back to Appwrite identity):", createError);
          return defaultProfile;
        }
      } else {
        console.error("Error fetching user profile (falling back to Appwrite identity):", error);
        return mapAppwriteUserToCurrentUser(user, seed);
      }
    }
  }, []);

  // --- Realtime Subscription for User Document Updates ---
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = `databases.${DATABASE_ID}.collections.${TABLES.USERS}.documents`;
    const unsubscribe = client.subscribe(channel, (response: any) => {
      if (!response || !response.payload) return;
      const record = response.payload;
      if (record.$id === currentUser.id || record.user_id === currentUser.id) {
        updateCurrentUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name: record.name || prev.name,
            color: record.color || prev.color,
            syndicateId: record.syndicate_id || record.syndicateId || prev.syndicateId,
            covenant: record.covenant || prev.covenant,
            xiBalance: record.xi_balance ?? record.xiBalance ?? prev.xiBalance,
            phiBalance: record.phi_balance ?? record.phiBalance ?? prev.phiBalance,
            resonanceScore: record.resonance_score ?? record.resonanceScore ?? prev.resonanceScore,
            mythosTitles: record.mythos_titles || record.mythosTitles || prev.mythosTitles,
            titheRate: record.tithe_rate ?? record.titheRate ?? prev.titheRate,
            calibrationScore: record.calibration_score ?? record.calibrationScore ?? prev.calibrationScore,
            pact: record.pact || prev.pact,
            hasOnboarded: Boolean(record.has_onboarded ?? record.hasOnboarded ?? prev.hasOnboarded),
            ageOfAscension: Boolean(record.age_of_ascension ?? record.ageOfAscension ?? prev.ageOfAscension),
            cogniOpsRemaining: record.cogni_ops_remaining ?? record.cogniOpsRemaining ?? prev.cogniOpsRemaining,
            cogniOpsLimit: record.cogni_ops_limit ?? record.cogniOpsLimit ?? prev.cogniOpsLimit,
          };
        });
      }
    });

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        console.warn('Realtime unsubscribe error in AuthContext:', err);
      }
    };
  }, [currentUser?.id, updateCurrentUser]);

  // --- Initial Load Logic ---
  useEffect(() => {
    mounted.current = true;

    const initialize = async () => {
      try {
        const userData = await account.get();
        if (mounted.current && userData) {
          const user = await ensureAccountExists(userData);
          if (mounted.current) updateCurrentUser(user);
        }
      } catch {
        // Not authenticated
        if (mounted.current) {
          updateCurrentUser(null);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => { mounted.current = false; };
  }, [ensureAccountExists, updateCurrentUser]);

  const login = useCallback(async (emailRaw: string, password: string) => {
    const email = emailRaw.trim().toLowerCase();
    try {
      try {
        await teardownAppwriteRealtimeSockets();
      } catch (teardownErr) {
        console.warn('Realtime teardown before login:', teardownErr);
      }
      try {
        await account.deleteSession('current');
      } catch {
        try {
          await (account as any).deleteSession({ sessionId: 'current' });
        } catch {
          /* no active session */
        }
      }
      try {
        await account.createEmailPasswordSession({ email, password });
      } catch (sessionErr: any) {
        const isSessionConflict =
          sessionErr?.type === 'user_session_already_exists' ||
          sessionErr?.code === 409 ||
          sessionErr?.message?.toLowerCase().includes('already exists') ||
          sessionErr?.message?.toLowerCase().includes('session is active');

        if (isSessionConflict) {
          // If session is already active, verify if it matches requested user
          const existingUser = await account.get().catch(() => null);
          if (existingUser && existingUser.email?.toLowerCase() === email) {
            // Already logged into this account
          } else {
            // Wipe all sessions and retry fresh
            await account.deleteSessions().catch(() => {});
            await account.createEmailPasswordSession({ email, password });
          }
        } else if (sessionErr?.message?.includes('Invalid') || sessionErr?.code === 400) {
          // Fallback for SDK interfaces expecting positional arguments
          await (account.createEmailPasswordSession as any)(email, password);
        } else {
          throw sessionErr;
        }
      }
      const userData = await account.get();
      const user = await ensureAccountExists(userData);
      if (!user) return { success: false, error: "Initialization failed." };
      updateCurrentUser(user);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: toAuthUiMessage(error) };
    }
  }, [ensureAccountExists, updateCurrentUser]);

  const register = useCallback(
    async (emailRaw: string, password: string, userName: string, covenant: Covenant, syndicateName?: string) => {
      const email = emailRaw.trim().toLowerCase();
      const name = userName.trim();
      if (!email || !password || !name) {
        return { success: false, error: 'Email, password, and display name are required.' };
      }
      if (password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters (Appwrite default minimum).',
        };
      }

      try {
        try {
          await account.deleteSession('current');
        } catch {
          try {
            await account.deleteSessions();
          } catch {
            /* no session */
          }
        }

        try {
          await teardownAppwriteRealtimeSockets();
        } catch (teardownErr) {
          console.warn('Realtime teardown before register:', teardownErr);
        }

        await account.create({
          userId: ID.unique(),
          email,
          password,
          name,
        });

        try {
          await account.createEmailPasswordSession({ email, password });
        } catch (sessionErr: any) {
          if (sessionErr?.message?.includes('Invalid') || sessionErr?.code === 400) {
            await (account.createEmailPasswordSession as any)(email, password);
          } else {
            throw sessionErr;
          }
        }

        const userData = await account.get();
        const syndicateId = `syn-${userData.$id}`;
        try {
          const prefs = await account.getPrefs();
          await account.updatePrefs({
            ...(typeof prefs === 'object' && prefs !== null ? prefs : {}),
            ...(syndicateName?.trim() ? { syndicate_alias: syndicateName.trim() } : {}),
          });
        } catch (prefsErr) {
          console.warn('Optional prefs update after signup failed:', prefsErr);
        }

        const user = await ensureAccountExists(userData, { covenant, syndicateId, name, hasOnboarded: true });
        if (user) updateCurrentUser(user);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: toAuthUiMessage(err) };
      }
    },
    [ensureAccountExists, updateCurrentUser],
  );

  const logout = useCallback(async () => {
    const syndicateForCleanup = currentUser?.syndicateId;
    try {
      try {
        await teardownAppwriteRealtimeSockets();
      } catch (teardownErr) {
        console.warn('Realtime teardown on logout:', teardownErr);
      }
      await account.deleteSession('current');
      updateCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      updateCurrentUser(null);
    } finally {
      runFileManagementNow('logout', syndicateForCleanup, true);
    }
  }, [currentUser?.syndicateId]);

  const updateUser = useCallback(async (updates: Partial<CurrentUser>) => {
    if (!currentUser) return;

    try {
      // Update name if provided (Appwrite Account)
      if (updates.name) {
        await account.updateName(updates.name);
      }

      // Update preferences for some fields (Appwrite Account)
      if (updates.color || updates.covenant) {
        const currentPrefs = await account.getPrefs();
        const newPrefs = {
          ...currentPrefs,
          ...(updates.color && { color: updates.color }),
          ...(updates.covenant && { covenant: updates.covenant })
        };
        await account.updatePrefs(newPrefs);
      }

      // Update custom profile fields in database
      const dbUpdates: Record<string, string | number | boolean | string[]> = {};
      if (updates.xiBalance !== undefined) dbUpdates.xi_balance = updates.xiBalance;
      if (updates.phiBalance !== undefined) dbUpdates.phi_balance = updates.phiBalance;
      if (updates.resonanceScore !== undefined) dbUpdates.resonance_score = updates.resonanceScore;
      if (updates.mythosTitles !== undefined) dbUpdates.mythos_titles = updates.mythosTitles;
      if (updates.titheRate !== undefined) dbUpdates.tithe_rate = updates.titheRate;
      if (updates.pact !== undefined) dbUpdates.pact = updates.pact;
      if (updates.cogniOpsRemaining !== undefined) dbUpdates.cogni_ops_remaining = updates.cogniOpsRemaining;
      if (updates.cogniOpsLimit !== undefined) dbUpdates.cogni_ops_limit = updates.cogniOpsLimit;
      if (updates.hasOnboarded !== undefined) dbUpdates.has_onboarded = updates.hasOnboarded;
      if (updates.ageOfAscension !== undefined) dbUpdates.age_of_ascension = updates.ageOfAscension;
      if (updates.name !== undefined) dbUpdates.name = updates.name;

      if (Object.keys(dbUpdates).length > 0) {
        await tablesDB.updateRow(
          DATABASE_ID,
          TABLES.USERS,
          currentUser.id,
          dbUpdates
        );
      }

      // Update local state
      updateCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }, [currentUser]);

  const handleSessionExpiry = useCallback(() => {
    const syndicateForCleanup = currentUser?.syndicateId;
    void (async () => {
      try {
        await teardownAppwriteRealtimeSockets();
      } catch (teardownErr) {
        console.warn('Realtime teardown on session expiry:', teardownErr);
      }
      updateCurrentUser(null);
      runFileManagementNow('session_expired', syndicateForCleanup, true);
    })();
  }, [updateCurrentUser, currentUser?.syndicateId]);

  const requestPasswordRecovery = useCallback(async (emailRaw: string) => {
    const email = emailRaw.trim().toLowerCase();
    if (!email) return { success: false, error: 'Email address is required.' };
    try {
      const recoveryUrl = `${window.location.origin}/recovery`;
      await account.createRecovery({ email, url: recoveryUrl });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: toAuthUiMessage(error) };
    }
  }, []);

  const completePasswordRecovery = useCallback(async (
    userId: string,
    secret: string,
    password: string,
    passwordAgain?: string
  ) => {
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
        });
      } catch {
        await (account.updateRecovery as any)(userId, secret, password);
      }
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: toAuthUiMessage(error) };
    }
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    try {
      const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify`;
      await account.createEmailVerification({ url: verifyUrl });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: toAuthUiMessage(error) };
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await account.getSession('current');
      if (session && mounted.current) {
        const userData = await account.get();
        const user = await ensureAccountExists(userData);
        if (mounted.current) updateCurrentUser(user);
      }
    } catch {
      if (mounted.current) {
        handleSessionExpiry();
      }
    }
  }, [ensureAccountExists, updateCurrentUser, handleSessionExpiry]);

  // Session heartbeat — silently refresh session every 10 minutes
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      void refreshSession();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser, refreshSession]);

  return (
    <AuthContext.Provider value={{
      currentUser, syndicateId: currentUser?.syndicateId || null, isLoading: loading,
      login, register, logout, updateUser, onAuthStateChange, handleSessionExpiry,
      requestPasswordRecovery, completePasswordRecovery, sendVerificationEmail, refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext.
 * @returns {AuthContextType} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
