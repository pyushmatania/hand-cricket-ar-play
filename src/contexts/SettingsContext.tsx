import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Settings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  commentaryEnabled: boolean;
}

interface SettingsContextType extends Settings {
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleCommentary: () => void;
}

const defaults: Settings = { soundEnabled: true, hapticsEnabled: true, commentaryEnabled: true };

const SettingsContext = createContext<SettingsContextType>({
  ...defaults,
  toggleSound: () => {},
  toggleHaptics: () => {},
  toggleCommentary: () => {},
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

  return (
    <SettingsContext.Provider value={{ ...settings, toggleSound, toggleHaptics, toggleCommentary }}>
      {children}
    </SettingsContext.Provider>
  );
}
