"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DigitTile from "../../components/table/DigitTile";
import type { GameOverMessage } from "../../lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<GameOverMessage | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("axxel_gameOver");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        router.push("/lobby");
      }
    } else {
      router.push("/lobby");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Loading results...</p>
      </div>
    );
  }

  const maxPnl = Math.max(...data.leaderboard.map((e) => Math.abs(e.pnl)), 1);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-[#D4A24E] text-[14px]">▲</span>
          <h1 className="text-[36px] font-extrabold tracking-[0.15em] text-text-primary">
            AXXEL
          </h1>
          <span className="text-[#D4A24E] text-[14px]">▲</span>
        </div>
        <p className="text-text-secondary text-[16px] font-medium mb-6">
          Game Complete
        </p>

        {/* Revealed digits */}
        <div className="flex gap-2 justify-center mb-4">
          {data.final_digits.map((digit, idx) => (
            <DigitTile key={idx} digit={String(digit)} index={idx} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-text-secondary text-[14px]">Settlement Sum:</span>
          <span className="text-[28px] font-bold text-text-primary tabular-nums">
            {data.settlement_price}
          </span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="text-[16px] font-semibold text-text-primary text-center mb-4">
          Leaderboard
        </h2>

        <div className="bg-panel-bg rounded-xl border border-white/[0.06] overflow-hidden">
          {/* Header */}
          <div className="flex items-center bg-pill-bg px-5 py-3">
            <span className="w-8 text-[11px] font-medium text-text-secondary">#</span>
            <span className="flex-1 text-[11px] font-medium text-text-secondary">Player</span>
            <span className="w-24 text-right text-[11px] font-medium text-text-secondary">
              PnL
            </span>
          </div>

          {/* Rows */}
          {data.leaderboard.map((entry, idx) => {
            const isPositive = entry.pnl >= 0;
            const barWidth = Math.abs(entry.pnl) / maxPnl * 60;

            return (
              <div
                key={entry.username}
                className={`
                  flex items-center px-5 py-3.5
                  ${idx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}
                  ${idx === 0 ? "border-l-2 border-l-[#D4A24E]" : ""}
                  transition-all duration-300
                `}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span className={`
                  w-8 text-[14px] font-bold
                  ${idx === 0 ? "text-[#D4A24E]" : idx === 1 ? "text-text-secondary" : "text-text-muted"}
                `}>
                  {idx + 1}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-[30px] h-[30px] rounded-full bg-seat-fill flex items-center justify-center">
                    <span className="text-[12px] font-bold text-white">
                      {entry.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[13px] font-medium text-text-primary">
                    {entry.username}
                  </span>
                </div>
                <div className="w-24 flex items-center justify-end gap-2">
                  {/* Mini bar */}
                  <div className="w-[60px] h-[6px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPositive ? "bg-buy-green" : "bg-sell-red"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span
                    className={`
                      text-[14px] font-bold tabular-nums
                      ${isPositive ? "text-buy-green" : "text-sell-red"}
                    `}
                  >
                    {isPositive ? "+" : ""}
                    {entry.pnl.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={() => {
            sessionStorage.removeItem("axxel_gameOver");
            router.push("/lobby");
          }}
          className="
            px-8 py-3 rounded-lg font-bold text-[14px] text-white
            bg-buy-green hover:brightness-110 active:brightness-90
            transition-all duration-200
          "
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
