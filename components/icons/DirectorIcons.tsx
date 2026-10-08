
import React from 'react';

export const FingerPrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3c0 1.3-.25 2.5-.58 3.5" />
    <path d="M12 22v-3.5" />
    <path d="M15 15.5c-.3 1.5-.7 3-1.35 4.5" />
    <path d="M18.15 17c.2-1.3.35-2.6.35-4a6 6 0 0 0-1.63-4" />
    <path d="M21.7 15.5c.2-1.15.3-2.3.3-3.5a10 10 0 0 0-1.72-5.5" />
  </svg>
);

export const CalendarEventIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);
