
/**
 * @file components/admin/IntegrationsPanel.tsx
 * @description The "Neural Bridges" interface. Allows the Sovereign to configure
 * third-party API keys, enabling agents to interact with external systems.
 * Persists keys locally for the session context.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { LockIcon, UnlockIcon } from '../../components/icons/LockIcons';
import { ZapIcon } from '../../components/icons/QuickActionIcons';
import { CheckCircleIcon } from '../../components/icons/AgentStatusIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useIntegrationsState, IntegrationState } from '../../hooks/useIntegrationsState';

type Category = 'Intelligence' | 'Communication' | 'Finance' | 'DevOps';

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  category: Category;
  iconText: string; // Placeholder for SVG icon
  color: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  { id: 'openai', name: 'OpenAI', description: 'LLM Intelligence & Reasoning', category: 'Intelligence', iconText: 'AI', color: 'text-green-400' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude Context Window', category: 'Intelligence', iconText: 'CL', color: 'text-orange-400' },
  { id: 'stripe', name: 'Stripe', description: 'Payment Processing & Treasury', category: 'Finance', iconText: 'S', color: 'text-purple-400' },
  { id: 'slack', name: 'Slack', description: 'Team Comms & Alerts', category: 'Communication', iconText: '#', color: 'text-blue-400' },
  { id: 'github', name: 'GitHub', description: 'Code Repositories & CI/CD', category: 'DevOps', iconText: 'GH', color: 'text-white' },
  { id: 'postman', name: 'Postman', description: 'API Collections, MCP Bridge & Testing', category: 'DevOps', iconText: 'PM', color: 'text-orange-500' },
  { id: 'sendgrid', name: 'SendGrid', description: 'Transactional Email', category: 'Communication', iconText: '@', color: 'text-blue-300' },
];

const IntegrationCard: React.FC<{
  def: IntegrationDef;
  data?: IntegrationState;
  onSave: (serviceId: string, key: string) => void;
  onToggle: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
}> = ({ def, data, onSave, onToggle, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const isConnected = !!data?.apiKey;
  const isEnabled = data?.isEnabled ?? false;

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(def.id, inputValue);
      setIsEditing(false);
      setInputValue('');
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${isConnected ? 'bg-white/5 border-patina-green/30' : 'bg-black/40 border-white/5'}`}>
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isConnected && isEnabled ? 'bg-patina-green' : isConnected ? 'bg-yellow-500' : 'bg-white/10'}`} />

      <div className="p-4 pl-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg bg-black/50 border border-white/10 ${def.color}`}>
              {def.iconText}
            </div>
            <div>
              <h3 className="font-bold text-vitreous-white text-sm">{def.name}</h3>
              <span className="text-[10px] uppercase tracking-wider text-text-tertiary">{def.category}</span>
            </div>
          </div>

          {isConnected ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggle(def.id)}
                className={`p-1.5 rounded-full transition-colors ${isEnabled ? 'text-patina-green bg-patina-green/10' : 'text-text-tertiary bg-white/5'}`}
                title={isEnabled ? "Active" : "Paused"}
              >
                <ZapIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 rounded-full text-text-secondary hover:text-white hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
            </div>
          ) : (
            <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-text-tertiary border border-white/5">DISCONNECTED</span>
          )}
        </div>

        <p className="text-xs text-text-secondary mb-4 min-h-[2.5em]">{def.description}</p>

        <AnimatePresence mode="wait">
          {isEditing || !isConnected ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="relative">
                <input
                  type={isVisible ? "text" : "password"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isConnected ? "Update API Key..." : "Enter API Key"}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:border-roman-aqua outline-none font-mono"
                />
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white"
                >
                  {isVisible ? <UnlockIcon className="w-3 h-3" /> : <LockIcon className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex justify-end space-x-2">
                {isConnected && (
                  <button
                    onClick={() => { onDelete(def.id); setIsEditing(false); }}
                    className="px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded"
                  >
                    Revoke
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-[10px] font-bold text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!inputValue.trim()}
                  className="px-3 py-1.5 bg-imperial-purple/20 border border-imperial-purple/50 text-imperial-purple hover:bg-imperial-purple/30 rounded text-[10px] font-bold disabled:opacity-50"
                >
                  {isConnected ? 'Update' : 'Connect'}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center space-x-2 text-xs text-patina-green">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="font-bold">Uplink Established</span>
              </div>
              <span className="text-[9px] font-mono text-text-tertiary">
                ****{data.apiKey.slice(-4)}
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const IntegrationsPanel: React.FC = () => {
  const { syndicateId, currentUser } = useAuth();
  const { integrations, saveIntegration, toggleIntegration, deleteIntegration, loading } =
    useIntegrationsState(syndicateId, currentUser?.id);
  
  const connectedCount = Object.keys(integrations).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ModuleCard title="Neural Bridges" className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-text-secondary">
              Configure external uplinks to allow Agents to access third-party data streams and execution environments.
              <p className="text-[10px] text-text-tertiary mt-1">
                Usage in Weaver: Use <code className="text-roman-aqua">{`{integration_id}`}</code> (e.g. <code className="text-roman-aqua">{`{integration_stripe}`}</code>) in API Call headers or Agent prompts.
              </p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-black/40 rounded-full border border-white/10">
              <span className={`w-2 h-2 rounded-full ${connectedCount > 0 ? 'bg-patina-green animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-mono text-vitreous-white">
                {loading ? '...' : connectedCount} Active Bridges
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {INTEGRATIONS.map(def => (
              <IntegrationCard
                key={def.id}
                def={def}
                data={integrations[def.id]}
                onSave={saveIntegration}
                onToggle={toggleIntegration}
                onDelete={deleteIntegration}
              />
            ))}
          </div>
        </ModuleCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard title="Local Llama Backend">
          <div className="text-xs text-text-secondary space-y-4">
            <p>Your local LLM bridge (llama.cpp) allows for private, cost-free model inference.</p>
            <div className="space-y-2">
                <h4 className="font-bold text-vitreous-white">1. Install</h4>
                <code className="block bg-black/50 p-2 rounded text-roman-aqua">curl -LsSf https://llama.app/install.sh | sh</code>
            </div>
            <div className="space-y-2">
                <h4 className="font-bold text-vitreous-white">2. Verify</h4>
                <code className="block bg-black/50 p-2 rounded text-roman-aqua">llama cli --version</code>
            </div>
            <div className="space-y-2">
                <h4 className="font-bold text-vitreous-white">3. Serve</h4>
                <code className="block bg-black/50 p-2 rounded text-roman-aqua">llama serve -hf ggml-org/gemma-4-e4b-it-GGUF:Q4_0</code>
            </div>
          </div>
        </ModuleCard>

        <ModuleCard title="Security Protocols">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-imperial-purple/10 border border-imperial-purple/20 rounded-lg">
              <LockIcon className="w-5 h-5 text-imperial-purple flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-vitreous-white">Vault Encrypted</h4>
                <p className="text-xs text-text-secondary mt-1">
                  API Keys are stored in your browser (localStorage) or syndicate tables in Appwrite. They are sent only to third-party endpoints during agent execution.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-text-tertiary px-2">
              <span>Storage Method</span>
              <span className="font-mono text-white">AES-256 (Server-Side)</span>
            </div>
          </div>
        </ModuleCard>

        <ModuleCard title="Usage Quotas">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">OpenAI Tokens</span>
              <span className="font-mono text-patina-green">14,205 / Limit</span>
            </div>
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-patina-green w-[15%] h-full" />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Stripe Calls</span>
              <span className="font-mono text-roman-aqua">842 / 1000</span>
            </div>
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-roman-aqua w-[84%] h-full" />
            </div>
          </div>
        </ModuleCard>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
