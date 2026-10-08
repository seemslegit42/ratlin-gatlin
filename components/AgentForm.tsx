/**
 * @file components/AgentForm.tsx
 * @description A reusable form component for configuring Agent properties.
 * Used in creation modals and inspectors.
 */

import React, { useState } from 'react';
import { AgentType, JsonObject, JsonValue } from '../types.js';
import { PlusIcon } from './icons/PlusIcon.js';
import { TrashIcon } from './icons/CommandPaletteIcons.js';

interface AgentFormProps {
    type: AgentType;
    initialData?: JsonObject;
    onSubmit: (data: JsonObject) => void;
    onCancel: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({ type, initialData = {}, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<JsonObject>({
        /* Fix: Use bracket notation for property access on JsonObject to avoid 'type {}' errors from inferred empty objects */
        name: (initialData['name'] as string) || `New ${type}`,
        /* Fix: Use bracket notation for property access on JsonObject to avoid 'type {}' errors from inferred empty objects */
        description: (initialData['description'] as string) || '',
        /* Fix: Safer check and casting for goals array in initialData using bracket notation */
        goals: Array.isArray(initialData['goals']) && (initialData['goals'] as string[]).length > 0 
            ? (initialData['goals'] as string[]) 
            : [''],
        ...initialData
    });

    const handleChange = (key: string, value: JsonValue) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleGoalChange = (idx: number, val: string) => {
        const newGoals = [...(formData.goals as string[])];
        newGoals[idx] = val;
        handleChange('goals', newGoals);
    };

    const addGoal = () => {
        handleChange('goals', [...(formData.goals as string[]), '']);
    };

    const removeGoal = (idx: number) => {
        const newGoals = (formData.goals as string[]).filter((_, i) => i !== idx);
        handleChange('goals', newGoals.length > 0 ? newGoals : ['']);
    };

    const inputClass = "w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-imperial-purple outline-none transition-all";
    const labelClass = "block text-[10px] font-bold text-text-secondary uppercase mb-1.5 tracking-wider";

    return (
        <div className="space-y-6">
            {/* Core Identity Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Designation (Name)</label>
                    <input
                        type="text"
                        value={formData.name as string}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Data Harvester"
                        required
                    />
                </div>
                <div>
                    <label className={labelClass}>Specialization</label>
                    <input
                        type="text"
                        value={(formData.specialization as string) || ''}
                        onChange={(e) => handleChange('specialization', e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Analysis, Creative"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Protocol Brief (Description)</label>
                <textarea
                    value={formData.description as string}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className={`${inputClass} h-20 resize-none`}
                    placeholder="Briefly define this agent's nature..."
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClass}>Operational Objectives (Goals)</label>
                    <button 
                        type="button" 
                        onClick={addGoal}
                        className="text-[9px] font-bold text-patina-green hover:text-white uppercase flex items-center gap-1 transition-colors"
                    >
                        <PlusIcon className="w-3 h-3" /> Add Goal
                    </button>
                </div>
                <div className="space-y-2">
                    {(formData.goals as string[]).map((goal, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={goal}
                                onChange={(e) => handleGoalChange(idx, e.target.value)}
                                className={`${inputClass} !p-2 !text-xs font-mono`}
                                placeholder={`Goal #${idx + 1}...`}
                            />
                            <button 
                                type="button" 
                                onClick={() => removeGoal(idx)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
                            >
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-white/10 my-2" />

            {/* Type Specific Fields */}
            {type === AgentType.CognitiveCore && (
                <div>
                    <label className={labelClass}>System Prompt</label>
                    <textarea
                        value={(formData.prompt as string) || ''}
                        onChange={(e) => handleChange('prompt', e.target.value)}
                        className={`${inputClass} h-32 resize-none`}
                        placeholder="Define the agent's core directive..."
                    />
                </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
                <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-white transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={() => onSubmit(formData)}
                    className="px-6 py-2.5 bg-patina-green hover:bg-white text-black font-bold rounded-lg text-xs transition-all shadow-lg shadow-patina-green/20"
                >
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default AgentForm;
