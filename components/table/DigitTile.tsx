"use client";

interface DigitTileProps {
  digit: string | null;
  index: number;
  animate?: boolean;
}

export default function DigitTile({ digit, index, animate = false }: DigitTileProps) {
  const isRevealed = digit !== null;

  return (
    <div
      className={`
        relative flex items-center justify-center
        w-[48px] h-[56px] rounded-lg
        font-bold text-[32px] tabular-nums select-none
        transition-all duration-300
        ${isRevealed
          ? "bg-tile-revealed-bg text-tile-revealed-text shadow-[0_0_8px_rgba(232,213,240,0.4)]"
          : "bg-tile-empty-bg border border-tile-empty-border"
        }
        ${animate && isRevealed ? "animate-digit-reveal" : ""}
      `}
      style={{ perspective: "400px" }}
      data-tile-index={index}
    >
      {isRevealed && (
        <span className="leading-none">{digit}</span>
      )}
    </div>
  );
}
