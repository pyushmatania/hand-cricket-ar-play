import defaultPitch from "./default-pitch-hero.jpg";
import pitchGully from "./pitch-gully.jpg";
import pitchSchool from "./pitch-school.jpg";
import pitchIpl from "./pitch-ipl.jpg";
import pitchInternational from "./pitch-international.jpg";
import pitchWorldcup from "./pitch-worldcup.jpg";

export const STADIUM_PITCHES: Record<string, string> = {
  default: defaultPitch,
  gully: pitchGully,
  school: pitchSchool,
  ipl: pitchIpl,
  international: pitchInternational,
  worldcup: pitchWorldcup,
};

export { defaultPitch, pitchGully, pitchSchool, pitchIpl, pitchInternational, pitchWorldcup };
