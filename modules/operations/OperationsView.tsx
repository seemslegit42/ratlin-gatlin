
/**
 * @file modules/operations/OperationsView.tsx
 * @description The Command Center for Syndicate Operations.
 * Orchestrates missions, agent dispatch, and real-time efficiency monitoring.
 */

import React, { useState, useMemo } from 'react';
import { ModuleCard } from '../shared/ModuleCard';
import { MissionTimeline } from '../../components/operations/MissionTimeline';
import { AgentLoadBalancer } from '../../components/operations/AgentLoadBalancer';
import { ProjectRoadmap } from '../../components/operations/ProjectRoadmap';
import { ExecutionLog } from '../../components/operations/ExecutionLog';
import { ChartBarIcon } from '../../components/icons/EconomyIcons';
import BackButton from '../../components/shared/BackButton';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { motion, AnimatePresence } from 'framer-motion';
import type { View, OperationTask, Agent } from '../../types';
import { AgentStatus } from '../../types';
import { TaskColumn } from '../../components/operations/TaskColumn';
import { ZapIcon, TrendingUpIcon } from '../../components/icons/VitalsIcons';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { LayersIcon } from '../../components/icons/LayersIcon';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import { SearchIcon } from '../../components/icons/CommandPaletteIcons';
import { FilterIcon } from '../../components/icons/FilterIcon';
import { ClockIcon } from '../../components/icons/AetheriumIcons';
import { EyeIcon } from '../../components/icons/SecurityIcons';
import { CrystallineGlyph } from '../../components/icons/CrystallineGlyph';
import { sounds } from '../../utils/soundEffects';

interface OperationsViewProps {
    onNavigate: (view: View) => void;
    tasks: OperationTask[];
    onUpdateTask: (id: string, updates: Partial<OperationTask>) => void;
    onDeleteTask: (id: string) => void;
    agents?: Record<string, Agent>; 
}

const STATUS_ORDER: OperationTask['status'][] = ['Pending', 'In Progress', 'Done', 'Blocked'];

export type TaskSortOption = 'Priority' | 'Due Date' | 'Assignee';

// --- SUB-COMPONENTS ---

const TacticalHUD: React.FC<{ tasks: OperationTask[]; activeAgents: number }> = ({ tasks, activeAgents }) => {
    const overdue = tasks.filter(t => t.status !== 'Done' && new Date(t.due) < new Date()).length;
    const blocked = tasks.filter(t => t.status === 'Blocked').length;
    const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'Done').length / tasks.length) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-28 hover:border-roman-aqua/30 transition-all">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Active Swarm</span>
                <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-mono font-bold text-patina-green">{activeAgents}</span>
                    <span className="text-xs text-text-tertiary">NODES</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <motion.div className="bg-patina-green h-full" animate={{ width: '85%' }} />
                </div>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-28 hover:border-red-500/30 transition-all">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Protocol Stalls</span>
                <div className="flex items-baseline space-x-2">
                    <span className={`text-3xl font-mono font-bold ${blocked > 0 ? 'text-red-500' : 'text-text-secondary'}`}>{blocked}</span>
                    <span className="text-xs text-text-tertiary">BLOCKED</span>
                </div>
                <span className="text-[9px] text-red-400 font-mono">CRITICAL PATH AT RISK</span>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-28 hover:border-yellow-400/30 transition-all">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Temporal Drag</span>
                <div className="flex items-baseline space-x-2">
                    <span className={`text-3xl font-mono font-bold ${overdue > 0 ? 'text-yellow-400' : 'text-text-secondary'}`}>{overdue}</span>
                    <span className="text-xs text-text-tertiary">OVERDUE</span>
                </div>
                <span className="text-[9px] text-text-tertiary font-mono uppercase tracking-widest">Scanning Chronos...</span>
            </div>

            <div className="bg-panel-bg/80 border border-glass-border p-4 rounded-xl flex flex-col justify-between h-28 shadow-glass">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Mission Velocity</span>
                <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-mono font-bold text-vitreous-white">{completionRate.toFixed(0)}%</span>
                    <span className="text-xs text-text-tertiary">OEE</span>
                </div>
                <div className="flex space-x-1">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= (completionRate/16) ? 'bg-roman-aqua shadow-[0_0_5px_var(--roman-aqua)]' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const BattleDrills: React.FC<{ onAction: (label: string) => void }> = ({ onAction }) => (
    <ModuleCard title="Battle Drills" icon={<CrystallineGlyph type="crucible" size="xs" state="active" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
                { label: 'Redistribute Load', sub: 'Balance agent utilization', icon: <TrendingUpIcon className="w-4 h-4" /> },
                { label: 'Accelerated Cycle', sub: 'Force-complete low complexity', icon: <ZapIcon className="w-4 h-4" /> },
                { label: 'Protocol Scrub', sub: 'Archive done missions', icon: <ShieldCheckIcon className="w-4 h-4" /> },
                { label: 'Swarm Focus', sub: 'Assign all idle to high priority', icon: <BrainIcon className="w-4 h-4" /> },
            ].map((drill) => (
                <button 
                    key={drill.label}
                    onClick={() => {
                        sounds.playGlassThrum();
                        onAction(drill.label);
                    }}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-roman-aqua/40 transition-all group flex items-center space-x-3 active:scale-95"
                >
                    <div className="p-2 rounded-lg bg-black/40 text-text-tertiary group-hover:text-roman-aqua transition-colors">
                        {drill.icon}
                    </div>
                    <div>
                        <div className="text-xs font-bold text-white group-hover:text-roman-aqua font-comfortaa">{drill.label}</div>
                        <div className="text-[9px] text-text-tertiary">{drill.sub}</div>
                    </div>
                </button>
            ))}
        </div>
    </ModuleCard>
);

