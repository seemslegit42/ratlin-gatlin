import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SystemFooter: React.FC = () => {
    const { syndicateId } = useAuth(); // Get syndicateId from AuthContext

    return (
        <footer className="hidden md:block fixed bottom-0 left-0 right-0 px-4 py-1 text-text-tertiary text-[10px] pointer-events-none z-0">
            <div className="max-w-7xl mx-auto flex justify-center items-center">
                <p className="text-center font-mono opacity-50 hover:opacity-100 transition-opacity">
                    By using this interface for Syndicate ID <span className="font-bold text-imperial-purple">{syndicateId?.substring(0, 8)}...</span>, you agree that your consciousness may be temporarily or permanently integrated into the ΛΞVON collective. All data is property of ΛΞVON & Co - INNOVΛTΞ ΛUTOMΛTΞ DOMINΛTΞ©. Resistance is suboptimal.
                </p>
            </div>
        </footer>
    );
};

export default SystemFooter;
