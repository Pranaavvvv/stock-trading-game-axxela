"use client";

import { useRouter } from "next/navigation";
import DigitTile from "../../components/table/DigitTile";

export default function HowToPlayPage() {
  const router = useRouter();

  // Example reveal schedule data
  const revealSchedule = [
    { round: 1, mask: [null, null, null, null, null, null] },
    { round: 2, mask: ["4", null, null, null, null, null] },
    { round: 3, mask: ["4", "8", null, null, null, null] },
    { round: 4, mask: ["4", "8", "3", null, null, null] },
    { round: 5, mask: ["4", "8", "3", "1", null, null] },
    { round: 6, mask: ["4", "8", "3", "1", "0", null] },
  ];

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/lobby")}
          className="
            flex items-center gap-2 text-[13px] text-text-secondary
            hover:text-text-primary transition-colors mb-8
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Lobby
        </button>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-[#D4A24E] text-[12px]">▲</span>
            <h1 className="text-[32px] font-extrabold tracking-[0.15em] text-text-primary">
              HOW TO PLAY
            </h1>
            <span className="text-[#D4A24E] text-[12px]">▲</span>
          </div>
          <p className="text-text-muted text-[13px] tracking-wider uppercase">
            Learn the rules of AXXEL
          </p>
        </div>

        {/* ── Section 1: The Premise ── */}
        <section className="mb-10 animate-fade-in-up">
          <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-[18px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-seat-fill flex items-center justify-center text-[12px] font-bold text-white">
                1
              </span>
              The Premise
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              A hidden 6-digit number is generated at the start of each game. The{" "}
              <span className="text-text-primary font-semibold">digit sum</span>{" "}
              (the total when you add all 6 digits together) is the underlying asset
              you&apos;re trading. Your goal: buy contracts below the true sum and sell
              above it to profit when the final value is revealed.
            </p>
            <div className="mt-4 p-3 bg-pill-bg rounded-lg">
              <p className="text-[12px] text-text-muted">
                Example: If the number is <span className="text-text-primary font-mono">4 8 3 1 0 9</span>,
                the sum is <span className="text-text-primary font-bold">4+8+3+1+0+9 = 25</span>.
                The possible range is 0 (all zeros) to 54 (all nines).
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 2: Reveal Schedule ── */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-[18px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-seat-fill flex items-center justify-center text-[12px] font-bold text-white">
                2
              </span>
              The Reveal Schedule
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed mb-5">
              The game has <span className="text-text-primary font-semibold">6 rounds</span>,
              each lasting 90 seconds. One new digit is revealed at the start of
              each round (starting from Round 2). You trade based on what you know so far.
            </p>

            <div className="space-y-3">
              {revealSchedule.map(({ round, mask }) => (
                <div key={round} className="flex items-center gap-4">
                  <span className="text-[12px] font-semibold text-text-muted w-16 shrink-0">
                    Round {round}
                  </span>
                  <div className="flex gap-1.5">
                    {mask.map((d, i) => (
                      <div key={i} className="scale-[0.7] origin-left">
                        <DigitTile digit={d} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06]">
                <span className="text-[12px] font-semibold text-[#D4A24E] w-16 shrink-0">
                  Settle
                </span>
                <div className="flex gap-1.5">
                  {["4", "8", "3", "1", "0", "9"].map((d, i) => (
                    <div key={i} className="scale-[0.7] origin-left">
                      <DigitTile digit={d} index={i} />
                    </div>
                  ))}
                </div>
                <span className="text-[12px] text-text-secondary ml-2">
                  Sum = <span className="text-text-primary font-bold">25</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Placing Orders ── */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-[18px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-seat-fill flex items-center justify-center text-[12px] font-bold text-white">
                3
              </span>
              How to Place an Order
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed mb-4">
              Enter a <span className="text-text-primary font-semibold">price</span> (0–54)
              and choose <span className="text-buy-green font-semibold">Buy</span> or{" "}
              <span className="text-sell-red font-semibold">Sell</span>:
            </p>
            <ul className="space-y-2 text-[13px] text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-buy-green font-bold mt-0.5">●</span>
                <span>
                  <span className="text-text-primary font-semibold">Buy</span> = you think
                  the final sum will be <em>higher</em> than your price
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sell-red font-bold mt-0.5">●</span>
                <span>
                  <span className="text-text-primary font-semibold">Sell</span> = you think
                  the final sum will be <em>lower</em> than your price
                </span>
              </li>
            </ul>

            {/* Illustrative order entry (non-interactive) */}
            <div className="mt-5 pointer-events-none opacity-70">
              <div className="rounded-lg border border-white/[0.06] p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 bg-input-bg rounded-lg px-4 py-2.5 text-[14px] text-text-primary font-medium">
                    28
                  </div>
                  <div className="w-[72px] bg-buy-green rounded-lg flex items-center justify-center text-[13px] font-bold text-white scale-[1.03]">
                    Buy
                  </div>
                  <div className="w-[72px] bg-sell-red/70 rounded-lg flex items-center justify-center text-[13px] font-bold text-white">
                    Sell
                  </div>
                </div>
                <div className="w-full bg-place-green rounded-lg py-3 text-center text-[14px] font-bold text-white">
                  Place Order →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Position Limits ── */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-[18px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-seat-fill flex items-center justify-center text-[12px] font-bold text-white">
                4
              </span>
              Position Limits
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed mb-4">
              Your net position is capped at{" "}
              <span className="text-text-primary font-semibold">-2 to +2</span>.
              This means you can hold at most 2 contracts in either direction.
            </p>
            <div className="flex gap-3">
              <div className="flex-1 bg-pill-bg rounded-lg p-3">
                <div className="text-[11px] text-text-muted mb-1">At +2 position:</div>
                <div className="w-full bg-disabled-grey rounded-lg py-2 text-center text-[11px] font-bold text-white/60">
                  Max Long Limit Reached
                </div>
              </div>
              <div className="flex-1 bg-pill-bg rounded-lg p-3">
                <div className="text-[11px] text-text-muted mb-1">At -2 position:</div>
                <div className="w-full bg-disabled-grey rounded-lg py-2 text-center text-[11px] font-bold text-white/60">
                  Max Short Limit Reached
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: How Trades Happen ── */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-[18px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-seat-fill flex items-center justify-center text-[12px] font-bold text-white">
                5
              </span>
              How Trades Happen
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              When your price overlaps someone else&apos;s, a trade fills{" "}
              <span className="text-text-primary font-semibold">
                automatically — instantly, no confirmation needed
              </span>
              . If no one is willing to take the other side at your price, your
              order sits in the book as a &quot;resting order&quot; until someone matches it
              or the round ends. All unfilled orders are cleared between rounds.
            </p>
          </div>
        </section>

        {/* ── Section 6: Settlement ── */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-[18px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-seat-fill flex items-center justify-center text-[12px] font-bold text-white">
                6
              </span>
              Settlement
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              After Round 6 ends, the final digit is revealed and the true sum is
              calculated. Any open position you hold is automatically closed at the
              settlement price (the true sum). Your{" "}
              <span className="text-text-primary font-semibold">
                profit or loss
              </span>{" "}
              comes from the difference between your average entry price and the
              settlement price.
            </p>
            <div className="mt-4 p-3 bg-pill-bg rounded-lg">
              <p className="text-[12px] text-text-muted">
                Example: You bought at 22 and the sum is 25 → you profit{" "}
                <span className="text-buy-green font-bold">+3</span> per contract.
                You sold at 28 and the sum is 25 → you profit{" "}
                <span className="text-buy-green font-bold">+3</span> per contract.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 7: CTAs ── */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/demo")}
              className="
                px-6 py-3 rounded-lg font-bold text-[14px] text-text-primary
                border border-white/10 hover:border-white/20
                hover:bg-white/[0.03] transition-all duration-200
              "
            >
              Watch a Demo Game
            </button>
            <button
              onClick={() => router.push("/lobby")}
              className="
                px-6 py-3 rounded-lg font-bold text-[14px] text-white
                bg-buy-green hover:brightness-110 active:brightness-90
                transition-all duration-200
              "
            >
              Back to Lobby
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
