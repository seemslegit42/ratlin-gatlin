
/**
 * @file components/admin/AccessKeysPanel.tsx
 * @description Allows the admin to generate and manage API keys that grant external access
 * to the Syndicate's OS. Features include key generation, scope definition, and revocation.
 * Also displays the unique System Identity (UUID) for this instance with rotation capabilities.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { KeyIcon } from '../../components/icons/KeyIcon';
import { TrashIcon } from '../../components/icons/CommandPaletteIcons';
import { ShareIcon } from '../../components/icons/MarketingIcons';
import { CheckCircleIcon } from '../../components/icons/AgentStatusIcons';

interface AccessKey {
  id: string;
  name: string;
  prefix: string;
  scope: 'read' | 'write' | 'admin';
  created: number;
  lastUsed?: number;
}

const SCOPES = {
  read: { label: 'Read Only', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  write: { label: 'Full Access', color: 'bg-patina-green/20 text-patina-green border-patina-green/30' },
  admin: { label: 'Admin (Sovereign)', color: 'bg-imperial-purple/20 text-imperial-purple border-imperial-purple/30' },
};

const AccessKeysPanel: React.FC = () => {
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [systemId, setSystemId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'read' | 'write' | 'admin'>('read');

  // Ephemeral state for the newly generated key (only shown once)
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  // Initialize System ID and Load Keys
  useEffect(() => {
    // 1. Ensure System Identity exists
    let sid = localStorage.getItem('beep_system_uuid');
    if (!sid) {
      sid = `syn_${nanoid(16)}`; // 'syn' prefix for Syndicate
      localStorage.setItem('beep_system_uuid', sid);
    }
    setSystemId(sid);

    // 2. Load Keys
    const stored = localStorage.getItem('beep_access_keys');
    if (stored) {
      setKeys(JSON.parse(stored));
    } else {
      // Seed fake data if empty
      setKeys([
        { id: '1', name: 'Mobile App Client', prefix: 'lev_live_mob...', scope: 'write', created: Date.now() - 10000000, lastUsed: Date.now() - 3600000 },
        { id: '2', name: 'Audit Log Reader', prefix: 'lev_live_aud...', scope: 'read', created: Date.now() - 20000000 },
      ]);
    }
  }, []);

  const saveKeys = (newKeys: AccessKey[]) => {
    setKeys(newKeys);
    localStorage.setItem('beep_access_keys', JSON.stringify(newKeys));
  };

  const handleGenerate = () => {
    if (!newKeyName.trim()) return;

    const secret = `lev_live_${nanoid(24)}`;
    const newKey: AccessKey = {
      id: nanoid(),
      name: newKeyName,
      prefix: `${secret.substring(0, 12)}...`,
      scope: newKeyScope,
      created: Date.now(),
    };

    saveKeys([newKey, ...keys]);
    setGeneratedSecret(secret);
    setNewKeyName('');
    setIsCreating(false);
  };

  const handleRevoke = (id: string) => {
    if (window.confirm('Are you sure you want to revoke this key? Any applications using it will be disconnected immediately.')) {
      saveKeys(keys.filter(k => k.id !== id));
    }
  };

  const handleRegenerateSystemId = () => {
    if (window.confirm('WARNING: Regenerating the System UUID will disconnect any integrations relying on the old ID. This action cannot be undone.')) {
      const newId = `syn_${nanoid(16)}`;
      setSystemId(newId);
      localStorage.setItem('beep_system_uuid', newId);
      setIdCopied(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedSecret) {
      void navigator.clipboard.writeText(generatedSecret);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    }
  };

  const copySystemId = () => {
    if (systemId) {
      void navigator.clipboard.writeText(systemId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    }
  };
  
  const connectedCount = keys.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Key Management Area */}
        <ModuleCard title="External Access Keys" className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs text-text-secondary max-w-md">
              Generate unique API keys to grant external systems programmatic access to the ΛΞVON OS. Configure scopes to limit exposure.
            </p>
            <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-text-tertiary">{connectedCount} Active Keys</span>
                <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold text-white transition-all flex items-center space-x-2"
                >
                <span>+ Generate Key</span>
                </button>
            </div>
          </div>

          {/* Creation Form */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-black/40 border border-glass-border rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text-tertiary uppercase mb-1">Key Label</label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. External Data Service"
                        className="w-full bg-input-bg border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-roman-aqua outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-tertiary uppercase mb-1">Permission Scope</label>
                      <select
                        value={newKeyScope}
                        onChange={(e) => setNewKeyScope(e.target.value as AccessKey['scope'])} // Cast to correct type
                        className="w-full bg-input-bg border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-roman-aqua outline-none"
                      >
                        <option value="read">Read Only (Telemetry)</option>
                        <option value="write">Full Access (Execution)</option>
                        <option value="admin">Admin (Sovereign)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-3 py-2 text-xs font-bold text-text-secondary hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={!newKeyName.trim()}
                      className="px-4 py-2 bg-patina-green hover:bg-patina-green/80 text-black font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New Key Display Modal/Alert */}
          <AnimatePresence>
            {generatedSecret && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-yellow-400 font-bold text-sm flex items-center gap-2">
                    <KeyIcon className="w-4 h-4" />
                    Unique Key Generated
                  </h4>
                  <button onClick={() => setGeneratedSecret(null)} className="text-text-tertiary hover:text-white text-xs">✕</button>
                </div>
                <p className="text-[10px] text-text-secondary mb-3">
                  This key will only be shown once. Copy it now and store it securely. If lost, you will need to generate a new one.
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-grow bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-sm text-patina-green break-all select-all">
                    {generatedSecret}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                    title="Copy to Clipboard"
                  >
                    {justCopied ? <CheckCircleIcon className="w-5 h-5 text-patina-green" /> : <ShareIcon className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Key List */}
          <div className="space-y-3">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${key.scope === 'admin' ? 'text-imperial-purple' : key.scope === 'write' ? 'text-patina-green' : 'text-blue-400'}`}>
                    <KeyIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-vitreous-white">{key.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${SCOPES[key.scope].color}`}>
                        {SCOPES[key.scope].label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-xs text-text-tertiary">{key.prefix}</span>
                      <span className="text-[10px] text-text-tertiary">• Created {new Date(key.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {key.lastUsed ? (
                    <span className="text-[10px] text-text-tertiary hidden md:block">
                      Last used: {new Date(key.lastUsed).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-tertiary hidden md:block">Never used</span>
                  )}
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="p-2 text-text-tertiary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Revoke Key"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {keys.length === 0 && (
              <div className="text-center py-8 text-text-tertiary text-xs">
                No active keys. Generate one to enable external access.
              </div>
            )}
          </div>
        </ModuleCard>

        {/* Sidebar / Info */}
        <div className="space-y-6">
          {/* System Identity Card */}
          <ModuleCard title="System Identity">
            <div className="space-y-4">
              <p className="text-xs text-text-secondary">
                Unique identifier for this Syndicate Node. Use this ID for webhooks or identifying this system in distributed logs.
              </p>
              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <label className="block text-[10px] font-bold text-text-tertiary uppercase mb-1">Node UUID</label>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-roman-aqua truncate select-all">{systemId}</code>
                  <div className="flex space-x-1">
                    <button
                      onClick={copySystemId}
                      className="p-1.5 hover:bg-white/10 rounded text-text-tertiary hover:text-white transition-colors"
                      title="Copy UUID"
                    >
                      {idCopied ? <CheckCircleIcon className="w-4 h-4 text-patina-green" /> : <ShareIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleRegenerateSystemId}
                      className="p-1.5 hover:bg-white/10 rounded text-text-tertiary hover:text-red-400 transition-colors"
                      title="Rotate UUID (Disconnects Integrations)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ModuleCard>

          <ModuleCard title="Security Policy">
            <div className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h4 className="text-red-400 font-bold text-xs uppercase mb-1">Root Access Warning</h4>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  Admin-scope keys bypass most Rate Limits and AEGIS protocols. Use only for secure server-side integrations. Never expose in client-side code.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-text-tertiary uppercase mb-2">Rate Limits</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-text-secondary">Read Only</span>
                    <span className="font-mono text-white">1,000 req/min</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-text-secondary">Full Access</span>
                    <span className="font-mono text-white">500 req/min</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-text-secondary">Admin</span>
                    <span className="font-mono text-white">Unlimited</span>
                  </div>
                </div>
              </div>
            </div>
          </ModuleCard>
        </div>
      </div>
    </div>
  );
};

export default AccessKeysPanel;
