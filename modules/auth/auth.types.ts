
/**
 * @file modules/auth/auth.types.ts
 * @description Configuration and type definitions for the Genesis Ritual.
 * Defines the psychological archetypes (Vows) available to new Initiates.
 */

import React from 'react';
import type { Covenant } from '../../types.js';
import { CrownIcon } from '../../components/icons/CrownIcon.js';
import { LayersIcon } from '../../components/icons/LayersIcon.js';
import { EyeIcon } from '../../components/icons/SecurityIcons.js';

/** Archetype selection during signup. */
export type VowType = 'Sovereign' | 'Architect' | 'Oracle';

/**
 * Definition of a specific Vow archetype.
 */
export interface VowDefinition {
    /** Unique ID. */
    id: VowType;
    /** High-level label. */
    title: string;
    /** Immersive quote or tagline. */
    description: string;
    /** Associated glyph. */
    icon: React.ReactNode;
    /** Signature UI color. */
    color: string;
    /** Default covenant alignment. */
    covenant: Covenant;
}

/** Static array of all available Vows. */
export const VOWS: VowDefinition[] = [
    {
        id: 'Architect',
        title: 'The Architect',
        description: '"I seek to build systems and orchestrate order."',
        icon: React.createElement(LayersIcon, { className: 'w-8 h-8' }),
        color: 'text-imperial-purple',
        covenant: 'silence'
    },
    {
        id: 'Sovereign',
        title: 'The Sovereign',
        description: '"I seek to command resources and forge an empire."',
        icon: React.createElement(CrownIcon, { className: 'w-8 h-8' }),
        color: 'text-yellow-400',
        covenant: 'motion'
    },
    {
        id: 'Oracle',
        title: 'The Oracle',
        description: '"I seek to uncover hidden truths and master information flow."',
        icon: React.createElement(EyeIcon, { className: 'w-8 h-8' }),
        color: 'text-roman-aqua',
        covenant: 'silence'
    }
];

/** Immersive follow-up questions for the ritual. */
export const INTENT_QUESTIONS: Record<VowType, { question: string; options: string[] }> = {
    'Sovereign': {
        question: "How will you exert your will upon the system?",
        options: ["Through relentless expansion.", "By securing absolute control.", "Through economic dominance."]
    },
    'Architect': {
        question: "What structural perfection do you seek?",
        options: ["Optimized efficiency.", "Impenetrable security.", "Infinite scalability."]
    },
    'Oracle': {
        question: "Which truth illuminates your path?",
        options: ["The hidden patterns of data.", "The future of the swarm.", "The secrets of the void."]
    }
};

/** Animation configuration for the ritual steps. */
export const STEP_VARIANTS = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0
    }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
};
