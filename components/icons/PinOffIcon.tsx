
import React from 'react';

export const PinOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <line x1="2" y1="2" x2="22" y2="22"></line>
    <path d="M16 4l2 2-1.5 1.5"></path>
    <path d="M10 10l-2 2-1.5 1.5"></path>
    <path d="M14 8l2 2-5 5-2 2"></path>
    <path d="M7 16l-2 2"></path>
    <path d="m2 21 6-6"></path>
    <path d="m13 11 6-6"></path>
    <path d="m18 13 3-3-2-2-3 3"></path>
  </svg>
);
