/**
 * Dynamic Weather System
 * Randomly assigns weather per match with visual + gameplay modifiers.
 */

export interface Weather {
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Visual config */
  visual: {
    overlay: string;           // CSS background overlay
    particleEmoji: string;
    particleCount: number;
    particleSpeed: number;     // seconds
    particleDirection: "down" | "diagonal" | "float";
    imageFilter?: string;      // applied to arena/pitch
    ambientOpacity: number;    // overlay opacity
  };
  /** Gameplay stat modifiers (multipliers, e.g. 1.1 = +10%) */
  modifiers: {
    boundaryChance: number;    // multiplier on 4/6 probability
    outChance: number;         // multiplier on OUT probability
    spinBonus: number;         // added AI accuracy in bowling
  };
  /** Weight for random selection (higher = more common) */
  weight: number;
}

export const WEATHER_CONDITIONS: Weather[] = [
  {
    id: "clear",
    name: "Clear Sky",
    icon: "☀️",
    description: "Perfect batting conditions",
    visual: {
      overlay: "transparent",
      particleEmoji: "",
      particleCount: 0,
      particleSpeed: 0,
      particleDirection: "down",
      ambientOpacity: 0,
    },
    modifiers: { boundaryChance: 1.0, outChance: 1.0, spinBonus: 0 },
    weight: 30,
  },
  {
    id: "overcast",
    name: "Overcast",
    icon: "☁️",
    description: "Swing bowling conditions",
    visual: {
      overlay: "linear-gradient(180deg, hsl(220 10% 40% / 0.15), transparent 60%)",
      particleEmoji: "",
      particleCount: 0,
      particleSpeed: 0,
      particleDirection: "down",
      imageFilter: "brightness(0.9) saturate(0.85)",
      ambientOpacity: 0.15,
    },
    modifiers: { boundaryChance: 0.9, outChance: 1.1, spinBonus: 0 },
    weight: 25,
  },
  {
    id: "drizzle",
    name: "Light Drizzle",
    icon: "🌧️",
    description: "Slower outfield, tricky batting",
    visual: {
      overlay: "linear-gradient(180deg, hsl(210 30% 35% / 0.2), hsl(210 20% 25% / 0.1))",
      particleEmoji: "💧",
      particleCount: 15,
      particleSpeed: 1.2,
      particleDirection: "diagonal",
      imageFilter: "brightness(0.85) saturate(0.8) contrast(1.05)",
      ambientOpacity: 0.2,
    },
    modifiers: { boundaryChance: 0.85, outChance: 1.05, spinBonus: 0 },
    weight: 12,
  },
  {
    id: "dew",
    name: "Heavy Dew",
    icon: "💧",
    description: "Wet ball — bowling harder in 2nd innings",
    visual: {
      overlay: "linear-gradient(180deg, transparent 40%, hsl(160 40% 50% / 0.08))",
      particleEmoji: "✨",
      particleCount: 6,
      particleSpeed: 3,
      particleDirection: "float",
      imageFilter: "brightness(1.05) saturate(1.1)",
      ambientOpacity: 0.08,
    },
    modifiers: { boundaryChance: 1.05, outChance: 0.9, spinBonus: -5 },
    weight: 10,
  },
  {
    id: "dust",
    name: "Dust Storm",
    icon: "🌪️",
    description: "Chaos — reduced visibility",
    visual: {
      overlay: "linear-gradient(180deg, hsl(30 50% 40% / 0.2), hsl(25 40% 30% / 0.15))",
      particleEmoji: "🟤",
      particleCount: 20,
      particleSpeed: 1.5,
      particleDirection: "diagonal",
      imageFilter: "brightness(0.8) sepia(0.3) saturate(0.7)",
      ambientOpacity: 0.25,
    },
    modifiers: { boundaryChance: 0.9, outChance: 1.1, spinBonus: -3 },
    weight: 5,
  },
  {
    id: "floodlights",
    name: "Floodlit Night",
    icon: "🏟️",
    description: "Spinners harder to read under lights",
    visual: {
      overlay: "radial-gradient(ellipse at 50% 0%, hsl(45 80% 80% / 0.08), transparent 60%)",
      particleEmoji: "🦋",
      particleCount: 4,
      particleSpeed: 4,
      particleDirection: "float",
      imageFilter: "brightness(0.75) contrast(1.15) saturate(0.9)",
      ambientOpacity: 0.1,
    },
    modifiers: { boundaryChance: 1.0, outChance: 1.05, spinBonus: 5 },
    weight: 12,
  },
  {
    id: "golden",
    name: "Golden Hour",
    icon: "🌅",
    description: "Beautiful light, balanced play",
    visual: {
      overlay: "linear-gradient(180deg, hsl(30 80% 55% / 0.1), hsl(20 70% 40% / 0.05))",
      particleEmoji: "✨",
      particleCount: 4,
      particleSpeed: 3.5,
      particleDirection: "float",
      imageFilter: "brightness(1.08) saturate(1.15) hue-rotate(-5deg)",
      ambientOpacity: 0.1,
    },
    modifiers: { boundaryChance: 1.0, outChance: 1.0, spinBonus: 0 },
    weight: 8,
  },
];

/** Weighted random pick */
export function rollWeather(): Weather {
  const totalWeight = WEATHER_CONDITIONS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * totalWeight;
  for (const w of WEATHER_CONDITIONS) {
    r -= w.weight;
    if (r <= 0) return w;
  }
  return WEATHER_CONDITIONS[0];
}

/** Get weather by id */
export function getWeatherById(id: string): Weather {
  return WEATHER_CONDITIONS.find((w) => w.id === id) || WEATHER_CONDITIONS[0];
}
