
/**
 * @file components/crm/ContactList.tsx
 * @description Displays a grid of important CRM contacts.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { UsersIcon } from '../icons/QuickActionIcons';
import type { CRMContact } from '../../types';

interface ContactListProps {
    contacts?: CRMContact[];
    onSelectContact?: (contact: CRMContact) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ contacts = [], onSelectContact }) => {
  // Fallback contacts if none provided
  const displayContacts = contacts.length > 0 ? contacts : [
      { id: '1', name: 'Sarah Connor', role: 'Decision Maker', company: 'Skynet', avatarColor: '#6A0DAD', syndicateId: 'demo' },
      { id: '2', name: 'Rick Deckard', role: 'Lead', company: 'Tyrell Corp', avatarColor: '#20B2AA', syndicateId: 'demo' }
  ];

  return (
    <ModuleCard title="Key Contacts" icon={<UsersIcon className="w-5 h-5 text-blue-400" />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {displayContacts.map((contact, i) => (
          <div 
            key={contact.id} 
            onClick={() => onSelectContact && onSelectContact(contact)}
            className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-blue-400/30 hover:bg-white/10 cursor-pointer transition-all group"
          >
            <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                style={{ backgroundColor: contact.avatarColor || `hsl(${i * 60}, 70%, 50%)` }}
            >
              {contact.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-vitreous-white font-bold truncate group-hover:text-blue-300 transition-colors">{contact.name}</div>
              <div className="text-[10px] text-text-tertiary">{contact.role} • {contact.company}</div>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
            <div className="col-span-full text-center py-8 text-xs text-text-tertiary">
                No contacts in database.
            </div>
        )}
      </div>
    </ModuleCard>
  );
};
