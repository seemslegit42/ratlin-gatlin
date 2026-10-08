/**
 * @file components/icons/ChevronDownIcon.tsx
 * @description A reusable React functional component for displaying a chevron-down SVG icon.
 * This icon typically symbolizes expansion, collapsing, or a dropdown menu within the UI.
 */

import React from 'react';

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);