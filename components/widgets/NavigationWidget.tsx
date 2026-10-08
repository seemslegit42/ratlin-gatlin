
import React from 'react';
import type { NavigationWidgetData, View } from '../../types';
import { WeaverIcon } from '../icons/WeaverIcon';
import { CrownIcon } from '../icons/CrownIcon';
import { LayersIcon } from '../icons/LayersIcon';
import { BrainIcon } from '../icons/BrainIcon';
import { CoinsIcon, ChartBarIcon } from '../icons/EconomyIcons';
import { UsersIcon, FolderIcon } from '../icons/QuickActionIcons';
import { ShieldIcon } from '../icons/SecurityIcons';
import { ListTodoIcon } from '../icons/ListTodoIcon';
import { SimulationIcon } from '../icons/SimulationIcon';
import { MegaphoneIcon } from '../icons/MarketingIcons';
import { UserGroupIcon } from '../icons/CommandPaletteIcons';
import { BookIcon } from '../icons/BookIcon';
import { DatabaseIcon } from '../icons/AetheriumIcons';

interface NavigationWidgetProps {
  data: NavigationWidgetData;
  onNavigate: (view: View) => void;
}

// Fix: Added missing 'vault' and 'registry' properties
const VIEW_ICONS: Record<View, React.ReactNode> = {
    main: <BrainIcon className="w-6 h-6" />,
    weaver: <WeaverIcon className="w-6 h-6" />,
    simulacrum: <SimulationIcon className="w-6 h-6" />,
    microAppForge: <LayersIcon className="w-6 h-6" />,
    economy: <CoinsIcon className="w-6 h-6" />,
    avf: <ChartBarIcon className="w-6 h-6" />,
    finance: <ChartBarIcon className="w-6 h-6" />,
    crm: <UserGroupIcon className="w-6 h-6" />, 
    hrm: <UsersIcon className="w-6 h-6" />,
    production: <LayersIcon className="w-6 h-6" />,
    operations: <ListTodoIcon className="w-6 h-6" />,
    security: <ShieldIcon className="w-6 h-6" />,
    marketing: <MegaphoneIcon className="w-6 h-6" />, 
    procurement: <FolderIcon className="w-6 h-6" />,
    admin: <CrownIcon className="w-6 h-6 text-yellow-400" />,
    codex: <BookIcon className="w-6 h-6" />,
    pantheon: <CrownIcon className="w-6 h-6" />,
    vault: <DatabaseIcon className="w-6 h-6" />,
    registry: <FolderIcon className="w-6 h-6" />,
    help: <BookIcon className="w-6 h-6" />,
};

const NavigationWidget: React.FC<NavigationWidgetProps> = ({ data, onNavigate }) => {
  return (
    <div className="bg-panel-bg backdrop-blur-md p-4 rounded-lg border border-glass-border high-density">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-[#F5FFFA]">Navigation Command</h4>
          <p className="text-sm text-[#8C94A8]">{data.text}</p>
        </div>
        <button
          onClick={() => onNavigate(data.targetView)}
          className="p-3 bg-gradient-to-br from-roman-aqua to-patina-green rounded-xl text-white transition-all hover:shadow-lg hover:shadow-patina-green/40 flex items-center justify-center space-x-2"
        >
          {VIEW_ICONS[data.targetView] || <BrainIcon className="w-6 h-6" />}
          <span className="font-bold text-sm">Go</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationWidget;
