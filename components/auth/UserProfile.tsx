/**
 * @file components/auth/UserProfile.tsx
 * @description User profile component to display authenticated user details.
 */

import React, { useEffect, useState } from 'react';
import { getCurrentAccount } from '../../services/authService';
import { type Models } from 'appwrite';
import { GlassPane } from '../shared/GlassPane';

export const UserProfile: React.FC = () => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const account = await getCurrentAccount();
                setUser(account);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) return <div className="text-roman-aqua">Initializing...</div>;
    if (!user) return <div className="text-imperial-purple">No active session found.</div>;

    return (
        <GlassPane className="p-6 w-full max-w-sm">
            <h2 className="text-2xl font-comfortaa mb-4 text-vitreous-white">User Profile</h2>
            <div className="space-y-4 font-lexend">
                <div>
                    <label className="text-xs text-roman-aqua uppercase tracking-wider block">Name</label>
                    <p className="text-lg text-white">{user.name || 'N/A'}</p>
                </div>
                <div>
                    <label className="text-xs text-roman-aqua uppercase tracking-wider block">Email</label>
                    <p className="text-lg text-white">{user.email}</p>
                </div>
                <div>
                    <label className="text-xs text-roman-aqua uppercase tracking-wider block">User ID</label>
                    <p className="text-xs text-gray-400 font-mono break-all">{user.$id}</p>
                </div>
            </div>
        </GlassPane>
    );
};
