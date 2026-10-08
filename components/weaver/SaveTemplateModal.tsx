
import React, { useState } from 'react';
import Modal from '../shared/Modal';

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name);
            setName('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Save as Template">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Template Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Custom Web Scraper"
                        className="w-full bg-input-bg border border-glass-border rounded-lg p-3 text-sm text-vitreous-white focus:ring-1 focus:ring-imperial-purple outline-none transition-all"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end pt-2 space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="px-6 py-2 bg-imperial-purple hover:bg-imperial-purple/80 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Template
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SaveTemplateModal;
