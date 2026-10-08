
import React from 'react';

export const MushroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4.5 12.5C4.5 8.36 7.86 5 12 5c4.14 0 7.5 3.36 7.5 7.5" />
    <path d="M19.5 12.5a7.5 7.5 0 0 1-7.5 7.5 7.5 7.5 0 0 1-7.5-7.5" />
    <path d="M12 2v20" />
    <path d="M12 22c-2.5 0-5-2-5-5" />
    <path d="M12 22c2.5 0 5-2 5-5" />
    <circle cx="8" cy="11" r="1" fill="currentColor" />
    <circle cx="16" cy="11" r="1" fill="currentColor" />
    <circle cx="12" cy="7" r="1" fill="currentColor" />
  </svg>
);

export const ObeliskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m12 2 8 20H4L12 2Z" />
    <path d="m12 2 3 20" />
    <path d="m12 2-3 20" />
    <path d="M12 10 4 22" />
    <path d="M12 10l8 12" />
  </svg>
);

export const NetworkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="12" cy="12" r="3" />
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M7.41 7.41 10 10" />
    <path d="m14 14 2.59 2.59" />
    <path d="m16.59 7.41-2.59 2.59" />
    <path d="m10 14-2.59 2.59" />
  </svg>
);
