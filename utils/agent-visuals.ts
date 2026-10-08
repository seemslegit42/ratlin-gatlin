
import React from 'react';
import { AgentType, AgentStatus, type Agent } from '../types.js';
import { RouterIcon, DatabaseIcon, ClockIcon, MailIcon, GlobeIcon } from '../components/icons/AetheriumIcons.js';
import { MegaphoneIcon, ShareIcon, SearchCheckIcon, ChartLineIcon } from '../components/icons/MarketingIcons.js';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon.js';
import { LayersIcon } from '../components/icons/LayersIcon.js';
import { ListTodoIcon } from '../components/icons/ListTodoIcon.js';
import { PlayIcon, SearchIcon } from '../components/icons/CommandPaletteIcons.js';
import { BrainIcon } from '../components/icons/BrainIcon.js';
import { CrownIcon } from '../components/icons/CrownIcon.js';
import { WizardIcon } from '../components/icons/WizardIcon.js';
import { PlugIcon } from '../components/icons/PlugIcon.js';

// Additional icons for new types
const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
    React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    React.createElement('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
    React.createElement('polyline', { points: '21 15 16 10 5 21' })
  )
);

const TerminalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
    React.createElement('polyline', { points: '4 17 10 11 4 5' }),
    React.createElement('line', { x1: '12', y1: '19', x2: '20', y2: '19' })
  )
);

const PenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
    React.createElement('path', { d: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' })
  )
);

export const AGENT_ICONS: Record<string, React.ReactNode> = {
  [AgentType.Input]: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
    React.createElement('path', { d: 'M12 2 L12 8 M12 2 L6 5 L18 5 Z M4 7 L20 7 L12 22 Z M8 12 L16 12' }),
    React.createElement('path', { d: 'M12 8 L8 12 L12 16 L16 12 Z' })
  ),
  [AgentType.Start]: React.createElement(PlayIcon, { className: 'h-6 w-6' }),
  [AgentType.End]: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' })),
  [AgentType.ManualTask]: React.createElement(ListTodoIcon, { className: 'h-6 w-6' }),
  [AgentType.CognitiveCore]: React.createElement(BrainIcon, { className: 'h-6 w-6' }),
  [AgentType.DataTransformer]: React.createElement(LayersIcon, { className: 'h-6 w-6' }),
  [AgentType.Output]: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
    React.createElement('path', { d: 'M12 16 L12 22 M12 22 L6 19 L18 19 Z M4 7 L20 7 L12 2 Z' })
  ),
  [AgentType.ApiCall]: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
  ),
  [AgentType.Condition]: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 21.5l9-9-9-9-9 9 9 9z' })
  ),
  [AgentType.Trigger]: React.createElement(ClockIcon, { className: 'h-6 w-6' }),
  [AgentType.KnowledgeRetrieval]: React.createElement(DatabaseIcon, { className: 'h-6 w-6' }),
  [AgentType.Router]: React.createElement(RouterIcon, { className: 'h-6 w-6' }),
  [AgentType.WebScraper]: React.createElement(GlobeIcon, { className: 'h-6 w-6' }),
  [AgentType.MCP_Bridge]: React.createElement(PlugIcon, { className: 'h-6 w-6' }),
  
  [AgentType.CronTrigger]: React.createElement(ClockIcon, { className: 'h-6 w-6' }),
  [AgentType.EmailAction]: React.createElement(MailIcon, { className: 'h-6 w-6' }),
  [AgentType.CampaignManager]: React.createElement(MegaphoneIcon, { className: 'h-6 w-6' }),
  [AgentType.Copywriter]: React.createElement(PenIcon, { className: 'h-6 w-6' }),
  [AgentType.SEOAnalyzer]: React.createElement(SearchIcon, { className: 'h-6 w-6' }),
  [AgentType.SocialPoster]: React.createElement(ShareIcon, { className: 'h-6 w-6' }),
  [AgentType.BrandGuard]: React.createElement(ShieldCheckIcon, { className: 'h-6 w-6' }),
  [AgentType.CMSPublisher]: React.createElement(GlobeIcon, { className: 'h-6 w-6' }),
  [AgentType.AnalyticsTracker]: React.createElement(ChartLineIcon, { className: 'h-6 w-6' }),
  [AgentType.ImageGeneration]: React.createElement(PhotoIcon, { className: 'h-6 w-6' }),
  [AgentType.ImageEditing]: React.createElement(PhotoIcon, { className: 'h-6 w-6' }),
  [AgentType.VisionAnalysis]: React.createElement(PhotoIcon, { className: 'h-6 w-6' }),
  [AgentType.CodeExecution]: React.createElement(TerminalIcon, { className: 'h-6 w-6' }),
  [AgentType.WasmExecutor]: React.createElement(TerminalIcon, { className: 'h-6 w-6' }),
  [AgentType.MicroApp]: React.createElement(LayersIcon, { className: 'h-6 w-6' }),
  [AgentType.Notification]: React.createElement(MegaphoneIcon, { className: 'h-6 w-6' }),
  [AgentType.Prompt]: React.createElement(PenIcon, { className: 'h-6 w-6' }),
  [AgentType.Vortex_Vanguard]: React.createElement(BrainIcon, { className: 'h-6 w-6 text-roman-aqua' }),

  'brain': React.createElement(BrainIcon, { className: 'h-6 w-6' }),
  'sovereign': React.createElement(CrownIcon, { className: 'h-6 w-6' }),
  'core': React.createElement(BrainIcon, { className: 'h-6 w-6' }),
  'agent-1': React.createElement(BrainIcon, { className: 'h-6 w-6 text-imperial-purple' }),
  'wizard': React.createElement(WizardIcon, { className: 'h-6 w-6' }),
};

