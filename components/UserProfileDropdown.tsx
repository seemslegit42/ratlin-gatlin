/**
 * @file components/UserProfileDropdown.tsx
 * @description Unified user profile and system control dropdown menu.
 * Integrates Demiurge Console, Settings, and user identity in one cohesive interface.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrentUser } from '../types.js';
import { CrownIcon } from './icons/CrownIcon.js';
import { CogIcon } from './icons/AgentStatusIcons.js';
import { LayersIcon } from './icons/LayersIcon.js';
import { PowerIcon } from './icons/AgentStatusIcons.js';

interface UserProfileDropdownProps {
    currentUser: CurrentUser;
    onOpenSettings: () => void;
    onSummonDemiurge: () => void;
    onLogout: () => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
    currentUser,
    onOpenSettings,
    onSummonDemiurge,
    onLogout
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleMenuClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    // User color for avatar
    const userInitial = currentUser.name?.charAt(0).toUpperCase() || 'S';
    const userColorClass = `bg-${currentUser.color || 'imperial-purple'}/20 border-${currentUser.color || 'imperial-purple'}/50`;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button - User Avatar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-imperial-purple/10 border border-imperial-purple/30 hover:bg-imperial-purple/20 hover:border-imperial-purple/60 transition-all shadow-[0_0_15px_rgba(106,13,173,0.1)] hover:shadow-[0_0_25px_rgba(106,13,173,0.3)] overflow-hidden"
                title="System Controls"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-imperial-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 font-comfortaa font-bold text-sm text-imperial-purple">
                    {userInitial}
                </span>
                
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center border border-white/20">
                    <div className="w-1.5 h-1.5 bg-patina-green rounded-full animate-pulse" />
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-obsidian-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[200] overflow-hidden"
                    >
                        {/* User Info Header */}
                        <div className="p-4 border-b border-white/5 bg-imperial-purple/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-imperial-purple/20 border border-imperial-purple/50 flex-shrink-0">
                                    <span className="font-comfortaa font-bold text-sm text-imperial-purple">
                                        {userInitial}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-comfortaa font-bold text-white text-sm truncate">
                                        {currentUser.name || 'Sovereign'}
                                    </p>
                                    <p className="text-[10px] text-text-tertiary font-mono truncate">
                                        {currentUser.syndicateId?.substring(0, 12)}...
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Info */}
                        <div className="px-4 py-3 border-b border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-text-tertiary uppercase tracking-widest">Xi Balance</span>
                                <span className="font-mono font-bold text-patina-green">
                                    {(currentUser.xiBalance || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-text-tertiary uppercase tracking-widest">Φ (Potential)</span>
                                <span className="font-mono font-bold text-roman-aqua">
                                    {(currentUser.phiBalance || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {/* Demiurge Console */}
                            <motion.button
                                whileHover={{ x: 4 }}
                                onClick={() => handleMenuClick(onSummonDemiurge)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-imperial-purple/10 transition-colors group"
                            >
                                <CrownIcon className="w-4 h-4 text-imperial-purple group-hover:text-imperial-purple transition-colors flex-shrink-0" />
                                <div className="text-left min-w-0">
                                    <p className="text-sm font-semibold leading-none">Demiurge Console</p>
                                    <p className="text-[10px] text-text-tertiary mt-1">Root system access</p>
                                </div>
                            </motion.button>

                            {/* System Configuration */}
                            <motion.button
                                whileHover={{ x: 4 }}
                                onClick={() => handleMenuClick(onOpenSettings)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-imperial-purple/10 transition-colors group"
                            >
                                <CogIcon className="w-4 h-4 text-roman-aqua group-hover:text-roman-aqua transition-colors flex-shrink-0" />
                                <div className="text-left min-w-0">
                                    <p className="text-sm font-semibold leading-none">System Config</p>
                                    <p className="text-[10px] text-text-tertiary mt-1">Settings & preferences</p>
                                </div>
                            </motion.button>

                            {/* Workspace Info */}
                            <motion.button
                                whileHover={{ x: 4 }}
                                className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-white/5 transition-colors group cursor-default"
                            >
                                <LayersIcon className="w-4 h-4 text-text-tertiary group-hover:text-white transition-colors flex-shrink-0" />
                                <div className="text-left min-w-0">
                                    <p className="text-sm font-semibold leading-none">Workspace Status</p>
                                    <p className="text-[10px] text-patina-green mt-1">✓ Connected & Nominal</p>
                                </div>
                            </motion.button>
                        </div>

                        {/* Logout */}
                        <div className="py-1 border-t border-white/5">
                            <motion.button
                                whileHover={{ x: 4 }}
                                onClick={() => handleMenuClick(onLogout)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors group"
                            >
                                <PowerIcon className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors flex-shrink-0" />
                                <div className="text-left min-w-0">
                                    <p className="text-sm font-semibold leading-none">Disconnect</p>
                                    <p className="text-[10px] text-red-400/60 mt-1">End session</p>
                                </div>
                            </motion.button>
                        </div>

                        {/* Footer Divider */}
                        <div className="border-t border-white/5 h-1 bg-gradient-to-r from-transparent via-imperial-purple/20 to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfileDropdown;
