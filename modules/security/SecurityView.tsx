
import React, { useState } from 'react';
import { ThreatDashboard } from '../../components/security/ThreatDashboard';
import { LiveThreatMap } from '../../components/security/LiveThreatMap';
import { BehavioralBaselines } from '../../components/security/BehavioralBaselines';
import BackButton from '../../components/shared/BackButton';
import type { View } from '../../types';
import { ModuleCard } from '../shared/ModuleCard'; // Added import
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon'; // Added import
import { CrystallineGlyph } from '../../components/icons/CrystallineGlyph';
import { sounds } from '../../utils/soundEffects';

interface SecurityViewProps {
    onNavigate: (view: View) => void;
}

interface ThreatIncident {
    id: string;
    target: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    type: string;
    timestamp: string;
    status: 'ACTIVE' | 'CONTAINED' | 'QUARANTINED';
}

const INITIAL_INCIDENTS: ThreatIncident[] = [
    { id: 'INC-901', target: 'Agent-4 (Cognitive Core)', severity: 'HIGH', type: 'Prompt Injection Probe', timestamp: '2m ago', status: 'ACTIVE' },
    { id: 'INC-902', target: 'Postman MCP Bridge (:3100)', severity: 'MEDIUM', type: 'Unsolicited Header Traversal', timestamp: '14m ago', status: 'CONTAINED' },
    { id: 'INC-903', target: 'Appwrite Storage (Media Vault)', severity: 'CRITICAL', type: 'Excessive Read Burst', timestamp: '38m ago', status: 'QUARANTINED' },
    { id: 'INC-904', target: 'Syndicate libSQL Edge', severity: 'MEDIUM', type: 'Schema Introspection', timestamp: '1h ago', status: 'CONTAINED' },
];

const ComplianceSentinel: React.FC = () => (
    <ModuleCard title="Compliance Sentinel" icon={<ShieldCheckIcon className="w-5 h-5 text-roman-aqua" />}>
        <div className="space-y-3">
            <div className="flex justify-between items-center p-2 border-b border-white/5">
                <span className="text-sm font-bold text-white font-comfortaa">GDPR Sovereign Vault</span>
                <span className="text-[10px] text-patina-green font-mono">100% COMPLIANT</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-white/5">
                <span className="text-sm font-bold text-white font-comfortaa">HIPAA Data Isolation</span>
                <span className="text-[10px] text-patina-green font-mono">ENCRYPTED AT REST</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-white/5">
                <span className="text-sm font-bold text-white font-comfortaa">SOC 2 Type II Invariants</span>
                <span className="text-[10px] text-yellow-400 font-mono">VERIFIED LIVE</span>
            </div>
            <div className="text-[10px] text-text-tertiary mt-2 italic font-lexend">
                Automated continuous zero-knowledge attestation active across all tenant rows.
            </div>
        </div>
    </ModuleCard>
);

