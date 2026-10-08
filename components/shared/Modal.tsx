/**
 * @file components/shared/Modal.tsx
 * @description A generic, reusable modal component with a backdrop and animated entry/exit.
 * Adheres to WCAG 2.1 dialog pattern: role="dialog", aria-modal, aria-labelledby,
 * Escape key dismissal, and backdrop click-to-close.
 */

import React, { ReactNode, useId, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Auto-focus the close button when modal opens */
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  /* Dismiss on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-[#1C1934] border border-[#F5FFFA]/20 rounded-2xl shadow-2xl shadow-[#6A0DAD]/30 max-w-lg w-full mx-4 animate-fade-in-up high-density"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center gap-3">
          <h2 id={titleId} className="text-xl font-bold font-comfortaa leading-tight">{title}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-vitreous-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label={`Close ${title} dialog`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
