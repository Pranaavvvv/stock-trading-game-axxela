// ─── Game Phases ───
export type GamePhase =
  | "LOBBY"
  | "ROUND_ACTIVE"
  | "INTERMISSION"
  | "SETTLEMENT"
  | "GAME_OVER";

// ─── Order Side ───
export type OrderSide = "BUY" | "SELL";


// ─── Player Info (broadcast in registry) ───
export interface PlayerInfo {
  username: string;
  absoluteSeatIndex: number;
  connected: boolean;
  isAdmin: boolean;
}

// ─── Order ───
export interface Order {
  id: string;
  username: string;
  side: OrderSide;
  price: number;
  timestamp: number;
}

// ─── Trade Record ───
export interface TradeRecord {
  buyer: string;
  seller: string;
  price: number;
  timestamp: number;
}

// ─── Player State (server-side, per-user) ───
export interface PlayerState {
  username: string;
  position: number; // -2 to +2
  avgPrice: number;
  realizedPnl: number;
  restingOrders: Order[];
}

// ─── Leaderboard Entry ───
export interface LeaderboardEntry {
  username: string;
  pnl: number;
}

// ─── Rejection Reasons ───
export type RejectionReason =
  | "MAX_LONG_LIMIT"
  | "MAX_SHORT_LIMIT"
  | "INVALID_PRICE"
  | "ROUND_NOT_ACTIVE"
  | "NOT_ADMIN";

// ──────────────────────────────────────────────
// Client → Server Messages
// ──────────────────────────────────────────────

export interface CreateRoomMessage {
  type: "CREATE_ROOM";
  username: string;
  capacity: number;
}

export interface JoinRoomMessage {
  type: "JOIN_ROOM";
  username: string;
  roomId: string;
}

export interface StartGameMessage {
  type: "START_GAME";
}

export interface PlaceOrderMessage {
  type: "PLACE_ORDER";
  side: OrderSide;
  price: number;
}

export type ClientMessage =
  | CreateRoomMessage
  | JoinRoomMessage
  | StartGameMessage
  | PlaceOrderMessage;

// ──────────────────────────────────────────────
// Server → Client Messages
// ──────────────────────────────────────────────

export interface UserRegistryMessage {
  type: "USER_REGISTRY";
  roomId: string;
  capacity: number;
  users: PlayerInfo[];
}

export interface LobbyTimerMessage {
  type: "LOBBY_TIMER";
  secondsRemaining: number;
}

export interface GameStartingMessage {
  type: "GAME_STARTING";
}

export interface RoundInitMessage {
  type: "ROUND_INIT";
  round: number;
  digitMask: (string | null)[];
  duration: number;
  players: PlayerInfo[];
}

export interface OrderBookUpdateMessage {
  type: "ORDER_BOOK_UPDATE";
  bids: { username: string; price: number; timestamp: number }[];
  asks: { username: string; price: number; timestamp: number }[];
}

export interface OrderFilledMessage {
  type: "ORDER_FILLED";
  buyer: string;
  seller: string;
  price: number;
  timestamp: number;
}

export interface OrderRejectedMessage {
  type: "ORDER_REJECTED";
  reason: RejectionReason;
  username: string;
}

export interface RoundIntermissionMessage {
  type: "ROUND_INTERMISSION";
  nextRound: number;
  duration: number;
}

export interface TimerTickMessage {
  type: "TIMER_TICK";
  secondsRemaining: number;
}

export interface GameOverMessage {
  type: "GAME_OVER";
  final_digits: number[];
  settlement_price: number;
  leaderboard: LeaderboardEntry[];
}

export interface StateSyncMessage {
  type: "STATE_SYNC";
  phase: GamePhase;
  round: number;
  secondsRemaining: number;
  digitMask: (string | null)[];
  players: PlayerInfo[];
  playerState: PlayerState;
  bids: { username: string; price: number; timestamp: number }[];
  asks: { username: string; price: number; timestamp: number }[];
  trades: TradeRecord[];
  roomId: string;
  capacity: number;
}

export interface PlayerStateUpdateMessage {
  type: "PLAYER_STATE_UPDATE";
  playerState: PlayerState;
}

export interface ErrorMessage {
  type: "ERROR";
  message: string;
}

export type ServerMessage =
  | UserRegistryMessage
  | LobbyTimerMessage
  | GameStartingMessage
  | RoundInitMessage
  | OrderBookUpdateMessage
  | OrderFilledMessage
  | OrderRejectedMessage
  | RoundIntermissionMessage
  | TimerTickMessage
  | GameOverMessage
  | StateSyncMessage
  | PlayerStateUpdateMessage
  | ErrorMessage;