export const getAgentAvatar = (agent: Agent): React.ReactNode => {
    if (agent.avatar && (agent.avatar.startsWith('http') || agent.avatar.startsWith('data:'))) {
        return React.createElement('img', { 
            src: agent.avatar, 
            alt: agent.name, 
            className: 'w-full h-full object-cover rounded-lg' 
        });
    }

    if (agent.id === 'agent-1') return AGENT_ICONS['agent-1'];
    if (agent.avatar && AGENT_ICONS[agent.avatar]) return AGENT_ICONS[agent.avatar];
    return AGENT_ICONS[agent.type] || AGENT_ICONS[AgentType.CognitiveCore];
};

/**
 * Aetheric Sigil state styles per Book III §3.3.
 * Each status maps to a CSS class that applies the correct animation
 * (defined in index.css) to the icon element.
 *
 * sigilClass targets the icon wrapper div.
 * States:
 *   Dormant  → sigil-dormant  (static, dim)
 *   Aware    → sigil-aware    (slow soft pulse – for Pending/Waiting)
 *   Active   → sigil-active   (rapid bright pulse – Running/Compiling)
 *   Success  → sigil-success-calm (resolved calm glow)
 *   Warning  → sigil-warning  (dissonant orange crackle)
 *   Error    → sigil-error    (red fragment shatter)
 */
export const AGENT_STATUS_STYLES: Record<AgentStatus, {
  text: string;
  dot: string;
  glowColor: string;
  ringStyle: string;
  /** CSS class applied to the Aetheric Sigil icon wrapper */
  sigilClass: string;
}> = {
    [AgentStatus.Idle]:             { text: 'text-text-tertiary', dot: 'bg-text-tertiary',              glowColor: 'transparent', ringStyle: 'solid',  sigilClass: 'sigil-dormant' },
    [AgentStatus.Pending]:          { text: 'text-yellow-400',    dot: 'bg-yellow-400 animate-pulse',   glowColor: '#FACC15',     ringStyle: 'dashed', sigilClass: 'sigil-aware' },
    [AgentStatus.Running]:          { text: 'text-roman-aqua',    dot: 'bg-roman-aqua animate-pulse',   glowColor: '#20B2AA',     ringStyle: 'solid',  sigilClass: 'sigil-active' },
    [AgentStatus.Success]:          { text: 'text-patina-green',  dot: 'bg-patina-green',               glowColor: '#3EB991',     ringStyle: 'solid',  sigilClass: 'sigil-success-calm' },
    [AgentStatus.Error]:            { text: 'text-red-500',       dot: 'bg-red-500',                    glowColor: '#EF4444',     ringStyle: 'jagged', sigilClass: 'sigil-error' },
    [AgentStatus.OPERATIONAL]:      { text: 'text-patina-green',  dot: 'bg-patina-green',               glowColor: '#3EB991',     ringStyle: 'solid',  sigilClass: 'sigil-success-calm' },
    [AgentStatus.COMPILING]:        { text: 'text-roman-aqua',    dot: 'bg-roman-aqua animate-ping',    glowColor: '#20B2AA',     ringStyle: 'dashed', sigilClass: 'sigil-active' },
    [AgentStatus.DEGRADED]:         { text: 'text-orange-500',    dot: 'bg-orange-500',                 glowColor: '#F97316',     ringStyle: 'jagged', sigilClass: 'sigil-warning' },
    [AgentStatus.TERMINATED]:       { text: 'text-gray-600',      dot: 'bg-gray-600',                   glowColor: 'transparent', ringStyle: 'dotted', sigilClass: 'sigil-dormant' },
    [AgentStatus.WAITING_FOR_HUMAN]:{ text: 'text-pink-500',      dot: 'bg-pink-500 animate-pulse',     glowColor: '#EC4899',     ringStyle: 'dashed', sigilClass: 'sigil-aware' },
};

