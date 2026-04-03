// Cosmetic visual definitions mapped from shop item names to visual configs

export interface BatSkinVisual {
  emoji: string;
  gradient: string;
  glow: string;
  trail?: string; // trailing particle color on hit
}

export interface VSEffectVisual {
  bgGradient: string;
  particleColors: string[];
  entranceStyle: "slide" | "spin" | "warp" | "shatter" | "flame";
  glowColor: string;
}

export interface AvatarFrameVisual {
  ring: string;
  glow: string;
  animate?: boolean;
}

export const BAT_SKINS: Record<string, BatSkinVisual> = {
  "Classic Willow": {
    emoji: "🏏",
    gradient: "from-[hsl(30_40%_45%)] to-[hsl(30_35%_35%)]",
    glow: "",
  },
  "Golden Blade": {
    emoji: "⚡",
    gradient: "from-[hsl(45_93%_50%)] to-[hsl(35_85%_40%)]",
    glow: "shadow-[0_0_10px_hsl(45_93%_50%/0.3)]",
    trail: "hsl(45 93% 58%)",
  },
  "Neon Strike": {
    emoji: "💚",
    gradient: "from-[hsl(142_71%_45%)] to-[hsl(160_60%_35%)]",
    glow: "shadow-[0_0_12px_hsl(142_71%_45%/0.35)]",
    trail: "hsl(142 71% 45%)",
  },
  "Thunder Bat": {
    emoji: "⚡",
    gradient: "from-[hsl(270_70%_55%)] to-[hsl(217_91%_50%)]",
    glow: "shadow-[0_0_14px_hsl(270_70%_55%/0.35)]",
    trail: "hsl(270 70% 55%)",
  },
  "Ice Shard": {
    emoji: "❄️",
    gradient: "from-[hsl(192_91%_55%)] to-[hsl(210_80%_45%)]",
    glow: "shadow-[0_0_14px_hsl(192_91%_60%/0.35)]",
    trail: "hsl(192 91% 60%)",
  },
  "Diamond Crusher": {
    emoji: "💎",
    gradient: "from-[hsl(192_91%_65%)] to-[hsl(280_70%_55%)]",
    glow: "shadow-[0_0_16px_hsl(192_91%_60%/0.4)]",
    trail: "hsl(192 91% 60%)",
  },
  "Inferno Blade": {
    emoji: "🔥",
    gradient: "from-[hsl(0_84%_55%)] to-[hsl(30_90%_50%)]",
    glow: "shadow-[0_0_18px_hsl(0_84%_55%/0.45)]",
    trail: "hsl(0 84% 55%)",
  },
  "Shadow Reaper": {
    emoji: "💀",
    gradient: "from-[hsl(270_30%_20%)] to-[hsl(0_0%_10%)]",
    glow: "shadow-[0_0_20px_hsl(270_50%_30%/0.5)]",
    trail: "hsl(270 50% 40%)",
  },
};

export const VS_EFFECTS: Record<string, VSEffectVisual> = {
  "Classic Clash": {
    bgGradient: "from-[hsl(222_47%_6%)] to-[hsl(222_47%_11%)]",
    particleColors: ["hsl(217 91% 60%)", "hsl(45 93% 58%)"],
    entranceStyle: "slide",
    glowColor: "hsl(217 91% 60% / 0.3)",
  },
  "Fire Entrance": {
    bgGradient: "from-[hsl(0_50%_8%)] to-[hsl(25_60%_10%)]",
    particleColors: ["hsl(0 84% 55%)", "hsl(30 90% 55%)", "hsl(45 93% 58%)"],
    entranceStyle: "flame",
    glowColor: "hsl(0 84% 55% / 0.35)",
  },
  "Stadium Roar": {
    bgGradient: "from-[hsl(142_30%_8%)] to-[hsl(142_40%_12%)]",
    particleColors: ["hsl(142 71% 45%)", "hsl(45 93% 58%)"],
    entranceStyle: "slide",
    glowColor: "hsl(142 71% 45% / 0.3)",
  },
  "Lightning Strike": {
    bgGradient: "from-[hsl(270_40%_8%)] to-[hsl(217_50%_10%)]",
    particleColors: ["hsl(270 76% 55%)", "hsl(217 91% 60%)", "hsl(0 0% 100%)"],
    entranceStyle: "shatter",
    glowColor: "hsl(270 76% 55% / 0.35)",
  },
  "Earthquake": {
    bgGradient: "from-[hsl(25_40%_8%)] to-[hsl(0_30%_8%)]",
    particleColors: ["hsl(25 90% 55%)", "hsl(45 60% 50%)", "hsl(0 0% 60%)"],
    entranceStyle: "shatter",
    glowColor: "hsl(25 90% 55% / 0.3)",
  },
  "Galaxy Warp": {
    bgGradient: "from-[hsl(270_50%_8%)] to-[hsl(220_50%_5%)]",
    particleColors: ["hsl(280 85% 65%)", "hsl(192 91% 60%)", "hsl(45 93% 58%)", "hsl(0 0% 100%)"],
    entranceStyle: "warp",
    glowColor: "hsl(280 85% 65% / 0.4)",
  },
  "Dragon Fury": {
    bgGradient: "from-[hsl(0_60%_8%)] to-[hsl(25_50%_6%)]",
    particleColors: ["hsl(0 84% 55%)", "hsl(30 90% 55%)", "hsl(45 93% 58%)", "hsl(0 0% 100%)"],
    entranceStyle: "flame",
    glowColor: "hsl(0 84% 55% / 0.45)",
  },
};

export function getBatSkin(name?: string | null): BatSkinVisual {
  if (!name) return BAT_SKINS["Classic Willow"];
  return BAT_SKINS[name] || BAT_SKINS["Classic Willow"];
}

export function getVSEffect(name?: string | null): VSEffectVisual {
  if (!name) return VS_EFFECTS["Classic Clash"];
  return VS_EFFECTS[name] || VS_EFFECTS["Classic Clash"];
}
