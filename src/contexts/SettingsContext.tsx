import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type VoiceEngine = "auto" | "elevenlabs" | "system";
export type CommentaryLanguage = "english" | "hindi" | "both" | "hinglish";

interface Settings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  commentaryEnabled: boolean;
  voiceEnabled: boolean;
  crowdEnabled: boolean;
  musicEnabled: boolean;
  batSoundEnabled: boolean;
  victorySoundEnabled: boolean;
  commentaryVoice: string;
  voiceEngine: VoiceEngine;
  commentaryLanguage: CommentaryLanguage;
  ceremoniesEnabled: boolean;
  ambientVolume: number;
  tapCeremoniesEnabled: boolean;
  arCeremoniesEnabled: boolean;
  tournamentCeremoniesEnabled: boolean;
  dailyCeremoniesEnabled: boolean;
  multiplayerCeremoniesEnabled: boolean;
  match3dEnabled: boolean;
}

interface SettingsContextType extends Settings {
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleCommentary: () => void;
  toggleVoice: () => void;
  toggleCrowd: () => void;
  toggleMusic: () => void;
  toggleBatSound: () => void;
  toggleVictorySound: () => void;
  setCommentaryVoice: (voice: string) => void;
  setVoiceEngine: (engine: VoiceEngine) => void;
  setCommentaryLanguage: (lang: CommentaryLanguage) => void;
  toggleCeremonies: () => void;
  setAmbientVolume: (v: number) => void;
  toggleTapCeremonies: () => void;
  toggleArCeremonies: () => void;
  toggleTournamentCeremonies: () => void;
  toggleDailyCeremonies: () => void;
  toggleMultiplayerCeremonies: () => void;
}

const defaults: Settings = {
  soundEnabled: true,
  hapticsEnabled: true,
  commentaryEnabled: true,
  voiceEnabled: true,
  crowdEnabled: true,
  musicEnabled: true,
  batSoundEnabled: true,
  victorySoundEnabled: true,
  commentaryVoice: "nPczCjzI2devNBz1zQrb",
  voiceEngine: "system" as VoiceEngine,
  commentaryLanguage: "both" as CommentaryLanguage,
  ceremoniesEnabled: true,
  ambientVolume: 0.25,
  tapCeremoniesEnabled: true,
  arCeremoniesEnabled: true,
  tournamentCeremoniesEnabled: true,
  dailyCeremoniesEnabled: true,
  multiplayerCeremoniesEnabled: true,
};

const SettingsContext = createContext<SettingsContextType>({
  ...defaults,
  toggleSound: () => {},
  toggleHaptics: () => {},
  toggleCommentary: () => {},
  toggleVoice: () => {},
  toggleCrowd: () => {},
  toggleMusic: () => {},
  toggleBatSound: () => {},
  toggleVictorySound: () => {},
  setCommentaryVoice: () => {},
  setVoiceEngine: () => {},
  setCommentaryLanguage: () => {},
  toggleCeremonies: () => {},
  setAmbientVolume: () => {},
  toggleTapCeremonies: () => {},
  toggleArCeremonies: () => {},
  toggleTournamentCeremonies: () => {},
  toggleDailyCeremonies: () => {},
  toggleMultiplayerCeremonies: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("hc_settings");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem("hc_settings", JSON.stringify(settings));
  }, [settings]);

  const toggleSound = () => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }));
  const toggleHaptics = () => setSettings((s) => ({ ...s, hapticsEnabled: !s.hapticsEnabled }));
  const toggleCommentary = () => setSettings((s) => ({ ...s, commentaryEnabled: !s.commentaryEnabled }));
  const toggleVoice = () => setSettings((s) => ({ ...s, voiceEnabled: !s.voiceEnabled }));
  const toggleCrowd = () => setSettings((s) => ({ ...s, crowdEnabled: !s.crowdEnabled }));
  const toggleMusic = () => setSettings((s) => ({ ...s, musicEnabled: !s.musicEnabled }));
  const toggleBatSound = () => setSettings((s) => ({ ...s, batSoundEnabled: !s.batSoundEnabled }));
  const toggleVictorySound = () => setSettings((s) => ({ ...s, victorySoundEnabled: !s.victorySoundEnabled }));
  const setCommentaryVoice = (voice: string) => setSettings((s) => ({ ...s, commentaryVoice: voice }));
  const setVoiceEngine = (engine: VoiceEngine) => setSettings((s) => ({ ...s, voiceEngine: engine }));
  const setCommentaryLanguage = (lang: CommentaryLanguage) => setSettings((s) => ({ ...s, commentaryLanguage: lang }));
  const toggleCeremonies = () => setSettings((s) => ({ ...s, ceremoniesEnabled: !s.ceremoniesEnabled }));
  const setAmbientVolume = (v: number) => setSettings((s) => ({ ...s, ambientVolume: v }));
  const toggleTapCeremonies = () => setSettings((s) => ({ ...s, tapCeremoniesEnabled: !s.tapCeremoniesEnabled }));
  const toggleArCeremonies = () => setSettings((s) => ({ ...s, arCeremoniesEnabled: !s.arCeremoniesEnabled }));
  const toggleTournamentCeremonies = () => setSettings((s) => ({ ...s, tournamentCeremoniesEnabled: !s.tournamentCeremoniesEnabled }));
  const toggleDailyCeremonies = () => setSettings((s) => ({ ...s, dailyCeremoniesEnabled: !s.dailyCeremoniesEnabled }));
  const toggleMultiplayerCeremonies = () => setSettings((s) => ({ ...s, multiplayerCeremoniesEnabled: !s.multiplayerCeremoniesEnabled }));

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        toggleSound,
        toggleHaptics,
        toggleCommentary,
        toggleVoice,
        toggleCrowd,
        toggleMusic,
        toggleBatSound,
        toggleVictorySound,
        setCommentaryVoice,
        setVoiceEngine,
        setCommentaryLanguage,
        toggleCeremonies,
        setAmbientVolume,
        toggleTapCeremonies,
        toggleArCeremonies,
        toggleTournamentCeremonies,
        toggleDailyCeremonies,
        toggleMultiplayerCeremonies,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
