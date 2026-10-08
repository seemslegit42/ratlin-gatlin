
/**
 * @file components/finance/foundersfocus/ComplianceCSRS4200.tsx
 * @description Automates the CSRS 4200 "Compilation Engagements" workflow.
 * Includes the "Knowledge of the Entity" conversational agent and engagement letter generation.
 */

import React from 'react';
import { ModuleCard } from '../../../modules/shared/ModuleCard';
import { ShieldCheckIcon } from '../../icons/ShieldCheckIcon';

const ComplianceItem: React.FC<{ label: string; status: 'Complete' | 'Pending' | 'Action Req'; date?: string }> = ({ label, status, date }) => (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
        <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${status === 'Complete' ? 'bg-patina-green' : status === 'Pending' ? 'bg-text-tertiary' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-sm font-bold text-vitreous-white">{label}</span>
        </div>
        <div className="flex items-center space-x-4">
            {date && <span className="text-xs text-text-tertiary font-mono">{date}</span>}
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                status === 'Complete' ? 'text-patina-green border-patina-green/30 bg-patina-green/10' : 
                status === 'Pending' ? 'text-text-secondary border-white/10 bg-white/5' : 
                'text-red-400 border-red-500/30 bg-red-500/10'
            }`}>
                {status}
            </span>
        </div>
    </div>
);

export const ComplianceCSRS4200: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* The Interview Agent */}
            <ModuleCard title="Knowledge of the Entity" icon={<ShieldCheckIcon className="w-5 h-5 text-roman-aqua"/>}>
                <div className="flex flex-col h-96">
                    <div className="flex-grow bg-black/30 rounded-lg border border-white/5 p-4 mb-4 overflow-y-auto space-y-4">
                        {/* Simulated Chat */}
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-roman-aqua/20 flex items-center justify-center text-roman-aqua font-bold text-xs">AI</div>
                            <div className="bg-white/10 rounded-r-xl rounded-bl-xl p-3 text-sm text-vitreous-white max-w-[80%]">
                                Based on your recent GL entries, I see a new revenue stream from "Consulting". Is this a recurring service or a one-time project? (Ref: CPA Handbook 4200)
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 justify-end">
                            <div className="bg-roman-aqua/10 border border-roman-aqua/30 rounded-l-xl rounded-br-xl p-3 text-sm text-white max-w-[80%]">
                                It's a recurring monthly retainer for Project Alpha.
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">ME</div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-roman-aqua/20 flex items-center justify-center text-roman-aqua font-bold text-xs">AI</div>
                            <div className="bg-white/10 rounded-r-xl rounded-bl-xl p-3 text-sm text-vitreous-white max-w-[80%]">
                                Noted. I have updated the "Nature of Operations" section. Do you have any inventory that might be obsolete as of year-end?
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <input type="text" placeholder="Respond to Compliance Agent..." className="flex-grow bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-roman-aqua outline-none" />
                        <button className="px-4 py-2 bg-roman-aqua text-black font-bold rounded-lg hover:bg-white transition-colors">Send</button>
                    </div>
                </div>
            </ModuleCard>

            {/* Documentation Status */}
            <div className="space-y-6">
                <ModuleCard title="Engagement Documentation">
                    <div className="space-y-2">
                        <ComplianceItem label="Form 1.10: Engagement Letter" status="Complete" date="Oct 20, 2025" />
                        <ComplianceItem label="Form 2.10: Knowledge of Entity" status="Action Req" />
                        <ComplianceItem label="Form 1.20: Mgmt Acknowledgement" status="Pending" />
                        <ComplianceItem label="Basis of Accounting Note" status="Complete" date="Auto-Generated" />
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                        <h4 className="text-yellow-400 text-xs font-bold uppercase mb-1">Disclaimer Injection Active</h4>
                        <p className="text-[10px] text-text-secondary">
                            "The financial information has been prepared on a cash basis of accounting, as prescribed by management for tax purposes. No assurance is provided."
                        </p>
                    </div>
                </ModuleCard>

                <ModuleCard title="The CPA Bridge">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-vitreous-white">
                            <span className="font-bold">Export Package Ready</span>
                            <p className="text-[10px] text-text-tertiary">Includes Trial Balance, GL, and 4200 Checklist.</p>
                        </div>
                        <button className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span>Download ZIP</span>
                        </button>
                    </div>
                </ModuleCard>
            </div>
        </div>
    );
};
