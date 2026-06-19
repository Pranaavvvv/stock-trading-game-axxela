"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameSocket } from "../../lib/ws-client";
import { getDisplaySeating } from "../../lib/seatRotation";
import type {
  PlayerInfo,
  TradeRecord,
  Order,
  ServerMessage,
  GamePhase,
  OrderSide,
  GameOverMessage,
} from "../../lib/types";

import GameHeader from "../../components/table/GameHeader";
import TableSurface from "../../components/table/TableSurface";
import StatsRow from "../../components/panel/StatsRow";
import OrderEntry from "../../components/panel/OrderEntry";
import WorkingOrders from "../../components/panel/WorkingOrders";
import TradesPanel from "../../components/panel/TradesPanel";
import OrderBook from "../../components/panel/OrderBook";

export default function TradePage() {
  const router = useRouter();
  const { connected, lastMessage, connect, send } = useGameSocket();

  // Game state
  const [phase, setPhase] = useState<GamePhase>("LOBBY");
  const [round, setRound] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [digitMask, setDigitMask] = useState<(string | null)[]>([
    null, null, null, null, null, null,
  ]);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [selfUsername, setSelfUsername] = useState("");
  const [selfRoomId, setSelfRoomId] = useState("");
  const [selfSeatIndex, setSelfSeatIndex] = useState(0);

  // Player state
  const [position, setPosition] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [realizedPnl, setRealizedPnl] = useState(0);
  const [restingOrders, setRestingOrders] = useState<Order[]>([]);

  // Order book
  const [bids, setBids] = useState<{ username: string; price: number; timestamp: number }[]>([]);
  const [asks, setAsks] = useState<{ username: string; price: number; timestamp: number }[]>([]);

  // Trades
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // Animation state
  const [animateReveal, setAnimateReveal] = useState(false);
  const prevDigitMaskRef = useRef<(string | null)[]>([null, null, null, null, null, null]);

  // Game over data
  const [gameOverData, setGameOverData] = useState<GameOverMessage | null>(null);

  // Error/notification
  const [notification, setNotification] = useState<string | null>(null);

  // Get username and roomId from sessionStorage (set during lobby join)
  useEffect(() => {
    const storedUser = sessionStorage.getItem("axxel_username");
    const storedRoom = sessionStorage.getItem("axxel_roomId");
    if (storedUser) {
      setSelfUsername(storedUser);
    }
    if (storedRoom) {
      setSelfRoomId(storedRoom);
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Rejoin if we have a username
  useEffect(() => {
    if (connected && selfUsername && selfRoomId) {
      send({ type: "JOIN_ROOM", username: selfUsername, roomId: selfRoomId });
    }
  }, [connected, selfUsername, selfRoomId, send]);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;
    const msg: ServerMessage = lastMessage;

    switch (msg.type) {
      case "USER_REGISTRY":
        setPlayers(msg.users);
        // Find our seat index
        const me = msg.users.find((u) => u.username === selfUsername);
        if (me) setSelfSeatIndex(me.absoluteSeatIndex);
        break;

      case "ROUND_INIT": {
        setPhase("ROUND_ACTIVE");
        setRound(msg.round);
        setSecondsRemaining(msg.duration);
        setPlayers(msg.players);

        // Check if new digits were revealed
        const prevMask = prevDigitMaskRef.current;
        const newDigitRevealed = msg.digitMask.some(
          (d, i) => d !== null && prevMask[i] === null
        );
        if (newDigitRevealed) {
          setAnimateReveal(true);
          setTimeout(() => setAnimateReveal(false), 500);
        }
        prevDigitMaskRef.current = msg.digitMask;
        setDigitMask(msg.digitMask);

        const myInfo = msg.players.find((u) => u.username === selfUsername);
        if (myInfo) setSelfSeatIndex(myInfo.absoluteSeatIndex);
        break;
      }

      case "ORDER_BOOK_UPDATE":
        setBids(msg.bids);
        setAsks(msg.asks);
        // Update our resting orders from the book
        const myBids = msg.bids.filter((o) => o.username === selfUsername);
        const myAsks = msg.asks.filter((o) => o.username === selfUsername);
        setRestingOrders([
          ...myBids.map((b, i) => ({
            id: `bid-${i}`,
            username: b.username,
            side: "BUY" as const,
            price: b.price,
            timestamp: b.timestamp,
          })),
          ...myAsks.map((a, i) => ({
            id: `ask-${i}`,
            username: a.username,
            side: "SELL" as const,
            price: a.price,
            timestamp: a.timestamp,
          })),
        ]);
        break;

      case "ORDER_FILLED": {
        const trade: TradeRecord = {
          buyer: msg.buyer,
          seller: msg.seller,
          price: msg.price,
          timestamp: msg.timestamp,
        };
        setTrades((prev) => [...prev, trade]);
        break;
      }

      case "ORDER_REJECTED":
        if (msg.username === selfUsername) {
          let reason = "";
          switch (msg.reason) {
            case "MAX_LONG_LIMIT":
              reason = "Maximum long position limit reached (+2)";
              break;
            case "MAX_SHORT_LIMIT":
              reason = "Maximum short position limit reached (-2)";
              break;
            case "INVALID_PRICE":
              reason = "Invalid price (must be 0-54)";
              break;
            default:
              reason = "Order rejected";
          }
          setNotification(reason);
          setTimeout(() => setNotification(null), 3000);
        }
        break;

      case "TIMER_TICK":
        setSecondsRemaining(msg.secondsRemaining);
        break;

      case "ROUND_INTERMISSION":
        setPhase("INTERMISSION");
        setSecondsRemaining(msg.duration);
        break;

      case "GAME_OVER":
        setGameOverData(msg);
        setPhase("GAME_OVER");
        // Store game-over data for results page
        sessionStorage.setItem("axxel_gameOver", JSON.stringify(msg));
        setTimeout(() => router.push("/results"), 2000);
        break;

      case "STATE_SYNC":
        setPhase(msg.phase);
        setRound(msg.round);
        setSecondsRemaining(msg.secondsRemaining);
        setDigitMask(msg.digitMask);
        prevDigitMaskRef.current = msg.digitMask;
        setPlayers(msg.players);
        setPosition(msg.playerState.position);
        setAvgPrice(msg.playerState.avgPrice);
        setRealizedPnl(msg.playerState.realizedPnl);
        setBids(msg.bids);
        setAsks(msg.asks);
        setTrades(msg.trades);

        const myP = msg.players.find((u) => u.username === selfUsername);
        if (myP) setSelfSeatIndex(myP.absoluteSeatIndex);

        setRestingOrders(
          msg.playerState.restingOrders || []
        );
        break;

      case "PLAYER_STATE_UPDATE":
        setPosition(msg.playerState.position);
        setAvgPrice(msg.playerState.avgPrice);
        setRealizedPnl(msg.playerState.realizedPnl);
        setRestingOrders(msg.playerState.restingOrders || []);
        break;
    }
  }, [lastMessage, selfUsername, router]);

  const handlePlaceOrder = useCallback(
    (side: OrderSide, price: number) => {
      send({ type: "PLACE_ORDER", side, price });
    },
    [send]
  );

  // Compute egocentric seating
  const displaySeats = getDisplaySeating(players, selfSeatIndex);

  const myRestingBuyCount = restingOrders.filter((o) => o.side === "BUY").length;
  const myRestingSellCount = restingOrders.filter((o) => o.side === "SELL").length;

  const isRoundActive = phase === "ROUND_ACTIVE";

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left Region: Table Area (~68%) ── */}
      <div className="flex-[68] flex flex-col min-w-0">
        <GameHeader round={round} secondsRemaining={secondsRemaining} />
        <TableSurface
          digitMask={digitMask}
          seats={displaySeats}
          animateReveal={animateReveal}
        />

        {/* Intermission overlay */}
        {phase === "INTERMISSION" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-30 pointer-events-none">
            <div className="bg-panel-bg/90 backdrop-blur-sm rounded-xl px-8 py-5 border border-white/10 text-center">
              <p className="text-[20px] font-semibold text-text-primary mb-1">
                Intermission
              </p>
              <p className="text-[14px] text-text-secondary">
                Round {round + 1} starting in{" "}
                <span className="text-text-primary font-bold tabular-nums">
                  {secondsRemaining}s
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Game Over overlay */}
        {phase === "GAME_OVER" && gameOverData && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
            <div className="bg-panel-bg/95 backdrop-blur-sm rounded-xl px-10 py-8 border border-white/10 text-center animate-fade-in-up">
              <p className="text-[24px] font-bold text-text-primary mb-2">
                Game Over
              </p>
              <p className="text-[16px] text-text-secondary mb-1">
                Settlement Price:{" "}
                <span className="text-text-primary font-bold text-[20px]">
                  {gameOverData.settlement_price}
                </span>
              </p>
              <p className="text-[13px] text-text-muted">
                Redirecting to results...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Region: Sidebar Panel (~32%) ── */}
      <div className="flex-[32] flex flex-col bg-panel-bg border-l border-white/[0.06] overflow-y-auto">
        <div className="p-6 space-y-4">
          <StatsRow pnl={realizedPnl} openPositions={position} />

          <OrderEntry
            onPlaceOrder={handlePlaceOrder}
            position={position}
            restingBuyCount={myRestingBuyCount}
            restingSellCount={myRestingSellCount}
            disabled={!isRoundActive}
          />

          <OrderBook
            bids={bids}
            asks={asks}
            selfUsername={selfUsername}
            onAcceptOrder={handlePlaceOrder}
            disabled={!isRoundActive}
          />

          <WorkingOrders
            orders={restingOrders}
            selfUsername={selfUsername}
          />

          <TradesPanel
            trades={trades}
            selfUsername={selfUsername}
            allPlayers={players}
            selfAbsoluteSeatIndex={selfSeatIndex}
          />
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-sell-red/90 backdrop-blur-sm text-white text-[13px] font-medium px-5 py-3 rounded-lg shadow-lg">
            {notification}
          </div>
        </div>
      )}
    </div>
  );
}
