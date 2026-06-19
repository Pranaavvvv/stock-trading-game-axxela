"use client";

interface DemoCaptionProps {
  caption: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onPlayAgain?: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isLastFrame: boolean;
}

export default function DemoCaption({
  caption,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onPlayAgain,
  isPlaying,
  onTogglePlay,
  isLastFrame,
}: DemoCaptionProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40">
      {/* Progress bar */}
      <div className="h-[3px] bg-white/[0.06]">
        <div
          className="h-full bg-ring-stroke transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Caption card */}
      <div className="bg-panel-bg/95 backdrop-blur-md border-t border-white/[0.08] px-6 py-5">
        <div className="max-w-3xl mx-auto">
          {/* Caption text */}
          <p className="text-[14px] text-text-secondary leading-relaxed mb-4">
            {caption}
          </p>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Step indicator */}
            <span className="text-[12px] text-text-muted tabular-nums">
              Step {currentStep + 1} of {totalSteps}
            </span>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                disabled={currentStep === 0}
                className="
                  px-4 py-2 rounded-lg text-[12px] font-semibold text-text-secondary
                  border border-white/10 hover:border-white/20
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:bg-white/[0.03] transition-all duration-200
                "
              >
                ← Back
              </button>

              <button
                onClick={onTogglePlay}
                className="
                  px-4 py-2 rounded-lg text-[12px] font-semibold text-text-primary
                  border border-white/10 hover:border-white/20
                  hover:bg-white/[0.03] transition-all duration-200
                "
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              {isLastFrame ? (
                <div className="flex gap-2">
                  {onPlayAgain && (
                    <button
                      onClick={onPlayAgain}
                      className="
                        px-4 py-2 rounded-lg text-[12px] font-semibold text-text-secondary
                        border border-white/10 hover:border-white/20
                        hover:bg-white/[0.03] transition-all duration-200
                      "
                    >
                      ↺ Watch Again
                    </button>
                  )}
                  <a
                    href="/lobby"
                    className="
                      px-5 py-2 rounded-lg text-[12px] font-bold text-white
                      bg-buy-green hover:brightness-110
                      transition-all duration-200
                    "
                  >
                    Play Now →
                  </a>
                </div>
              ) : (
                <button
                  onClick={onNext}
                  className="
                    px-4 py-2 rounded-lg text-[12px] font-semibold text-text-primary
                    bg-white/[0.06] border border-white/10 hover:border-white/20
                    hover:bg-white/[0.08] transition-all duration-200
                  "
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
