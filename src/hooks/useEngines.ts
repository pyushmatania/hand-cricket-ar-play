// ═══════════════════════════════════════════════════
// useEngines — React bridge for the Doc 2 Engine System
// Syncs SettingsContext → engine controls, manages lifecycle
// ═══════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { engines } from '@/engines/EngineManager';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Call once per game screen. Initializes engines, syncs settings,
 * and tears down on unmount.
 */
export function useEngines() {
  const {
    soundEnabled,
    musicEnabled,
    hapticsEnabled,
    crowdEnabled,
    commentaryEnabled,
    ambientVolume,
    commentaryLanguage,
  } = useSettings();

  const initialized = useRef(false);

  // Initialize engine system once
  useEffect(() => {
    if (!initialized.current) {
      engines.initialize();
      initialized.current = true;
    }
    return () => {
      engines.destroy();
      initialized.current = false;
    };
  }, []);

  // Sync sound toggle
  useEffect(() => {
    engines.sound.setEnabled('sound', soundEnabled);
  }, [soundEnabled]);

  // Sync music toggle
  useEffect(() => {
    engines.sound.setEnabled('music', musicEnabled);
  }, [musicEnabled]);

  // Sync haptics toggle
  useEffect(() => {
    engines.sound.setEnabled('vibration', hapticsEnabled);
  }, [hapticsEnabled]);

  // Sync ambient volume
  useEffect(() => {
    engines.sound.setAmbientVolumeMaster(ambientVolume);
  }, [ambientVolume]);

  // Sync commentary language
  useEffect(() => {
    engines.commentary.setLanguage(commentaryLanguage);
  }, [commentaryLanguage]);

  // Sync crowd enabled (start/stop crowd engine)
  useEffect(() => {
    if (crowdEnabled) {
      engines.crowd.start();
    } else {
      engines.crowd.stop();
    }
  }, [crowdEnabled]);

  return engines;
}
