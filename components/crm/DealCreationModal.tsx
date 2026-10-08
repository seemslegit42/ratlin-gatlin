
/**
 * @file components/crm/DealCreationModal.tsx
 * @description Modal for instantiating new sales opportunities in the CRM pipeline.
 */

import React, { useState } from 'react';
import Modal from '../shared/Modal';
import type { CRMDeal } from '../../types';

interface DealCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (deal: Omit<CRMDeal, 'id'>) => void;
}

const DealCreationModal: React.FC<DealCreationModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [company, setCompany] = useState('');
    const [dealName, setDealName] = useState('');
    const [value, setValue] = useState<number | ''>('');
    const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!company.trim() || !dealName.trim() || value === '') return;

        onCreate({
            company,
            dealName,
            value: Number(value),
            priority,
            lastContact: new Date().toISOString().split('T')[0],
            resonance: 50, // Initial resonance
        });
        
        // Reset
        setCompany('');
        setDealName('');
        setValue('');
        setPriority('Medium');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manifest Opportunity">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Target Entity (Company)</label>
                    <input 
                        type="text" 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-roman-aqua outline-none"
                        placeholder="e.g. Tyrell Corporation"
                        autoFocus
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Opportunity Label</label>
                    <input 
                        type="text" 
                        value={dealName}
                        onChange={(e) => setDealName(e.target.value)}
                        className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-roman-aqua outline-none"
                        placeholder="e.g. Q4 Nexus Contract"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Projected Value</label>
                        <input 
                            type="number" 
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                            className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-roman-aqua outline-none font-mono"
                            placeholder="0.00"
                            min="0"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Priority</label>
                        <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-roman-aqua outline-none cursor-pointer"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={!company || !dealName || value === ''}
                        className="px-6 py-2 bg-roman-aqua text-black font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-white transition-all shadow-lg shadow-roman-aqua/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Initialize Deal
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default DealCreationModal;
