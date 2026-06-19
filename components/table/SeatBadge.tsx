"use client";

import type { DisplaySeat } from "../../lib/seatRotation";

interface SeatBadgeProps {
  seat: DisplaySeat;
  isSelf?: boolean;
}

export default function SeatBadge({ seat, isSelf = false }: SeatBadgeProps) {
  return (
    <div
      className={`
        flex items-center justify-center
        w-[58px] h-[58px] rounded-full
        font-bold text-[22px] text-seat-text select-none
        border-2 transition-all duration-300
        ${seat.connected
          ? "bg-seat-fill border-seat-border shadow-[0_0_12px_rgba(41,171,226,0.3)]"
          : "bg-seat-fill/40 border-seat-border/40 opacity-50"
        }
        ${isSelf ? "ring-2 ring-white/30 ring-offset-2 ring-offset-transparent" : ""}
      `}
      title={seat.username}
    >
      {seat.displayLetter}
    </div>
  );
}
