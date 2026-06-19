"use client";

import { useState } from "react";
import type { OrderSide } from "../../lib/types";

interface OrderEntryProps {
  onPlaceOrder: (side: OrderSide, price: number) => void;
  position: number;
  restingBuyCount: number;
  restingSellCount: number;
  disabled?: boolean;
  readOnly?: boolean;
  /** Pre-filled price for demo/illustrative mode */
  illustrativePrice?: number;
  /** Pre-selected side for demo/illustrative mode */
  illustrativeSide?: OrderSide;
}

export default function OrderEntry({
  onPlaceOrder,
  position,
  restingBuyCount,
  restingSellCount,
  disabled = false,
  readOnly = false,
  illustrativePrice,
  illustrativeSide,
}: OrderEntryProps) {
  const [selectedSide, setSelectedSide] = useState<OrderSide>(
    illustrativeSide || "BUY"
  );
  const [priceInput, setPriceInput] = useState(
    illustrativePrice !== undefined ? String(illustrativePrice) : ""
  );

  const potentialLong = position + restingBuyCount;
  const potentialShort = position - restingSellCount;
  const maxLongReached = potentialLong >= 2;
  const maxShortReached = potentialShort <= -2;

  const isFullyDisabled = disabled || readOnly;
  const buyDisabled = isFullyDisabled || maxLongReached;
  const sellDisabled = isFullyDisabled || maxShortReached;

  const handleSubmit = () => {
    if (readOnly || disabled) return;
    const price = parseInt(priceInput, 10);
    if (isNaN(price) || price < 0 || price > 54) return;

    if (selectedSide === "BUY" && maxLongReached) return;
    if (selectedSide === "SELL" && maxShortReached) return;

    onPlaceOrder(selectedSide, price);
    setPriceInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className={`
        rounded-lg border border-white/[0.06] p-4 space-y-3
        transition-all duration-300
        ${isFullyDisabled ? "opacity-40 pointer-events-none" : ""}
      `}
    >
      {/* Row 1: Price + Buy + Sell */}
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          max={54}
          placeholder="Enter Price"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isFullyDisabled}
          className="
            flex-1 bg-input-bg text-text-primary text-[14px] font-medium
            rounded-lg px-4 py-2.5
            placeholder:text-input-placeholder
            outline-none border border-transparent
            focus:border-ring-stroke/40
            tabular-nums
            [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
          "
          id="order-price-input"
        />

        {/* Buy Button */}
        <button
          onClick={() => !buyDisabled && setSelectedSide("BUY")}
          disabled={buyDisabled}
          className={`
            relative w-[72px] rounded-lg font-bold text-[13px] text-white
            transition-all duration-200
            ${buyDisabled
              ? "bg-disabled-grey cursor-not-allowed"
              : selectedSide === "BUY"
                ? "bg-buy-green scale-[1.03] shadow-[0_0_8px_rgba(39,185,15,0.3)]"
                : "bg-buy-green/70 hover:bg-buy-green"
            }
          `}
          id="order-buy-btn"
        >
          Buy
          {maxLongReached && (
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-sell-red whitespace-nowrap font-medium">
              Max Long Limit
            </span>
          )}
        </button>

        {/* Sell Button */}
        <button
          onClick={() => !sellDisabled && setSelectedSide("SELL")}
          disabled={sellDisabled}
          className={`
            relative w-[72px] rounded-lg font-bold text-[13px] text-white
            transition-all duration-200
            ${sellDisabled
              ? "bg-disabled-grey cursor-not-allowed"
              : selectedSide === "SELL"
                ? "bg-sell-red scale-[1.03] shadow-[0_0_8px_rgba(192,57,43,0.3)]"
                : "bg-sell-red/70 hover:bg-sell-red"
            }
          `}
          id="order-sell-btn"
        >
          Sell
          {maxShortReached && (
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-sell-red whitespace-nowrap font-medium">
              Max Short Limit
            </span>
          )}
        </button>
      </div>

      {/* Row 2: Place Order */}
      <button
        onClick={handleSubmit}
        disabled={isFullyDisabled}
        className={`
          w-full flex items-center justify-center gap-2
          rounded-lg py-3 font-bold text-[14px] text-white
          transition-all duration-200
          ${isFullyDisabled
            ? "bg-disabled-grey cursor-not-allowed"
            : selectedSide === "BUY"
              ? "bg-place-green hover:brightness-110 active:brightness-90"
              : "bg-place-red hover:brightness-110 active:brightness-90"
          }
        `}
        id="place-order-btn"
      >
        Place Order
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
