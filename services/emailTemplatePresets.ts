import type { EmailTemplateDocument } from './emailCampaignTypes.js';

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplateDocument = {
  id: 'tpl-default',
  name: 'Product pulse',
  subject: 'A quick update from your team',
  preheader: 'Short preview text shown in inbox clients that support it.',
  layout: 'standard',
  updatedAt: Date.now(),
  blocks: [
    {
      id: 'blk-hero-1',
      type: 'hero',
      headline: 'Ship faster with less chaos',
      subline: 'One paragraph to anchor the narrative before the fold.',
      align: 'center',
    },
    {
      id: 'blk-text-1',
      type: 'text',
      body: 'Use this space for value props, social proof, or a personal note. Drag blocks from the palette to extend the story.',
      align: 'left',
    },
    {
      id: 'blk-btn-1',
      type: 'button',
      label: 'Open the cockpit',
      href: 'https://example.com',
    },
    { id: 'blk-sp-1', type: 'spacer', heightPx: 12 },
    { id: 'blk-div-1', type: 'divider' },
    {
      id: 'blk-text-2',
      type: 'text',
      body: 'Fine print: you can add compliance, address, and unsubscribe copy here.',
      align: 'center',
    },
  ],
};

export const LAYOUT_PRESETS: { id: EmailTemplateDocument['layout']; label: string; hint: string }[] = [
  { id: 'narrow', label: 'Narrow', hint: 'Mobile-first single column' },
  { id: 'standard', label: 'Standard', hint: '600px — common ESP default' },
  { id: 'wide', label: 'Wide', hint: 'Editorial layouts with imagery' },
];
