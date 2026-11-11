import { Mic } from "lucide-react";

import { TypographyMetric } from "@/components/typography";
import { Waveform } from "@/components/marketing/waveform";
import { sessionPreview } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

function Chip({ children, solid = false }: { children: string; solid?: boolean }) {
  return (
    <span
      className={cn(
        "text-metric rounded-[3px] border px-1.5 py-[0.15rem] text-[0.6rem]",
        solid
          ? "border-support bg-support text-foreground"
          : "border-white/25 text-white/85",
      )}
    >
      {children}
    </span>
  );
}

function ScoreRail({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-2 first:mt-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-ink-70 text-[0.68rem]">{label}</span>
        <TypographyMetric className="text-foreground text-[0.68rem]">
          {value.toFixed(1)}
        </TypographyMetric>
      </div>
      <div className="bg-muted mt-1 h-1 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Product preview used in the hero: a real interview turn, the input level and
 * the per-answer rubric readout. It is a UI mock, not a claim of live data.
 */
export function SessionPreview() {
  const {
    category,
    course,
    difficulty,
    timeLeft,
    questionNumber,
    question,
    answerPreview,
    answerHint,
    elapsed,
    inputLevelDb,
    overallScore,
    scores,
  } = sessionPreview;

  return (
    <div className="grid gap-3 sm:grid-cols-[1.32fr_1fr]">
      <div className="bg-foreground shadow-[0_18px_34px_-26px_rgba(19,41,61,0.85)] flex flex-col gap-3.5 rounded-lg p-4 text-white">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip solid>{category}</Chip>
          <Chip>{course}</Chip>
          <Chip>{difficulty}</Chip>
          <TypographyMetric className="ml-auto text-[0.66rem] text-white/70">
            {timeLeft} left
          </TypographyMetric>
        </div>

        <div>
          <TypographyMetric className="text-support block text-[0.62rem]">
            {questionNumber}
          </TypographyMetric>
          <p className="mt-1.5 text-[0.86rem] leading-snug font-medium">
            {question}
          </p>
        </div>

        <Waveform
          bars={24}
          className="h-11"
          barClassName="bg-support"
          activeBars={24}
        />

        <div className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2">
          <span className="text-metric block text-[0.55rem] tracking-[0.08em] text-white/45 uppercase">
            Transcript
          </span>
          <p className="mt-1 text-[0.72rem] leading-snug text-white/85">
            {answerPreview}
            <span
              aria-hidden
              className="bg-support ml-0.5 inline-block h-3 w-[2px] translate-y-[2px]"
            />
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-md border border-white/15 bg-white/[0.07] px-2.5 py-2">
          <span className="bg-support text-foreground grid size-7 shrink-0 place-items-center rounded-full">
            <Mic className="size-3.5" aria-hidden />
          </span>
          <span className="text-[0.66rem] leading-tight text-white/65">
            <b className="block text-[0.7rem] font-medium text-white">
              Listening
            </b>
            {answerHint}
          </span>
          <TypographyMetric className="ml-auto rounded-[3px] border border-white/25 px-1.5 py-0.5 text-[0.6rem] text-white/85">
            {elapsed}
          </TypographyMetric>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="border-border/80 bg-card flex flex-col gap-2 rounded-lg border p-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-ink-70 text-[0.68rem]">Input level</span>
            <TypographyMetric className="text-foreground text-[0.66rem]">
              {inputLevelDb}
            </TypographyMetric>
          </div>
          <div className="flex h-8 items-end gap-[3px]" aria-hidden>
            {Array.from({ length: 14 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "min-w-px flex-1 rounded-[1px]",
                  index < 9
                    ? "bg-accent"
                    : index < 11
                      ? "bg-support"
                      : "bg-foreground/10",
                )}
                style={{ height: "100%" }}
              />
            ))}
          </div>
        </div>

        <div className="border-border/80 bg-card flex flex-1 flex-col rounded-lg border p-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-ink-70 text-[0.68rem]">Answer scores</span>
            <TypographyMetric className="text-ink-50 text-[0.62rem]">
              {questionNumber.split(" ")[0]}
            </TypographyMetric>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl leading-none font-semibold tracking-[-0.02em]">
              {overallScore}
            </span>
            <span className="text-ink-50 text-[0.62rem]">
              / 10 rubric average
            </span>
          </div>
          <div className="mt-3">
            {scores.map((score) => (
              <ScoreRail
                key={score.label}
                label={score.label}
                value={score.value}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
