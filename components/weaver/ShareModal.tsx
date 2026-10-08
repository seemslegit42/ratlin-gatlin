
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../shared/Modal';
import type { User } from '../../types';
import { ShareIcon } from '../icons/MarketingIcons';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    syndicateId: string;
    users: Record<string, User>;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, syndicateId, users }) => {
    const [copied, setCopied] = useState(false);
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}?syndicate=${syndicateId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const activeUsers = Object.values(users) as User[];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite Collaborators">
            <div className="space-y-6">
                <div className="p-4 bg-imperial-purple/10 border border-imperial-purple/30 rounded-xl">
                    <p className="text-sm text-vitreous-white mb-3">
                        Share this neural link to invite others to collaborate on this workflow in real-time.
                    </p>
                    
                    <div className="flex items-center space-x-2">
                        <div className="flex-grow bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-text-secondary truncate select-all">
                            {link}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className={`p-3 rounded-lg font-bold text-xs transition-all flex items-center space-x-2 ${copied ? 'bg-patina-green text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                            {copied ? (
                                <span>Copied!</span>
                            ) : (
                                <>
                                    <ShareIcon className="w-4 h-4" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold uppercase text-text-tertiary tracking-widest mb-3">Active Neural Links ({activeUsers.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {activeUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                        style={{ backgroundColor: user.color }}
                                    >
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-vitreous-white">{user.name}</div>
                                        <div className="text-[10px] text-text-tertiary font-mono">ID: {user.id.substring(0, 8)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-patina-green rounded-full animate-pulse shadow-[0_0_8px_var(--patina-green)]"></div>
                                    <span className="text-[10px] text-patina-green font-bold">ONLINE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ShareModal;
