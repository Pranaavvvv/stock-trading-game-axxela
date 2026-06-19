"use client";

import type { TradeRecord, PlayerInfo } from "../../lib/types";
import { getDisplayLetter } from "../../lib/seatRotation";

interface TradesPanelProps {
  trades: TradeRecord[];
  selfUsername: string;
  allPlayers: PlayerInfo[];
  selfAbsoluteSeatIndex: number;
}

export default function TradesPanel({
  trades,
  selfUsername,
  allPlayers,
  selfAbsoluteSeatIndex,
}: TradesPanelProps) {
  // Only show trades involving this player, newest first
  const myTrades = trades
    .filter((t) => t.buyer === selfUsername || t.seller === selfUsername)
    .reverse();

  return (
    <div>
      {/* Section divider with centered label */}
      <div className="panel-divider">
        <span>Trades</span>
      </div>

      {/* Table header */}
      <div className="flex items-center bg-pill-bg rounded-md px-3 py-2 mb-1">
        <span className="flex-1 text-[11px] font-medium text-text-secondary">
          Partner
        </span>
        <span className="flex-1 text-center text-[11px] font-medium text-text-secondary">
          Price
        </span>
        <span className="flex-1 text-right text-[11px] font-medium text-text-secondary">
          Action
        </span>
      </div>

      {/* Trade rows */}
      <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
        {myTrades.map((trade, idx) => {
          const isBuyer = trade.buyer === selfUsername;
          const partnerUsername = isBuyer ? trade.seller : trade.buyer;
          const partnerLetter = getDisplayLetter(
            allPlayers,
            selfAbsoluteSeatIndex,
            partnerUsername
          );
          const action = isBuyer ? "Buy" : "Sell";

          return (
            <div
              key={`${trade.timestamp}-${idx}`}
              className="flex items-center bg-trade-row-bg rounded-md px-3 py-2.5 border-b border-white/[0.08] last:border-b-0"
            >
              {/* Partner badge */}
              <div className="flex-1 flex items-center gap-2">
                <div className="w-[24px] h-[24px] rounded-full bg-seat-fill flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white">
                    {partnerLetter}
                  </span>
                </div>
                <span className="text-[12px] text-text-secondary">
                  {partnerLetter}
                </span>
              </div>

              {/* Price */}
              <span className="flex-1 text-center text-[13px] font-semibold text-trade-price tabular-nums">
                {trade.price}
              </span>

              {/* Action */}
              <span className="flex-1 text-right text-[12px] font-semibold text-trade-price">
                {action}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
