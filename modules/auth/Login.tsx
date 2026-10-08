
/**
 * @file modules/auth/Login.tsx
 * @description The "Smart Container" for the Genesis Ritual authentication flow.
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import { IdentityForm } from '../../components/auth/IdentityForm';
import { VowSelection } from '../../components/auth/VowSelection';
import { IntentQuestion } from '../../components/auth/IntentQuestion';
import { Crossing } from '../../components/auth/Crossing';
import { VOWS, type VowType } from './auth.types';
import { generateOracleGreeting } from '../../services/ollamaService';
import { logInteraction } from '../../services/appLogger.js';

const Login: React.FC = () => {
    const { login, register, requestPasswordRecovery, sendVerificationEmail } = useAuth();
    
    // -- State --
    const [step, setStep] = useState<number>(0);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [oracleAxiom, setOracleAxiom] = useState<string>('Syncing Neural Pathways...');
    
    // Form Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [syndicateName, setSyndicateName] = useState(''); 
    
    const [selectedVow, setSelectedVow] = useState<VowType | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // -- Logic --
    const generateId = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const prefixes = ['Nebula', 'Aether', 'Void', 'Quantum', 'Hyper', 'Neon'];
            const suffixes = ['Dynamics', 'Systems', 'Collective', 'Syndicate', 'Labs', 'Protocol'];
            setSyndicateName(`${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`);
            setIsGenerating(false);
        }, 400);
    };

    const handleIdentitySubmit = async () => {
        setAuthError(null);
        if (!email.trim() || !password.trim()) {
            setAuthError('Credentials required.');
            return;
        }

        logInteraction('auth.credentials_submit', { mode: authMode });

        if (authMode === 'login') {
            const { success, error } = await login(email, password);
            if (success) {
                setOracleAxiom("Signature Verified. Welcome back, Sovereign.");
                setStep(3);
            } else {
                setAuthError(error || 'Access Denied.');
            }
        } else {
            if (!name.trim()) {
                setAuthError('Designation required.');
                return;
            }
            setStep(1);
        }
    };

    const handleRequestRecovery = async (recoveryEmail: string) => {
        logInteraction('auth.recovery_request', {});
        return requestPasswordRecovery(recoveryEmail);
    };

    const handleResendVerification = async () => {
        logInteraction('auth.resend_verification', {});
        return sendVerificationEmail();
    };

    const handleSelectVow = (vow: VowType) => {
        setSelectedVow(vow);
        setStep(2);
    };

    const handleSelectIntent = async (intent: string) => {
        if (!selectedVow) return;

        logInteraction('auth.complete_signup', { vowId: selectedVow });
        
        const vowConfig = VOWS.find(v => v.id === selectedVow);
        const covenant = vowConfig?.covenant || 'motion';

        // Start synthesis of welcome axiom immediately
        void generateOracleGreeting(selectedVow, name).then(setOracleAxiom);

        const { success, error } = await register(email, password, name, covenant, syndicateName);

        if (success) {
            setStep(3);
        } else {
            setAuthError(error || 'Initialization Failed.');
            setStep(0); 
        }
    };

    return (
        <AuthLayout>
            <AnimatePresence mode='wait'>
                {step === 0 && (
                    <IdentityForm 
                        mode={authMode} setMode={setAuthMode}
                        name={name} setName={setName}
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        syndicateId={syndicateName} setSyndicateId={setSyndicateName}
                        onSubmit={handleIdentitySubmit} generateId={generateId}
                        isGenerating={isGenerating} authError={authError} setAuthError={setAuthError}
                        onRequestRecovery={handleRequestRecovery}
                        onResendVerification={handleResendVerification}
                    />
                )}

                {step === 1 && (
                    <VowSelection onSelectVow={handleSelectVow} onBack={() => setStep(0)} />
                )}

                {step === 2 && selectedVow && (
                    <IntentQuestion vow={selectedVow} onSelectIntent={handleSelectIntent} onBack={() => setStep(1)} />
                )}

                {step === 3 && (
                    <Crossing vow={selectedVow || 'Sovereign'} message={oracleAxiom} />
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};

export default Login;
