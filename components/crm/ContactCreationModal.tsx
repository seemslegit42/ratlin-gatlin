
/**
 * @file components/crm/ContactCreationModal.tsx
 * @description Modal for onboarding new souls (contacts) into the CRM.
 */

import React, { useState } from 'react';
import Modal from '../shared/Modal';
import type { CRMContact } from '../../types';

interface ContactCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (contact: Omit<CRMContact, 'id'>) => void;
}

const ContactCreationModal: React.FC<ContactCreationModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !company.trim()) return;

        onCreate({
            name,
            role: role || 'Unknown',
            company,
            email: email || '',
            lastContact: new Date().toISOString().split('T')[0],
            syndicateId: '' // Will be set by hook
        });

        // Reset
        setName('');
        setRole('');
        setCompany('');
        setEmail('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register Soul">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-imperial-purple outline-none"
                        placeholder="e.g. Niander Wallace"
                        autoFocus
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Role / Title</label>
                        <input 
                            type="text" 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-imperial-purple outline-none"
                            placeholder="e.g. CEO"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Affiliation</label>
                        <input 
                            type="text" 
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-imperial-purple outline-none"
                            placeholder="e.g. Wallace Corp"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Comm Link (Email)</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-imperial-purple outline-none"
                        placeholder="nw@wallace.net"
                    />
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
                        disabled={!name || !company}
                        className="px-6 py-2 bg-imperial-purple text-white font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-lg shadow-imperial-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Contact
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ContactCreationModal;
