
import React, { useState } from 'react';
import Modal from '../shared/Modal';

interface SaveVersionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string) => void;
}

const SaveVersionModal: React.FC<SaveVersionModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name, description);
        setName('');
        setDescription('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Archive Temporal State">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Version Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Stable Release V1"
                        className="w-full bg-input-bg border border-glass-border rounded-md p-3 text-sm text-vitreous-white focus:ring-1 focus:ring-imperial-purple transition-all"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Notes on what changed..."
                        className="w-full bg-input-bg border border-glass-border rounded-md p-3 text-sm text-vitreous-white resize-none h-24 focus:ring-1 focus:ring-imperial-purple transition-all"
                    />
                </div>
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="px-6 py-2 bg-imperial-purple hover:bg-imperial-purple/80 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Snapshot
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SaveVersionModal;
