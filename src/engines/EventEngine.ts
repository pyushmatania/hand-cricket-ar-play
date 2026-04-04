// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 2: Event Engine
// Central event bus with priority queue and blocking
// ═══════════════════════════════════════════════════

import type { GameEvent, EventType, EventListener } from './types';

export class EventEngine {
  private queue: GameEvent[] = [];
  private listeners: Map<EventType, EventListener[]> = new Map();
  private wildcardListeners: EventListener[] = [];
  private isProcessing = false;
  private currentEvent: GameEvent | null = null;
  private isPaused = false;
  private eventLog: GameEvent[] = [];
  private onEventProcessed?: (event: GameEvent) => void;

  // ── REGISTRATION ──

  on(type: EventType, callback: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    return () => {
      const arr = this.listeners.get(type);
      if (arr) {
        const idx = arr.indexOf(callback);
        if (idx !== -1) arr.splice(idx, 1);
      }
    };
  }

  onAny(callback: EventListener): () => void {
    this.wildcardListeners.push(callback);
    return () => {
      const idx = this.wildcardListeners.indexOf(callback);
      if (idx !== -1) this.wildcardListeners.splice(idx, 1);
    };
  }

  // ── EVENT EMISSION ──

  emit(
    type: EventType,
    payload: Record<string, any> = {},
    options: Partial<Pick<GameEvent, 'duration' | 'blocking' | 'priority' | 'source'>> = {}
  ): string {
    const id = crypto.randomUUID();
    const event: GameEvent = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      duration: options.duration ?? this.getDefaultDuration(type),
      blocking: options.blocking ?? this.isBlockingByDefault(type),
      priority: options.priority ?? this.getDefaultPriority(type),
      source: options.source ?? 'local',
    };

