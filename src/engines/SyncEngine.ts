// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 3: Sync Engine
// PvP synchronization via Supabase Realtime
// Doc 5 §1.4 — Connection health monitoring
// ═══════════════════════════════════════════════════

import type { BallResult } from './types';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SyncPoint {
  id: string;
  resolve: () => void;
  timeout: ReturnType<typeof setTimeout>;
}

// Doc 5 §1.4: Connection health monitor
class ConnectionMonitor {
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private staleCheckInterval: ReturnType<typeof setInterval> | null = null;
  private lastHeartbeat: number = Date.now();
  private maxHeartbeatAge: number = 10000; // 10 seconds
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private onDisconnect?: () => void;
  private onReconnect?: () => void;

  start(channel: RealtimeChannel, userId: string, onDisconnect?: () => void, onReconnect?: () => void): void {
    this.onDisconnect = onDisconnect;
    this.onReconnect = onReconnect;
    this.lastHeartbeat = Date.now();
    this.reconnectAttempts = 0;

    // Send heartbeat every 3 seconds
    this.heartbeatInterval = setInterval(() => {
      channel.send({
        type: 'broadcast', event: 'heartbeat',
        payload: { userId, timestamp: Date.now() },
      });
    }, 3000);

    // Listen for opponent heartbeats
    channel.on('broadcast', { event: 'heartbeat' }, ({ payload }) => {
      if (payload.userId !== userId) {
        this.lastHeartbeat = Date.now();
        if (this.reconnectAttempts > 0) {
          this.reconnectAttempts = 0;
          this.onReconnect?.();
        }
      }
    });

    // Check for stale connection every 5 seconds
    this.staleCheckInterval = setInterval(() => {
      if (Date.now() - this.lastHeartbeat > this.maxHeartbeatAge) {
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.onDisconnect?.();
        }
      }
    }, 5000);
  }

  stop(): void {
    if (this.heartbeatInterval) { clearInterval(this.heartbeatInterval); this.heartbeatInterval = null; }
    if (this.staleCheckInterval) { clearInterval(this.staleCheckInterval); this.staleCheckInterval = null; }
  }

  isStale(): boolean {
    return Date.now() - this.lastHeartbeat > this.maxHeartbeatAge;
  }
}

export class SyncEngine {
  private channel: RealtimeChannel | null = null;
  private matchId: string = '';
  private userId: string = '';
  private opponentId: string = '';
  private pendingSyncPoints: Map<string, SyncPoint> = new Map();
  private ballPicks: Map<string, { pick: number; role: 'batting' | 'bowling' }> = new Map();
  private isHost: boolean = false;
  private connectionMonitor: ConnectionMonitor = new ConnectionMonitor();

  // Callbacks
  private onOpponentPick?: (pick: number) => void;
  private onBallResult?: (result: BallResult) => void;
  private onOpponentDisconnect?: () => void;
  private onOpponentReconnect?: () => void;

  // Doc 5 §1.1: Toss broadcast callbacks
  private onTossCall?: (call: string, userId: string) => void;
  private onTossResult?: (result: string) => void;

  // ── CONNECTION ──

  async connect(matchId: string, userId: string, opponentId: string): Promise<void> {
    this.matchId = matchId;
    this.userId = userId;
    this.opponentId = opponentId;

    this.channel = supabase.channel(`match-${matchId}`, {
      config: { broadcast: { ack: true } },
    });

    this.channel
      .on('broadcast', { event: 'sync_ready' }, ({ payload }) => {
        this.handleSyncReady(payload);
      })
      .on('broadcast', { event: 'ball_pick' }, ({ payload }) => {
        this.handleBallPick(payload);
      })
      .on('broadcast', { event: 'ball_result' }, ({ payload }) => {
        this.handleBallResult(payload);
      })
      .on('broadcast', { event: 'disconnect' }, ({ payload }) => {
        this.handleDisconnect(payload);
      })
      // Doc 5 §1.1: Toss call/result broadcasts
      .on('broadcast', { event: 'toss_call' }, ({ payload }) => {
        this.onTossCall?.(payload.call, payload.userId);
      })
      .on('broadcast', { event: 'toss_result' }, ({ payload }) => {
        this.onTossResult?.(payload.result);
      });

    await this.channel.subscribe();

    // Doc 5 §1.4: Start connection health monitoring
    this.connectionMonitor.start(
      this.channel, userId,
      () => this.onOpponentDisconnect?.(),
      () => this.onOpponentReconnect?.(),
    );
  }

