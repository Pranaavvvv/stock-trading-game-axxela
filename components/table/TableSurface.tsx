"use client";

import DigitTile from "./DigitTile";
import SeatBadge from "./SeatBadge";
import type { DisplaySeat } from "../../lib/seatRotation";

interface TableSurfaceProps {
  digitMask: (string | null)[];
  seats: DisplaySeat[];
  animateReveal?: boolean;
}

/**
 * Compute x,y position for a seat at a given angle on a stadium-shaped perimeter.
 * The oval is positioned within a bounding box of width W and height H.
 * Angles: 90=top, 270=bottom, 0=right, 180=left (CSS convention)
 */
function getSeatPosition(
  angleDeg: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  // Convert to radians, adjust for CSS coordinate system
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const rx = containerWidth / 2;
  const ry = containerHeight / 2;
  // Offset seats slightly outside the ring
  const offsetX = rx + 42;
  const offsetY = ry + 42;

  return {
    x: containerWidth / 2 + offsetX * Math.cos(angleRad),
    y: containerHeight / 2 + offsetY * Math.sin(angleRad),
  };
}

/**
 * Compute pip marker position on the ring itself
 */
function getPipPosition(
  angleDeg: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const rx = containerWidth / 2 - 2;
  const ry = containerHeight / 2 - 2;

  return {
    x: containerWidth / 2 + rx * Math.cos(angleRad),
    y: containerHeight / 2 + ry * Math.sin(angleRad),
  };
}

export default function TableSurface({
  digitMask,
  seats,
  animateReveal = false,
}: TableSurfaceProps) {
  // Table dimensions as percentages of the container
  const tableWidth = 620;
  const tableHeight = 300;

  return (
    <div className="relative flex items-center justify-center flex-1 px-8">
      {/* Outer glow ellipse — the felt "bleed" beyond the ring */}
      <div
        className="absolute animate-glow-pulse"
        style={{
          width: tableWidth + 80,
          height: tableHeight + 80,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, var(--table-felt-inner) 0%, var(--table-felt-mid) 40%, var(--table-felt-outer) 70%, transparent 100%)",
          filter: "blur(20px)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* The ring (stadium shape) */}
      <div
        className="relative"
        style={{
          width: tableWidth,
          height: tableHeight,
        }}
      >
        {/* Ring border */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: "999px",
            border: "2px solid var(--ring-stroke)",
            background:
              "radial-gradient(ellipse at center, var(--table-felt-inner) 0%, var(--table-felt-mid) 50%, var(--table-felt-outer) 100%)",
            filter: "drop-shadow(0 0 12px var(--ring-glow))",
          }}
        />

        {/* Pip markers on the ring */}
        {seats.map((seat) => {
          const pos = getPipPosition(seat.angle, tableWidth, tableHeight);
          return (
            <div
              key={`pip-${seat.displaySeatIndex}`}
              className="absolute w-[10px] h-[10px] rounded-full border-2 border-ring-stroke bg-transparent"
              style={{
                left: pos.x - 5,
                top: pos.y - 5,
              }}
            />
          );
        })}

        {/* Center content — digit tiles + wordmark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Digit tiles row */}
          <div className="flex gap-2 mb-4">
            {digitMask.map((digit, idx) => (
              <DigitTile
                key={idx}
                digit={digit}
                index={idx}
                animate={animateReveal}
              />
            ))}
          </div>

          {/* AXXEL wordmark */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#D4A24E] text-[10px] leading-none">▲</span>
              <span
                className="text-text-primary text-[22px] font-extrabold tracking-[0.15em] leading-none"
                style={{ letterSpacing: "0.15em" }}
              >
                AXXEL
              </span>
              <span className="text-[#D4A24E] text-[10px] leading-none">▲</span>
            </div>
            <span className="text-text-muted text-[9px] tracking-[0.2em] mt-1 uppercase">
              Digit Sum Trading
            </span>
          </div>
        </div>

        {/* Seat badges positioned around the oval */}
        {seats.map((seat) => {
          const pos = getSeatPosition(seat.angle, tableWidth, tableHeight);
          return (
            <div
              key={`seat-${seat.displaySeatIndex}`}
              className="absolute z-20"
              style={{
                left: pos.x - 29,
                top: pos.y - 29,
              }}
            >
              <SeatBadge
                seat={seat}
                isSelf={seat.displaySeatIndex === 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
