
import React from 'react';

export const WizardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M20 12l-4-4-4 4 4 4 4-4Z" />
    <path d="M16 8V4l-4 2-4-2v4" />
    <path d="M12 16v4" />
    <path d="M8 12 4 8" />
    <path d="M4 16l4-4" />
    <circle cx="16" cy="12" r="2" />
  </svg>
);
