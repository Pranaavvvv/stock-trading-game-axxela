"use client";

interface GameHeaderProps {
  round: number;
  secondsRemaining: number;
  isPaused?: boolean;
  isAdmin?: boolean;
  onTogglePause?: () => void;
}

export default function GameHeader({ round, secondsRemaining, isPaused, isAdmin, onTogglePause }: GameHeaderProps) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const isUrgent = secondsRemaining <= 10 && secondsRemaining > 0;

  return (
    <div className="flex items-baseline justify-between px-8 pt-6 pb-2">
      <h1 className="text-[28px] font-semibold text-text-primary tracking-tight">
        Round {round}
      </h1>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <button
            onClick={onTogglePause}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[14px] font-medium transition-colors"
          >
            {isPaused ? "Resume Timer" : "Pause Timer"}
          </button>
        )}
        <span
          className={`
            text-[28px] font-semibold tabular-nums
            ${isUrgent ? "text-sell-red animate-timer-pulse" : "text-text-primary"}
          `}
        >
          {timeStr}
        </span>
      </div>
    </div>
  );
}
