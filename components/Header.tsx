
/**
 * @file components/Header.tsx
 * @description The Sovereign's Halo — Book III §3.1.
 *
 * Dual-state TopBar:
 *   Ambient State : balanced dashboard (default)
 *   Command State : BEEP input expands to full width on Cmd+K, central
 *                   elements slide out to create the "Altar" (§3.1).
 *
 * The Aurora Strip at the bottom acts as the System Health Syncytium,
 * subtly pulsing green when all systems are nominal.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, CurrentUser, WeaverMode } from '../types.js';
import { LevonLogoIcon } from './icons/LevonLogoIcon.js';
import { BrainIcon } from './icons/BrainIcon.js';
import { LayersIcon } from './icons/LayersIcon.js';
import UserProfileDropdown from './UserProfileDropdown.js';
import AvatarStack from './AvatarStack.js';
import { VIEW_REGISTRY } from '../config/navigationRegistry.js';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
    currentUser: CurrentUser;
    onOpenSettings: () => void;
    mode?: WeaverMode;
    setMode?: (mode: WeaverMode) => void;
    /** Live / Architect toggle — only on unified home `/` */
    showWorkspaceModes?: boolean;
    onSummonDemiurge: () => void;
    onLogout: () => void;
    /** Optional: fires when user submits a quick command from the TopBar altar. */
    onQuickCommand?: (cmd: string) => void;
    /** Connected syndicate team members for avatar stack. */
    users?: Record<string, any>;
}

// Fix: Added missing 'vault' and 'registry' properties
const VIEW_NAMES: Record<View, string> = {
    main: 'COCKPIT',
    weaver: 'WEAVER STUDIO',
    simulacrum: 'GALAXY VIEW',
    microAppForge: 'THE FORGE',
    economy: 'XI TREASURY',
    avf: 'AVF COMMAND DECK',
    finance: 'FOUNDERS FOCUS',
    crm: 'RELATIONSHIPS',
    hrm: 'TALENT GRID',
    production: 'SUPPLY CHAIN',
    operations: 'OPS COMMAND',
    security: 'SENTINEL',
    marketing: 'GROWTH ENGINE',
    procurement: 'SOURCING',
    admin: 'SYSTEM ROOT',
    codex: 'THE CODEX',
    pantheon: 'THE PANTHEON',
    vault: 'DATA VAULT',
    registry: 'SYNDICATE REGISTRY', // Added Registry
    help: 'HELP CENTER',
};

