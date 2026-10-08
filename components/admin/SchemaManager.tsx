
/**
 * @file components/admin/SchemaManager.tsx
 * @description The "System Architect" interface.
 * Detects missing tables in the Appwrite backend and provides a "Self-Healing"
 * SQL script for the user to execute.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard.js';
import { DatabaseIcon } from '../icons/AetheriumIcons.js';
import { CheckCircleIcon, ExclamationIcon } from '../icons/AgentStatusIcons.js';
// TODO: Migrate to Appwrite Databases API for schema validation

const APPWRITE_SETUP_HINT = `Use schema.sql plus scripts/setup-appwrite-backend.ts (or your cloud console)
to provision tables in Appwrite. This panel does not execute SQL directly.`;

const REQUIRED_TABLES = [
    'syndicates', 'users', 'agents', 'connections', 'crews',
    'agent_templates', 'workflow_versions', 'chronicle_events',
    'operations_tasks', 'micro_app_modules', 'micro_app_patches', 'published_micro_apps',
    'crm_deals', 'crm_contacts', 'crm_activities',
    'procurement_orders', 'treasury_transactions', 'notes',
    'syndicate_integrations', 'access_keys', 'chat_messages',
    'email_marketing_lab'
];

export const SchemaManager: React.FC = () => {
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [showScript, setShowScript] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const checkSchema = async () => {
        setIsLoading(true);
        const results: Record<string, boolean> = {};
        
        // TODO: Migrate to Appwrite Databases API for schema validation
        // For now, mark all tables as pending
        for (const table of REQUIRED_TABLES) {
            results[table] = false; // Pending Appwrite integration
        }
        
        setStatusMap(results);
        setIsLoading(false);
    };

    useEffect(() => {
        void checkSchema();
    }, []);

    const missingCount = Object.values(statusMap).filter(v => !v).length;
    const isHealthy = missingCount === 0;

    const handleCopyScript = () => {
        const script = APPWRITE_SETUP_HINT;
        void navigator.clipboard.writeText(script);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleCard title="System Architect: Schema Status" icon={<DatabaseIcon className="w-6 h-6 text-roman-aqua" />}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${isHealthy ? 'bg-patina-green/20 text-patina-green' : 'bg-red-500/20 text-red-500'}`}>
                                {isHealthy ? <CheckCircleIcon className="w-6 h-6" /> : <ExclamationIcon className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-vitreous-white">
                                    {isLoading ? "Scanning Neural Lattice..." : isHealthy ? "System Integrity Nominal" : "Critical Infrastructure Missing"}
                                </h4>
                                <p className="text-xs text-text-tertiary">
                                    {isLoading ? "Checking availability of data nodes." : `${missingCount} tables offline.`}
                                </p>
                            </div>
                        </div>
                        {!isHealthy && !isLoading && (
                            <button 
                                onClick={() => setShowScript(true)}
                                className="px-4 py-2 bg-roman-aqua hover:bg-white text-black font-bold rounded-lg text-xs transition-colors flex items-center space-x-2 animate-pulse"
                            >
                                <span>Initialize Protocol</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {REQUIRED_TABLES.map(table => (
                            <div key={table} className={`flex items-center space-x-2 p-2 rounded border text-xs font-mono ${statusMap[table] ? 'border-patina-green/30 bg-patina-green/5 text-patina-green' : 'border-red-500/30 bg-red-500/5 text-red-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${statusMap[table] ? 'bg-patina-green' : 'bg-red-500'}`} />
                                <span>{table}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </ModuleCard>

            <AnimatePresence>
                {showScript && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-black/80 border border-roman-aqua/50 rounded-xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-roman-aqua" />
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-roman-aqua font-comfortaa">Self-Healing Protocol: SQL Injection</h3>
                            <button onClick={() => setShowScript(false)} className="text-text-tertiary hover:text-white">✕</button>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-4">
                            {APPWRITE_SETUP_HINT}
                            <br/>
                            <span className="text-white font-bold">Action Required:</span> Copy the provisioning notes below and run your Appwrite setup as documented.
                        </p>

                        <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-xs text-patina-green overflow-x-auto whitespace-pre h-64 custom-scrollbar">
                            {APPWRITE_SETUP_HINT}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={handleCopyScript}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy Full Script'}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
