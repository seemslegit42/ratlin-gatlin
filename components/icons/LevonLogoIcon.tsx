
import React from 'react';

export const LevonLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Optional Glow Filter Definition */}
    <defs>
      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Main Outer Triangle Frame */}
    <path 
      d="M24 2L2 42H46L24 2Z" 
      stroke="currentColor" 
      strokeWidth="2"
      fill="currentColor" 
      fillOpacity="0.02"
    />

    {/* Inner Prism (Floating Core) */}
    <path 
      d="M24 12L14 36H34L24 12Z" 
      stroke="currentColor" 
      strokeOpacity="0.8"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.1"
      filter="url(#logo-glow)"
    />

    {/* Vertical Spine (Alignment) */}
    <path d="M24 2V12" stroke="currentColor" strokeOpacity="0.4" />
    <path d="M24 36V42" stroke="currentColor" strokeOpacity="0.4" />

    {/* Refractive Facet Lines (Depth) */}
    <path d="M24 12L2 42" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
    <path d="M24 12L46 42" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

    {/* Center Singularity Point */}
    <circle cx="24" cy="28" r="1.5" fill="currentColor" fillOpacity="0.9" stroke="none" filter="url(#logo-glow)" />
  </svg>
);
