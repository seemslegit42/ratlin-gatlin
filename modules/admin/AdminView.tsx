
import React, { useState } from 'react';
import ThePantheon from '../../components/admin/ThePantheon';
import LoomOfFates from '../../components/admin/LoomOfFates';
import IntegrationsPanel from '../../components/admin/IntegrationsPanel';
import AccessKeysPanel from '../../components/admin/AccessKeysPanel';
import { SchemaManager } from '../../components/admin/SchemaManager';
import { InfraControlPanel } from '../../components/admin/InfraControlPanel';
import { ConstitutionManager } from '../../components/admin/ConstitutionManager';
import { CrownIcon } from '../../components/icons/CrownIcon';
import { LayersIcon } from '../../components/icons/LayersIcon';
import { PlugIcon } from '../../components/icons/PlugIcon';
import { KeyIcon } from '../../components/icons/KeyIcon';
import { DatabaseIcon } from '../../components/icons/AetheriumIcons';
import { ZapIcon } from '../../components/icons/VitalsIcons';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import BackButton from '../../components/shared/BackButton';
import type { View, Agent, Connection } from '../../types';
import { LlamaCliPlayground } from '../../components/admin/LlamaCliPlayground';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { DemiurgeConsole } from '../../components/admin/DemiurgeConsole';
import { CrystallineGlyph } from '../../components/icons/CrystallineGlyph';
import { sounds } from '../../utils/soundEffects';
import { UsersIcon } from '../../components/icons/QuickActionIcons';

interface AdminViewProps {
  onNavigate: (view: View) => void;
  agents?: Record<string, Agent>;
  connections?: Connection[];
}

const AdminView: React.FC<AdminViewProps> = ({ onNavigate, agents, connections }) => {
  const [activeInstrument, setActiveInstrument] = useState<'pantheon' | 'loom' | 'integrations' | 'keys' | 'schema' | 'infra' | 'constitution' | 'llama-cli' | 'teams'>('pantheon');
  const [isDemiurgeOpen, setIsDemiurgeOpen] = useState(false);

  const switchInstrument = (instrument: typeof activeInstrument) => {
    sounds.playGlassThrum();
    setActiveInstrument(instrument);
  };

  return (
    <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 high-density">
      <div className="flex items-center space-x-4 mb-2">
        <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
      </div>
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            The Architect's Gaze
          </h1>
          <p className="text-sm text-text-tertiary font-mono tracking-widest mt-1">SOVEREIGN COMMAND // SYSTEM ROOT</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playCrystallineChime();
              setIsDemiurgeOpen(true);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-imperial-purple/20 hover:bg-imperial-purple/40 border border-imperial-purple/40 text-imperial-purple hover:text-white rounded-xl text-xs font-bold transition-all shadow-lg"
          >
            <CrystallineGlyph glyph="oracle" size="xs" glowIntensity="high" />
            <span>Invoke Demiurge</span>
          </button>
        </div>

        {/* Instrument Switcher */}
        <div className="flex space-x-2 bg-black/30 p-1 rounded-lg border border-white/10 overflow-x-auto max-w-full custom-scrollbar">
          <button
            onClick={() => switchInstrument('pantheon')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'pantheon' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <CrownIcon className="w-4 h-4" />
            <span>The Pantheon</span>
          </button>
          <button
            onClick={() => switchInstrument('teams')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'teams' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <UsersIcon className="w-4 h-4 text-roman-aqua" />
            <span>Teams Tenancy</span>
          </button>
          <button
            onClick={() => switchInstrument('loom')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'loom' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <LayersIcon className="w-4 h-4" />
            <span>Loom of Fates</span>
          </button>
          <button
            onClick={() => switchInstrument('constitution')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'constitution' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Constitution</span>
          </button>
          <button
            onClick={() => switchInstrument('infra')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'infra' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <ZapIcon className="w-4 h-4" />
            <span>Infrastructure</span>
          </button>
          <button
            onClick={() => switchInstrument('integrations')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'integrations' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <PlugIcon className="w-4 h-4" />
            <span>Integrations</span>
          </button>
          <button
            onClick={() => switchInstrument('keys')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'keys' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <KeyIcon className="w-4 h-4" />
            <span>Access Keys</span>
          </button>
          <button
            onClick={() => switchInstrument('schema')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'schema' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <DatabaseIcon className="w-4 h-4" />
            <span>Schema</span>
          </button>
          <button
            onClick={() => switchInstrument('llama-cli')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center space-x-2 transition-colors whitespace-nowrap ${activeInstrument === 'llama-cli' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            <BrainIcon className="w-4 h-4 text-roman-aqua" />
            <span>Llama CLI</span>
          </button>
        </div>
      </header>

      {activeInstrument === 'pantheon' && <ThePantheon />}
      {activeInstrument === 'teams' && <TeamsTenancyPanel />}
      {activeInstrument === 'loom' && <LoomOfFates agents={agents} connections={connections} />}
      {activeInstrument === 'constitution' && <ConstitutionManager />}
      {activeInstrument === 'infra' && <InfraControlPanel />}
      {activeInstrument === 'integrations' && <IntegrationsPanel />}
      {activeInstrument === 'keys' && <AccessKeysPanel />}
      {activeInstrument === 'schema' && <SchemaManager />}
      {activeInstrument === 'llama-cli' && <LlamaCliPlayground />}

      <DemiurgeConsole isOpen={isDemiurgeOpen} onClose={() => setIsDemiurgeOpen(false)} />
    </div>
  );
};

export default AdminView;