    this.queue.push(event);
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.timestamp - b.timestamp;
    });

    if (!this.isProcessing && !this.isPaused) {
      this.processNext();
    }

    return event.id;
  }

  emitSequence(
    events: Array<{ type: EventType; payload?: Record<string, any>; duration?: number }>
  ): void {
    events.forEach((e, index) => {
      this.emit(e.type, e.payload ?? {}, {
        duration: e.duration,
        priority: 100 - index,
      });
    });
  }

  // ── PROCESSING ──

  private async processNext(): Promise<void> {
    if (this.queue.length === 0 || this.isPaused) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    this.currentEvent = this.queue.shift()!;
    this.eventLog.push(this.currentEvent);

    const typeListeners = this.listeners.get(this.currentEvent.type) || [];
    const allListeners = [...typeListeners, ...this.wildcardListeners];

    try {
      await Promise.all(
        allListeners.map(fn => fn(this.currentEvent!.payload, this.currentEvent!))
      );
    } catch (error) {
      console.error(`Error processing event ${this.currentEvent.type}:`, error);
    }

    if (this.currentEvent.blocking && this.currentEvent.duration > 0) {
      await this.sleep(this.currentEvent.duration);
      // Doc 5 §1.3: Breathing pause (300ms) between blocking events
      // prevents rapid-fire stacking of results
      await this.sleep(300);
    }

    this.onEventProcessed?.(this.currentEvent);
    this.currentEvent = null;
    this.processNext();
  }

  // ── CONTROL ──

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    if (!this.isProcessing && this.queue.length > 0) {
      this.processNext();
    }
  }

  clearQueue(): void {
    this.queue = [];
  }

  getEventLog(): GameEvent[] {
    return [...this.eventLog];
  }

  isCurrentlyBlocking(): boolean {
    return this.isProcessing && (this.currentEvent?.blocking ?? false);
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  setOnEventProcessed(cb: (event: GameEvent) => void): void {
    this.onEventProcessed = cb;
  }

  destroy(): void {
    this.clearQueue();
    this.listeners.clear();
    this.wildcardListeners = [];
    this.eventLog = [];
    this.isProcessing = false;
    this.isPaused = false;
    this.currentEvent = null;
  }

  // ── DEFAULT CONFIGURATIONS ──

  private getDefaultDuration(type: EventType): number {
    const durations: Partial<Record<EventType, number>> = {
      MATCH_START: 500,
      MATCH_END: 1000,
      TOSS_BEGIN: 500,
      TOSS_COIN_FLIP: 2500,
      TOSS_RESULT: 1500,
      TOSS_DECISION: 1500,
      INNINGS_START: 1000,
      INNINGS_END: 1000,
      INNINGS_BREAK: 3000,
      BALL_BOWLER_RUNUP: 600,
      BALL_RESULT: 200,
      DEFENSE_SCORED: 900,
      RUNS_SCORED: 1300,
      BOUNDARY_FOUR: 2800,
      BOUNDARY_SIX: 3800,
      WICKET_BOWLED: 4200,
      WICKET_CAUGHT: 4500,
      WICKET_CAUGHT_BEHIND: 4000,
      WICKET_LBW: 5000,
      WICKET_RUN_OUT: 4500,
      WICKET_STUMPED: 3800,
      WICKET_HIT_WICKET: 3500,
      WICKET_DEFENSE: 4000,
      NEW_BATSMAN: 2000,
      BOWLER_CHANGE: 1500,
      OVER_START: 300,
      OVER_END: 2000,
      MILESTONE_50: 3000,
      MILESTONE_100: 4000,
      MILESTONE_5_WICKETS: 3500,
      HATTRICK: 5000,
      DRS_REVIEW_START: 1000,
      DRS_REVIEW_RESULT: 3000,
      UI_SHOW_CARD: 200,
      UI_HIDE_CARD: 200,
      UI_UPDATE_SCORE: 400,
      UI_FLASH_BOUNDARY: 1500,
      UI_SCREEN_SHAKE: 300,
      POWERPLAY_START: 1000,
      POWERPLAY_END: 800,
      DEATH_OVERS_START: 1000,
      COMMENTARY_LINE: 0,
      COMMENTARY_DUO: 0,
      SOUND_EFFECT: 0,
      SOUND_AMBIENT_CHANGE: 0,
    };
    return durations[type] ?? 0;
  }

  private isBlockingByDefault(type: EventType): boolean {
    const blocking: EventType[] = [
      'MATCH_START', 'MATCH_END',
      'TOSS_COIN_FLIP', 'TOSS_RESULT', 'TOSS_DECISION',
      'INNINGS_START', 'INNINGS_END', 'INNINGS_BREAK',
      'BALL_BOWLER_RUNUP', 'BALL_RESULT',
      'DEFENSE_SCORED', 'RUNS_SCORED', 'BOUNDARY_FOUR', 'BOUNDARY_SIX',
      'WICKET_BOWLED', 'WICKET_CAUGHT', 'WICKET_CAUGHT_BEHIND',
      'WICKET_LBW', 'WICKET_RUN_OUT', 'WICKET_STUMPED', 'WICKET_HIT_WICKET', 'WICKET_DEFENSE',
      'NEW_BATSMAN', 'BOWLER_CHANGE',
      'OVER_START', 'OVER_END',
      'MILESTONE_50', 'MILESTONE_100', 'MILESTONE_5_WICKETS', 'HATTRICK',
      'DRS_REVIEW_START', 'DRS_REVIEW_RESULT',
      'POWERPLAY_START', 'DEATH_OVERS_START',
    ];
    return blocking.includes(type);
  }

  private getDefaultPriority(type: EventType): number {
    // Higher = processed first when queued simultaneously
    if (type.startsWith('MATCH_')) return 100;
    if (type.startsWith('INNINGS_')) return 90;
    if (type.startsWith('WICKET_')) return 80;
    if (type.startsWith('BOUNDARY_')) return 70;
    if (type.startsWith('MILESTONE_') || type === 'HATTRICK') return 75;
    if (type.startsWith('BALL_')) return 60;
    if (type.startsWith('OVER_')) return 50;
    if (type.startsWith('UI_')) return 30;
    if (type.startsWith('SOUND_') || type.startsWith('COMMENTARY_')) return 20;
    if (type.startsWith('CROWD_')) return 10;
    return 40;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
