/**
 * @file components/icons/BrainIcon.tsx
 * @description A reusable React functional component for displaying a brain SVG icon.
 * This icon typically symbolizes AI, cognition, intelligence, or core processing within the UI.
 */

import React from 'react';

export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 2a4.5 4.5 0 00-4.5 4.5c0 1.25.5 2.4 1.34 3.25" />
    <path d="M12 2a4.5 4.5 0 014.5 4.5c0 1.25-.5 2.4-1.34 3.25" />
    <path d="M12 13a4.5 4.5 0 00-4.5-4.5" />
    <path d="M12 13a4.5 4.5 0 014.5-4.5" />
    <path d="M8.84 16.25c.16-.25.33-.5.5-.75a4.5 4.5 0 017.32 0c.17.25.34.5.5.75" />
    <path d="M4.5 12.5a4.5 4.5 0 000 9" />
    <path d="M19.5 12.5a4.5 4.5 0 010 9" />
    <path d="M12 13v9" />
    <path d="M12 22a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);