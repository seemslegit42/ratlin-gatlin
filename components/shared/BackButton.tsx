
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Back', className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-black/20 hover:bg-white/10 text-text-secondary hover:text-white transition-all backdrop-blur-md border border-white/5 hover:border-white/20 group ${className}`}
        >
            <div className="group-hover:-translate-x-1 transition-transform">
                <ChevronLeftIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">{label}</span>
        </button>
    );
};

export default BackButton;
