/**
 * @file modules/auth/EmailVerification.tsx
 * @description Ritual of Email Verification.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmEmailVerification } from '../../services/authService';
import { AuthLayout } from './AuthLayout';

export const EmailVerification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = useState<string | null>(null);

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    useEffect(() => {
        if (!userId || !secret) {
            setStatus('error');
            setError('Missing verification credentials.');
            return;
        }

        confirmEmailVerification(userId, secret).then(({ success, error }) => {
            if (success) {
                setStatus('success');
            } else {
                setStatus('error');
                setError(error || 'Verification failed.');
            }
        });
    }, [userId, secret]);

    return (
        <AuthLayout>
            <div className="bg-obsidian-black/60 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center">
                <h2 className="text-2xl font-comfortaa mb-6 text-vitreous-white">
                    {status === 'verifying' && 'Verifying Your Essence...'}
                    {status === 'success' && 'Verification Complete'}
                    {status === 'error' && 'Verification Failed'}
                </h2>
                
                {status === 'verifying' && (
                    <div className="w-12 h-12 border-4 border-imperial-purple/20 border-t-imperial-purple rounded-full animate-spin mx-auto" />
                )}

                {status === 'success' && (
                    <div className="text-patina-green">
                        <p className="mb-6">You have been verified, Sovereign. Proceed to the command center.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-roman-aqua text-obsidian-black px-6 py-2 rounded-lg font-comfortaa hover:bg-roman-aqua/90 transition"
                        >
                            Enter ΛΞVOS
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-red-400">
                        <p className="mb-6">{error}</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-imperial-purple text-vitreous-white px-6 py-2 rounded-lg font-comfortaa hover:bg-imperial-purple/90 transition"
                        >
                            Return to Ritual
                        </button>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
};
