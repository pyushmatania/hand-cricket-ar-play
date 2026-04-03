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

/* ── Button Styles ── */
export interface ButtonStyleMove {
  emoji: string;
  label: string;
  color: string;
  border: string;
  glow: string;
}

export interface ButtonStyleTheme {
  id: string;
  name: string;
  description: string;
  preview: string; // emoji preview for selector
  moves: Record<string, ButtonStyleMove>;
}

export const BUTTON_STYLES: Record<string, ButtonStyleTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional hand cricket signals",
    preview: "✊",
    moves: {
      DEF: { emoji: "✊", label: "DEF", color: "from-[hsl(210_10%_40%)] to-[hsl(210_10%_30%)]", border: "border-[hsl(210_10%_22%)]", glow: "" },
      "1": { emoji: "☝️", label: "1", color: "from-[hsl(200_70%_45%)] to-[hsl(200_70%_35%)]", border: "border-[hsl(200_70%_28%)]", glow: "shadow-[0_0_12px_hsl(200_70%_45%/0.3)]" },
      "2": { emoji: "✌️", label: "2", color: "from-[hsl(122_39%_49%)] to-[hsl(122_39%_38%)]", border: "border-[hsl(122_39%_28%)]", glow: "shadow-[0_0_12px_hsl(122_39%_49%/0.3)]" },
      "3": { emoji: "🤟👆", label: "3", color: "from-[hsl(43_96%_56%)] to-[hsl(43_96%_42%)]", border: "border-[hsl(43_96%_32%)]", glow: "shadow-[0_0_12px_hsl(43_96%_56%/0.3)]" },
      "4": { emoji: "🖐️", label: "4", color: "from-[hsl(25_90%_55%)] to-[hsl(25_90%_42%)]", border: "border-[hsl(25_90%_32%)]", glow: "shadow-[0_0_14px_hsl(25_90%_55%/0.35)]" },
      "6": { emoji: "👍", label: "6", color: "from-[hsl(280_70%_55%)] to-[hsl(280_70%_42%)]", border: "border-[hsl(280_70%_32%)]", glow: "shadow-[0_0_16px_hsl(280_70%_55%/0.4)]" },
    },
  },
  neon: {
    id: "neon",
    name: "Neon Blaze",
    description: "Glowing cyberpunk hand signs",
    preview: "🫸",
    moves: {
      DEF: { emoji: "🛡️", label: "BLOCK", color: "from-[hsl(180_100%_35%)] to-[hsl(180_80%_25%)]", border: "border-[hsl(180_100%_20%)]", glow: "shadow-[0_0_18px_hsl(180_100%_45%/0.5)]" },
      "1": { emoji: "🫵", label: "1", color: "from-[hsl(300_100%_50%)] to-[hsl(300_80%_38%)]", border: "border-[hsl(300_100%_28%)]", glow: "shadow-[0_0_18px_hsl(300_100%_50%/0.45)]" },
      "2": { emoji: "🤘", label: "2", color: "from-[hsl(120_100%_45%)] to-[hsl(120_80%_33%)]", border: "border-[hsl(120_100%_25%)]", glow: "shadow-[0_0_18px_hsl(120_100%_45%/0.45)]" },
      "3": { emoji: "🤙", label: "3", color: "from-[hsl(50_100%_50%)] to-[hsl(50_90%_38%)]", border: "border-[hsl(50_100%_30%)]", glow: "shadow-[0_0_18px_hsl(50_100%_50%/0.45)]" },
      "4": { emoji: "🖐️", label: "4", color: "from-[hsl(30_100%_50%)] to-[hsl(30_90%_38%)]", border: "border-[hsl(30_100%_28%)]", glow: "shadow-[0_0_20px_hsl(30_100%_50%/0.5)]" },
      "6": { emoji: "💥", label: "6", color: "from-[hsl(0_100%_55%)] to-[hsl(340_90%_40%)]", border: "border-[hsl(0_100%_30%)]", glow: "shadow-[0_0_22px_hsl(0_100%_55%/0.55)]" },
    },
  },
  manga: {
    id: "manga",
    name: "Manga Strike",
    description: "Anime-inspired action hand poses",
    preview: "👊",
    moves: {
      DEF: { emoji: "🙅", label: "守", color: "from-[hsl(220_60%_45%)] to-[hsl(220_50%_32%)]", border: "border-[hsl(220_60%_22%)]", glow: "shadow-[0_0_14px_hsl(220_60%_50%/0.35)]" },
      "1": { emoji: "👆", label: "壱", color: "from-[hsl(340_80%_50%)] to-[hsl(340_70%_38%)]", border: "border-[hsl(340_80%_28%)]", glow: "shadow-[0_0_14px_hsl(340_80%_50%/0.35)]" },
      "2": { emoji: "✌️", label: "弐", color: "from-[hsl(270_70%_55%)] to-[hsl(270_60%_40%)]", border: "border-[hsl(270_70%_30%)]", glow: "shadow-[0_0_14px_hsl(270_70%_55%/0.35)]" },
      "3": { emoji: "🤞", label: "参", color: "from-[hsl(45_90%_50%)] to-[hsl(45_80%_38%)]", border: "border-[hsl(45_90%_28%)]", glow: "shadow-[0_0_14px_hsl(45_90%_50%/0.35)]" },
      "4": { emoji: "🫴", label: "四", color: "from-[hsl(160_70%_42%)] to-[hsl(160_60%_30%)]", border: "border-[hsl(160_70%_22%)]", glow: "shadow-[0_0_14px_hsl(160_70%_42%/0.35)]" },
      "6": { emoji: "👊", label: "六", color: "from-[hsl(0_85%_55%)] to-[hsl(0_75%_40%)]", border: "border-[hsl(0_85%_30%)]", glow: "shadow-[0_0_18px_hsl(0_85%_55%/0.45)]" },
    },
  },
  skeleton: {
    id: "skeleton",
    name: "Skeleton X-Ray",
    description: "Bone structure hand signals",
    preview: "🦴",
    moves: {
      DEF: { emoji: "💀", label: "DEAD", color: "from-[hsl(0_0%_25%)] to-[hsl(0_0%_12%)]", border: "border-[hsl(0_0%_8%)]", glow: "shadow-[0_0_12px_hsl(180_50%_40%/0.25)]" },
      "1": { emoji: "🦴", label: "1", color: "from-[hsl(180_40%_30%)] to-[hsl(180_30%_18%)]", border: "border-[hsl(180_40%_12%)]", glow: "shadow-[0_0_14px_hsl(180_50%_45%/0.3)]" },
      "2": { emoji: "☠️", label: "2", color: "from-[hsl(160_40%_30%)] to-[hsl(160_30%_18%)]", border: "border-[hsl(160_40%_12%)]", glow: "shadow-[0_0_14px_hsl(160_50%_45%/0.3)]" },
      "3": { emoji: "🩻", label: "3", color: "from-[hsl(200_40%_30%)] to-[hsl(200_30%_18%)]", border: "border-[hsl(200_40%_12%)]", glow: "shadow-[0_0_14px_hsl(200_50%_45%/0.3)]" },
      "4": { emoji: "🫱", label: "4", color: "from-[hsl(220_40%_30%)] to-[hsl(220_30%_18%)]", border: "border-[hsl(220_40%_12%)]", glow: "shadow-[0_0_14px_hsl(220_50%_45%/0.3)]" },
      "6": { emoji: "💀", label: "6!", color: "from-[hsl(280_50%_30%)] to-[hsl(280_40%_18%)]", border: "border-[hsl(280_50%_12%)]", glow: "shadow-[0_0_18px_hsl(280_60%_45%/0.4)]" },
    },
  },
  royal: {
    id: "royal",
    name: "Royal Crown",
    description: "Majestic golden regal signals",
    preview: "👑",
    moves: {
      DEF: { emoji: "🏰", label: "FORT", color: "from-[hsl(30_50%_35%)] to-[hsl(30_40%_25%)]", border: "border-[hsl(30_50%_18%)]", glow: "shadow-[0_0_12px_hsl(45_80%_50%/0.25)]" },
      "1": { emoji: "👑", label: "I", color: "from-[hsl(45_85%_48%)] to-[hsl(40_80%_36%)]", border: "border-[hsl(45_85%_28%)]", glow: "shadow-[0_0_14px_hsl(45_85%_55%/0.35)]" },
      "2": { emoji: "⚜️", label: "II", color: "from-[hsl(45_75%_45%)] to-[hsl(38_70%_33%)]", border: "border-[hsl(45_75%_25%)]", glow: "shadow-[0_0_14px_hsl(45_75%_50%/0.35)]" },
      "3": { emoji: "🗡️", label: "III", color: "from-[hsl(210_50%_50%)] to-[hsl(210_40%_38%)]", border: "border-[hsl(210_50%_28%)]", glow: "shadow-[0_0_14px_hsl(210_50%_50%/0.35)]" },
      "4": { emoji: "🛡️", label: "IV", color: "from-[hsl(0_60%_48%)] to-[hsl(0_50%_36%)]", border: "border-[hsl(0_60%_26%)]", glow: "shadow-[0_0_14px_hsl(0_60%_48%/0.35)]" },
      "6": { emoji: "🔱", label: "VI", color: "from-[hsl(270_60%_50%)] to-[hsl(270_50%_38%)]", border: "border-[hsl(270_60%_28%)]", glow: "shadow-[0_0_18px_hsl(270_60%_50%/0.45)]" },
    },
  },
};

export function getButtonStyle(id?: string | null): ButtonStyleTheme {
  if (!id) return BUTTON_STYLES["classic"];
  return BUTTON_STYLES[id] || BUTTON_STYLES["classic"];
}
