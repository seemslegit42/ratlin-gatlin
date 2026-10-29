
/**
 * @file components/GlobalMobileNav.tsx
 * @description A global bottom navigation bar for mobile users.
 * Acts as the primary "Dock" for the application, featuring a prominent
 * Command Center trigger and quick access to core views.
 */

import React from 'react';
import { BrainIcon } from './icons/BrainIcon';
import { LayersIcon } from './icons/LayersIcon';
import { CoinsIcon } from './icons/EconomyIcons';
import { CompassIcon } from './icons/CompassIcon';
import { UsersIcon } from './icons/QuickActionIcons';
import type { View } from '../types';
import { motion } from 'framer-motion';
import { sounds } from '../utils/soundEffects';
import { CrystallineGlyph } from './icons/CrystallineGlyph';

interface GlobalMobileNavProps {
    currentView: View;
    onNavigate: (view: View) => void;
    /** Opens System Core (Command Center) — same compass hub as the ActionBar; lists all modules. */
    onOpenCommandCenter: () => void;
    /** Highlights the center control when the command sheet is open. */
    commandCenterOpen?: boolean;
}

const NavItem: React.FC<{ 
  view?: View; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  color: string;
  isMain?: boolean;
  /** Accessible name when label alone is ambiguous (e.g. center compass). */
  ariaLabel?: string;
}> = ({ icon, label, active, onClick, color, isMain, ariaLabel }) => (
    <button 
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? label}
        aria-current={active && !isMain ? 'page' : undefined}
        className={`one-tap relative flex flex-col items-center justify-end h-full flex-1 transition-all duration-300 ${active ? 'text-white' : 'text-text-secondary hover:text-white'}`}
        style={{ color: active ? 'white' : undefined }}
    >
        {isMain ? (
            // Center: opens System Core (same entry point as ActionBar compass → all modules)
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform transition-transform active:scale-95 z-20">
                <div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-black to-[#1a1a1a] border shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center relative overflow-hidden group ${active ? 'border-roman-aqua/60 ring-2 ring-roman-aqua/25' : 'border-white/20'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-imperial-purple/20 to-roman-aqua/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 text-white drop-shadow-md">
                        {icon}
                    </div>
                    {/* Ring Pulse */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/5 animate-pulse-slow" />
                </div>
            </div>
        ) : (
            // Standard Nav Items
            <div className={`flex flex-col items-center justify-center w-full h-full pb-2 space-y-0.5 ${active ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white/10 scale-110' : ''}`}>
                    {icon}
                </div>
                <span className="text-[9px] font-comfortaa font-bold uppercase tracking-widest leading-none">{label}</span>
                
                {active && (
                    <motion.div 
                        layoutId="mobile-nav-indicator"
                        className="absolute bottom-1 w-1 h-1 rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                )}
            </div>
        )}
    </button>
);

const GlobalMobileNav: React.FC<GlobalMobileNavProps> = ({ currentView, onNavigate, onOpenCommandCenter, commandCenterOpen = false }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100]">
            {/* Gradient Fade to blend content behind nav */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian-black via-obsidian-black/90 to-transparent pointer-events-none" />

            <nav
                aria-label="Primary navigation"
                className="relative h-[4.25rem] min-h-tap px-1.5 pb-safe bg-obsidian-black/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex items-stretch justify-between high-density"
            >
                
                <NavItem 
                    view="main" 
                    label="Cockpit" 
                    icon={<BrainIcon className="w-5 h-5" />} 
                    active={currentView === 'main'} 
                    onClick={() => {
                        sounds.playCrystallineChime(1200);
                        onNavigate('main');
                    }} 
                    color="#3EB991"
                />
                
                <NavItem 
                    view="weaver" 
                    label="Weaver" 
                    icon={<LayersIcon className="w-5 h-5" />} 
                    active={currentView === 'weaver'} 
                    onClick={() => {
                        sounds.playCrystallineChime(1300);
                        onNavigate('weaver');
                    }} 
                    color="#6A0DAD"
                />
                
                {/* System Core: same compass / command sheet as ActionBar — full module grid */}
                <NavItem 
                    label="Core" 
                    icon={<CompassIcon className="w-7 h-7" />} 
                    active={commandCenterOpen} 
                    onClick={() => {
                        sounds.playGlassThrum();
                        onOpenCommandCenter();
                    }} 
                    color="#20B2AA"
                    isMain={true}
                    ariaLabel="Open System Core — all modules"
                />
                
                <NavItem
                    view="economy"
                    label="Vault"
                    icon={<CoinsIcon className="w-5 h-5" />}
                    active={currentView === 'economy'}
                    onClick={() => {
                        sounds.playCrystallineChime(1400);
                        onNavigate('economy');
                    }}
                    color="#20B2AA"
                />

                <NavItem
                    view="crm"
                    label="Pipeline"
                    icon={<UsersIcon className="w-5 h-5" />}
                    active={currentView === 'crm'}
                    onClick={() => {
                        sounds.playCrystallineChime(1500);
                        onNavigate('crm');
                    }}
                    color="#3EB991"
                />
            </nav>
        </div>
    );
};

export default GlobalMobileNav;
