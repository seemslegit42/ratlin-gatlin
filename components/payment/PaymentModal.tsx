
/**
 * @file components/payment/PaymentModal.tsx
 * @description A sophisticated payment modal using Stripe Elements.
 * Features a "Black Card" aesthetic, credit card flip animation, and status feedback.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Modal from '../shared/Modal';
import { confirmMockPayment } from '../../services/stripeService';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { LockIcon } from '../icons/LockIcons';

// Use a demo key if none provided in localStorage
const DEMO_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    amount: number;
    onSuccess: () => void;
}

const CheckoutForm: React.FC<{ amount: number; onSuccess: () => void; onClose: () => void }> = ({ amount, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        // Simulate backend handshake
        try {
            const isConfirmed = await confirmMockPayment();
            
            if (isConfirmed) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                throw new Error("Card declined by The Phalanx protocol.");
            }
        } catch (err: any) {
            setError(err.message || "Payment failed.");
            setIsProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-patina-green rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(62,185,145,0.6)]"
                >
                    <ShieldCheckIcon className="w-8 h-8 text-black" />
                </motion.div>
                <h3 className="text-xl font-bold text-white font-comfortaa">Transaction Verified</h3>
                <p className="text-sm text-text-tertiary mt-2">Allocating Resources...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-text-secondary uppercase">Secure Gateway</span>
                        <LockIcon className="w-3 h-3 text-patina-green" />
                    </div>
                    <div className="flex space-x-1">
                        <div className="w-8 h-5 bg-white/10 rounded opacity-50" />
                        <div className="w-8 h-5 bg-white/10 rounded opacity-50" />
                    </div>
                </div>
                
                <div className="p-3 bg-input-bg border border-white/10 rounded-lg">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#F0F2F5',
                                    fontFamily: '"Lexend", sans-serif',
                                    '::placeholder': {
                                        color: '#718096',
                                    },
                                    iconColor: '#3EB991',
                                },
                                invalid: {
                                    color: '#EF4444',
                                    iconColor: '#EF4444',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20 flex items-center gap-2">
                    <span className="font-bold">ERROR:</span> {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-4 bg-gradient-to-r from-imperial-purple to-roman-aqua rounded-xl text-white font-bold font-mono tracking-widest shadow-lg hover:shadow-imperial-purple/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>PROCESSING</span>
                    </div>
                ) : (
                    <span className="relative z-10">AUTHORIZE ${amount}</span>
                )}
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            
            <div className="text-center">
                <p className="text-[10px] text-text-tertiary">
                    Encrypted via Stripe. Powered by The Syndicate.
                </p>
            </div>
        </form>
    );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planName, amount, onSuccess }) => {
    // Load Stripe key from Integrations if available, else fallback to demo
    const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

    useEffect(() => {
        if (isOpen) {
            const storedIntegrations = localStorage.getItem('beep_integrations');
            let key = DEMO_KEY;
            if (storedIntegrations) {
                const parsed = JSON.parse(storedIntegrations);
                if (parsed['stripe']?.apiKey) {
                    key = parsed['stripe'].apiKey;
                }
            }
            setStripePromise(loadStripe(key));
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Value Transfer Protocol">
            <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/5 flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-bold text-vitreous-white">{planName}</h4>
                    <p className="text-xs text-text-tertiary">Immediate Activation</p>
                </div>
                <div className="text-xl font-mono font-bold text-roman-aqua">
                    ${amount}
                </div>
            </div>

            {stripePromise && (
                <Elements stripe={stripePromise}>
                    <CheckoutForm amount={amount} onSuccess={onSuccess} onClose={onClose} />
                </Elements>
            )}
        </Modal>
    );
};

export default PaymentModal;
