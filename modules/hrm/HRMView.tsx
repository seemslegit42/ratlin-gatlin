/**
 * @file modules/hrm/HRMView.tsx
 * @description Human & Agent Resource Management.
 * Comprehensive talent management with org chart, performance reviews,
 * headcount planning, recruitment pipeline, and secure comms grid.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../shared/ModuleCard';
import { UsersIcon } from '../../components/icons/QuickActionIcons';
import { HeadcountWidget } from '../../components/hrm/HeadcountWidget';
import { TalentConstellation } from '../../components/hrm/TalentConstellation';
import BackButton from '../../components/shared/BackButton';
import type { View, Agent } from '../../types';
import { AgentStatus } from '../../types';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { MegaphoneIcon } from '../../components/icons/MarketingIcons';
import { ZapIcon, TrendingUpIcon } from '../../components/icons/VitalsIcons';
import { LayersIcon } from '../../components/icons/LayersIcon';
import { ShieldIcon } from '../../components/icons/SecurityIcons';

interface HRMViewProps {
    onNavigate: (view: View) => void;
    /** Live agent map from workflow state — used to populate the Agent Workforce section. */
    agents?: Record<string, Agent>;
}

type HRMTab = 'overview' | 'roster' | 'performance' | 'recruiting' | 'planning';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    department: string;
    type: 'FTE' | 'Contract' | 'Agent';
    status: 'Active' | 'PTO' | 'Offboarding';
    tenure: string;
    performanceScore: number;
    skills: string[];
    color: string;
    reportsTo?: string;
}

const TEAM: TeamMember[] = [
    { id: 'u1', name: 'Sovereign Director', role: 'CEO / Founder', department: 'Executive', type: 'FTE', status: 'Active', tenure: '3y', performanceScore: 98, skills: ['Strategy', 'Vision', 'Capital'], color: '#6A0DAD', reportsTo: undefined },
    { id: 'u2', name: 'Axiom Chen', role: 'CTO', department: 'Engineering', type: 'FTE', status: 'Active', tenure: '2y', performanceScore: 95, skills: ['Systems', 'AI/ML', 'Architecture'], color: '#20B2AA', reportsTo: 'u1' },
    { id: 'u3', name: 'Nebula Okonkwo', role: 'Head of Growth', department: 'Marketing', type: 'FTE', status: 'Active', tenure: '18mo', performanceScore: 91, skills: ['Demand Gen', 'SEO', 'ABM'], color: '#FFD700', reportsTo: 'u1' },
    { id: 'u4', name: 'Void Kapoor', role: 'Lead Engineer', department: 'Engineering', type: 'FTE', status: 'Active', tenure: '1y', performanceScore: 88, skills: ['Bun', 'TypeScript', 'React'], color: '#3EB991', reportsTo: 'u2' },
    { id: 'u5', name: 'Quantum Rivera', role: 'Product Designer', department: 'Design', type: 'FTE', status: 'PTO', tenure: '8mo', performanceScore: 90, skills: ['Figma', 'UX Research', 'Systems Design'], color: '#FF6B6B', reportsTo: 'u1' },
    { id: 'u6', name: 'Aether Nzinga', role: 'Operations Lead', department: 'Ops', type: 'Contract', status: 'Active', tenure: '6mo', performanceScore: 85, skills: ['Kanban', 'Process', 'Logistics'], color: '#4FC3F7', reportsTo: 'u1' },
    { id: 'u7', name: 'Analyst-7', role: 'AI Cognitive Node', department: 'Agent Workforce', type: 'Agent', status: 'Active', tenure: '4mo', performanceScore: 94, skills: ['Data Analysis', 'Synthesis', 'Pattern Recognition'], color: '#BB86FC', reportsTo: 'u2' },
    { id: 'u8', name: 'Campaign-Nexus', role: 'AI Campaign Agent', department: 'Agent Workforce', type: 'Agent', status: 'Active', tenure: '2mo', performanceScore: 89, skills: ['Outreach', 'Personalization', 'Scheduling'], color: '#CF6679', reportsTo: 'u3' },
];

const DEPARTMENTS = Array.from(new Set(TEAM.map(t => t.department)));

