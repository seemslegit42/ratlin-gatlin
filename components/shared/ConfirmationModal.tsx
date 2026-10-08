
/**
 * @file components/shared/ConfirmationModal.tsx
 * @description A generic modal for confirming destructive actions.
 */

import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmLabel = 'Confirm', 
    cancelLabel = 'Cancel' 
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-vitreous-white leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="min-h-[44px] px-4 py-2 text-xs font-bold text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="min-h-[44px] px-6 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all"
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
