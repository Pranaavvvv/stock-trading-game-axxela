import type {
  GamePhase,
  PlayerInfo,
  PlayerState,
  TradeRecord,
  OrderSide,
  ServerMessage,
  LeaderboardEntry,
} from "../lib/types";
import { MatchingEngine, MatchResult } from "./matchingEngine";
import { settlePosition } from "./pnlEngine";

const ROUND_DURATION = 90; // seconds
const INTERMISSION_DURATION = 5; // seconds
const TOTAL_ROUNDS = 6;

export type BroadcastFn = (msg: ServerMessage, targetUsername?: string) => void;

export class GameEngine {
  roomId: string;
  capacity: number;
  
  // ── Core State ──
  phase: GamePhase = "LOBBY";
  round = 0;
  secondsRemaining = 0;
  digits: number[] = [];
  digitMask: (string | null)[] = [null, null, null, null, null, null];

  // ── Players ──
  players: Map<string, PlayerInfo> = new Map();
  playerStates: Map<string, PlayerState> = new Map();
  joinOrder: string[] = []; // usernames in join order
  adminUsername: string | null = null;

  // ── Order Book & Trades ──
  matchingEngine = new MatchingEngine();
  trades: TradeRecord[] = [];

  // ── Timers ──
  private roundTimer: ReturnType<typeof setInterval> | null = null;
  public isPaused: boolean = false;

  // ── Broadcast function (injected by ws-server) ──
  private broadcast: BroadcastFn;

  constructor(roomId: string, capacity: number, broadcast: BroadcastFn) {
    this.roomId = roomId;
    this.capacity = capacity;
    this.broadcast = broadcast;
  }

  // ══════════════════════════════════════════════
  // LOBBY
  // ══════════════════════════════════════════════

  addPlayer(username: string): { success: boolean; error?: string } {
    if (this.phase !== "LOBBY") {
      // Allow reconnection during game
      if (this.players.has(username)) {
        const player = this.players.get(username)!;
        player.connected = true;
        this.broadcastRegistry();
        return { success: true };
      }
      return { success: false, error: "Game already in progress" };
    }

    if (this.players.has(username)) {
      // Reconnecting to lobby
      const player = this.players.get(username)!;
      player.connected = true;
      this.broadcastRegistry();
      return { success: true };
    }

    if (this.players.size >= this.capacity) {
      return { success: false, error: "Room is full" };
    }

    // Assign seat index
    const seatIndex = this.players.size;
    const isAdmin = this.players.size === 0;

    const playerInfo: PlayerInfo = {
      username,
      absoluteSeatIndex: seatIndex,
      connected: true,
      isAdmin,
    };

    this.players.set(username, playerInfo);
    this.joinOrder.push(username);

    if (isAdmin) {
      this.adminUsername = username;
    }

    // Initialize player state
    this.playerStates.set(username, {
      username,
      position: 0,
      avgPrice: 0,
      realizedPnl: 0,
      balance: 0,
      restingOrders: [],
    });

    this.broadcastRegistry();

    return { success: true };
  }

  removePlayer(username: string): void {
    const player = this.players.get(username);
    if (!player) return;

    if (this.phase === "LOBBY") {
      // In lobby: mark disconnected
      player.connected = false;

      // If admin disconnected, promote next
      if (player.isAdmin) {
        this.promoteAdmin(username);
      }

      this.broadcastRegistry();
    } else {
      // Mid-game: mark disconnected, retain state
      player.connected = false;
      this.broadcastRegistry();
    }
  }

  private promoteAdmin(oldAdmin: string): void {
    const oldPlayer = this.players.get(oldAdmin);
    if (oldPlayer) oldPlayer.isAdmin = false;

    // Find next connected player in join order
    for (const uname of this.joinOrder) {
      if (uname === oldAdmin) continue;
      const p = this.players.get(uname);
      if (p && p.connected) {
        p.isAdmin = true;
        this.adminUsername = uname;
        return;
      }
    }
    this.adminUsername = null;
  }

