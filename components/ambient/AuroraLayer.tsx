
/**
 * @file components/ambient/AuroraLayer.tsx
 * @description Renders a dynamic, flowing aurora-like background animation.
 * This component is designed to evoke a mystical or ethereal atmosphere,
 * specifically used for the "Pantheon" (SimulacrumView) to align with its aesthetic.
 */

import React from 'react';

/**
 * The AuroraLayer component.
 * Displays a full-screen, animated aurora effect using CSS gradients and animations.
 * @returns {React.FC} The AuroraLayer UI.
 */
const AuroraLayer: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
      <div
        className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-tr from-transparent via-roman-aqua/20 to-transparent opacity-60 mix-blend-screen"
        style={{
          animation: 'aurora-dance 30s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] bg-gradient-to-bl from-transparent via-imperial-purple/20 to-transparent opacity-50 mix-blend-screen"
        style={{
          animation: 'aurora-dance 35s ease-in-out infinite reverse',
          animationDelay: '-5s',
          willChange: 'transform',
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-patina-green/10 blur-[100px] rounded-full opacity-30 animate-pulse-slow"
      />
    </div>
  );
};

export default AuroraLayer;
