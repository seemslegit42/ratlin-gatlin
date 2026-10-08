
/**
 * @file components/ambient/GlassOverlay.tsx
 * @description Applies a global glassmorphism effect to elements positioned behind it.
 * This component uses CSS `backdrop-filter` to create a translucent, blurred background
 * effect, adhering to the "Glassmorphism Perfected" aesthetic.
 */

import React from 'react';

/**
 * The GlassOverlay component.
 * Renders a full-screen, transparent layer that applies a blur effect to content behind it.
 * @returns {React.FC} The GlassOverlay UI.
 */
const GlassOverlay: React.FC = () => {
  return (
    <div
      className="fixed inset-0 -z-1"
      style={{
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
      }}
    />
  );
};

export default GlassOverlay;
