import React from 'react';
import type { View } from '../types';

// Icons
import { BrainIcon } from '../components/icons/BrainIcon';
import { WeaverIcon } from '../components/icons/WeaverIcon';
import { SimulationIcon } from '../components/icons/SimulationIcon';
import { LayersIcon } from '../components/icons/LayersIcon';
import { CoinsIcon, ChartBarIcon } from '../components/icons/EconomyIcons';
import { UserGroupIcon } from '../components/icons/CommandPaletteIcons';
import { UsersIcon, FolderIcon } from '../components/icons/QuickActionIcons';
import { ListTodoIcon } from '../components/icons/ListTodoIcon';
import { ShieldIcon } from '../components/icons/SecurityIcons';
import { MegaphoneIcon } from '../components/icons/MarketingIcons';
import { CrownIcon } from '../components/icons/CrownIcon';
import { BookIcon } from '../components/icons/BookIcon';
import { DatabaseIcon } from '../components/icons/AetheriumIcons';

export interface ViewConfig {
    label: string;
    icon: React.ReactNode;
    path?: string; // For explicit routing if needed later
}

export const VIEW_REGISTRY: Record<View, ViewConfig> = {
    main: {
        label: 'COCKPIT',
        icon: <BrainIcon className="w-6 h-6" />
    },
    weaver: {
        label: 'WEAVER STUDIO',
        icon: <WeaverIcon className="w-6 h-6" />
    },
    simulacrum: {
        label: 'GLASS HOUSE',
        icon: <SimulationIcon className="w-6 h-6" />
    },
    microAppForge: {
        label: 'THE FORGE',
        icon: <LayersIcon className="w-6 h-6" />
    },
    economy: {
        label: 'XI TREASURY',
        icon: <CoinsIcon className="w-6 h-6" />
    },
    avf: {
        label: 'AVF COMMAND DECK',
        icon: <ChartBarIcon className="w-6 h-6" />
    },
    finance: {
        label: 'FOUNDERS FOCUS',
        icon: <ChartBarIcon className="w-6 h-6" />
    },
    crm: {
        label: 'RELATIONSHIPS',
        icon: <UserGroupIcon className="w-6 h-6" />
    },
    hrm: {
        label: 'TALENT GRID',
        icon: <UsersIcon className="w-6 h-6" />
    },
    production: {
        label: 'SUPPLY CHAIN',
        icon: <LayersIcon className="w-6 h-6" />
    },
    operations: {
        label: 'OPS COMMAND',
        icon: <ListTodoIcon className="w-6 h-6" />
    },
    security: {
        label: 'SENTINEL',
        icon: <ShieldIcon className="w-6 h-6" />
    },
    marketing: {
        label: 'GROWTH ENGINE',
        icon: <MegaphoneIcon className="w-6 h-6" />
    },
    procurement: {
        label: 'SOURCING',
        icon: <FolderIcon className="w-6 h-6" />
    },
    admin: {
        label: 'SYSTEM ROOT',
        icon: <CrownIcon className="w-6 h-6 text-yellow-400" />
    },
    codex: {
        label: 'THE CODEX',
        icon: <BookIcon className="w-6 h-6" />
    },
    pantheon: {
        label: 'THE PANTHEON',
        icon: <CrownIcon className="w-6 h-6" />
    },
    vault: {
        label: 'DATA VAULT',
        icon: <DatabaseIcon className="w-6 h-6" />
    },
    registry: {
        label: 'SYNDICATE REGISTRY',
        icon: <FolderIcon className="w-6 h-6" />
    },
    help: {
        label: 'HELP CENTER',
        icon: <BookIcon className="w-6 h-6" />
    }
};
