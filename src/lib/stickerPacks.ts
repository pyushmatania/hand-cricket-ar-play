// ─── Sticker Packs for Chat ─────────────────────────────────
export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}

export interface StickerPack {
  id: string;
  name: string;
  icon: string;
  stickers: Sticker[];
}

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "cricket",
    name: "Cricket",
    icon: "🏏",
    stickers: [
      { id: "c1", emoji: "🏏🔥", label: "Fire batting" },
      { id: "c2", emoji: "🎯🏏", label: "Target hit" },
      { id: "c3", emoji: "💨⚡", label: "Fast ball" },
      { id: "c4", emoji: "🏆👑", label: "Champion" },
      { id: "c5", emoji: "🦆💀", label: "Duck out" },
      { id: "c6", emoji: "6️⃣🚀", label: "SIX!" },
      { id: "c7", emoji: "4️⃣💥", label: "FOUR!" },
      { id: "c8", emoji: "🎪🏟️", label: "Stadium" },
    ],
  },
  {
    id: "trash",
    name: "Trash Talk",
    icon: "🗣️",
    stickers: [
      { id: "t1", emoji: "🥱😴", label: "Boring" },
      { id: "t2", emoji: "👋😏", label: "See ya" },
      { id: "t3", emoji: "💪😤", label: "Built different" },
      { id: "t4", emoji: "🫡🎯", label: "On target" },
      { id: "t5", emoji: "🤡🎪", label: "Clown show" },
      { id: "t6", emoji: "😂👏", label: "LMAO" },
      { id: "t7", emoji: "🧊😎", label: "Ice cold" },
      { id: "t8", emoji: "💀⚰️", label: "Dead" },
    ],
  },
  {
    id: "reactions",
    name: "React",
    icon: "🎭",
    stickers: [
      { id: "r1", emoji: "🔥🔥🔥", label: "Triple fire" },
      { id: "r2", emoji: "😱🤯", label: "Shocked" },
      { id: "r3", emoji: "🫠😵", label: "Melting" },
      { id: "r4", emoji: "🥶❄️", label: "Frozen" },
      { id: "r5", emoji: "🎉🎊", label: "Party" },
      { id: "r6", emoji: "👏👏👏", label: "Applause" },
      { id: "r7", emoji: "😈🔥", label: "Evil" },
      { id: "r8", emoji: "🙏✨", label: "GG" },
    ],
  },
  {
    id: "vibes",
    name: "Vibes",
    icon: "✨",
    stickers: [
      { id: "v1", emoji: "💯🏅", label: "100" },
      { id: "v2", emoji: "⚡🌟", label: "Electric" },
      { id: "v3", emoji: "🫶💖", label: "Love" },
      { id: "v4", emoji: "🤝🏽💪", label: "Respect" },
      { id: "v5", emoji: "🎶🎵", label: "Vibin" },
      { id: "v6", emoji: "😤💢", label: "Angry" },
      { id: "v7", emoji: "🌈🦄", label: "Magic" },
      { id: "v8", emoji: "🍿👀", label: "Watching" },
    ],
  },
];

export function isSticker(message: string): boolean {
  return STICKER_PACKS.some((pack) =>
    pack.stickers.some((s) => s.emoji === message)
  );
}
