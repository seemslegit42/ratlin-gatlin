import React from 'react';

export const WeaverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M9 18l3-3 3 3" />
    <path d="M9 6l3 3 3-3" />
    <path d="M12 9v6" />
    <path d="M3 9h.01" />
    <path d="M21 9h.01" />
    <path d="M3 15h.01" />
    <path d="M21 15h.01" />
    <path d="M12 3v.01" />
    <path d="M12 21v.01" />
  </svg>
);