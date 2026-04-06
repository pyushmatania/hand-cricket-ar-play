import frameCommon from "./frame-common.png";
import frameRare from "./frame-rare.png";
import frameEpic from "./frame-epic.png";
import frameLegendary from "./frame-legendary.png";
import frameMythic from "./frame-mythic.png";

export const CARD_FRAMES: Record<string, string> = {
  common: frameCommon,
  rare: frameRare,
  epic: frameEpic,
  legendary: frameLegendary,
  mythic: frameMythic,
};

export { frameCommon, frameRare, frameEpic, frameLegendary, frameMythic };
