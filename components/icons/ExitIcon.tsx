/**
 * @file components/icons/ExitIcon.tsx
 * @description A reusable React functional component for displaying an exit or log out SVG icon.
 * This icon typically symbolizes leaving a section, logging out, or exiting the application.
 */

import React from 'react';

export const ExitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
    <polyline points="17 16 21 12 17 8" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);