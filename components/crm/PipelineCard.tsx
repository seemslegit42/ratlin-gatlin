
/**
 * @file components/crm/PipelineCard.tsx
 * @description A draggable, interactive card representing a CRM deal.
 */

import React, { useState } from 'react';
import type { CRMDeal } from '../../types';
import { motion } from 'framer-motion';
import { MailIcon } from '../icons/AetheriumIcons';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { BrainIcon } from '../icons/BrainIcon';

interface PipelineCardProps {
  deal: CRMDeal;
  stage: string;
  onDragStart: (e: React.DragEvent, dealId: string | number, stage: string) => void;
  onUpdate: (deal: CRMDeal) => void;
  onAction?: (action: 'emailed' | 'called', company: string) => void;
  /** Opens the full deal sidebar for this card. */
  onSelect?: (dealId: string | number) => void;
}

export const PipelineCard: React.FC<PipelineCardProps> = ({ deal, stage, onDragStart, onUpdate, onAction, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeal, setEditedDeal] = useState<CRMDeal>(deal);

  const handleSave = () => {
    onUpdate(editedDeal);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedDeal(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) : value
    }));
  };
  
  const handleQuickAction = (e: React.MouseEvent, type: 'emailed' | 'called') => {
      e.stopPropagation();
      if(onAction) onAction(type, deal.company);
  }

  const resonanceColor = deal.resonance && deal.resonance > 70 ? 'text-patina-green' : deal.resonance && deal.resonance < 40 ? 'text-red-400' : 'text-roman-aqua';

  return (
    <motion.div
      layout
      draggable={!isEditing}
      onDragStart={(e: any) => onDragStart(e, deal.id, stage)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-black/40 p-4 rounded-xl border hover:border-roman-aqua/50 transition-all shadow-sm group ${isEditing ? 'border-roman-aqua/50 ring-1 ring-roman-aqua/20' : 'border-white/5 cursor-grab active:cursor-grabbing'}`}
    >
      {isEditing ? (
        <div className="space-y-2">
          <input type="text" name="company" value={editedDeal.company} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-vitreous-white outline-none" />
          <input type="text" name="dealName" value={editedDeal.dealName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-text-secondary outline-none" />
          <div className="flex gap-2">
            <select name="priority" value={editedDeal.priority} onChange={handleChange} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-vitreous-white outline-none">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input type="number" name="value" value={editedDeal.value} onChange={handleChange} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-vitreous-white outline-none" />
          </div>
          <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-white/5">
            <button onClick={() => setIsEditing(false)} className="text-xs text-text-tertiary hover:text-white px-2 py-1">Cancel</button>
            <button onClick={handleSave} className="text-xs bg-roman-aqua/20 text-roman-aqua hover:bg-roman-aqua/40 px-3 py-1 rounded font-bold">Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div>
                <span className="font-bold text-sm text-vitreous-white block">{deal.company}</span>
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">{deal.dealName}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${deal.priority === 'High' ? 'bg-patina-green/20 text-patina-green' : 'bg-white/5 text-text-tertiary'}`}>
                    {deal.priority}
                </span>
                <div className="flex items-center gap-1 mt-1">
                    <div className={`w-1 h-1 rounded-full animate-pulse ${resonanceColor.replace('text-', 'bg-')}`} />
                    <span className={`text-[9px] font-mono font-bold ${resonanceColor}`}>{deal.resonance}% RESONANCE</span>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-[10px] text-text-tertiary font-mono">{deal.lastContact}</span>
            <div className="flex items-center space-x-3">
                 <button onClick={(e) => handleQuickAction(e, 'emailed')} className="text-text-tertiary hover:text-patina-green transition-colors" title="Log Email">
                    <MailIcon className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={(e) => handleQuickAction(e, 'called')} className="text-text-tertiary hover:text-roman-aqua transition-colors" title="Log Call">
                    <MicrophoneIcon className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={(e) => setIsEditing(true)} className="text-text-tertiary hover:text-white transition-opacity" title="Edit Deal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                 </button>
                 <span className="text-xs font-mono text-patina-green font-bold ml-1">${(deal.value / 1000).toFixed(0)}k</span>
            </div>
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(deal.id); }}
            className="w-full mt-3 py-1.5 bg-imperial-purple/10 hover:bg-imperial-purple/20 border border-imperial-purple/20 hover:border-imperial-purple/40 rounded-lg text-[9px] font-bold uppercase tracking-widest text-imperial-purple hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <BrainIcon className="w-3 h-3" />
            Tactical Briefing
          </button>
        </>
      )}
    </motion.div>
  );
};
