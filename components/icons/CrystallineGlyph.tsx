/**
 * @file components/icons/CrystallineGlyph.tsx
 * @description Faceted Crystalline Glyphs for ΛΞVON OS.
 * Icons are not merely flat pictures; they are sacred faceted crystals that glow from within.
 * 
 * Behaviors:
 * - Dormant: Faint internal pulse with subtle refraction.
 * - Gaze/Hover: Refractive shimmer with chromatic aberration & back-surface glow.
 * - Active: Bright internal glow with resonant particle shimmer.
 * - Visuals: Abstract, geometric, rendered with Roman Aqua & Verdigris gradients.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export type GlyphState = 'dormant' | 'hover' | 'active';

export type GlyphType = 
  | 'oracle'
  | 'lattice'
  | 'swarm'
  | 'conduit'
  | 'vault'
  | 'sentinel'
  | 'alchemy'
  | 'syndicate'
  | 'chronicle'
  | 'spark'
  | 'shield'
  | 'crucible'
  | 'metronome'
  | 'mycelium';

interface CrystallineGlyphProps {
  type?: GlyphType;
  glyph?: GlyphType;
  state?: GlyphState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  title?: string;
  glowColor?: string;
  glowIntensity?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-4 h-4', svg: 16 },
  sm: { box: 'w-6 h-6', svg: 24 },
  md: { box: 'w-8 h-8', svg: 32 },
  lg: { box: 'w-12 h-12', svg: 48 },
  xl: { box: 'w-16 h-16', svg: 64 },
};

export const CrystallineGlyph: React.FC<CrystallineGlyphProps> = ({
  type,
  glyph,
  state: controlledState,
  size = 'md',
  className = '',
  onClick,
  title,
  glowColor = '#20B2AA',
}) => {
  const activeType = type || glyph || 'lattice';
  const [internalHover, setInternalHover] = useState(false);
  const effectiveState: GlyphState = controlledState || (internalHover ? 'hover' : 'dormant');
  const dimensions = SIZE_MAP[size] || SIZE_MAP.md;

  // Render faceted crystal geometry depending on type
  const renderFacetedPaths = () => {
    switch (activeType) {
      case 'oracle':
        // Eye of Providence in a faceted diamond octahedron
        return (
          <>
            <polygon points="12,2 22,12 12,22 2,12" fill="url(#crystal-aqua-grad)" opacity="0.25" stroke="currentColor" strokeWidth="1" />
            <polygon points="12,5 19,12 12,19 5,12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
            <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="#fff" />
          </>
        );

      case 'lattice':
      case 'swarm':
        // Hexagonal interlocking facets with neural vertices
        return (
          <>
            <polygon points="12,2 20.66,7 20.66,17 12,22 3.34,17 3.34,7" fill="url(#crystal-aqua-grad)" opacity="0.2" stroke="currentColor" strokeWidth="1" />
            <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
            <line x1="3.34" y1="7" x2="20.66" y2="17" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
            <line x1="3.34" y1="17" x2="20.66" y2="7" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
            <polygon points="12,6 17.2,9 17.2,15 12,18 6.8,15 6.8,9" fill="url(#crystal-patina-grad)" opacity="0.4" stroke="currentColor" strokeWidth="0.75" />
            <circle cx="12" cy="12" r="1.5" fill="#fff" />
          </>
        );

      case 'conduit':
        // Dynamic flow vectors through a refractive prism
        return (
          <>
            <polygon points="4,4 20,8 16,20 2,14" fill="url(#crystal-aqua-grad)" opacity="0.3" stroke="currentColor" strokeWidth="1" />
            <path d="M4 14 Q 12 8 20 8" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M2 14 Q 12 18 16 20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
            <polygon points="8,9 15,11 13,16 6,13" fill="url(#crystal-patina-grad)" opacity="0.5" />
          </>
        );

      case 'vault':
        // Crystalline tesseract / hypercube
        return (
          <>
            <rect x="4" y="4" width="16" height="16" rx="2" fill="url(#crystal-aqua-grad)" opacity="0.2" stroke="currentColor" strokeWidth="1" />
            <rect x="8" y="8" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="4" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="0.8" />
            <line x1="20" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="0.8" />
            <line x1="4" y1="20" x2="8" y2="16" stroke="currentColor" strokeWidth="0.8" />
            <line x1="20" y1="20" x2="16" y2="16" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="1.5" fill="#fff" />
          </>
        );

      case 'sentinel':
      case 'shield':
        // Aegis crystalline crest with refractive chevron facets
        return (
          <>
            <polygon points="12,2 21,6 18,17 12,22 6,17 3,6" fill="url(#crystal-aqua-grad)" opacity="0.25" stroke="currentColor" strokeWidth="1" />
            <polyline points="7,8 12,12 17,8" fill="none" stroke="currentColor" strokeWidth="1" />
            <polyline points="8,13 12,16 16,13" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
            <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          </>
        );

      case 'alchemy':
      case 'crucible':
        // Triangle in inverted triangle with central seed
        return (
          <>
            <polygon points="12,3 21,19 3,19" fill="url(#crystal-aqua-grad)" opacity="0.2" stroke="currentColor" strokeWidth="1" />
            <polygon points="12,21 3,7 21,7" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
            <polygon points="12,8 16,15 8,15" fill="url(#crystal-patina-grad)" opacity="0.4" />
            <circle cx="12" cy="13" r="1.5" fill="#fff" />
          </>
        );

      case 'syndicate':
      case 'chronicle':
      default:
        // Double-faceted tetrahedron
        return (
          <>
            <polygon points="12,2 21,9 18,21 6,21 3,9" fill="url(#crystal-aqua-grad)" opacity="0.25" stroke="currentColor" strokeWidth="1" />
            <line x1="12" y1="2" x2="18" y2="21" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
            <line x1="12" y1="2" x2="6" y2="21" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
            <polygon points="12,6 16,11 14,18 10,18 8,11" fill="url(#crystal-patina-grad)" opacity="0.45" />
            <circle cx="12" cy="11" r="1" fill="#fff" />
          </>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      title={title}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-all ${dimensions.box} ${className}`}
    >
      {/* Background internal glow based on state */}
      <motion.div
        animate={{
          scale: effectiveState === 'active' ? [1, 1.25, 1.1] : effectiveState === 'hover' ? 1.15 : [1, 1.05, 1],
          opacity: effectiveState === 'active' ? 0.9 : effectiveState === 'hover' ? 0.65 : 0.25,
        }}
        transition={{
          duration: effectiveState === 'active' ? 1.5 : effectiveState === 'hover' ? 0.2 : 3,
          repeat: effectiveState === 'dormant' || effectiveState === 'active' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{
          backgroundColor: glowColor,
          filter: `blur(${size === 'xs' ? 3 : size === 'sm' ? 6 : 10}px)`,
        }}
        className="absolute inset-0 rounded-full pointer-events-none"
      />

      {/* Refractive shimmer halo on gaze/hover */}
      {effectiveState === 'hover' && (
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.8, rotate: 180 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-1 rounded-full border border-roman-aqua/40 pointer-events-none"
          style={{
            boxShadow: '0 0 14px rgba(32,178,170,0.5)',
          }}
        />
      )}

      {/* Active state resonant particle ring */}
      {effectiveState === 'active' && (
        <div className="absolute -inset-1.5 rounded-full border border-patina-green/50 animate-spin-slow pointer-events-none" />
      )}

      {/* SVG Crystal */}
      <svg
        viewBox="0 0 24 24"
        className={`w-full h-full text-roman-aqua transition-colors duration-200 relative z-10 ${
          effectiveState === 'active'
            ? 'text-vitreous-white drop-shadow-[0_0_10px_rgba(32,178,170,0.9)]'
            : effectiveState === 'hover'
            ? 'text-roman-aqua drop-shadow-[0_0_6px_rgba(32,178,170,0.7)]'
            : 'text-roman-aqua/80'
        }`}
      >
        <defs>
          <linearGradient id="crystal-aqua-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#20B2AA" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3EB991" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6A0DAD" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="crystal-patina-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3EB991" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#20B2AA" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {renderFacetedPaths()}
      </svg>
    </div>
  );
};

export default CrystallineGlyph;