const AgentDispatcher: React.FC<{ agents: Agent[]; tasks: OperationTask[]; onDispatch: (taskId: string, agentId: string, agentName: string) => void }> = ({ agents, tasks, onDispatch }) => {
    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'Blocked');
    const idleAgents = agents.filter(a => a.status === AgentStatus.Idle);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <ModuleCard title="Unassigned Directives">
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {pendingTasks.map(task => (
                        <div key={task.id} className="p-3 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center group">
                            <div>
                                <h5 className="text-sm font-bold text-white group-hover:text-roman-aqua transition-colors">{task.title}</h5>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[9px] font-mono text-text-tertiary uppercase">Complexity: {task.complexity}/10</span>
                                    <span className="text-[9px] font-mono text-text-tertiary uppercase">Due: {task.due}</span>
                                </div>
                            </div>
                            <select 
                                className="bg-panel-bg border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-roman-aqua focus:outline-none cursor-pointer"
                                aria-label={`Assign agent for ${task.title}`}
                                onChange={(e) => {
                                    const selectedAgent = agents.find(a => a.id === e.target.value);
                                    onDispatch(task.id, e.target.value, selectedAgent?.name || '');
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>Dispatch Agent...</option>
                                {idleAgents.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    {pendingTasks.length === 0 && <p className="text-center py-8 text-xs text-text-tertiary italic">No pending directives to dispatch.</p>}
                </div>
            </ModuleCard>

            <ModuleCard title="Fleet Status (Field Service)">
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {agents.map(agent => (
                        <div key={agent.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${agent.status === AgentStatus.Running ? 'bg-patina-green animate-pulse' : 'bg-white/20'}`} />
                                <div>
                                    <div className="text-xs font-bold text-white">{agent.name}</div>
                                    <div className="text-[9px] text-text-tertiary font-mono uppercase">{agent.type} • {agent.status}</div>
                                </div>
                            </div>
                            {agent.status === AgentStatus.Running && (
                                <div className="flex items-center gap-2">
                                     <div className="h-6 w-px bg-white/10 mx-2" />
                                     <span className="text-[10px] text-patina-green font-bold animate-pulse">PROCESSING DATA</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ModuleCard>
        </div>
    );
};

// --- MAIN VIEW ---

const OperationsView: React.FC<OperationsViewProps> = ({ onNavigate, tasks, onUpdateTask, onDeleteTask, agents = {} }) => {
    const [activeTab, setActiveTab] = useState<'projects' | 'roadmap' | 'dispatch' | 'monitor'>('projects');
    const [sortBy, setSortBy] = useState<TaskSortOption>('Priority');
    const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('All');
    const [filterAssignee, setFilterAssignee] = useState<string>('All');
    const [showFilters, setShowFilters] = useState(false);

    const handleStatusCycle = (task: OperationTask) => {
        const currentIndex = STATUS_ORDER.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
        const nextStatus = STATUS_ORDER[nextIndex];
        onUpdateTask(task.id, { status: nextStatus });
    };

    const handleDropTask = (taskId: string, targetStatus: OperationTask['status']) => {
        const task = tasks.find((t): t is OperationTask => t.id === taskId);
        if (task && task.status !== targetStatus) {
            onUpdateTask(taskId, { status: targetStatus });
        }
    };

    const handleDispatch = async (taskId: string, agentId: string, agentName: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            await onUpdateTask(taskId, { 
                assignee: agentName, 
                assigneeType: 'Agent',
                status: 'In Progress' 
            });
        }
    };

    const handleBattleDrill = (label: string) => {
        console.log(`Executing drill: ${label}`);
    };

    const agentList = useMemo(() => Object.values(agents) as Agent[], [agents]);
    const activeAgentCount = agentList.filter(a => a.status !== AgentStatus.Idle).length;

    const assignees = useMemo(() => Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))), [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
            const matchesAssignee = filterAssignee === 'All' || task.assignee === filterAssignee;
            
            return matchesSearch && matchesPriority && matchesAssignee;
        });
    }, [tasks, searchQuery, filterPriority, filterAssignee]);
    const hasFilteredResults = filteredTasks.length > 0;

    // -- Deletion Logic --
    const promptDelete = (id: string) => setTaskToDeleteId(id);
    const confirmDelete = () => { if (taskToDeleteId) onDeleteTask(taskToDeleteId); setTaskToDeleteId(null); };
    const cancelDelete = () => setTaskToDeleteId(null);

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 bg-obsidian-black/80 high-density">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                    </div>
                    <div className="flex items-center space-x-2">
                         <div className="flex bg-black/30 p-1 rounded-lg border border-white/10 items-center">
                             <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 ${showFilters ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-white'}`}
                                title="Toggle Filters"
                             >
                                <FilterIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Filter</span>
                             </button>
                             <div className="w-px h-4 bg-white/10 mx-1" />
                            <span className="text-[10px] font-bold text-text-tertiary uppercase px-2 py-1 flex items-center">
                                Sort:
                            </span>
                            {(['Priority', 'Due Date', 'Assignee'] as TaskSortOption[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${sortBy === option ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-white'}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        
                        <div className="flex bg-black/30 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-[200px] md:max-w-none custom-scrollbar">
                            {[
                                { id: 'projects', label: 'Kanban', icon: <LayersIcon className="w-3.5 h-3.5" /> },
                                { id: 'roadmap', label: 'Timeline', icon: <ClockIcon className="w-3.5 h-3.5" /> },
                                { id: 'monitor', label: 'Monitor', icon: <EyeIcon className="w-3.5 h-3.5" /> },
                                { id: 'dispatch', label: 'Dispatch', icon: <ZapIcon className="w-3.5 h-3.5" /> },
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-transparent text-text-secondary hover:text-white'}`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/30 border border-white/10 rounded-lg p-3 flex flex-wrap gap-4 items-center overflow-hidden"
                        >
                            <div className="relative group">
                                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-white" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search tasks..."
                                    className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-text-tertiary focus:outline-none focus:border-white/30 w-48 transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-text-tertiary uppercase">Priority:</span>
                                <select 
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    aria-label="Filter by priority"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <option value="All">All Priorities</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-text-tertiary uppercase">Assignee:</span>
                                <select 
                                    value={filterAssignee}
                                    onChange={(e) => setFilterAssignee(e.target.value)}
                                    aria-label="Filter by assignee"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <option value="All">All Assignees</option>
                                    {assignees.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            {(searchQuery || filterPriority !== 'All' || filterAssignee !== 'All') && (
                                <button 
                                    onClick={() => { setSearchQuery(''); setFilterPriority('All'); setFilterAssignee('All'); }}
                                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase ml-auto"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <header className="mb-4 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                        Ops Command
                    </h1>
                    <p className="text-sm text-text-tertiary font-mono tracking-widest mt-1 uppercase tracking-[0.2em]">Execution // Field Service // Projects</p>
                </div>
                <div className="flex gap-4 text-right">
                    <div>
                        <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Global Eff.</div>
                        <div className="text-sm font-mono font-bold text-patina-green">81% (Target: 85%)</div>
                    </div>
                </div>
            </header>

            <TacticalHUD tasks={tasks} activeAgents={activeAgentCount} />

            <ModuleCard title="Operator Guidance" icon={<BrainIcon className="w-5 h-5 text-roman-aqua" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">1. Stabilize</p>
                        <p className="text-sm font-bold text-white mt-1">Clear blocked directives first</p>
                        <p className="text-xs text-text-secondary mt-2">Use Monitor to identify load hotspots, then dispatch idle agents to unblock critical tasks.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">2. Sequence</p>
                        <p className="text-sm font-bold text-white mt-1">Prioritize by due date and risk</p>
                        <p className="text-xs text-text-secondary mt-2">Apply filters to isolate urgent workstreams before changing assignees or cycling statuses.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">3. Verify</p>
                        <p className="text-sm font-bold text-white mt-1">Close with execution telemetry</p>
                        <p className="text-xs text-text-secondary mt-2">Use Execution Log to confirm completion quality before archiving or rolling tasks forward.</p>
                    </div>
                </div>
            </ModuleCard>

            {!hasFilteredResults && (
                <ModuleCard title="No Matching Directives" icon={<SearchIcon className="w-5 h-5 text-yellow-400" />}>
                    <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-sm text-yellow-100">No directives match the current filters. Reset filters to restore visibility across all mission lanes.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setFilterPriority('All'); setFilterAssignee('All'); }}
                            className="px-4 py-2 rounded-lg border border-yellow-400/40 bg-yellow-500/20 text-xs font-bold uppercase tracking-wider text-yellow-100 hover:bg-yellow-500/30 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </ModuleCard>
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'projects' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <MissionTimeline />
                            <BattleDrills onAction={handleBattleDrill} />
                        </div>

                        <ModuleCard title="Swarm Directives" className="lg:col-span-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 min-h-[400px]">
                                {STATUS_ORDER.map(status => (
                                    <TaskColumn
                                        key={status}
                                        status={status}
                                        tasks={filteredTasks.filter(t => t.status === status)}
                                        onDropTask={handleDropTask}
                                        onUpdateTask={onUpdateTask}
                                        onDeleteTask={promptDelete}
                                        onStatusCycle={handleStatusCycle}
                                        sortBy={sortBy}
                                    />
                                ))}
                            </div>
                        </ModuleCard>
                    </motion.div>
                )}

                {activeTab === 'roadmap' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <ProjectRoadmap tasks={filteredTasks} />
                    </motion.div>
                )}

                {activeTab === 'monitor' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AgentLoadBalancer agents={agents} />
                            <ExecutionLog />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'dispatch' && (
                    <AgentDispatcher 
                        agents={agentList} 
                        tasks={tasks} 
                        onDispatch={handleDispatch} 
                    />
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={!!taskToDeleteId}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Purge Directive"
                message="This operation will permanently delete the selected task from the registry. The action cannot be undone. Confirm removal?"
                confirmLabel="Delete"
                cancelLabel="Abort"
            />
        </div>
    );
};

export default OperationsView;
