/**
 * Drag-and-drop email template builder with live HTML preview (desktop / mobile).
 * Component catalog: see docs/email-marketing/ui-components.md
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../../modules/shared/ModuleCard.js';
import { LayersIcon } from '../../icons/LayersIcon.js';
import type { EmailBlock, EmailBlockType, EmailTemplateDocument } from '../../../services/emailCampaignTypes.js';
import { renderEmailHtml } from '../../../services/emailHtmlRenderer.js';
import { LAYOUT_PRESETS } from '../../../services/emailTemplatePresets.js';

const PALETTE: { type: EmailBlockType; label: string; hint: string }[] = [
  { type: 'hero', label: 'Hero', hint: 'Headline + subline' },
  { type: 'text', label: 'Text', hint: 'Body copy' },
  { type: 'button', label: 'CTA', hint: 'Primary button' },
  { type: 'image', label: 'Image', hint: 'Hero or inline visual' },
  { type: 'columns', label: 'Two columns', hint: 'Side-by-side copy' },
  { type: 'spacer', label: 'Spacer', hint: 'Vertical rhythm' },
  { type: 'divider', label: 'Divider', hint: 'Subtle rule' },
];

function makeBlock(type: EmailBlockType): EmailBlock {
  const id = nanoid();
  switch (type) {
    case 'hero':
      return { id, type: 'hero', headline: 'New hero', subline: 'Supporting line', align: 'center' };
    case 'text':
      return { id, type: 'text', body: 'Paragraph text goes here.', align: 'left' };
    case 'button':
      return { id, type: 'button', label: 'Call to action', href: 'https://' };
    case 'image':
      return { id, type: 'image', alt: 'Visual', src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80' };
    case 'columns':
      return { id, type: 'columns', left: 'Left column', right: 'Right column' };
    case 'spacer':
      return { id, type: 'spacer', heightPx: 24 };
    case 'divider':
      return { id, type: 'divider' };
    default:
      return { id, type: 'text', body: '', align: 'left' };
  }
}

interface EmailCampaignCanvasProps {
  document: EmailTemplateDocument;
  onDocumentChange: (next: EmailTemplateDocument | ((prev: EmailTemplateDocument) => EmailTemplateDocument)) => void;
}

export const EmailCampaignCanvas: React.FC<EmailCampaignCanvasProps> = ({ document: doc, onDocumentChange: setDoc }) => {
  const [selectedId, setSelectedId] = useState<string | null>(doc.blocks[0]?.id ?? null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (doc.blocks.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !doc.blocks.some((b) => b.id === selectedId)) {
      setSelectedId(doc.blocks[0]!.id);
    }
  }, [doc.blocks, selectedId]);

  const html = useMemo(() => renderEmailHtml(doc), [doc]);
  const selected = doc.blocks.find((b) => b.id === selectedId) ?? null;

  const updateBlock = useCallback(
    (id: string, patch: Partial<EmailBlock>) => {
      setDoc((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        blocks: prev.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as EmailBlock) : b)),
      }));
    },
    [setDoc],
  );

  const removeBlock = (id: string) => {
    setDoc((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const addBlock = (type: EmailBlockType) => {
    const block = makeBlock(type);
    setDoc((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      blocks: [...prev.blocks, block],
    }));
    setSelectedId(block.id);
  };

  const onDropReorder = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    setDoc((prev) => {
      const blocks = [...prev.blocks];
      const from = blocks.findIndex((b) => b.id === dragId);
      const to = blocks.findIndex((b) => b.id === targetId);
      if (from < 0 || to < 0) return prev;
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved!);
      return { ...prev, updatedAt: Date.now(), blocks };
    });
    setDragId(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <ModuleCard title="Block palette" className="xl:col-span-2" icon={<LayersIcon className="w-5 h-5 text-roman-aqua" />}>
        <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-3">Drag handle on canvas rows to reorder</p>
        <div className="space-y-2">
          {PALETTE.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => addBlock(p.type)}
              className="w-full text-left px-3 py-2 rounded-lg border border-white/10 bg-black/30 hover:bg-white/5 transition-colors"
            >
              <div className="text-xs font-bold text-white">{p.label}</div>
              <div className="text-[10px] text-text-tertiary">{p.hint}</div>
            </button>
          ))}
        </div>
      </ModuleCard>

      <ModuleCard title="Canvas" className="xl:col-span-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            className="flex-1 min-w-[140px] bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            value={doc.name}
            onChange={(e) => setDoc((p) => ({ ...p, name: e.target.value, updatedAt: Date.now() }))}
            placeholder="Template name"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Subject</label>
            <input
              className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              value={doc.subject}
              onChange={(e) => setDoc((p) => ({ ...p, subject: e.target.value, updatedAt: Date.now() }))}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Preheader</label>
            <input
              className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              value={doc.preheader}
              onChange={(e) => setDoc((p) => ({ ...p, preheader: e.target.value, updatedAt: Date.now() }))}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-[10px] font-bold text-text-tertiary uppercase">Layout width</label>
          <div className="flex gap-2 mt-1">
            {LAYOUT_PRESETS.map((lp) => (
              <button
                key={lp.id}
                type="button"
                onClick={() => setDoc((p) => ({ ...p, layout: lp.id, updatedAt: Date.now() }))}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold border ${
                  doc.layout === lp.id ? 'border-roman-aqua bg-roman-aqua/10 text-white' : 'border-white/10 text-text-secondary hover:text-white'
                }`}
              >
                {lp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence initial={false}>
            {doc.blocks.map((b) => (
              <motion.div
                layout
                key={b.id}
                draggable
                onDragStart={() => setDragId(b.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropReorder(b.id)}
                onClick={() => setSelectedId(b.id)}
                className={`rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-colors ${
                  selectedId === b.id ? 'border-roman-aqua bg-roman-aqua/5' : 'border-white/10 bg-black/25 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-text-tertiary">{b.type}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(b.id);
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 uppercase font-bold"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-text-secondary mt-1 truncate">
                  {b.type === 'hero' && b.headline}
                  {b.type === 'text' && b.body.slice(0, 80)}
                  {b.type === 'button' && `${b.label} → ${b.href}`}
                  {b.type === 'image' && b.alt}
                  {b.type === 'columns' && 'Two columns'}
                  {b.type === 'spacer' && `${b.heightPx}px`}
                  {b.type === 'divider' && '—'}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ModuleCard>

      <ModuleCard title="Inspector" className="xl:col-span-3">
        {!selected ? (
          <p className="text-xs text-text-secondary">Select a block to edit properties.</p>
        ) : (
          <div className="space-y-3 text-xs">
            {selected.type === 'hero' && (
              <>
                <Field label="Headline" value={selected.headline} onChange={(v) => updateBlock(selected.id, { headline: v })} />
                <Field label="Subline" value={selected.subline} onChange={(v) => updateBlock(selected.id, { subline: v })} multiline />
                <AlignField value={selected.align} onChange={(align) => updateBlock(selected.id, { align })} />
              </>
            )}
            {selected.type === 'text' && (
              <>
                <Field label="Body" value={selected.body} onChange={(v) => updateBlock(selected.id, { body: v })} multiline />
                <AlignField value={selected.align} onChange={(align) => updateBlock(selected.id, { align })} />
              </>
            )}
            {selected.type === 'button' && (
              <>
                <Field label="Label" value={selected.label} onChange={(v) => updateBlock(selected.id, { label: v })} />
                <Field label="URL" value={selected.href} onChange={(v) => updateBlock(selected.id, { href: v })} />
              </>
            )}
            {selected.type === 'image' && (
              <>
                <Field label="Image URL" value={selected.src} onChange={(v) => updateBlock(selected.id, { src: v })} />
                <Field label="Alt text" value={selected.alt} onChange={(v) => updateBlock(selected.id, { alt: v })} />
              </>
            )}
            {selected.type === 'columns' && (
              <>
                <Field label="Left" value={selected.left} onChange={(v) => updateBlock(selected.id, { left: v })} multiline />
                <Field label="Right" value={selected.right} onChange={(v) => updateBlock(selected.id, { right: v })} multiline />
              </>
            )}
            {selected.type === 'spacer' && (
              <div>
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Height (px)</label>
                <input
                  type="number"
                  min={4}
                  max={120}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  value={selected.heightPx}
                  onChange={(e) => updateBlock(selected.id, { heightPx: Number(e.target.value) || 8 })}
                />
              </div>
            )}
            {selected.type === 'divider' && <p className="text-text-tertiary">No properties for divider.</p>}
          </div>
        )}
      </ModuleCard>

      <ModuleCard title="Live preview" className="xl:col-span-3">
        <div className="flex gap-2 mb-2">
          {(['desktop', 'mobile'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPreviewMode(m)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border ${
                previewMode === m ? 'border-pink-500 text-white bg-pink-500/10' : 'border-white/10 text-text-secondary'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div
          className={`mx-auto rounded-xl border border-white/10 bg-black/40 overflow-hidden ${
            previewMode === 'mobile' ? 'max-w-[360px]' : 'w-full'
          }`}
          style={{ height: 440 }}
        >
          <iframe title="Email preview" className="w-full h-full border-0 bg-white" srcDoc={html} sandbox="allow-same-origin" />
        </div>
        <p className="text-[10px] text-text-tertiary mt-2">
          Preview uses table-based responsive HTML. Test in real clients before high-volume sends.
        </p>
      </ModuleCard>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; multiline?: boolean }> = ({
  label,
  value,
  onChange,
  multiline,
}) => (
  <div>
    <label className="text-[10px] font-bold text-text-tertiary uppercase">{label}</label>
    {multiline ? (
      <textarea
        className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white min-h-[88px] resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </div>
);

const AlignField: React.FC<{ value: 'left' | 'center'; onChange: (v: 'left' | 'center') => void }> = ({ value, onChange }) => (
  <div>
    <label className="text-[10px] font-bold text-text-tertiary uppercase">Align</label>
    <div className="flex gap-2 mt-1">
      {(['left', 'center'] as const).map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(a)}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold capitalize border ${
            value === a ? 'border-roman-aqua text-white' : 'border-white/10 text-text-secondary'
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  </div>
);