  // ── Start Game ──
  startGame(username: string): { success: boolean; error?: string } {
    if (username !== this.adminUsername) {
      return { success: false, error: "Only admin can start the game" };
    }
    if (this.phase !== "LOBBY") {
      return { success: false, error: "Game already started" };
    }
    if (this.players.size < 2) {
      return { success: false, error: "Need at least 2 players to start" };
    }

    // Generate the secret 6-digit number
    this.digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

    this.broadcastRegistry();
    this.broadcast({ type: "GAME_STARTING" });

    // Start Round 1 after a short delay
    setTimeout(() => this.startRound(1), 1500);

    return { success: true };
  }

  // ══════════════════════════════════════════════
  // ROUNDS
  // ══════════════════════════════════════════════

  private startRound(roundNum: number): void {
    this.phase = "ROUND_ACTIVE";
    this.round = roundNum;
    this.secondsRemaining = ROUND_DURATION;

    // Clear order book from previous round
    this.matchingEngine.clearAll();
    // Update resting orders in player states
    for (const [, ps] of this.playerStates) {
      ps.restingOrders = [];
    }

    // Update digit mask: rounds 2-6 reveal digits 1-(round-1)
    this.digitMask = this.digits.map((d, idx) =>
      idx < roundNum - 1 ? String(d) : null
    );

    const playersArray = Array.from(this.players.values());

    this.broadcast({
      type: "ROUND_INIT",
      round: this.round,
      digitMask: this.digitMask,
      duration: ROUND_DURATION,
      players: playersArray,
    });

    // Also send an initial empty order book
    this.broadcastOrderBook();

    // Start round timer
    this.roundTimer = setInterval(() => {
      if (this.isPaused) return;

      this.secondsRemaining--;

      this.broadcast({
        type: "TIMER_TICK",
        secondsRemaining: this.secondsRemaining,
      });

      if (this.secondsRemaining <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  private endRound(): void {
    if (this.roundTimer) {
      clearInterval(this.roundTimer);
      this.roundTimer = null;
    }

    // Clear all resting orders at round end
    this.matchingEngine.clearAll();
    for (const [, ps] of this.playerStates) {
      ps.restingOrders = [];
    }

    if (this.round >= TOTAL_ROUNDS) {
      // Proceed to settlement — no intermission after Round 6
      this.settle();
    } else {
      // Intermission
      this.phase = "INTERMISSION";
      this.secondsRemaining = INTERMISSION_DURATION;

      this.broadcast({
        type: "ROUND_INTERMISSION",
        nextRound: this.round + 1,
        duration: INTERMISSION_DURATION,
      });

      const intermissionTimer = setInterval(() => {
        if (this.isPaused) return;

        this.secondsRemaining--;
        this.broadcast({
          type: "TIMER_TICK",
          secondsRemaining: this.secondsRemaining,
        });

        if (this.secondsRemaining <= 0) {
          clearInterval(intermissionTimer);
          this.startRound(this.round + 1);
        }
      }, 1000);
    }
  }

  // ══════════════════════════════════════════════
  // SETTLEMENT
  // ══════════════════════════════════════════════

  private settle(): void {
    this.phase = "SETTLEMENT";

    const vFinal = this.digits.reduce((sum, d) => sum + d, 0);

    // Force-close all nonzero positions at V_final
    for (const [, ps] of this.playerStates) {
      settlePosition(ps, vFinal);
    }

    // Build leaderboard
    const leaderboard: LeaderboardEntry[] = Array.from(this.playerStates.values())
      .map((ps) => ({
        username: ps.username,
        pnl: Math.round(ps.realizedPnl * 100) / 100,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    this.phase = "GAME_OVER";

    this.broadcast({
      type: "GAME_OVER",
      final_digits: this.digits,
      settlement_price: vFinal,
      leaderboard,
    });
  }

  // ══════════════════════════════════════════════
  // ORDER HANDLING
  // ══════════════════════════════════════════════

  togglePause(username: string): { success: boolean; error?: string } {
    if (username !== this.adminUsername) {
      return { success: false, error: "Only admin can pause the game" };
    }

    this.isPaused = !this.isPaused;

    this.broadcast({
      type: "GAME_PAUSED_STATE",
      isPaused: this.isPaused,
    });

    return { success: true };
  }

  placeOrder(
    username: string,
    side: OrderSide,
    price: number
  ): void {
    if (this.phase !== "ROUND_ACTIVE") {
      this.broadcast(
        { type: "ORDER_REJECTED", reason: "ROUND_NOT_ACTIVE", username },
        username
      );
      return;
    }

    const result: MatchResult = this.matchingEngine.submitOrder(
      username,
      side,
      price,
      this.playerStates
    );

    if (result.rejectionReason) {
      this.broadcast(
        { type: "ORDER_REJECTED", reason: result.rejectionReason, username },
        username
      );
      return;
    }

    // If order rested (no fills), update the player's resting orders
    if (result.fills.length === 0) {
      const ps = this.playerStates.get(username);
      if (ps) {
        ps.restingOrders = this.matchingEngine.getRestingOrders(username);
      }
    }

    // Process fills
    for (const fill of result.fills) {
      this.trades.push(fill);

      // Update resting orders for both parties
      const buyerState = this.playerStates.get(fill.buyer);
      const sellerState = this.playerStates.get(fill.seller);
      if (buyerState) {
        buyerState.restingOrders = this.matchingEngine.getRestingOrders(fill.buyer);
        this.broadcast({ type: "PLAYER_STATE_UPDATE", playerState: buyerState }, fill.buyer);
      }
      if (sellerState) {
        sellerState.restingOrders = this.matchingEngine.getRestingOrders(fill.seller);
        this.broadcast({ type: "PLAYER_STATE_UPDATE", playerState: sellerState }, fill.seller);
      }

      this.broadcast({
        type: "ORDER_FILLED",
        buyer: fill.buyer,
        seller: fill.seller,
        price: fill.price,
        timestamp: fill.timestamp,
      });
    }

    // Always broadcast updated order book
    this.broadcastOrderBook();
  }

  // ══════════════════════════════════════════════
  // STATE SYNC (for reconnecting clients)
  // ══════════════════════════════════════════════

  getStateSyncForPlayer(username: string): ServerMessage {
    const ps = this.playerStates.get(username) || {
      username,
      position: 0,
      avgPrice: 0,
      realizedPnl: 0,
      balance: 0,
      restingOrders: [],
    };

    return {
      type: "STATE_SYNC",
      phase: this.phase,
      round: this.round,
      secondsRemaining: this.secondsRemaining,
      isPaused: this.isPaused,
      digitMask: this.digitMask,
      players: Array.from(this.players.values()),
      playerState: ps,
      bids: this.matchingEngine.getBids().map((o) => ({
        username: o.username,
        price: o.price,
        timestamp: o.timestamp,
      })),
      asks: this.matchingEngine.getAsks().map((o) => ({
        username: o.username,
        price: o.price,
        timestamp: o.timestamp,
      })),
      trades: this.trades,
      roomId: this.roomId,
      capacity: this.capacity,
    };
  }

  // ══════════════════════════════════════════════
  // BROADCASTS
  // ══════════════════════════════════════════════

  private broadcastRegistry(): void {
    this.broadcast({
      type: "USER_REGISTRY",
      roomId: this.roomId,
      capacity: this.capacity,
      users: Array.from(this.players.values()),
    });
  }

  private broadcastOrderBook(): void {
    this.broadcast({
      type: "ORDER_BOOK_UPDATE",
      bids: this.matchingEngine.getBids().map((o) => ({
        username: o.username,
        price: o.price,
        timestamp: o.timestamp,
      })),
      asks: this.matchingEngine.getAsks().map((o) => ({
        username: o.username,
        price: o.price,
        timestamp: o.timestamp,
      })),
    });
  }
}
