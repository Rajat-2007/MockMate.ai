import { cn } from "@/lib/utils";

const PATTERN = [30, 76, 48, 94, 40, 66, 84, 52, 72, 38, 90, 58];

type WaveformProps = {
  bars?: number;
  className?: string;
  barClassName?: string;
  /** Bars left of this index render as "active" (brighter). */
  activeBars?: number;
  animated?: boolean;
};

/**
 * Decorative VU-meter style waveform. Pure CSS animation, no client JS.
 * Decorative only, so it is hidden from assistive technology.
 */
export function Waveform({
  bars = 28,
  className,
  barClassName,
  activeBars,
  animated = true,
}: WaveformProps) {
  return (
    <div
      aria-hidden
      className={cn("flex h-14 items-end gap-[3px] overflow-hidden", className)}
    >
      {Array.from({ length: bars }).map((_, index) => {
        const isActive = activeBars === undefined || index < activeBars;
        return (
          <span
            key={index}
            className={cn(
              "min-w-px flex-1 origin-bottom rounded-[1px] bg-support",
              !isActive && "bg-support/35",
              animated && "motion-safe:animate-[vu-bar_ease-in-out_infinite]",
              barClassName,
            )}
            style={{
              height: `${PATTERN[index % PATTERN.length]}%`,
              animationDuration: `${2 + (index % 5) * 0.28}s`,
              animationDelay: `${(index % 7) * 0.13}s`,
            }}
          />
        );
      })}
    </div>
  );
}
