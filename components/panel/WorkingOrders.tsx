"use client";

import type { Order } from "../../lib/types";

interface WorkingOrdersProps {
  orders: Order[];
  selfUsername: string;
}

export default function WorkingOrders({ orders, selfUsername }: WorkingOrdersProps) {
  const myOrders = orders.filter((o) => o.username === selfUsername);

  return (
    <div>
      {/* Section divider with centered label */}
      <div className="panel-divider">
        <span>Working Orders</span>
      </div>

      {/* Table header */}
      <div className="flex items-center bg-pill-bg rounded-md px-3 py-2 mb-1">
        <span className="flex-1 text-[11px] font-medium text-text-secondary">
          Action
        </span>
        <span className="flex-1 text-center text-[11px] font-medium text-text-secondary">
          Price
        </span>
        <span className="w-[60px] text-right text-[11px] font-medium text-text-secondary">
          Cancel
        </span>
      </div>

      {/* Order rows */}
      <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
        {myOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center px-3 py-2 rounded-md hover:bg-white/[0.03] transition-colors"
          >
            <span
              className={`
                flex-1 text-[12px] font-semibold
                ${order.side === "BUY" ? "text-buy-green" : "text-sell-red"}
              `}
            >
              {order.side === "BUY" ? "Buy" : "Sell"}
            </span>
            <span className="flex-1 text-center text-[12px] font-medium text-text-primary tabular-nums">
              {order.price}
            </span>
            <span className="w-[60px] text-right">
              <button
                className="text-[11px] text-text-muted cursor-not-allowed opacity-40"
                disabled
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