const Header: React.FC<HeaderProps> = ({
    currentView, onNavigate, currentUser, onOpenSettings,
    mode, setMode, showWorkspaceModes = false, onSummonDemiurge, onLogout, onQuickCommand,
    users = {},
}) => {
    const zoneLabel = VIEW_REGISTRY[currentView]?.label || VIEW_NAMES[currentView] || 'UNKNOWN SECTOR';

    // ── Command State (Book III §3.1) ─────────────────────────
    // When active, central elements slide out and a BEEP altar input expands.
    const [isCommandMode, setIsCommandMode] = useState(false);
    const [altarInput, setAltarInput]       = useState('');
    const altarRef = useRef<HTMLInputElement>(null);

    const enterCommandMode = useCallback(() => {
        setIsCommandMode(true);
        setTimeout(() => altarRef.current?.focus(), 120);
    }, []);

    const exitCommandMode = useCallback(() => {
        setIsCommandMode(false);
        setAltarInput('');
    }, []);

    const submitAltar = useCallback(() => {
        const cmd = altarInput.trim();
        if (!cmd) { exitCommandMode(); return; }
        onQuickCommand?.(cmd);
        setAltarInput('');
        exitCommandMode();
    }, [altarInput, exitCommandMode, onQuickCommand]);

    // Cmd+K toggles command mode globally
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandMode(v => !v);
            }
            if (e.key === 'Escape' && isCommandMode) exitCommandMode();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isCommandMode, exitCommandMode]);

    // Architect mode toggle
    const handleToggleMode = (targetMode: WeaverMode) => {
        if (!setMode || mode === targetMode) return;
        setMode(targetMode);
        if (!showWorkspaceModes) {
            onNavigate(targetMode === 'live' ? 'main' : 'weaver');
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 h-16 z-[100] backdrop-blur-xl border-b border-white/10 flex items-center px-3 md:px-5 shadow-glass-edge transition-all duration-300 overflow-hidden high-density ${
                isCommandMode ? 'bg-obsidian-black/95 topbar-command-active' : 'bg-obsidian-black/90'
            }`}
        >
            {/* ── 1. SOVEREIGN SIGIL — always anchored left ────── */}
            <div
                className="flex items-center space-x-3 cursor-pointer group flex-shrink-0 z-10 topbar-slide-left"
                onClick={() => { if (!isCommandMode) onNavigate('main'); }}
            >
                <div className="relative w-9 h-9 flex items-center justify-center bg-white/5 rounded-full border border-white/10 group-hover:border-imperial-purple/50 transition-colors overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-imperial-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <LevonLogoIcon className="w-5 h-5 text-vitreous-white group-hover:text-imperial-purple transition-colors duration-300 relative z-10" />
                </div>

                <AnimatePresence mode="wait">
                    {!isCommandMode && (
                        <motion.div
                            key={zoneLabel}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col min-w-0"
                        >
                            <span className="font-comfortaa font-bold text-sm text-vitreous-white tracking-tight leading-none uppercase">
                                {zoneLabel}
                            </span>
                            <span className="hidden sm:block text-[9px] text-text-tertiary font-mono tracking-widest uppercase mt-0.5 truncate max-w-[120px]">
                                {currentUser.syndicateId?.substring(0, 8) ?? 'Unknown'}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── 2. COMMAND STATE ALTAR — expands on Cmd+K ────── */}
            <AnimatePresence>
                {isCommandMode ? (
                    <motion.div
                        key="altar"
                        initial={{ opacity: 0, scaleX: 0.85, width: 0 }}
                        animate={{ opacity: 1, scaleX: 1, width: '100%' }}
                        exit={{ opacity: 0, scaleX: 0.85, width: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="flex-1 mx-4 flex items-center gap-3 relative"
                    >
                        {/* Altar glow border */}
                        <div className="absolute inset-0 rounded-xl border border-imperial-purple/40 shadow-[0_0_20px_rgba(106,13,173,0.2)] pointer-events-none" />
                        {/* BEEP sigil */}
                        <div className="w-6 h-6 rounded-full bg-imperial-purple/20 border border-imperial-purple/40 flex items-center justify-center flex-shrink-0 ml-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-imperial-purple animate-pulse" />
                        </div>
                        <input
                            ref={altarRef}
                            value={altarInput}
                            onChange={(e) => setAltarInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') submitAltar();
                                if (e.key === 'Escape') exitCommandMode();
                            }}
                            placeholder="Whisper your intent to BEEP…"
                            className="flex-1 bg-transparent text-sm text-white placeholder-text-tertiary outline-none font-lexend py-2"
                            aria-label="BEEP quick command"
                        />
                        <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                            <button
                                onClick={submitAltar}
                                disabled={!altarInput.trim()}
                                className="px-3 py-1 rounded-lg text-[10px] font-bold text-imperial-purple border border-imperial-purple/40 hover:bg-imperial-purple/15 transition-colors disabled:opacity-30 uppercase tracking-wider"
                            >
                                Decree
                            </button>
                            <button
                                onClick={exitCommandMode}
                                className="text-[10px] font-mono text-text-tertiary hover:text-white transition-colors"
                            >
                                Esc
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* ── 2b. AMBIENT STATE — Cmd+K altar only (vitals live in MainView) ── */
                    <motion.div
                        key="ambient"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden md:flex flex-1 items-center justify-center gap-3"
                    >
                        <button
                            onClick={enterCommandMode}
                            title="Open BEEP Altar (Cmd+K)"
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/10 border border-white/5 hover:border-imperial-purple/30 hover:bg-imperial-purple/5 transition-all group/pill"
                        >
                            <kbd className="text-[8px] font-mono text-text-tertiary bg-white/5 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
                            <span className="text-[10px] text-text-tertiary group-hover/pill:text-white transition-colors">Whisper to BEEP</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 3. COMMAND DECK — right, always visible ──────── */}
            <div className="flex items-center space-x-3 flex-shrink-0 z-10 topbar-slide-right">

                {/* Live ↔ Architect — unified home `/` only */}
                {showWorkspaceModes && setMode && mode && !isCommandMode && (
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 relative">
                        <motion.div
                            className="absolute top-1 bottom-1 w-[50%] bg-white/10 rounded shadow-sm border border-white/5"
                            initial={false}
                            animate={{ x: mode === 'live' ? '0%' : '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => handleToggleMode('live')}
                            className={`relative px-3 py-1.5 flex items-center gap-2 rounded transition-colors ${mode === 'live' ? 'text-white' : 'text-text-tertiary hover:text-white'}`}
                        >
                            <BrainIcon className={`w-3.5 h-3.5 ${mode === 'live' ? 'text-roman-aqua' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                        </button>
                        <button
                            onClick={() => handleToggleMode('architect')}
                            className={`relative px-3 py-1.5 flex items-center gap-2 rounded transition-colors ${mode === 'architect' ? 'text-white' : 'text-text-tertiary hover:text-white'}`}
                        >
                            <LayersIcon className={`w-3.5 h-3.5 ${mode === 'architect' ? 'text-imperial-purple' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Architect</span>
                        </button>
                    </div>
                )}

                {/* Syndicate Presence Avatars */}
                <div className="hidden lg:flex items-center">
                    <AvatarStack 
                        users={users && Object.values(users).length > 0 
                            ? (Object.values(users) as any[]) 
                            : (currentUser ? [{ id: currentUser.id, name: currentUser.name, color: '#3eb991', pact: currentUser.pact } as any] : [])} 
                        selfId={currentUser?.id} 
                    />
                </div>

                {/* User Profile Dropdown */}
                <UserProfileDropdown
                    currentUser={currentUser}
                    onOpenSettings={onOpenSettings}
                    onSummonDemiurge={onSummonDemiurge}
                    onLogout={onLogout}
                />
            </div>

            {/* ── Aurora Strip — System Health Syncytium ─────── */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-patina-green to-transparent opacity-25 animate-pulse-slow" />
            {/* Wabi-sabi micro-imperfection on the header surface */}
            <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none" />
        </header>
    );
};

export default Header;
