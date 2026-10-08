
/**
 * @file components/shared/GlassPane.tsx
 * @description Foundational UI components implementing the "Ancient Roman Glass" aesthetic.
 * Encapsulates backdrop-blur, smoky translucency, and high-fidelity borders.
 * Accessibility: supports role/aria forwarding, focus-visible ring via CSS.
 */

import React from 'react';

/** Standard variants for glass containers. */
export type GlassPaneVariant = 'default' | 'modal' | 'sidebar' | 'notification';

/**
 * Props for the GlassPane primitive.
 */
export interface GlassPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: GlassPaneVariant;
  blurIntensity?: number;
  /** background-color alpha value (0 to 1). */
  opacity?: number;
}

/**
 * Props for the GlassCard molecule.
 */
export interface GlassCardProps extends Omit<GlassPaneProps, 'title'> {
  title: React.ReactNode;
  /** Accessible heading level — default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  actions?: React.ReactNode;
}

const variantStyles: Record<GlassPaneVariant, string> = {
  default:      'bg-panel-bg/40 border-white/10 shadow-glass-default rounded-xl hover:border-white/20 transition-colors duration-150',
  modal:        'bg-obsidian-black/85 border-white/10 shadow-glass-modal rounded-2xl',
  sidebar:      'bg-obsidian-black/60 border-white/5 shadow-glass-sidebar rounded-xl',
  notification: 'bg-charcoal/90 border-white/10 shadow-glass-notification rounded-lg',
};

const variantBlur: Record<GlassPaneVariant, number> = {
  default:      12,
  modal:        40,
  sidebar:      20,
  notification: 16,
};

/**
 * Foundational "atom" component for all OS containers.
 * Applies the Verdigris Protocol glass effect.
 *
 * Accessibility notes:
 * - Passes all aria-* and role props through via spread.
 * - focus-visible ring is handled globally in index.css.
 * - When used as a modal container, callers should pass role="dialog",
 *   aria-modal="true", and aria-labelledby.
 */
export const GlassPane: React.FC<GlassPaneProps> = ({
  children,
  className = '',
  variant = 'default',
  blurIntensity,
  style,
  ...props
}) => {
  const finalBlur = blurIntensity !== undefined ? blurIntensity : variantBlur[variant];

  const dynamicStyles: React.CSSProperties = {
    backdropFilter: `blur(${finalBlur}px)`,
    WebkitBackdropFilter: `blur(${finalBlur}px)`,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      className={`glass-panel high-density ${variantStyles[variant]} border ${className}`}
      style={dynamicStyles}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Structured "molecule" container with header and footer slots.
 * Uses a semantic heading (level configurable via headingLevel prop).
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  children,
  actions,
  headingLevel = 3,
  className = '',
  ...props
}) => {
  const headingClass =
    'text-xl font-bold text-vitreous-white mb-3 border-b border-white/5 pb-2 font-comfortaa leading-tight tracking-tight';

  return (
    <GlassPane className={`glass-card high-density flex flex-col p-3 md:p-4 gap-0 high-density-card ${className}`} {...props}>
      {React.createElement(`h${headingLevel}`, { className: headingClass }, title)}
      <div className="flex-grow text-text-secondary font-lexend">
        {children}
      </div>
      {actions && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {actions}
        </div>
      )}
    </GlassPane>
  );
};
