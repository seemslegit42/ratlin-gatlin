/**
 * @file useAppwriteAuth.native.ts
 * @description React Native hook for Appwrite 2.0 Auth, Team memberships, and tenant verification.
 */

import { useState, useEffect, useCallback } from 'react';
import { account, teams, checkAppwriteSession } from '../../services/appwriteNativeService.js';
import type { Models } from 'appwrite';

export function useAppwriteAuth() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [teamMemberships, setTeamMemberships] = useState<Models.Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { authenticated, user: currentUser } = await checkAppwriteSession();
      if (authenticated && currentUser) {
        setUser(currentUser);
        try {
          const teamList = await teams.list();
          // Extract memberships or teams
          setTeamMemberships(teamList.teams as any);
        } catch {
          setTeamMemberships([]);
        }
      } else {
        setUser(null);
        setTeamMemberships([]);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await account.createEmailPasswordSession(email, pass);
      await refreshSession();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setTeamMemberships([]);
    } catch {}
  };

  return {
    user,
    teamMemberships,
    isLoading,
    refreshSession,
    loginWithEmail,
    logout,
  };
}
