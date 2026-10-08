
/**
 * @file components/auth/IdentityForm.tsx
 * @description Phase 1: The Call to Sovereignty & The Threshold.
 * Captures the Initiate's Designation (Whisper) and simulates the Ether's response (Echo).
 * Supports "Access" (Login) vs "Initialize" (Signup) modes.
 * Includes password recovery trigger, email verification resend, and password visibility toggle.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STEP_VARIANTS } from '../../modules/auth/auth.types';
import { GlassPane } from '../shared/GlassPane';
import { PlusIcon } from '../icons/PlusIcon'; 

interface IdentityFormProps {
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  syndicateId: string;
  setSyndicateId: (val: string) => void;
  onSubmit: () => void | Promise<void>;
  generateId: () => void;
  isGenerating: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  onRequestRecovery?: (email: string) => Promise<{ success: boolean; error?: string }>;
  onResendVerification?: () => Promise<{ success: boolean; error?: string }>;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({
  mode, setMode, name, setName, email, setEmail, password, setPassword,
  syndicateId, setSyndicateId, onSubmit, generateId, isGenerating,
  authError, setAuthError, onRequestRecovery, onResendVerification
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const isVerificationError = authError?.toLowerCase().includes('verif') ?? false;

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setAuthError(null); 
    setRecoveryStatus(null);
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail || (!recoveryMode && !password.trim())) {
        setAuthError('Email and password credentials are required.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        setAuthError('Please enter a valid email address format.');
        return;
    }

    if (mode === 'signup' && !name.trim()) {
        setAuthError('Operator designation is required for initialization.');
        return;
    }

    if (mode === 'signup' && !recoveryMode && password.length < 8) {
        setAuthError('Password must be at least 8 characters long.');
        return;
    }

    if (recoveryMode) {
      if (!onRequestRecovery) return;
      setIsSubmitting(true);
      try {
        const result = await onRequestRecovery(trimmedEmail);
        if (result.success) {
          setRecoveryStatus('Password recovery link dispatched. Please check your inbox.');
          setRecoveryMode(false);
        } else {
          setAuthError(result.error || 'Recovery request failed.');
        }
      } catch (err) {
        setAuthError('An unexpected error occurred during password recovery.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit());
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication attempt failed.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, name, mode, recoveryMode, onRequestRecovery, onSubmit, setAuthError]);

  const handleResendVerification = useCallback(async () => {
    if (!onResendVerification) return;
    const result = await onResendVerification();
    if (result.success) {
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 10000);
    } else {
      setAuthError(result.error || 'Could not send verification email.');
    }
  }, [onResendVerification, setAuthError]);

  const passwordStrength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2 : 3;

  const strengthColors = ['', 'bg-red-500', 'bg-yellow-400', 'bg-patina-green'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <motion.div
      key="step0"
      variants={STEP_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative z-10 w-full"
    >
      <GlassPane variant="modal" className="p-8 relative overflow-hidden w-full min-h-[420px] flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-roman-aqua to-transparent opacity-50"></div>

        <AnimatePresence mode="wait">
            {!isSubmitting ? (
                <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                    className="space-y-6"
                >
                    {/* Mode Toggle */}
                    {!recoveryMode && (
                      <div className="flex justify-center mb-2">
                          <div className="bg-black/40 p-1 rounded-xl flex space-x-1 border border-white/10 shadow-inner">
                              <button
                                  type="button"
                                  onClick={() => { setMode('login'); setAuthError(null); setRecoveryStatus(null); }}
                                  className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${mode === 'login' ? 'bg-white/10 text-white shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                              >
                                  Access
                              </button>
                              <button
                                  type="button"
                                  onClick={() => { setMode('signup'); setAuthError(null); setRecoveryStatus(null); }}
                                  className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${mode === 'signup' ? 'bg-imperial-purple text-white shadow-lg shadow-imperial-purple/20' : 'text-text-tertiary hover:text-white'}`}
                              >
                                  Initialize
                              </button>
                          </div>
                      </div>
                    )}

                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-1 font-comfortaa text-white tracking-tight">
                            {recoveryMode ? 'Axiom Recovery' : mode === 'login' ? 'Neural Handshake' : 'Protocol Initialization'}
                        </h2>
                        <p className="text-xs text-text-tertiary font-mono uppercase tracking-widest opacity-60">
                            {recoveryMode ? 'Resetting Cipher' : mode === 'login' ? 'Confirming Sovereignty' : 'Preparing the Seed'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Designation (Signup Only) */}
                        <AnimatePresence>
                            {mode === 'signup' && !recoveryMode && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="group relative"
                                >
                                    <label className="block text-[9px] font-bold text-text-tertiary uppercase tracking-[0.3em] mb-1 text-center group-focus-within:text-roman-aqua transition-colors">
                                        Subject Designation
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Architect Prime"
                                        className="w-full bg-transparent border-b border-white/10 px-4 py-2 text-white text-center placeholder-white/5 focus:outline-none focus:border-roman-aqua transition-all font-comfortaa text-lg"
                                        aria-label="Your designation"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="group">
                            <label className="block text-[9px] font-bold text-text-tertiary uppercase tracking-[0.3em] mb-1 text-center group-focus-within:text-patina-green transition-colors">
                                Neural Link (Email)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="sovereign@aevon.os"
                                className="w-full bg-transparent border-b border-white/10 px-4 py-2 text-white text-center placeholder-white/5 focus:outline-none focus:border-patina-green transition-all font-mono text-sm"
                                aria-label="Your email"
                                autoComplete="email"
                            />
                        </div>

                        {!recoveryMode && (
                          <div className="group">
                              <label className="block text-[9px] font-bold text-text-tertiary uppercase tracking-[0.3em] mb-1 text-center group-focus-within:text-imperial-purple transition-colors">
                                  Axiom Cipher (Password)
                              </label>
                              <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="w-full bg-transparent border-b border-white/10 px-4 py-2 pr-10 text-white text-center placeholder-white/5 focus:outline-none focus:border-imperial-purple transition-all font-mono text-sm"
                                    aria-label="Your password"
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors p-1"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      {showPassword ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                      ) : (
                                        <>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </>
                                      )}
                                    </svg>
                                </button>
                              </div>

                              {/* Password strength indicator (signup only) */}
                              {mode === 'signup' && password.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex gap-1 flex-1">
                                    {[1, 2, 3].map(level => (
                                      <div key={level} className={`h-0.5 flex-1 rounded-full transition-colors ${passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-white/10'}`} />
                                    ))}
                                  </div>
                                  <span className="text-[8px] font-mono text-text-tertiary uppercase tracking-wider">{strengthLabels[passwordStrength]}</span>
                                </div>
                              )}
                          </div>
                        )}

                        {/* Syndicate ID (Signup Only) */}
                        <AnimatePresence>
                            {mode === 'signup' && !recoveryMode && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex flex-col items-center pt-3"
                                >
                                    <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.3em] mb-1">
                                        Syndicate Alias
                                    </label>
                                    <div className="flex items-center space-x-2 bg-black/20 p-1 rounded-lg border border-white/5">
                                        <input
                                            type="text"
                                            value={syndicateId}
                                            onChange={(e) => setSyndicateId(e.target.value)}
                                            placeholder="Nebula Collective"
                                            className="bg-transparent px-3 py-1 text-patina-green text-center placeholder-white/10 focus:outline-none transition-all font-mono text-xs min-w-[220px]"
                                            aria-label="Syndicate Name"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateId}
                                            disabled={isGenerating}
                                            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-patina-green transition-colors"
                                            title="Cycle Alias"
                                        >
                                            <PlusIcon className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {authError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-red-400 text-[10px] text-center font-bold uppercase tracking-wider"
                            >
                                <span className="mr-2">⚠</span> {authError}
                                {isVerificationError && onResendVerification && (
                                  <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={verificationSent}
                                    className="block mx-auto mt-2 text-roman-aqua hover:text-white transition-colors underline underline-offset-2 normal-case tracking-normal"
                                  >
                                    {verificationSent ? '✓ Verification email sent' : 'Resend verification email'}
                                  </button>
                                )}
                            </motion.div>
                        )}

                        {recoveryStatus && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-patina-green/10 border border-patina-green/30 rounded-lg p-2.5 text-patina-green text-[10px] text-center font-bold uppercase tracking-wider"
                          >
                            ✓ {recoveryStatus}
                          </motion.div>
                        )}

                        <div className="pt-4 flex flex-col items-center gap-3">
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(32,178,170,0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-12 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3"
                                aria-label={recoveryMode ? 'Send Recovery Link' : 'Confirm Credentials'}
                            >
                                <span>{recoveryMode ? 'Send Recovery' : mode === 'login' ? 'Enter' : 'Manifest'}</span>
                                <div className="w-1 h-1 rounded-full bg-roman-aqua animate-pulse" />
                            </motion.button>

                            {/* Password recovery / back link */}
                            {mode === 'login' && !recoveryMode && onRequestRecovery && (
                              <button
                                type="button"
                                onClick={() => { setRecoveryMode(true); setAuthError(null); setRecoveryStatus(null); }}
                                className="text-[10px] text-text-tertiary hover:text-roman-aqua transition-colors font-mono uppercase tracking-wider"
                              >
                                Forgot Axiom Cipher?
                              </button>
                            )}
                            {recoveryMode && (
                              <button
                                type="button"
                                onClick={() => { setRecoveryMode(false); setAuthError(null); }}
                                className="text-[10px] text-text-tertiary hover:text-white transition-colors font-mono uppercase tracking-wider"
                              >
                                ← Return to Access
                              </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            ) : (
                <motion.div
                    key="echo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-8 py-10"
                >
                    <div className="relative w-20 h-20 mx-auto">
                        <motion.div 
                            className="absolute inset-0 rounded-full border-2 border-dashed border-roman-aqua/40"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div 
                            className="absolute inset-2 rounded-full border-2 border-t-imperial-purple border-r-transparent border-b-patina-green border-l-transparent"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-comfortaa text-white font-light tracking-wide">
                            {mode === 'login' ? 'Confirming Signature' : 'Resonating with Ether'}
                        </h3>
                        <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-[0.4em] animate-pulse">
                            Establishing neural sync...
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </GlassPane>
    </motion.div>
  );
};
