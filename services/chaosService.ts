
/**
 * @file services/chaosService.ts
 * @description Static definitions and logic for the Chaos Card Deck.
 */

import { ChaosCard, ChaosCardClass } from '../types';

export const CHAOS_CARDS: ChaosCard[] = [
  // Class I: Aesthetic Aberrations
  {
    id: 'geologic-time',
    name: 'Geologic Time',
    class: ChaosCardClass.Class1,
    cost: 50,
    description: "Feel the weight of eons in every action. A reminder that patience is a form of power.",
    systemEffect: "For 60 seconds, UI animations and refresh rates slow dramatically. Clicks feel momentous, and windows drift with immense gravity.",
    duration: 60,
    visualKey: 'geo-time'
  },
  {
    id: 'acropolis-marble',
    name: 'Acropolis Marble',
    class: ChaosCardClass.Class1,
    cost: 75,
    description: "Re-skin your digital architecture in the stone of the ancients. Clean, classical, eternal.",
    systemEffect: "Your entire UI theme is rendered in the stark, beautiful whites and greys of Parthenon marble, with golden hour light accents, for one hour.",
    duration: 3600,
    visualKey: 'marble-skin'
  },
  {
    id: 'noctuas-gaze',
    name: "Noctua's Gaze",
    class: ChaosCardClass.Class1,
    cost: 75,
    description: "Adopt the vision of Athena's owl. See clarity in the darkness.",
    systemEffect: "Activates a 'dark mode' that is pure black, with text glowing in a soft, silver light. All non-essential UI elements fade unless hovered over.",
    duration: 1800,
    visualKey: 'owl-vision'
  },
  {
    id: 'fractal-bloom',
    name: 'Fractal Bloom',
    class: ChaosCardClass.Class1,
    cost: 100,
    description: "The universe's geometry, revealed in a flash. The math of nature, made manifest.",
    systemEffect: "Every action spawns a temporary, intricate fractal pattern—a snowflake, a fern leaf, a nautilus shell—that blossoms and fades.",
    duration: 300,
    visualKey: 'fractals'
  },
  {
    id: 'weeping-glass',
    name: 'Weeping Glass',
    class: ChaosCardClass.Class1,
    cost: 50,
    description: "For a short time, the hard edges of your OS soften and flow. A reminder that even structure is fluid.",
    systemEffect: "For 15 minutes, UI elements on the Canvas develop a slow, 'dripping' animation, as if made of liquid glass. Purely cosmetic, utterly beautiful.",
    duration: 900,
    visualKey: 'weeping'
  },
  
  // Class II: Agentic Whims
  {
    id: 'oracles-decree',
    name: "Oracle's Decree",
    class: ChaosCardClass.Class2,
    cost: 175,
    description: "The Pythia speaks through the machine. Your next security alert arrives as prophecy. Interpret it wisely.",
    systemEffect: "The next security alert from Aegis is delivered in cryptic, prophetic dactylic hexameter, requiring interpretation to solve.",
    duration: 0, // Event based
  },
  {
    id: 'socratic-method',
    name: 'Socratic Method',
    class: ChaosCardClass.Class2,
    cost: 200,
    description: "Your agent will no longer give you answers, only questions. True knowledge is born from inquiry.",
    systemEffect: "For the next 5 minutes, agentic suggestions are replaced with probing questions designed to make you reconsider your workflow, forcing a deeper level of mastery.",
    duration: 300,
  }
];

export const getCardById = (id: string) => CHAOS_CARDS.find(c => c.id === id);
