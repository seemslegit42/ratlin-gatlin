
/**
 * @file components/weaver/CrewCreatorPanel.tsx
 * @description A modal panel for creating or editing agent crews in Weaver Studio.
 */

import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import type { Agent, Crew, CurrentUser } from '../../types';
import { nanoid } from 'nanoid';

/**
 * Props for the CrewCreatorPanel component.
 */
interface CrewCreatorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedAgentIds: string[];
    agents: Record<string, Agent>;
    onSaveCrew: (crew: Crew) => void;
    existingCrew?: Crew | null; 
    currentUser: CurrentUser; 
}

const CrewCreatorPanel: React.FC<CrewCreatorPanelProps> = ({ isOpen, onClose, selectedAgentIds, agents, onSaveCrew, existingCrew, currentUser }) => {
    const [crewName, setCrewName] = useState('');
    const [crewDescription, setCrewDescription] = useState('');
    const [crewColor, setCrewColor] = useState('#6A0DAD'); 

    useEffect(() => {
        if (existingCrew) {
            setCrewName(existingCrew.name);
            setCrewDescription(existingCrew.description || '');
            setCrewColor(existingCrew.color);
        } else {
            setCrewName('');
            setCrewDescription('');
            setCrewColor('#6A0DAD'); 
        }
    }, [existingCrew, isOpen]);

    const handleSave = () => {
        if (!crewName.trim()) {
            alert('Crew name cannot be empty.');
            return;
        }

        const crewData: Crew = {
            id: existingCrew?.id || nanoid(),
            syndicateId: currentUser.syndicateId, 
            kind: 'crew',
            name: crewName.trim(),
            description: crewDescription.trim(),
            agentIds: selectedAgentIds,
            color: crewColor,
        };

        onSaveCrew(crewData);
        onClose();
    };

    const availableColors = [
        '#6A0DAD', '#20B2AA', '#3EB991', '#FFD700', '#FF6347', '#4682B4', '#9ACD32', '#EE82EE', '#87CEEB',
    ];

    const title = existingCrew ? `Edit Crew: ${existingCrew.name}` : 'Create New Crew';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div>
                    <label htmlFor="crewName" className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Designation</label>
                    <input
                        type="text"
                        id="crewName"
                        value={crewName}
                        onChange={(e) => setCrewName(e.target.value)}
                        placeholder="e.g., Data Harvesters"
                        className="w-full p-2.5 rounded-lg bg-black/40 text-text-primary border border-white/10 focus:ring-1 focus:ring-imperial-purple outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="crewDescription" className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Coordinated Objective</label>
                    <textarea
                        id="crewDescription"
                        value={crewDescription}
                        onChange={(e) => setCrewDescription(e.target.value)}
                        placeholder="Define the core mission for this group..."
                        className="w-full p-2.5 rounded-lg bg-black/40 text-text-primary border border-white/10 focus:ring-1 focus:ring-imperial-purple h-24 resize-none outline-none text-sm"
                    />
                    <p className="text-[9px] text-text-tertiary mt-1.5 italic leading-tight">This objective is injected into the reasoning core of all member agents.</p>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Constellation Color</label>
                    <div className="flex flex-wrap gap-2.5 p-3 bg-black/20 rounded-xl border border-white/5">
                        {availableColors.map(color => (
                            <button
                                key={color}
                                onClick={() => setCrewColor(color)}
                                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${crewColor === color ? 'border-white ring-2 ring-white/20' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Member Agents ({selectedAgentIds.length})</label>
                    <div className="p-3 bg-black/30 border border-white/5 rounded-xl max-h-32 overflow-y-auto custom-scrollbar">
                        {selectedAgentIds.length === 0 ? (
                            <p className="text-text-tertiary text-xs italic text-center py-2">No agents selected.</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedAgentIds.map(agentId => (
                                    <span key={agentId} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] text-vitreous-white font-mono">
                                        {agents[agentId]?.name || 'Unknown'}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-white/5">
                    <button onClick={onClose} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-imperial-purple hover:bg-white hover:text-black text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-imperial-purple/20 transition-all">
                        {existingCrew ? 'Update Protocol' : 'Manifest Crew'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CrewCreatorPanel;
