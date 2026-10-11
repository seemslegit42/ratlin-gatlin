/**
 * @file components/auth/EditProfileModal.tsx
 * @description Modal component for editing authenticated user details.
 */

import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { updateName, updatePrefs } from '../../services/authService';
import { type Models } from 'appwrite';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Models.User<Models.Preferences>;
    onSuccess: (updatedUser: Models.User<Models.Preferences>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const [name, setName] = useState(user.name || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await updateName(name);
            if (result.success && result.data) {
                onSuccess(result.data);
                onClose();
            } else {
                setError(result.error || 'Failed to update profile.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-imperial-purple text-sm">{error}</p>}
                <div>
                    <label className="text-xs text-roman-aqua uppercase tracking-wider block mb-1">Display Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                        required
                    />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-vitreous-white/70 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-roman-aqua/20 border border-roman-aqua/50 rounded-lg text-roman-aqua text-sm hover:bg-roman-aqua/30 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