const SecurityView: React.FC<SecurityViewProps> = ({ onNavigate }) => {
    const [incidents, setIncidents] = useState<ThreatIncident[]>(INITIAL_INCIDENTS);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CONTAINED'>('ALL');
    const [quarantineActive, setQuarantineActive] = useState(false);
    const [keysRotated, setKeysRotated] = useState(false);

    const handleQuarantine = (id: string) => {
        sounds.playErrorHum();
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'QUARANTINED' } : inc));
    };

    const handleRotateKeys = () => {
        sounds.playGlassThrum();
        setKeysRotated(true);
        setTimeout(() => {
            sounds.playSuccessHarmonic();
            setKeysRotated(false);
        }, 1500);
    };

    const handleTriggerLockdown = () => {
        sounds.playErrorHum();
        setQuarantineActive(true);
        setTimeout(() => {
            sounds.playSuccessHarmonic();
            setQuarantineActive(false);
        }, 2000);
    };

    const filteredIncidents = incidents.filter(i => {
        if (filter === 'ACTIVE') return i.status === 'ACTIVE';
        if (filter === 'CONTAINED') return i.status === 'CONTAINED' || i.status === 'QUARANTINED';
        return true;
    });

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-6 space-y-6 font-lexend high-density">
            <div className="flex items-center justify-between">
                <BackButton onClick={() => onNavigate('main')} label="Cockpit" />
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRotateKeys}
                        className="px-3 py-1.5 rounded-lg text-xs font-comfortaa font-bold uppercase bg-white/5 hover:bg-white/10 text-roman-aqua border border-roman-aqua/30 transition-all flex items-center gap-1.5"
                    >
                        <CrystallineGlyph type="vault" size="xs" />
                        <span>{keysRotated ? 'Rotating Keys...' : 'Rotate Ed25519 Keys'}</span>
                    </button>
                    <button
                        onClick={handleTriggerLockdown}
                        className="px-3 py-1.5 rounded-lg text-xs font-comfortaa font-bold uppercase bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/40 transition-all flex items-center gap-1.5"
                    >
                        <CrystallineGlyph type="sentinel" size="xs" glowColor="#EF4444" />
                        <span>{quarantineActive ? 'Sanitizing Mesh...' : 'Emergency Quarantine'}</span>
                    </button>
                </div>
            </div>

            <header className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-comfortaa text-white tracking-tight flex items-center gap-3">
                        <CrystallineGlyph type="sentinel" size="md" state="active" />
                        <span>Security Operations & Sentinel Defense</span>
                    </h1>
                    <p className="text-xs text-text-tertiary font-mono tracking-widest uppercase mt-1">
                        Zero-Trust Lattice · Biometric Attestation · Automated Incident Containment
                    </p>
                </div>
                <div className="text-right font-mono text-xs text-text-tertiary">
                    Firewall Invariants: <span className="text-patina-green font-bold">4,120 Passed</span> · 0 Breaches
                </div>
            </header>

            {/* Top row of key security metrics */}
            <ThreatDashboard />

            {/* Incident Response Deck */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                        <h3 className="font-comfortaa font-bold text-base text-white">
                            Autonomous Threat Mitigation Deck
                        </h3>
                        <p className="text-xs text-text-tertiary font-lexend">
                            Real-time detection of adversarial prompts, anomalous MCP payloads, and API abuse.
                        </p>
                    </div>

                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
                        {(['ALL', 'ACTIVE', 'CONTAINED'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    sounds.playCrystallineChime(1100);
                                    setFilter(tab);
                                }}
                                className={`px-2.5 py-1 rounded transition-colors uppercase ${
                                    filter === tab ? 'bg-roman-aqua text-black font-bold' : 'text-text-tertiary hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredIncidents.map(inc => (
                        <div key={inc.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-white">{inc.id}</span>
                                    <span className="text-xs text-text-tertiary">·</span>
                                    <span className="text-xs font-bold text-roman-aqua">{inc.type}</span>
                                    <span className="text-xs text-text-tertiary">·</span>
                                    <span className={`text-[10px] font-mono font-bold ${
                                        inc.severity === 'CRITICAL' ? 'text-red-400' : inc.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
                                    }`}>
                                        {inc.severity}
                                    </span>
                                </div>
                                <div className="text-xs text-text-secondary font-mono">
                                    Target: {inc.target} <span className="text-text-tertiary">({inc.timestamp})</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                                    inc.status === 'QUARANTINED' ? 'bg-imperial-purple/20 text-purple-300' : inc.status === 'CONTAINED' ? 'bg-patina-green/20 text-patina-green' : 'bg-red-500/20 text-red-300 animate-pulse'
                                }`}>
                                    {inc.status}
                                </span>
                                {inc.status === 'ACTIVE' && (
                                    <button
                                        onClick={() => handleQuarantine(inc.id)}
                                        className="px-2.5 py-1 rounded text-[10px] font-comfortaa font-bold uppercase tracking-wider bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-colors"
                                    >
                                        Isolate Target
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <LiveThreatMap />
                </div>
                <ComplianceSentinel />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                <BehavioralBaselines />
            </div>
        </div>
    );
};

export default SecurityView;