const STATUS_COLORS: Record<string, string> = {
    Active: 'bg-patina-green/10 text-patina-green border-patina-green/30',
    PTO: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    Offboarding: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const TYPE_COLORS: Record<string, string> = {
    FTE: 'text-roman-aqua',
    Contract: 'text-yellow-400',
    Agent: 'text-imperial-purple',
};

const RECRUITMENT_STAGES = [
    { label: 'Applied', count: 18, color: 'bg-text-tertiary' },
    { label: 'Screening', count: 11, color: 'bg-blue-400' },
    { label: 'Interview', count: 6, color: 'bg-roman-aqua' },
    { label: 'Offer', count: 2, color: 'bg-yellow-400' },
    { label: 'Hired', count: 1, color: 'bg-patina-green' },
];

const OPEN_ROLES = [
    { title: 'Senior Full-Stack Engineer', dept: 'Engineering', priority: 'Critical', posted: '3d ago' },
    { title: 'Growth Marketing Manager', dept: 'Marketing', priority: 'High', posted: '1w ago' },
    { title: 'AI/ML Research Scientist', dept: 'Engineering', priority: 'High', posted: '2w ago' },
    { title: 'Customer Success Lead', dept: 'Ops', priority: 'Medium', posted: '3w ago' },
];

const HEADCOUNT_PLAN = [
    { quarter: 'Q1 \'25', target: 8, actual: 8, budget: 480000 },
    { quarter: 'Q2 \'25', target: 12, actual: 11, budget: 720000 },
    { quarter: 'Q3 \'25', target: 16, actual: null, budget: 960000 },
    { quarter: 'Q4 \'25', target: 20, actual: null, budget: 1200000 },
];

const PRIORITY_COLORS: Record<string, string> = {
    Critical: 'text-red-400 bg-red-400/10 border-red-400/30',
    High: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    Medium: 'text-roman-aqua bg-roman-aqua/10 border-roman-aqua/30',
};

/** Live agent workforce panel — pulls from workflow state if available, falls back to TEAM mock. */
const AgentWorkforceStats: React.FC<{ liveAgents?: Agent[] }> = ({ liveAgents }) => {
    const agents = liveAgents && liveAgents.length > 0 ? liveAgents : TEAM.filter(m => m.type === 'Agent').map(m => ({
        id: m.id, name: m.name, status: AgentStatus.OPERATIONAL, type: 'CognitiveCore',
        metrics: { iqi: m.performanceScore },
    } as unknown as Agent));

    const activeCount = agents.filter(a =>
        a.status === AgentStatus.Running || a.status === AgentStatus.OPERATIONAL
    ).length;
    const estHours = agents.length * 120;
    const topAgent = liveAgents && liveAgents.length > 0
        ? liveAgents.reduce((best, a) => (a.metrics.iqi > (best?.metrics.iqi ?? 0) ? a : best), liveAgents[0])
        : null;

    const statusDot = (a: Agent) => {
        if (a.status === AgentStatus.Running || a.status === AgentStatus.OPERATIONAL) return 'bg-patina-green animate-pulse';
        if (a.status === AgentStatus.Error) return 'bg-red-400';
        if (a.status === AgentStatus.Pending) return 'bg-yellow-400 animate-pulse';
        return 'bg-text-tertiary';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-imperial-purple/10 border border-imperial-purple/20 rounded-lg">
                <div className="flex items-center gap-2">
                    <BrainIcon className="w-4 h-4 text-imperial-purple" />
                    <span className="text-xs font-bold text-white">Digital Labor Force</span>
                </div>
                <span className="text-xs font-mono text-white">{activeCount} / {agents.length} Active</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-text-tertiary">
                    <span>Est. Equivalent FTE Hours / mo</span>
                    <span className="text-white">~{estHours} hrs</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-imperial-purple h-full transition-all duration-700"
                        style={{ width: `${agents.length > 0 ? (activeCount / agents.length) * 100 : 0}%` }}
                    />
                </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/5">
                {agents.slice(0, 8).map(agent => (
                    <div key={agent.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusDot(agent)}`} />
                            <span className="text-white truncate max-w-[140px]">{agent.name}</span>
                        </div>
                        <span className="text-text-tertiary font-mono text-[10px]">{agent.status}</span>
                    </div>
                ))}
                {agents.length > 8 && (
                    <div className="text-[9px] text-text-tertiary text-center">+{agents.length - 8} more agents</div>
                )}
            </div>
            {topAgent && (
                <div className="pt-2 border-t border-white/5 text-[10px] text-text-tertiary">
                    Top IQI: <span className="text-roman-aqua font-bold">{topAgent.name} ({topAgent.metrics.iqi.toFixed(0)})</span>
                </div>
            )}
        </div>
    );
};

const OrgChart: React.FC<{ members: TeamMember[] }> = ({ members }) => {
    const exec = members.filter(m => !m.reportsTo);
    const direct = members.filter(m => m.reportsTo === exec[0]?.id);

    return (
        <div className="overflow-x-auto custom-scrollbar py-4">
            <div className="flex flex-col items-center gap-6 min-w-[600px]">
                {/* Tier 1: CEO */}
                <div className="flex justify-center">
                    {exec.map(m => (
                        <div key={m.id} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-black shadow-lg" style={{ backgroundColor: m.color }}>
                                {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="text-[10px] font-bold text-white mt-1">{m.name}</div>
                            <div className="text-[9px] text-text-tertiary">{m.role}</div>
                        </div>
                    ))}
                </div>

                {/* Connector */}
                <div className="w-px h-6 bg-white/20" />

                {/* Tier 2 */}
                <div className="flex gap-8 relative">
                    <div className="absolute top-0 left-[10%] right-[10%] h-px bg-white/20" style={{ top: '-1.5rem' }} />
                    {direct.map(m => (
                        <div key={m.id} className="flex flex-col items-center gap-1">
                            <div className="w-px h-6 bg-white/20 mx-auto" />
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-md" style={{ backgroundColor: m.color }}>
                                {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="text-[10px] font-bold text-white text-center">{m.name}</div>
                            <div className="text-[9px] text-text-tertiary text-center">{m.role}</div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[m.status]}`}>{m.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HRMView: React.FC<HRMViewProps> = ({ onNavigate, agents = {} }) => {
    const [activeTab, setActiveTab] = useState<HRMTab>('overview');
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [filterDept, setFilterDept] = useState<string>('All');

    const liveAgentList = useMemo(() => Object.values(agents) as Agent[], [agents]);

    const filteredTeam = filterDept === 'All' ? TEAM : TEAM.filter(m => m.department === filterDept);
    const ftCount = TEAM.filter(m => m.type === 'FTE').length;
    const contractCount = TEAM.filter(m => m.type === 'Contract').length;
    const agentCount = liveAgentList.length > 0 ? liveAgentList.length : TEAM.filter(m => m.type === 'Agent').length;
    const avgPerformance = Math.round(TEAM.reduce((s, m) => s + m.performanceScore, 0) / TEAM.length);

    const tabs: { id: HRMTab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'roster', label: 'Roster' },
        { id: 'performance', label: 'Performance' },
        { id: 'recruiting', label: 'Recruiting' },
        { id: 'planning', label: 'Headcount Plan' },
    ];

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 bg-obsidian-black/80 font-lexend high-density">
            <div className="flex items-center space-x-4">
                <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
            </div>

            <header className="border-b border-white/10 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                        Human & Agent Resources
                    </h1>
                    <p className="text-sm text-text-tertiary font-mono tracking-[0.2em] mt-1 uppercase">
                        Talent // Payroll // Collaboration // Planning
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="text-center">
                        <div className="text-xl font-mono font-bold text-white">{TEAM.length}</div>
                        <div className="text-[9px] text-text-tertiary uppercase tracking-widest">Total</div>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                        <div className="text-xl font-mono font-bold text-roman-aqua">{ftCount}</div>
                        <div className="text-[9px] text-text-tertiary uppercase tracking-widest">FTE</div>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                        <div className="text-xl font-mono font-bold text-imperial-purple">{agentCount}</div>
                        <div className="text-[9px] text-text-tertiary uppercase tracking-widest">Agents</div>
                    </div>
                </div>
            </header>

            {/* Tab Nav */}
            <div className="flex flex-wrap gap-2 bg-black/30 p-1.5 rounded-xl border border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === tab.id
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-text-tertiary hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ==================== OVERVIEW ==================== */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Headcount', value: TEAM.length.toString(), sub: `${ftCount} FTE · ${contractCount} contract`, color: 'text-white' },
                                { label: 'AI Agent Nodes', value: agentCount.toString(), sub: 'Digital labor force', color: 'text-imperial-purple' },
                                { label: 'Avg Performance', value: `${avgPerformance}%`, sub: 'Across all reviews', color: 'text-patina-green' },
                                { label: 'Open Roles', value: OPEN_ROLES.length.toString(), sub: `${OPEN_ROLES.filter(r => r.priority === 'Critical').length} critical`, color: 'text-red-400' },
                            ].map(({ label, value, sub, color }) => (
                                <div key={label} className="bg-black/40 border border-white/5 rounded-xl p-4">
                                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">{label}</div>
                                    <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
                                    <div className="text-[9px] text-text-tertiary mt-1">{sub}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <TalentConstellation />
                            </div>
                            <ModuleCard title="Total Headcount" icon={<UsersIcon className="w-6 h-6 text-blue-400" />}>
                                <HeadcountWidget total={TEAM.length} fte={ftCount} contract={contractCount} />
                            </ModuleCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <ModuleCard title="The Pantheon (Agent HR)">
                                <AgentWorkforceStats liveAgents={liveAgentList.length > 0 ? liveAgentList : undefined} />
                            </ModuleCard>
                            <ModuleCard title="Secure Comms Grid" icon={<MegaphoneIcon className="w-5 h-5 text-roman-aqua" />}>
                                <div className="grid grid-cols-2 gap-3">
                                    {TEAM.filter(m => m.type !== 'Agent').slice(0, 4).map(m => (
                                        <div key={m.id} className="bg-white/5 border border-white/10 p-2 rounded-lg flex items-center gap-2">
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-black" style={{ backgroundColor: m.color }}>
                                                    {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${m.status === 'Active' ? 'bg-patina-green' : 'bg-yellow-400'}`} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-white truncate w-20">{m.name.split(' ')[0]}</div>
                                                <div className="text-[9px] text-roman-aqua">Encrypted Link</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 py-2 bg-roman-aqua/10 border border-roman-aqua/30 text-roman-aqua text-xs font-bold rounded hover:bg-roman-aqua/20 transition-colors uppercase tracking-wider">
                                    Initiate Team Sync
                                </button>
                            </ModuleCard>
                            <ModuleCard title="Approvals & Payroll">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                            <span className="text-xs text-white">PTO: Quantum Rivera</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-patina-green text-xs font-bold hover:underline">Approve</button>
                                            <span className="text-white/20">|</span>
                                            <button className="text-red-400 text-xs font-bold hover:underline">Deny</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                            <span className="text-xs text-white">Contract Renewal: Aether</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-patina-green text-xs font-bold hover:underline">Review</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-text-secondary">Payroll Status</span>
                                        <span className="text-sm font-bold text-patina-green font-mono">On Track</span>
                                    </div>
                                    <div className="text-[10px] text-text-tertiary mt-1">Next Run: Nov 28 · Est. $162,000</div>
                                    <button className="w-full mt-3 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/30 hover:bg-blue-500/30 transition-colors uppercase tracking-wider">
                                        View Run Preview
                                    </button>
                                </div>
                            </ModuleCard>
                        </div>
                    </motion.div>
                )}

                {/* ==================== ROSTER ==================== */}
                {activeTab === 'roster' && (
                    <motion.div key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Org Chart */}
                        <ModuleCard title="Org Structure" icon={<LayersIcon className="w-5 h-5 text-roman-aqua" />}>
                            <OrgChart members={TEAM} />
                        </ModuleCard>

                        {/* Roster Table */}
                        <ModuleCard title="Full Roster" action={
                            <select
                                value={filterDept}
                                onChange={e => setFilterDept(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                            >
                                <option value="All">All Departments</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        }>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                                            <th className="text-left py-2 pr-4">Member</th>
                                            <th className="text-left py-2 pr-4">Role</th>
                                            <th className="text-left py-2 pr-4">Dept</th>
                                            <th className="text-left py-2 pr-4">Type</th>
                                            <th className="text-left py-2 pr-4">Tenure</th>
                                            <th className="text-left py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredTeam.map(m => (
                                            <motion.tr
                                                key={m.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => setSelectedMember(m)}
                                            >
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0" style={{ backgroundColor: m.color }}>
                                                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </div>
                                                        <span className="font-bold text-white">{m.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-text-secondary">{m.role}</td>
                                                <td className="py-3 pr-4 text-text-tertiary">{m.department}</td>
                                                <td className={`py-3 pr-4 font-bold ${TYPE_COLORS[m.type]}`}>{m.type}</td>
                                                <td className="py-3 pr-4 font-mono text-text-tertiary">{m.tenure}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_COLORS[m.status]}`}>{m.status}</span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ModuleCard>

                        {/* Member Detail Panel */}
                        <AnimatePresence>
                            {selectedMember && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <ModuleCard title={`Profile: ${selectedMember.name}`} action={
                                        <button onClick={() => setSelectedMember(null)} className="text-text-tertiary hover:text-white text-xl font-light">×</button>
                                    }>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-xl" style={{ backgroundColor: selectedMember.color }}>
                                                    {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-white">{selectedMember.name}</div>
                                                    <div className="text-xs text-text-secondary">{selectedMember.role}</div>
                                                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_COLORS[selectedMember.status]}`}>{selectedMember.status}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Department', value: selectedMember.department },
                                                    { label: 'Type', value: selectedMember.type },
                                                    { label: 'Tenure', value: selectedMember.tenure },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="flex justify-between text-xs border-b border-white/5 pb-2">
                                                        <span className="text-text-tertiary">{label}</span>
                                                        <span className="text-white font-bold">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2">Skills</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedMember.skills.map(s => (
                                                        <span key={s} className="px-2 py-1 text-[10px] font-bold bg-white/5 border border-white/10 rounded-full text-text-secondary">{s}</span>
                                                    ))}
                                                </div>
                                                <div className="mt-4">
                                                    <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2">Performance Score</div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl font-mono font-bold text-patina-green">{selectedMember.performanceScore}%</div>
                                                        <div className="flex-grow h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                            <div className="bg-patina-green h-full" style={{ width: `${selectedMember.performanceScore}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ModuleCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ==================== PERFORMANCE ==================== */}
                {activeTab === 'performance' && (
                    <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Avg Score', value: `${avgPerformance}%`, color: 'text-patina-green' },
                                { label: 'Top Performer', value: 'Sovereign Dir.', color: 'text-yellow-400', sub: '98%' },
                                { label: 'Reviews Due', value: '3', color: 'text-red-400', sub: 'This quarter' },
                                { label: 'Improvement Plans', value: '0', color: 'text-patina-green', sub: 'Active PIPs' },
                            ].map(({ label, value, color, sub }) => (
                                <div key={label} className="bg-black/40 border border-white/5 rounded-xl p-4">
                                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">{label}</div>
                                    <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
                                    {sub && <div className="text-[9px] text-text-tertiary mt-0.5">{sub}</div>}
                                </div>
                            ))}
                        </div>

                        <ModuleCard title="Performance Matrix" icon={<TrendingUpIcon className="w-5 h-5 text-roman-aqua" />}>
                            <div className="space-y-3">
                                {TEAM.map(m => (
                                    <div key={m.id} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0" style={{ backgroundColor: m.color }}>
                                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="w-36 flex-shrink-0">
                                            <div className="text-xs font-bold text-white truncate">{m.name}</div>
                                            <div className="text-[9px] text-text-tertiary">{m.department}</div>
                                        </div>
                                        <div className="flex-grow h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                className="h-full"
                                                style={{ backgroundColor: m.performanceScore >= 90 ? '#3EB991' : m.performanceScore >= 75 ? '#20B2AA' : '#FFD700' }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${m.performanceScore}%` }}
                                                transition={{ delay: 0.1, type: 'spring', stiffness: 40 }}
                                            />
                                        </div>
                                        <span className={`text-xs font-mono font-bold w-10 text-right flex-shrink-0 ${m.performanceScore >= 90 ? 'text-patina-green' : m.performanceScore >= 75 ? 'text-roman-aqua' : 'text-yellow-400'}`}>
                                            {m.performanceScore}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ModuleCard>
                    </motion.div>
                )}

                {/* ==================== RECRUITING ==================== */}
                {activeTab === 'recruiting' && (
                    <motion.div key="recruiting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <ModuleCard title="Recruitment Pipeline" icon={<UsersIcon className="w-5 h-5 text-blue-400" />}>
                            <div className="flex items-end justify-between gap-4 pt-2 h-40">
                                {RECRUITMENT_STAGES.map(stage => (
                                    <div key={stage.label} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="text-lg font-bold text-white">{stage.count}</div>
                                        <div className="w-full rounded-t-lg transition-all group-hover:opacity-100 opacity-80" style={{ height: `${(stage.count / 18) * 100}px`, backgroundColor: stage.color.replace('bg-', '') === 'text-tertiary' ? '#666' : '' }}>
                                            <div className={`w-full h-full rounded-t-lg ${stage.color}`} />
                                        </div>
                                        <div className="text-[9px] text-text-tertiary uppercase tracking-wider text-center">{stage.label}</div>
                                    </div>
                                ))}
                            </div>
                        </ModuleCard>

                        <ModuleCard title="Open Roles" icon={<ZapIcon className="w-5 h-5 text-yellow-400" />}>
                            <div className="space-y-3">
                                {OPEN_ROLES.map(role => (
                                    <div key={role.title} className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                        <div>
                                            <div className="text-sm font-bold text-white">{role.title}</div>
                                            <div className="text-[10px] text-text-tertiary mt-0.5">{role.dept} · Posted {role.posted}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${PRIORITY_COLORS[role.priority]}`}>
                                                {role.priority}
                                            </span>
                                            <button className="text-xs text-roman-aqua font-bold hover:text-white transition-colors">View →</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ModuleCard>
                    </motion.div>
                )}

                {/* ==================== HEADCOUNT PLAN ==================== */}
                {activeTab === 'planning' && (
                    <motion.div key="planning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <ModuleCard title="Quarterly Headcount Plan" icon={<TrendingUpIcon className="w-5 h-5 text-roman-aqua" />}>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                                            <th className="text-left py-2 pr-6">Quarter</th>
                                            <th className="text-left py-2 pr-6">Target HC</th>
                                            <th className="text-left py-2 pr-6">Actual HC</th>
                                            <th className="text-left py-2 pr-6">Attainment</th>
                                            <th className="text-left py-2">Budget</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {HEADCOUNT_PLAN.map(row => {
                                            const att = row.actual !== null ? Math.round((row.actual / row.target) * 100) : null;
                                            return (
                                                <tr key={row.quarter} className="hover:bg-white/5 transition-colors">
                                                    <td className="py-3 pr-6 font-mono font-bold text-white">{row.quarter}</td>
                                                    <td className="py-3 pr-6 text-text-secondary">{row.target}</td>
                                                    <td className="py-3 pr-6">
                                                        {row.actual !== null ? (
                                                            <span className={row.actual >= row.target ? 'text-patina-green font-bold' : 'text-yellow-400 font-bold'}>{row.actual}</span>
                                                        ) : (
                                                            <span className="text-text-tertiary italic">Planned</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-6">
                                                        {att !== null ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                                    <div className={`h-full ${att >= 100 ? 'bg-patina-green' : 'bg-yellow-400'}`} style={{ width: `${Math.min(att, 100)}%` }} />
                                                                </div>
                                                                <span className={att >= 100 ? 'text-patina-green' : 'text-yellow-400'}>{att}%</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-text-tertiary">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-text-secondary font-mono">${(row.budget / 1000).toFixed(0)}k</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </ModuleCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ModuleCard title="Department Budget Allocation">
                                <div className="space-y-3">
                                    {[
                                        { dept: 'Engineering', pct: 42, budget: 672000, color: 'bg-roman-aqua' },
                                        { dept: 'Marketing', pct: 22, budget: 352000, color: 'bg-yellow-400' },
                                        { dept: 'Ops', pct: 18, budget: 288000, color: 'bg-blue-400' },
                                        { dept: 'Design', pct: 10, budget: 160000, color: 'bg-imperial-purple' },
                                        { dept: 'Executive', pct: 8, budget: 128000, color: 'bg-patina-green' },
                                    ].map(({ dept, pct, budget, color }) => (
                                        <div key={dept}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-text-secondary">{dept}</span>
                                                <span className="font-mono text-white">${(budget / 1000).toFixed(0)}k <span className="text-text-tertiary">({pct}%)</span></span>
                                            </div>
                                            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                <motion.div className={`h-full ${color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.1, type: 'spring', stiffness: 40 }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ModuleCard>

                            <ModuleCard title="Hiring Velocity" icon={<ShieldIcon className="w-5 h-5 text-patina-green" />}>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Time to Fill (avg)', value: '34 days', target: '< 45 days', ok: true },
                                        { label: 'Offer Acceptance Rate', value: '86%', target: '> 80%', ok: true },
                                        { label: 'Quality of Hire Score', value: '8.2 / 10', target: '> 8.0', ok: true },
                                        { label: '90-Day Retention', value: '94%', target: '> 90%', ok: true },
                                    ].map(({ label, value, target, ok }) => (
                                        <div key={label} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                                            <div>
                                                <div className="text-text-secondary">{label}</div>
                                                <div className="text-[9px] text-text-tertiary">Target: {target}</div>
                                            </div>
                                            <div className={`font-mono font-bold ${ok ? 'text-patina-green' : 'text-red-400'}`}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </ModuleCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HRMView;
