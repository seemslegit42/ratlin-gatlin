
import React from 'react';
import { ThreatDashboard } from '../../components/security/ThreatDashboard';
import { LiveThreatMap } from '../../components/security/LiveThreatMap';
import { BehavioralBaselines } from '../../components/security/BehavioralBaselines';
import BackButton from '../../components/shared/BackButton';
import type { View } from '../../types';
import { ModuleCard } from '../shared/ModuleCard'; // Added import
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon'; // Added import

interface SecurityViewProps {
    onNavigate: (view: View) => void;
}

const ComplianceSentinel: React.FC = () => (
    <ModuleCard title="Compliance Sentinel" icon={<ShieldCheckIcon className="w-5 h-5 text-roman-aqua" />}>
        <div className="space-y-3">
            <div className="flex justify-between items-center p-2 border-b border-white/5">
                <span className="text-sm font-bold text-white">GDPR</span>
                <span className="text-[10px] bg-patina-green/20 text-patina-green px-2 py-0.5 rounded border border-patina-green/30">COMPLIANT</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-white/5">
                <span className="text-sm font-bold text-white">HIPAA</span>
                <span className="text-[10px] bg-patina-green/20 text-patina-green px-2 py-0.5 rounded border border-patina-green/30">SECURE</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-white/5">
                <span className="text-sm font-bold text-white">SOC 2 Type II</span>
                <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-400/30">AUDIT PENDING</span>
            </div>
            <div className="text-[10px] text-text-tertiary mt-2 italic">
                Automated log retention policies active. Data residency verified.
            </div>
        </div>
    </ModuleCard>
);

const SecurityView: React.FC<SecurityViewProps> = ({ onNavigate }) => {
    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 high-density">
            <div className="flex items-center space-x-4 mb-2">
                <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
            </div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">
                    Security Operations
                </h1>
                <p className="text-sm text-text-tertiary font-mono tracking-widest mt-1">THREAT INTEL // ACCESS CONTROL // COMPLIANCE</p>
            </header>

            {/* Top row of key security metrics */}
            <ThreatDashboard />

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
