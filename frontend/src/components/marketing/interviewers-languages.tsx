import { Waveform } from "@/components/marketing/waveform";
import { TypographyH3, TypographyMetric } from "@/components/typography";
import {
  interviewLanguages,
  interviewerPersonalities,
} from "@/lib/marketing-data";

/**
 * Compound section: the dark panel carries the language system, the overlapping
 * white card carries the interviewer personalities.
 */
export function InterviewersLanguages() {
  return (
    <section
      id="languages"
      className="container-page py-14 sm:py-16 lg:py-20"
    >
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-0">
        <div className="bg-foreground flex min-h-[26rem] flex-col justify-end gap-4 rounded-lg px-6 pt-7 pb-6 text-white lg:pr-24">
          <div>
            <TypographyH3 className="text-[1.12rem] font-semibold">
              Interview languages
            </TypographyH3>
            <Waveform
              bars={12}
              className="mt-3 h-10"
              barClassName="bg-support/90"
              activeBars={12}
            />
          </div>

          <ul className="flex flex-wrap gap-1.5">
            {interviewLanguages.map((language, index) => (
              <li key={language.code}>
                <span
                  className={
                    index === 0
                      ? "bg-support text-foreground inline-block rounded-[3px] border border-transparent px-2 py-1 text-[0.68rem] font-medium"
                      : "inline-block rounded-[3px] border border-white/25 px-2 py-1 text-[0.68rem] text-white/90"
                  }
                  lang={language.code}
                >
                  {language.native}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-[0.66rem] leading-relaxed text-white/55">
            Questions, follow-ups and reports follow the language picked for that
            session. Typed answers work in all 11; speech input and output are
            enabled per language once its speech tests pass.
          </p>
        </div>

        <div className="bg-card border-border/80 rounded-lg border p-6 shadow-[0_16px_30px_-28px_rgba(19,41,61,0.7)] sm:p-7 lg:-ml-14 lg:my-8">
          <TypographyH3 className="text-[1.05rem]">
            Interviewer personalities
          </TypographyH3>
          <p className="text-ink-70 mt-1 mb-4 text-[0.76rem]">
            The same question set, delivered by a different interviewer.
          </p>

          <ul>
            {interviewerPersonalities.map((personality) => (
              <li
                key={personality.slug}
                className="border-border/70 grid items-start gap-3 border-t py-3 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <span className="block text-[0.88rem] font-semibold tracking-[-0.005em]">
                    {personality.name}
                  </span>
                  <span className="text-ink-70 mt-0.5 block max-w-[20rem] text-[0.74rem] leading-snug">
                    {personality.tone}
                  </span>
                </div>
                <TypographyMetric className="text-accent border-accent/20 w-fit rounded-[3px] border px-2 py-1 text-[0.6rem] whitespace-nowrap">
                  {personality.bestFor}
                </TypographyMetric>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
