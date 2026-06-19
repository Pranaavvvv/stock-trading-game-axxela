"use client";

interface StatsRowProps {
  pnl: number;
  openPositions: number;
  balance: number;
}

export default function StatsRow({ pnl, openPositions, balance }: StatsRowProps) {
  const pnlColor =
    pnl > 0
      ? "text-buy-green"
      : pnl < 0
        ? "text-sell-red"
        : "text-text-primary";

  const balanceColor =
    balance > 0
      ? "text-buy-green"
      : balance < 0
        ? "text-sell-red"
        : "text-text-primary";

  return (
    <div className="flex gap-3 px-1">
      <div className="flex-1 flex items-center justify-center bg-pill-bg rounded-lg py-3 px-4">
        <span className="text-[13px] font-medium text-pill-text">
          PNL:{" "}
          <span className={`font-semibold tabular-nums ${pnlColor}`}>
            {pnl >= 0 ? "+" : ""}
            {pnl.toFixed(1)}
          </span>
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center bg-pill-bg rounded-lg py-3 px-4">
        <span className="text-[13px] font-medium text-pill-text">
          Positions:{" "}
          <span className="font-semibold tabular-nums">{openPositions}</span>
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center bg-pill-bg rounded-lg py-3 px-4">
        <span className="text-[13px] font-medium text-pill-text">
          Wallet:{" "}
          <span className={`font-semibold tabular-nums ${balanceColor}`}>
            {balance >= 0 ? "+" : ""}
            {balance}
          </span>
        </span>
      </div>
    </div>
  );
}
