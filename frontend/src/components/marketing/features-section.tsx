import { Check, Mic, Pause, PhoneOff, RotateCcw } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/marketing/section";
import { Waveform } from "@/components/marketing/waveform";
import { TypographyH4, TypographyMetric } from "@/components/typography";
import { productFeatures } from "@/lib/marketing-data";
import type { ProductFeature } from "@/types/marketing";

function QuestionSetVisual() {
  return (
    <div className="mt-auto flex flex-col gap-1.5 pt-4">
      {["Role aligned", "Difficulty aware", "Fresh question set"].map((label) => (
        <div
          key={label}
          className="text-ink-70 flex items-center gap-1.5 text-[0.58rem]"
        >
          <Check className="text-emerald-600 size-3" aria-hidden />
          {label}
        </div>
      ))}
    </div>
  );
}

function LanguagesVisual() {
  return (
    <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
      {["English", "हिन्दी", "Hinglish", "தமிழ்"].map((language) => (
        <span
          key={language}
          className="border-border/70 rounded-full border px-2 py-1 text-[0.55rem]"
        >
          {language}
        </span>
      ))}
    </div>
  );
}

function DifficultyVisual() {
  return (
    <div className="mt-auto flex gap-1.5 pt-4">
      {["Easy", "Medium", "Hard"].map((level) => (
        <span
          key={level}
          className={`rounded-full border px-2 py-1 text-[0.55rem] ${
            level === "Medium"
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-border/70"
          }`}
        >
          {level}
        </span>
      ))}
    </div>
  );
}

function ReportVisual() {
  return (
    <div className="mt-auto pt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-ink-70 text-[0.62rem]">Overall</span>
        <TypographyMetric className="text-foreground text-[0.66rem]">
          7.2
        </TypographyMetric>
      </div>
      <div className="bg-muted mt-1 h-1 overflow-hidden rounded-full">
        <div className="bg-accent h-full w-[72%] rounded-full" />
      </div>
      <ul className="mt-2 flex flex-col gap-0.5">
        {["Answer detail", "Structure"].map((label) => (
          <li key={label} className="text-ink-50 text-[0.55rem]">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const visuals: Record<ProductFeature["visual"], () => React.ReactNode> = {
  questions: QuestionSetVisual,
  difficulty: DifficultyVisual,
  languages: LanguagesVisual,
  report: ReportVisual,
  voice: () => null,
};

export function FeaturesSection() {
  const [voiceFeature, ...smallFeatures] = productFeatures;

  return (
    <Section tone="band" id="features">
      <SectionHeader
        title="Practice that feels clear, not complicated"
        description="Choose a role, hear thoughtful questions, speak or type, and leave with feedback you can use."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,1fr)] lg:grid-rows-[10.5rem_10.5rem]">
        <Reveal className="h-full sm:col-span-2 lg:col-span-3 lg:row-span-2">
          <div className="bg-background border-accent/20 flex h-full flex-col rounded-lg border p-5">
            <TypographyH4 className="text-[1.05rem] font-semibold tracking-[-0.018em]">
              {voiceFeature.title}
            </TypographyH4>
            <p className="text-ink-70 mt-1.5 max-w-[21rem] text-[0.78rem] leading-snug">
              {voiceFeature.description}
            </p>

            <Waveform
              bars={28}
              className="my-auto h-16"
              activeBars={28}
              barClassName="bg-support"
            />

            <div className="mt-2 flex items-center gap-2" aria-hidden>
              <span className="bg-foreground grid size-8 place-items-center rounded-[5px] text-white">
                <Mic className="size-3.5" />
              </span>
              {[
                { Icon: Pause, key: "pause" },
                { Icon: RotateCcw, key: "repeat" },
                { Icon: PhoneOff, key: "end" },
              ].map(({ Icon, key }) => (
                <span
                  key={key}
                  className="border-accent/20 text-accent grid size-8 place-items-center rounded-[5px] border"
                >
                  <Icon className="size-3.5" />
                </span>
              ))}
              <TypographyMetric className="border-border/70 text-foreground ml-auto rounded-[3px] border px-2 py-1 text-[0.62rem]">
                18:42
              </TypographyMetric>
            </div>
          </div>
        </Reveal>

        {smallFeatures.map((feature, index) => {
          const Visual = visuals[feature.visual];
          return (
            <Reveal
              key={feature.title}
              delay={0.04 * (index + 1)}
              className="h-full"
            >
              <div className="bg-background border-accent/20 flex h-full flex-col rounded-lg border p-4">
                <TypographyH4 className="text-[0.8rem] font-semibold">
                  {feature.title}
                </TypographyH4>
                <p className="text-ink-70 mt-1 text-[0.66rem] leading-snug">
                  {feature.description}
                </p>
                <Visual />
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
