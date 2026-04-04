// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 6: Commentary Engine
// Dynamic, context-aware, dual-voice commentary
// ═══════════════════════════════════════════════════

import type { EventType, MatchContext, CommentaryLanguage, CommentaryLine } from './types';

export class CommentaryEngine {
  private language: CommentaryLanguage = 'english';
  private currentTheme: string = 'stadium';
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private voiceMain: SpeechSynthesisVoice | null = null;
  private voiceColor: SpeechSynthesisVoice | null = null;
  private lastPlayedIds: string[] = [];

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

    const pool = this.getPool(eventType, perspective);
    if (!pool || pool.length === 0) return;

    // Anti-repetition filter
    let available = pool.filter(line => !this.lastPlayedIds.includes(line.id));
    if (available.length === 0) {
      this.lastPlayedIds = [];
      available = pool;
    }

    // Situation filter
    const situationFiltered = available.filter(line => {
      if (!line.minSituation) return true;
      return line.minSituation === context.matchSituation;
    });
    const pool2 = situationFiltered.length > 0 ? situationFiltered : available;

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
      utterance.rate = line.rate;
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
   * Commentary CONTENT (500+ lines per language) will come from Doc 3.
   * For now, uses built-in fallback lines.
   */
  private getPool(eventType: EventType, perspective: string): CommentaryLine[] {
    // Fallback commentary lines until Doc 3 content is loaded
    const fallbacks: Record<string, CommentaryLine[]> = {
      DOT_BALL: [
        { id: 'dot1', text: 'Defended. Dot ball.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
        { id: 'dot2', text: 'Good length, no run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
        { id: 'dot3', text: 'Beaten outside off. Good bowling.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
      ],
      RUNS_SCORED: [
        { id: 'run1', text: 'Pushed into the gap, quick single.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
        { id: 'run2', text: 'Nicely placed, they run two.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
        { id: 'run3', text: 'Worked away, good running between the wickets.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
      ],
      BOUNDARY_FOUR: [
        { id: 'four1', text: 'FOUR! Beautiful shot through the covers!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 0,
          followUp: { id: 'four1f', text: "That's batting of the highest class.", voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 } },
        { id: 'four2', text: 'FOUR! Driven to the boundary!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 0 },
        { id: 'four3', text: 'FOUR! That raced away to the fence!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 0 },
      ],
      BOUNDARY_SIX: [
        { id: 'six1', text: 'SIX! MAXIMUM! That has gone all the way!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0,
          followUp: { id: 'six1f', text: 'Absolutely monstrous! Into the stands!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.0, delay: 0 } },
        { id: 'six2', text: "SIX! That's gone into orbit!", voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
        { id: 'six3', text: 'SIX! What a hit! The crowd goes wild!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
      ],
      WICKET_BOWLED: [
        { id: 'wb1', text: 'BOWLED! The stumps are shattered!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 0,
          followUp: { id: 'wb1f', text: 'Clean bowled. Nothing the batsman could do.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 } },
        { id: 'wb2', text: "OUT! Timber! That's cleaned him up!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 0 },
      ],
      WICKET_CAUGHT: [
        { id: 'wc1', text: 'CAUGHT! What a grab!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 0 },
        { id: 'wc2', text: "OUT! Caught in the deep! That's a big wicket!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 0 },
      ],
      WICKET_LBW: [
        { id: 'wl1', text: 'LBW! The finger goes up! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.1, pitch: 1.0, delay: 0 },
        { id: 'wl2', text: 'Plumb in front! Given LBW!', voice: 'main', emotion: 'dramatic', rate: 1.1, pitch: 1.0, delay: 0 },
      ],
      MILESTONE_50: [
        { id: 'm50', text: 'FIFTY! Well deserved half-century!', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.1, delay: 0 },
      ],
      MILESTONE_100: [
        { id: 'm100', text: 'CENTURY! What a magnificent innings!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
      ],
      OVER_END: [
        { id: 'oe1', text: 'End of the over.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
        { id: 'oe2', text: "That's the end of the over. Time for a change.", voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
      ],
    };

    return fallbacks[eventType] || [];
  }

  destroy(): void {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }
}
