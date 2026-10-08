/**
 * @file components/crm/PipelineColumn.tsx
 * @description A component representing a single column (stage) in the CRM sales pipeline Kanban board.
 * Supports dropping dragged deals and rendering interactive cards.
 */

import React, { useState } from 'react';
import type { CRMDeal, CRMActivity } from '../../types';
import { PipelineCard } from './PipelineCard';

interface PipelineColumnProps {
  stage: string;
  count: number;
  items: CRMDeal[];
  onDropDeal: (dealId: string | number, targetStage: string) => void;
  onUpdateDeal: (deal: CRMDeal) => void;
  logActivity: (action: CRMActivity['action'], target: string, topic: string) => Promise<void>;
  /** Opens deal detail sidebar — passed down to PipelineCard Tactical Briefing. */
  onSelectDeal?: (dealId: string | number) => void;
  /** Visual variant for Won/Lost closed-stage columns. */
  variant?: 'default' | 'won' | 'lost';
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, count, items, onDropDeal, onUpdateDeal, logActivity, onSelectDeal, variant = 'default' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData('dealId');
    if (!raw) return;
    const id = /^\d+$/.test(raw) ? Number(raw) : raw;
    onDropDeal(id, stage);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string | number, _stage: string) => {
    e.dataTransfer.setData('dealId', String(dealId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const borderClass = isDragOver
    ? 'border-pink-500/50 bg-pink-500/10'
    : variant === 'won'
      ? 'border-patina-green/30 bg-patina-green/5'
      : variant === 'lost'
        ? 'border-red-500/20 bg-red-500/5'
        : 'border-glass-border';

  const headerColor = variant === 'won' ? 'text-patina-green' : variant === 'lost' ? 'text-red-400' : 'text-text-secondary';

  return (
    <div
      className={`border rounded-xl p-4 flex flex-col h-full min-h-[300px] transition-colors bg-panel-bg/30 ${borderClass}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <h3 className={`text-sm font-bold uppercase mb-4 flex justify-between items-center ${headerColor}`}>
        <span className="flex items-center gap-2">
          {variant === 'won' && <span className="w-2 h-2 rounded-full bg-patina-green inline-block" />}
          {variant === 'lost' && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
          {stage}
        </span>
        <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">{count}</span>
      </h3>

      {/* Scrollable list of deal items */}
      <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <PipelineCard
            key={item.id}
            deal={item}
            stage={stage}
            onDragStart={handleDragStart}
            onUpdate={onUpdateDeal}
            onSelect={onSelectDeal}
            onAction={(action, company) => {
                void logActivity(action, company, action === 'emailed' ? 'Follow-up sent' : 'Discovery call logged');
            }}
          />
        ))}
        {items.length === 0 && (
          <div className="h-24 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-text-tertiary text-xs">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
};