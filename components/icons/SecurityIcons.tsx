
/**
 * @file components/icons/SecurityIcons.tsx
 * @description A collection of reusable React functional components for displaying SVG icons
 * related to security, access control, and threat monitoring.
 */

import React from 'react';

/**
 * A React functional component for a "Shield" SVG icon.
 * Symbolizes protection, defense, security status, or integrity.
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG props.
 */
export const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/**
 * A React functional component for a "Lock" SVG icon.
 * Symbolizes security, access control, permissions, or encryption.
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG props.
 */
export const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/**
 * A React functional component for a "Radar" SVG icon.
 * Symbolizes scanning, threat detection, or monitoring.
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG props.
 */
export const RadarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 12 2 12" />
    <path d="M12 12 19.07 4.93" />
    <path d="M12 12 4.93 19.07" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

/**
 * A React functional component for an "Eye" SVG icon.
 * Symbolizes visibility, monitoring, surveillance, or previewing.
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG props.
 */
export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);