  disconnect(): void {
    this.connectionMonitor.stop();
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'disconnect',
        payload: { userId: this.userId },
      });
      this.channel.unsubscribe();
      this.channel = null;
    }
  }

  // ── Doc 5 §1.1: TOSS BROADCASTS ──

  async sendTossCall(call: string): Promise<void> {
    await this.channel?.send({
      type: 'broadcast', event: 'toss_call',
      payload: { userId: this.userId, call, timestamp: Date.now() },
    });
  }

  async sendTossResult(result: string): Promise<void> {
    await this.channel?.send({
      type: 'broadcast', event: 'toss_result',
      payload: { result, timestamp: Date.now() },
    });
  }

  // ── SYNC POINTS ──

  async waitForSync(pointId: string, timeoutMs: number = 15000): Promise<void> {
    await this.channel?.send({
      type: 'broadcast',
      event: 'sync_ready',
      payload: { pointId, userId: this.userId, timestamp: Date.now() },
    });

    if (this.pendingSyncPoints.has(`opponent_${pointId}`)) {
      this.pendingSyncPoints.get(`opponent_${pointId}`)!.resolve();
      this.pendingSyncPoints.delete(`opponent_${pointId}`);
      return;
    }

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`Sync timeout at ${pointId} — proceeding anyway`);
        this.pendingSyncPoints.delete(pointId);
        resolve();
      }, timeoutMs);

      this.pendingSyncPoints.set(pointId, {
        id: pointId,
        resolve: () => {
          clearTimeout(timeout);
          this.pendingSyncPoints.delete(pointId);
          resolve();
        },
        timeout,
      });
    });
  }

  private handleSyncReady(payload: { pointId: string; userId: string }): void {
    if (payload.userId === this.opponentId) {
      const pending = this.pendingSyncPoints.get(payload.pointId);
      if (pending) {
        pending.resolve();
      } else {
        this.pendingSyncPoints.set(`opponent_${payload.pointId}`, {
          id: payload.pointId,
          resolve: () => {},
          timeout: setTimeout(() => {}, 0),
        });
      }
    }
  }

  // ── BALL PICKS ──

  async sendBallPick(pick: number, role: 'batting' | 'bowling', ballId: string): Promise<void> {
    await this.channel?.send({
      type: 'broadcast',
      event: 'ball_pick',
      payload: { userId: this.userId, pick, role, ballId, timestamp: Date.now() },
    });

    this.ballPicks.set(`${this.userId}_${ballId}`, { pick, role });
  }

  private async handleBallPick(payload: {
    userId: string; pick: number; role: 'batting' | 'bowling'; ballId: string;
  }): Promise<void> {
    if (payload.userId === this.opponentId) {
      this.ballPicks.set(`${payload.userId}_${payload.ballId}`, {
        pick: payload.pick,
        role: payload.role,
      });

      this.onOpponentPick?.(payload.pick);

      const myPick = this.ballPicks.get(`${this.userId}_${payload.ballId}`);
      const theirPick = this.ballPicks.get(`${this.opponentId}_${payload.ballId}`);

      if (myPick && theirPick && this.isHost) {
        await this.resolveBall(payload.ballId, myPick, theirPick);
      }
    }
  }

  private async resolveBall(
    ballId: string,
    myPick: { pick: number; role: string },
    theirPick: { pick: number; role: string }
  ): Promise<void> {
    const battingPick = myPick.role === 'batting' ? myPick.pick : theirPick.pick;
    const bowlingPick = myPick.role === 'bowling' ? myPick.pick : theirPick.pick;

    // For PvP, resolve via edge function for fairness
    try {
      const { data: result } = await supabase.functions.invoke('resolve-ball', {
        body: { matchId: this.matchId, ballId, battingPick, bowlingPick },
      });

      await this.channel?.send({
        type: 'broadcast',
        event: 'ball_result',
        payload: { ballId, result, timestamp: Date.now() },
      });
    } catch (err) {
      console.error('[SyncEngine] Ball resolution failed:', err);
    }
  }

  private handleBallResult(payload: { ballId: string; result: BallResult }): void {
    this.onBallResult?.(payload.result);
    this.ballPicks.delete(`${this.userId}_${payload.ballId}`);
    this.ballPicks.delete(`${this.opponentId}_${payload.ballId}`);
  }

  // ── TIMEOUT ──

  async forceOpponentPick(ballId: string): Promise<void> {
    const randomPick = Math.floor(Math.random() * 6) + 1;
    this.handleBallPick({
      userId: this.opponentId,
      pick: randomPick,
      role: 'bowling',
      ballId,
    });
  }

  private handleDisconnect(payload: { userId: string }): void {
    if (payload.userId === this.opponentId) {
      console.warn('[SyncEngine] Opponent disconnected');
      this.onOpponentDisconnect?.();
    }
  }

  // ── SETTERS ──
  setOnOpponentPick(cb: (pick: number) => void): void { this.onOpponentPick = cb; }
  setOnBallResult(cb: (result: BallResult) => void): void { this.onBallResult = cb; }
  setIsHost(isHost: boolean): void { this.isHost = isHost; }
  setOnOpponentDisconnect(cb: () => void): void { this.onOpponentDisconnect = cb; }
  setOnOpponentReconnect(cb: () => void): void { this.onOpponentReconnect = cb; }
  setOnTossCall(cb: (call: string, userId: string) => void): void { this.onTossCall = cb; }
  setOnTossResult(cb: (result: string) => void): void { this.onTossResult = cb; }

  // Doc 5 §1.4: Check if opponent connection is stale
  isOpponentStale(): boolean { return this.connectionMonitor.isStale(); }

  destroy(): void {
    this.connectionMonitor.stop();
    this.disconnect();
    for (const [, sp] of this.pendingSyncPoints) {
      clearTimeout(sp.timeout);
    }
    this.pendingSyncPoints.clear();
    this.ballPicks.clear();
  }
}
