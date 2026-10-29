/**
 * @file components/auth/UserProfile.tsx
 * @description User profile component leveraging useAuth hook to display name and email, with editable display name updating Appwrite account profile and updating UI immediately.
 */

import React, { useState, useEffect } from 'react';
import { getCurrentAccount, updateName } from '../../services/authService';
import { type Models } from 'appwrite';
import { GlassPane } from '../shared/GlassPane';
import { useAuth } from '../../contexts/AuthContext';

export const UserProfile: React.FC = () => {
    const { currentUser, updateUser, isLoading: authLoading } = useAuth();
    const [accountUser, setAccountUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchAccount() {
            try {
                const acc = await getCurrentAccount();
                setAccountUser(acc);
                if (acc?.name) {
                    setDisplayName(acc.name);
                } else if (currentUser?.name) {
                    setDisplayName(currentUser.name);
                }
            } catch (error) {
                console.error('Failed to fetch Appwrite account:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAccount();
    }, [currentUser?.name]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const result = await updateName(displayName);
            if (result.success && result.data) {
                setAccountUser(result.data);
                await updateUser({ name: displayName });
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
                setIsEditing(false);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.message || 'An unexpected error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return <div className="p-6 text-roman-aqua font-lexend">Loading profile...</div>;
    }

    const email = accountUser?.email || (currentUser as any)?.email || 'N/A';
    const name = displayName || currentUser?.name || accountUser?.name || 'Sovereign User';

    return (
        <GlassPane className="p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-comfortaa text-vitreous-white">Sovereign Profile</h2>
                <span className="px-3 py-1 bg-roman-aqua/10 text-roman-aqua text-xs font-mono rounded-full border border-roman-aqua/30">
                    Active Session
                </span>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-lexend ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                    {message.text}
                </div>
            )}

            {!isEditing ? (
                <div className="space-y-4 font-lexend">
                    <div>
                        <label className="text-xs text-roman-aqua uppercase tracking-wider block">Display Name</label>
                        <p className="text-lg text-white font-medium">{name}</p>
                    </div>
                    <div>
                        <label className="text-xs text-roman-aqua uppercase tracking-wider block">Email Address</label>
                        <p className="text-lg text-white">{email}</p>
                    </div>
                    <div>
                        <label className="text-xs text-roman-aqua uppercase tracking-wider block">Appwrite User ID</label>
                        <p className="text-xs text-gray-400 font-mono break-all">{accountUser?.$id || currentUser?.id || 'N/A'}</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-roman-aqua/20 border border-roman-aqua/50 rounded-lg text-roman-aqua text-sm font-lexend hover:bg-roman-aqua/30 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-4 font-lexend">
                    <div>
                        <label className="text-xs text-roman-aqua uppercase tracking-wider block mb-1">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-roman-aqua outline-none transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-roman-aqua uppercase tracking-wider block mb-1">Email Address (Read-only)</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-black/60 border border-white/5 rounded-lg p-3 text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setDisplayName(accountUser?.name || currentUser?.name || '');
                            }}
                            className="px-4 py-2 text-sm text-vitreous-white/70 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-roman-aqua/20 border border-roman-aqua/50 rounded-lg text-roman-aqua text-sm font-lexend hover:bg-roman-aqua/30 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </GlassPane>
    );
};