export const AGENT_DESCRIPTIONS: Record<AgentType, string> = {
  [AgentType.Start]: 'The Big Bang of your logic.',
  [AgentType.End]: 'The inevitable conclusion.',
  [AgentType.Trigger]: 'Waiting for the stars to align.',
  [AgentType.ManualTask]: 'Awaiting human signal.',
  [AgentType.Input]: 'Source of all chaos. Data ingress.',
  [AgentType.CognitiveCore]: 'Neural reasoning engine.',
  [AgentType.DataTransformer]: 'Digital alchemy. Lead to gold.',
  [AgentType.ApiCall]: 'External uplink protocol.',
  [AgentType.Condition]: 'Crossroads of destiny. Logic gate.',
  [AgentType.Output]: 'The final verdict. Data egress.',
  [AgentType.CronTrigger]: 'Time is a flat circle.',
  [AgentType.KnowledgeRetrieval]: 'The Syndicate archives.',
  [AgentType.WebScraper]: 'Harvests raw data from the web.',
  [AgentType.Router]: 'Traffic control for thoughts.',
  [AgentType.EmailAction]: 'Digital pigeon carrier.',
  [AgentType.CampaignManager]: 'Growth engine orchestrator.',
  [AgentType.Copywriter]: 'Hallucinating eloquence.',
  [AgentType.SEOAnalyzer]: 'Appeasing the search gods.',
  [AgentType.SocialPoster]: 'Feeding the algorithm.',
  [AgentType.BrandGuard]: 'The corporate immune system.',
  [AgentType.CMSPublisher]: 'Live deployment protocol.',
  [AgentType.AnalyticsTracker]: 'Counting beans in the machine.',
  [AgentType.ImageEditing]: 'Visual manipulation.',
  [AgentType.VisionAnalysis]: 'The synthetic gaze.',
  [AgentType.CodeExecution]: 'Executing untrusted logic.',
  [AgentType.WasmExecutor]: 'High-speed binary bottle.',
  [AgentType.MicroApp]: 'Sacred instrument of the Forge.',
  [AgentType.Notification]: 'Town crier for the swarm.',
  [AgentType.Prompt]: 'Injecting context shards.',
  [AgentType.ImageGeneration]: 'Dreaming in pixels.',
  [AgentType.MCP_Bridge]: 'Bridges to the material world.',
  [AgentType.Vortex_Vanguard]: 'I am speed.',
};

export const AGENT_HUMOROUS_DESCRIPTIONS: Record<AgentType, string> = AGENT_DESCRIPTIONS;

export const AGENT_TOOLTIPS: Record<AgentType, string> = {
    [AgentType.Start]: 'Start Node',
    [AgentType.End]: 'End Node',
    [AgentType.Trigger]: 'Trigger',
    [AgentType.ManualTask]: 'Human Interaction',
    [AgentType.Input]: 'Input',
    [AgentType.CognitiveCore]: 'Cognitive Core',
    [AgentType.DataTransformer]: 'Transformer',
    [AgentType.ApiCall]: 'API Call',
    [AgentType.Condition]: 'Logic Gate',
    [AgentType.Output]: 'Output',
    [AgentType.CronTrigger]: 'Schedule',
    [AgentType.KnowledgeRetrieval]: 'Archive',
    [AgentType.WebScraper]: 'Scraper',
    [AgentType.Router]: 'Router',
    [AgentType.EmailAction]: 'Email',
    [AgentType.CampaignManager]: 'Campaign',
    [AgentType.Copywriter]: 'Copy',
    [AgentType.SEOAnalyzer]: 'SEO',
    [AgentType.SocialPoster]: 'Social',
    [AgentType.BrandGuard]: 'Guard',
    [AgentType.CMSPublisher]: 'CMS',
    [AgentType.AnalyticsTracker]: 'Analytics',
    [AgentType.ImageGeneration]: 'Image Gen',
    [AgentType.ImageEditing]: 'Image Edit',
    [AgentType.VisionAnalysis]: 'Vision',
    [AgentType.CodeExecution]: 'Runtime',
    [AgentType.WasmExecutor]: 'WASM',
    [AgentType.MicroApp]: 'App',
    [AgentType.Notification]: 'Notify',
    [AgentType.Prompt]: 'Prompt',
    [AgentType.MCP_Bridge]: 'Bridge',
    [AgentType.Vortex_Vanguard]: 'Vanguard',
};
