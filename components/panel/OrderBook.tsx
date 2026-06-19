import React from "react";
import type { OrderSide } from "../../lib/types";

interface OrderBookProps {
  bids: { username: string; price: number; timestamp: number }[];
  asks: { username: string; price: number; timestamp: number }[];
  selfUsername: string;
  onAcceptOrder: (side: OrderSide, price: number) => void;
  disabled?: boolean;
}

export default function OrderBook({
  bids,
  asks,
  selfUsername,
  onAcceptOrder,
  disabled = false,
}: OrderBookProps) {
  return (
    <div className="bg-panel-bg-alt rounded-xl p-5 border border-white/[0.06] flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-widest">
        Market Order Book
      </h3>

      <div className="flex gap-4">
        {/* ASKS -> AVAILABLE TO BUY */}
        <div className="flex-1">
          <h4 className="text-[12px] font-medium text-buy-green mb-2 text-center border-b border-buy-green/20 pb-1">
            AVAILABLE TO BUY
          </h4>
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {asks.length === 0 ? (
              <div className="text-[11px] text-text-muted text-center py-2">No sell offers</div>
            ) : (
              asks.map((ask, i) => {
                const isMine = ask.username === selfUsername;
                return (
                  <div
                    key={`ask-${ask.username}-${ask.price}-${ask.timestamp}-${i}`}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      isMine ? "bg-white/[0.04]" : "bg-white/[0.02] hover:bg-white/[0.06]"
                    } transition-colors group`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-sell-red">{ask.price}</span>
                      <span className="text-[11px] text-text-muted truncate max-w-[70px]" title={ask.username}>
                        {isMine ? "You" : ask.username}
                      </span>
                    </div>
                    {!isMine && (
                      <button
                        disabled={disabled}
                        onClick={() => onAcceptOrder("BUY", ask.price)}
                        className="px-3 py-1.5 text-[11px] font-bold text-white bg-buy-green hover:bg-green-500 active:brightness-90 rounded shadow-[0_0_10px_rgba(39,185,15,0.2)] disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BIDS -> AVAILABLE TO SELL */}
        <div className="flex-1">
          <h4 className="text-[12px] font-medium text-sell-red mb-2 text-center border-b border-sell-red/20 pb-1">
            AVAILABLE TO SELL
          </h4>
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {bids.length === 0 ? (
              <div className="text-[11px] text-text-muted text-center py-2">No buy offers</div>
            ) : (
              bids.map((bid, i) => {
                const isMine = bid.username === selfUsername;
                return (
                  <div
                    key={`bid-${bid.username}-${bid.price}-${bid.timestamp}-${i}`}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      isMine ? "bg-white/[0.04]" : "bg-white/[0.02] hover:bg-white/[0.06]"
                    } transition-colors group`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-buy-green">{bid.price}</span>
                      <span className="text-[11px] text-text-muted truncate max-w-[70px]" title={bid.username}>
                        {isMine ? "You" : bid.username}
                      </span>
                    </div>
                    {!isMine && (
                      <button
                        disabled={disabled}
                        onClick={() => onAcceptOrder("SELL", bid.price)}
                        className="px-3 py-1.5 text-[11px] font-bold text-white bg-sell-red hover:bg-red-500 active:brightness-90 rounded shadow-[0_0_10px_rgba(235,63,63,0.2)] disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Sell
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
