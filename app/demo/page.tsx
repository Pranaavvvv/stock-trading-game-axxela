"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DEMO_FRAMES,
  DEMO_PLAYERS,
  DEMO_DIGITS,
  DEMO_SETTLEMENT_PRICE,
} from "../../lib/demoScript";
import { getDisplaySeating } from "../../lib/seatRotation";

import GameHeader from "../../components/table/GameHeader";
import TableSurface from "../../components/table/TableSurface";
import StatsRow from "../../components/panel/StatsRow";
import DemoCaption from "../../components/demo/DemoCaption";
import DigitTile from "../../components/table/DigitTile";

const AUTO_ADVANCE_MS = 4000;

export default function DemoPage() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frame = DEMO_FRAMES[frameIndex];
  const isLastFrame = frameIndex === DEMO_FRAMES.length - 1;
  const isLeaderboardFrame = frame.round === -1;

  // Voice-guided Auto-advance timer
  useEffect(() => {
    // Only run if the user has clicked start, is playing, and there is a next frame
    if (hasStarted && isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(frame.caption);
        utterance.rate = 1.05; // Slightly faster for good pacing

        utterance.onend = () => {
          if (!isLastFrame) {
            // Wait 1.5 seconds after speech finishes before advancing
            autoAdvanceRef.current = setTimeout(() => {
              setFrameIndex((prev) =>
                prev < DEMO_FRAMES.length - 1 ? prev + 1 : prev
              );
            }, 1500);
          }
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback for browsers without TTS: fixed 12 second delay
        if (!isLastFrame) {
          autoAdvanceRef.current = setTimeout(() => {
            setFrameIndex((prev) =>
              prev < DEMO_FRAMES.length - 1 ? prev + 1 : prev
            );
          }, 12000);
        }
      }
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
      }
    };
  }, [hasStarted, isPlaying, isLastFrame, frameIndex, frame.caption]);

  // Stop auto-play on last frame
  useEffect(() => {
    if (isLastFrame && isPlaying) {
      setIsPlaying(false);
    }
  }, [isLastFrame, isPlaying]);

  const handleNext = useCallback(() => {
    if (frameIndex < DEMO_FRAMES.length - 1) {
      setFrameIndex((prev) => prev + 1);
    }
  }, [frameIndex]);

  const handleBack = useCallback(() => {
    if (frameIndex > 0) {
      setFrameIndex((prev) => prev - 1);
    }
  }, [frameIndex]);

  const handlePlayAgain = useCallback(() => {
    setFrameIndex(0);
    setIsPlaying(true);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Compute seats from demo players (viewer = seat 0)
  const displaySeats = getDisplaySeating(DEMO_PLAYERS, 0);

  // Demo leaderboard data
  const leaderboard = [
    { username: "Demo_Vega", pnl: 10 },
    { username: "Demo_Theta", pnl: 5 },
    { username: "Demo_Gamma", pnl: 3 },
    { username: "Demo_Delta", pnl: -1 },
    { username: "Demo_Alpha", pnl: -7 },
    { username: "Demo_Zeta", pnl: -10 },
  ];

  if (!hasStarted) {
    return (
      <div className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 animate-fade-in-up">
          <h1 className="text-[48px] font-extrabold tracking-[0.15em] text-text-primary mb-4">
            AXXEL TUTORIAL
          </h1>
          <p className="text-text-secondary text-[16px] max-w-lg mx-auto mb-8">
            Learn the core mechanics, math, and strategies of digit sum trading in this voice-guided interactive demo. Make sure your volume is turned up!
          </p>
          <button
            onClick={() => setHasStarted(true)}
            className="px-8 py-4 bg-buy-green hover:bg-green-500 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(39,185,15,0.3)] transition-all hover:scale-105"
          >
            Start Guided Demo
          </button>
        </div>
        
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4A24E] via-transparent to-transparent"></div>
      </div>
    );
  }

  if (isLeaderboardFrame) {
    return (
      <div className="h-screen flex flex-col relative">
        {/* Leaderboard view */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-[#D4A24E] text-[12px]">▲</span>
              <h1 className="text-[32px] font-extrabold tracking-[0.15em] text-text-primary">
                GAME OVER
              </h1>
              <span className="text-[#D4A24E] text-[12px]">▲</span>
            </div>

            <div className="flex gap-2 justify-center mb-3">
              {DEMO_DIGITS.map((d, i) => (
                <DigitTile key={i} digit={String(d)} index={i} />
              ))}
            </div>
            <p className="text-text-secondary text-[14px]">
              Settlement Price: <span className="text-text-primary font-bold text-[20px]">{DEMO_SETTLEMENT_PRICE}</span>
            </p>
          </div>

          <div className="w-full max-w-md bg-panel-bg rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="flex items-center bg-pill-bg px-5 py-3">
              <span className="w-8 text-[11px] font-medium text-text-secondary">#</span>
              <span className="flex-1 text-[11px] font-medium text-text-secondary">Player</span>
              <span className="w-20 text-right text-[11px] font-medium text-text-secondary">PnL</span>
            </div>
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.username}
                className={`flex items-center px-5 py-3 ${idx % 2 === 0 ? "bg-white/[0.02]" : ""} ${idx === 0 ? "border-l-2 border-l-[#D4A24E]" : ""}`}
              >
                <span className={`w-8 text-[14px] font-bold ${idx === 0 ? "text-[#D4A24E]" : "text-text-muted"}`}>
                  {idx + 1}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-[28px] h-[28px] rounded-full bg-seat-fill flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">{entry.username[5]}</span>
                  </div>
                  <span className="text-[13px] font-medium text-text-primary">{entry.username}</span>
                </div>
                <span className={`w-20 text-right text-[14px] font-bold tabular-nums ${entry.pnl >= 0 ? "text-buy-green" : "text-sell-red"}`}>
                  {entry.pnl >= 0 ? "+" : ""}{entry.pnl.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DemoCaption
          caption={frame.caption}
          currentStep={frameIndex}
          totalSteps={DEMO_FRAMES.length}
          onNext={handleNext}
          onBack={handleBack}
          onPlayAgain={handlePlayAgain}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          isLastFrame={isLastFrame}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* ── Left Region: Table Area ── */}
      <div className="flex-[68] flex flex-col min-w-0">
        <GameHeader
          round={frame.round || 1}
          secondsRemaining={
            frame.timeRemainingLabel
              ? (() => {
                  const parts = frame.timeRemainingLabel.split(":");
                  return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
                })()
              : 0
          }
        />
        <TableSurface
          digitMask={frame.digitMask}
          seats={displaySeats}
          animateReveal={true}
        />

        {/* Event highlight badge */}
        {frame.highlightedEvent && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-fade-in-up">
            <div className={`
              px-5 py-2.5 rounded-lg text-[12px] font-semibold backdrop-blur-sm border
              ${frame.highlightedEvent.type === "ORDER_FILLED"
                ? "bg-buy-green/20 border-buy-green/30 text-buy-green"
                : frame.highlightedEvent.type === "POSITION_CAPPED"
                  ? "bg-sell-red/20 border-sell-red/30 text-sell-red"
                  : frame.highlightedEvent.type === "SETTLEMENT"
                    ? "bg-[#D4A24E]/20 border-[#D4A24E]/30 text-[#D4A24E]"
                    : "bg-seat-fill/20 border-seat-fill/30 text-seat-fill"
              }
            `}>
              {frame.highlightedEvent.detail}
            </div>
          </div>
        )}
      </div>

      {/* ── Right Region: Sidebar (read-only) ── */}
      <div className="flex-[32] flex flex-col bg-panel-bg border-l border-white/[0.06] overflow-y-auto">
        <div className="p-6 space-y-4">
          <StatsRow pnl={0} openPositions={0} balance={0} />

          {/* Read-only Order Entry */}
          <div className="rounded-lg border border-white/[0.06] p-4 space-y-3 opacity-50 pointer-events-none">
            <div className="flex gap-2">
              <div className="flex-1 bg-input-bg rounded-lg px-4 py-2.5 text-[14px] text-input-placeholder">
                Enter Price
              </div>
              <div className="w-[72px] bg-buy-green/70 rounded-lg flex items-center justify-center text-[13px] font-bold text-white">
                Buy
              </div>
              <div className="w-[72px] bg-sell-red/70 rounded-lg flex items-center justify-center text-[13px] font-bold text-white">
                Sell
              </div>
            </div>
            <div className="w-full bg-place-green/70 rounded-lg py-3 text-center text-[14px] font-bold text-white">
              Place Order →
            </div>
          </div>

          {/* Working Orders */}
          <div>
            <div className="panel-divider">
              <span>Working Orders</span>
            </div>
            <div className="flex items-center bg-pill-bg rounded-md px-3 py-2 mb-1">
              <span className="flex-1 text-[11px] font-medium text-text-secondary">Action</span>
              <span className="flex-1 text-center text-[11px] font-medium text-text-secondary">Price</span>
              <span className="w-[60px] text-right text-[11px] font-medium text-text-secondary">Cancel</span>
            </div>
            {frame.workingOrdersSnapshot.map((order, idx) => (
              <div key={idx} className="flex items-center px-3 py-2 rounded-md">
                <span className={`flex-1 text-[12px] font-semibold ${order.side === "BUY" ? "text-buy-green" : "text-sell-red"}`}>
                  {order.side === "BUY" ? "Buy" : "Sell"}
                </span>
                <span className="flex-1 text-center text-[12px] font-medium text-text-primary tabular-nums">
                  {order.price}
                </span>
                <span className="w-[60px] text-right text-[11px] text-text-muted opacity-40">✕</span>
              </div>
            ))}
          </div>

          {/* Trades */}
          <div>
            <div className="panel-divider">
              <span>Trades</span>
            </div>
            <div className="flex items-center bg-pill-bg rounded-md px-3 py-2 mb-1">
              <span className="flex-1 text-[11px] font-medium text-text-secondary">Partner</span>
              <span className="flex-1 text-center text-[11px] font-medium text-text-secondary">Price</span>
              <span className="flex-1 text-right text-[11px] font-medium text-text-secondary">Action</span>
            </div>
            {frame.tradesPanelSnapshot.map((trade, idx) => (
              <div key={idx} className="flex items-center bg-trade-row-bg rounded-md px-3 py-2.5 mb-0.5">
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-[22px] h-[22px] rounded-full bg-seat-fill flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{trade.partner[5]}</span>
                  </div>
                </div>
                <span className="flex-1 text-center text-[13px] font-semibold text-trade-price tabular-nums">
                  {trade.price}
                </span>
                <span className="flex-1 text-right text-[12px] font-semibold text-trade-price">
                  {trade.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Caption overlay */}
      <DemoCaption
        caption={frame.caption}
        currentStep={frameIndex}
        totalSteps={DEMO_FRAMES.length}
        onNext={handleNext}
        onBack={handleBack}
        onPlayAgain={handlePlayAgain}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        isLastFrame={isLastFrame}
      />
    </div>
  );
}
