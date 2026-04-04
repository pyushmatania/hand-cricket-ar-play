// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 6: Commentary Engine
// Dynamic, context-aware, dual-voice commentary
// ═══════════════════════════════════════════════════

import type { EventType, MatchContext, CommentaryLanguage, CommentaryLine } from './types';
import { getCommentaryPool } from '@/data/commentary';
import type { CommentaryTone } from '@/lib/matchThemes';

export interface CommentaryToneConfig {
  tone: CommentaryTone;
  speechRate: number;       // multiplier on line.rate
  frequency: number;        // 0-1, probability gate for triggering commentary
  preferredLanguage?: CommentaryLanguage; // override language if set
}

const DEFAULT_TONE_CONFIG: CommentaryToneConfig = {
  tone: 'professional',
  speechRate: 1.0,
  frequency: 0.7,
};

export class CommentaryEngine {
  private language: CommentaryLanguage = 'english';
  private currentTheme: string = 'stadium';
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private voiceMain: SpeechSynthesisVoice | null = null;
  private voiceColor: SpeechSynthesisVoice | null = null;
  private lastPlayedIds: string[] = [];
  private toneConfig: CommentaryToneConfig = DEFAULT_TONE_CONFIG;

  constructor() {
    this.initVoices();
  }

  private async initVoices(): Promise<void> {
    if (typeof speechSynthesis === 'undefined') return;

    if (speechSynthesis.getVoices().length === 0) {
      await new Promise<void>(resolve => {
        speechSynthesis.onvoiceschanged = () => resolve();
        // Timeout fallback
        setTimeout(resolve, 2000);
      });
    }

    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return;

    this.voiceMain = voices.find(v => v.lang === 'en-IN')
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];

    this.voiceColor = voices.find(v => v.lang === 'en-IN' && v !== this.voiceMain)
      || voices.find(v => v.lang === 'en-GB')
      || this.voiceMain;
  }

  /**
   * Get and speak a commentary line for an event.
   */
  async speakForEvent(
    eventType: EventType,
    context: MatchContext,
    perspective: 'positive' | 'negative' | 'neutral' | 'excited' | 'dramatic' | string
  ): Promise<void> {
    if (this.isMuted || this.isSpeaking) return;

    // Frequency gate — theme controls how chatty commentary is
    if (Math.random() > this.toneConfig.frequency) return;

    // Use preferred language from tone config if set, otherwise user setting
    const lang = this.toneConfig.preferredLanguage || this.language;

    const pool = this.getPoolWithLang(eventType, perspective, lang);
    if (!pool || pool.length === 0) return;

    // Anti-repetition filter
    let available = pool.filter(line => !this.lastPlayedIds.includes(line.id));
    if (available.length === 0) {
      this.lastPlayedIds = [];
      available = pool;
    }

    // Situation filter — PRIORITIZE situation-matched lines in tense/critical moments
    const isTenseOrCritical = context.matchSituation === 'tense' || context.matchSituation === 'critical';
    const situationMatched = available.filter(line =>
      line.minSituation && line.minSituation === context.matchSituation
    );
    const generic = available.filter(line => !line.minSituation);

    // In tense/critical moments, 70% chance to pick a situation-specific line if available
    let pool2: CommentaryLine[];
    if (isTenseOrCritical && situationMatched.length > 0 && Math.random() < 0.7) {
      pool2 = situationMatched;
    } else if (generic.length > 0) {
      pool2 = [...generic, ...situationMatched];
    } else {
      pool2 = available;
    }

    // Theme filter
    const themeFiltered = pool2.filter(line => {
      if (!line.theme) return true;
      return line.theme === this.currentTheme;
    });
    const finalPool = themeFiltered.length > 0 ? themeFiltered : pool2;

    // Random selection
    const selected = finalPool[Math.floor(Math.random() * finalPool.length)];

    // Track for anti-repetition
    this.lastPlayedIds.push(selected.id);
    if (this.lastPlayedIds.length > 15) this.lastPlayedIds.shift();

    // Speak main line
    await this.speak(selected);

    // Speak follow-up (color commentator) if present
    if (selected.followUp) {
      await this.sleep(400);
      await this.speak(selected.followUp);
    }
  }

  /**
   * Get text for UI display without speaking.
   */
  getTextForUI(
    eventType: EventType,
    context: MatchContext,
    perspective: string
  ): string {
    const pool = this.getPool(eventType, perspective);
    if (!pool || pool.length === 0) return '';
    const available = pool.filter(line => !this.lastPlayedIds.includes(line.id));
    const finalPool = available.length > 0 ? available : pool;
    return finalPool[Math.floor(Math.random() * finalPool.length)].text;
  }

  private speak(line: CommentaryLine): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted || typeof speechSynthesis === 'undefined') {
        resolve();
        return;
      }

      this.isSpeaking = true;

      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.voice = line.voice === 'main' ? this.voiceMain : this.voiceColor;
      // Apply tone config speech rate multiplier
      utterance.rate = line.rate * this.toneConfig.speechRate;
      utterance.pitch = line.pitch;
      utterance.volume = 1.0;

      if (this.language === 'hindi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        resolve();
      };

      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, line.delay);
    });
  }

  // ── Configuration ──
  setLanguage(lang: CommentaryLanguage): void { this.language = lang; }
  setTheme(theme: string): void { this.currentTheme = theme; }
  setToneConfig(config: CommentaryToneConfig): void { this.toneConfig = config; }
  getToneConfig(): CommentaryToneConfig { return this.toneConfig; }
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get commentary pool for event + perspective.
   * Uses full Doc 3 content pools (500+ lines across 3 languages).
   */
  private getPool(eventType: EventType, _perspective: string): CommentaryLine[] {
    return getCommentaryPool(eventType, this.language);
  }

  private getPoolWithLang(eventType: EventType, _perspective: string, lang: CommentaryLanguage): CommentaryLine[] {
    return getCommentaryPool(eventType, lang);
  }

  destroy(): void {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }
}
