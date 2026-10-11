/**
 * @file modules/auth/PasswordRecovery.tsx
 * @description The Sovereign Cipher Recovery Ritual (Password Recovery).
 * Facilitates the two-stage Appwrite Account Recovery Flow:
 *  1. Requesting the recovery dispatch via email.
 *  2. Consuming the secret token from the recovery link to set a new Axiom Cipher.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import { GlassPane } from '../../components/shared/GlassPane';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { KeyIcon } from '../../components/icons/KeyIcon';
import { NotificationContext, useNotifications } from '../../contexts/NotificationContext';

export const PasswordRecovery: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { requestPasswordRecovery, completePasswordRecovery } = useAuth();
  const notificationContext = React.useContext(NotificationContext);
  const notify = (msg: string, type?: 'success' | 'error' | 'info') => {
    if (notificationContext?.addNotification) {
      notificationContext.addNotification(msg, type);
    }
  };

  // Extract credentials from search params or hash params
  const [userId, setUserId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    let uid = searchParams.get('userId') || searchParams.get('user_id') || searchParams.get('uid');
    let sec = searchParams.get('secret') || searchParams.get('token');

    // Fallback: Check window.location.search directly in case router hasn't updated searchParams yet
    if ((!uid || !sec) && typeof window !== 'undefined' && window.location.search) {
      const windowParams = new URLSearchParams(window.location.search);
      uid = uid || windowParams.get('userId') || windowParams.get('user_id') || windowParams.get('uid');
      sec = sec || windowParams.get('secret') || windowParams.get('token');
    }

    // Fallback: Check hash string in case router is using hash-based routing
    if ((!uid || !sec) && typeof window !== 'undefined' && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const params = new URLSearchParams(hashQuery);
      uid = uid || params.get('userId') || params.get('user_id') || params.get('uid');
      sec = sec || params.get('secret') || params.get('token');
    }

    setUserId(uid);
    setSecret(sec);
  }, [searchParams]);

  const hasCredentials = Boolean(userId && secret);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabels = ['Cipher Weak', 'Cipher Nominal', 'Cipher Impervious'];
  const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-patina-green'];

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please provide your Sovereign neural link (email).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Invalid email address format.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordRecovery(trimmedEmail);
      if (res.success) {
        const successNotice = 'Recovery email has been successfully sent to your inbox. Inspect your messages to reset your password.';
        setStatusMessage(successNotice);
        notify(successNotice, 'success');
      } else {
        const errorNotice = res.error || 'Failed to dispatch recovery cipher.';
        setError(errorNotice);
        notify(errorNotice, 'error');
      }
    } catch (err: unknown) {
      const errorNotice = err instanceof Error ? err.message : 'Unexpected recovery error occurred.';
      setError(errorNotice);
      notify(errorNotice, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!userId || !secret) {
      const errorNotice = 'Missing recovery tokens. Please open the link directly from your email.';
      setError(errorNotice);
      notify(errorNotice, 'error');
      return;
    }

    if (!password || password.length < 8) {
      const errorNotice = 'Axiom Cipher must be at least 8 characters long.';
      setError(errorNotice);
      notify(errorNotice, 'error');
      return;
    }

    if (password !== passwordAgain) {
      const errorNotice = 'Cipher confirmations do not match.';
      setError(errorNotice);
      notify(errorNotice, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completePasswordRecovery(userId, secret, password, passwordAgain);
      if (res.success) {
        setIsComplete(true);
        const successNotice = 'Cipher successfully forged! Your Sovereign credentials have been updated.';
        setStatusMessage(successNotice);
        notify(successNotice, 'success');
      } else {
        const errorNotice = res.error || 'Cipher reset rejected by Appwrite.';
        setError(errorNotice);
        notify(errorNotice, 'error');
      }
    } catch (err: unknown) {
      const errorNotice = err instanceof Error ? err.message : 'Failed to update cipher.';
      setError(errorNotice);
      notify(errorNotice, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="relative w-full max-w-md mx-auto">
        <GlassPane className="p-8 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(28,25,52,0.4)] rounded-2xl relative overflow-hidden">
          {/* Top Decorative Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-roman-aqua/20 to-imperial-purple/20 border border-roman-aqua/40 flex items-center justify-center text-roman-aqua shadow-[0_0_20px_rgba(32,178,170,0.25)]">
              {hasCredentials ? <KeyIcon className="w-7 h-7" /> : <ShieldCheckIcon className="w-7 h-7" />}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-comfortaa font-bold text-vitreous-white tracking-wide">
              {isComplete
                ? 'Cipher Restored'
                : hasCredentials
                ? 'Forge New Axiom Cipher'
                : 'Forgot Password • Recovery Portal'}
            </h2>
            <p className="text-xs text-text-tertiary font-lexend mt-1.5 opacity-80">
              {isComplete
                ? 'Your access credentials have been securely recalibrated across Appwrite.'
                : hasCredentials
                ? 'Enter a new impervious cipher (password) to regain sovereign authority.'
                : 'Dispatch an encrypted Appwrite password recovery token to your registered email.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs text-center font-bold tracking-wide"
            >
              ⚠ {error}
            </motion.div>
          )}

          {/* Success Banner */}
          {statusMessage && !error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-patina-green/10 border border-patina-green/30 rounded-xl p-3 text-patina-green text-xs text-center font-bold tracking-wide"
            >
              ✓ {statusMessage}
            </motion.div>
          )}

          {/* State 1: Finished */}
          {isComplete ? (
            <div className="text-center space-y-5 pt-2">
              <p className="text-xs text-text-secondary leading-relaxed">
                Your cipher has been refreshed across the Appwrite neural lattice. You may now enter ΛΞVOS with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-roman-aqua hover:bg-roman-aqua/90 text-obsidian-black font-comfortaa font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(32,178,170,0.3)] active:scale-95"
              >
                Enter ΛΞVOS
              </button>
            </div>
          ) : hasCredentials ? (
            /* State 2: Reset Form with Token */
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-tertiary uppercase tracking-widest text-center">
                  New Axiom Cipher
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-white font-mono text-sm placeholder-white/20 focus:outline-none focus:border-roman-aqua focus:bg-white/10 transition-all"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="pt-1 flex items-center justify-between text-[9px] font-mono">
                    <div className="flex gap-1 flex-1 mr-3">
                      {[1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength >= lvl ? strengthColors[passwordStrength - 1] : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-text-tertiary uppercase tracking-wider">
                      {strengthLabels[passwordStrength - 1] || 'Weak'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-tertiary uppercase tracking-widest text-center">
                  Confirm Axiom Cipher
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordAgain}
                  onChange={(e) => setPasswordAgain(e.target.value)}
                  placeholder="Repeat cipher"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-white font-mono text-sm placeholder-white/20 focus:outline-none focus:border-roman-aqua focus:bg-white/10 transition-all"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-roman-aqua hover:bg-roman-aqua/90 disabled:opacity-50 text-obsidian-black font-comfortaa font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(32,178,170,0.3)] active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-obsidian-black border-t-transparent animate-spin" />
                    <span>Recalibrating Cipher...</span>
                  </>
                ) : (
                  <span>Forge New Cipher</span>
                )}
              </button>
            </form>
          ) : (
            /* State 3: Request Reset Link Form */
            <form onSubmit={handleRequestSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-tertiary uppercase tracking-widest text-center">
                  Neural Link (Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sovereign@aevon.os"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-white font-mono text-sm placeholder-white/20 focus:outline-none focus:border-patina-green focus:bg-white/10 transition-all"
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 rounded-xl text-white font-comfortaa font-bold tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Dispatching Token...</span>
                  </>
                ) : (
                  <span>Send Password Recovery Email</span>
                )}
              </button>
            </form>
          )}

          {/* Navigation Back */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-mono text-text-tertiary hover:text-white transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Return to Sacred Access</span>
            </button>
          </div>

          {/* Mandatory Brand Signature Stamp */}
          <div className="mt-8 pt-4 border-t border-white/5 flex flex-col items-center opacity-30 select-none mix-blend-overlay">
            <span className="font-comfortaa font-bold text-[10px] tracking-normal text-white">ΛΞV Inc</span>
            <span className="font-lexend text-[8px] tracking-[0.2em] text-white uppercase">The Future Needs Context</span>
            <span className="font-lexend text-[7px] tracking-[0.1em] text-white/80 uppercase mt-0.5">Innovate, Automate, Dominate</span>
          </div>
        </GlassPane>
      </div>
    </AuthLayout>
  );
};

export default PasswordRecovery;
