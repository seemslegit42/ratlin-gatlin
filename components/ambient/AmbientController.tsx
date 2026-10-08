
/**
 * @file components/ambient/AmbientController.tsx
 * @description Provides user controls for adjusting ambient visual effects and themes.
 * It allows changing the overall visual theme (aurora, celestial, starlight)
 * and the intensity of global glow effects, updating CSS variables dynamically.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/** Defines the available ambient themes. */
type Theme = 'aurora' | 'celestial' | 'starlight';

/**
 * The AmbientController component.
 * Offers a collapsible panel with sliders and buttons to customize ambient visual settings.
 * @returns {React.FC} The AmbientController UI.
 */
const AmbientController: React.FC = () => {
  /** @state {number} intensity - The current intensity of global glow effects. */
  const [intensity, setIntensity] = useState(0.7);
  /** @state {Theme} theme - The currently selected ambient theme. */
  const [theme, setTheme] = useState<Theme>('aurora');
  /** @state {boolean} isOpen - Controls the visibility of the settings panel. */
  const [isOpen, setIsOpen] = useState(false);

  // Update CSS variables for glow intensity and theme
  useEffect(() => {
    document.documentElement.style.setProperty('--glow-intensity', intensity.toString());
    document.body.setAttribute('data-theme', theme);
  }, [intensity, theme]);

  return (
    <motion.div
      initial={{ x: 100 }}
      animate={{ x: isOpen ? 0 : 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-1/2 -translate-y-1/2 right-0 z-50 bg-panel-bg backdrop-blur-xl border border-glass-border rounded-l-2xl shadow-lg flex"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-l-2xl bg-imperial-purple/80 hover:bg-imperial-purple text-white flex items-center justify-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 w-64">
          <h3 className="font-comfortaa text-lg font-bold text-vitreous-white mb-2">Ambient Controls</h3>

          {/* Glow Intensity */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Glow Intensity</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-conchoidal-gray rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-roman-aqua [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
            />
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Theme</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setTheme('aurora')}
                className={`flex-1 p-2 text-xs rounded-md font-bold transition-colors ${theme === 'aurora' ? 'bg-imperial-purple text-white' : 'bg-white/10 text-text-secondary'}`}
              >
                Aurora
              </button>
              <button
                onClick={() => setTheme('celestial')}
                className={`flex-1 p-2 text-xs rounded-md font-bold transition-colors ${theme === 'celestial' ? 'bg-imperial-purple text-white' : 'bg-white/10 text-text-secondary'}`}
              >
                Celestial
              </button>
              <button
                onClick={() => setTheme('starlight')}
                className={`flex-1 p-2 text-xs rounded-md font-bold transition-colors ${theme === 'starlight' ? 'bg-imperial-purple text-white' : 'bg-white/10 text-text-secondary'}`}
              >
                Starlight
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AmbientController;
