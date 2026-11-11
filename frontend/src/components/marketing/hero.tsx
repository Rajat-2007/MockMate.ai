import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { SessionPreview } from "@/components/marketing/session-preview";
import { TypographyH1, TypographyLead } from "@/components/typography";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f8ff] text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-56 size-[34rem] rounded-full bg-indigo-300/40 blur-[110px]" />
        <div className="absolute -bottom-72 left-[28%] size-[38rem] rounded-full bg-cyan-200/45 blur-[120px]" />
        <div className="absolute -left-48 top-1/3 size-[30rem] rounded-full bg-blue-200/30 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:min-h-[42rem] lg:grid-cols-[0.94fr_1.06fr] lg:gap-12 lg:py-20">
        <div className="hero-rise">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/75 px-3 py-1.5 text-[0.68rem] font-semibold tracking-wide text-indigo-900 shadow-sm shadow-indigo-950/5 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-indigo-600" aria-hidden />
            A calmer way to prepare for the big round
          </div>

          <TypographyH1 className="max-w-[42rem] font-bold tracking-[-0.045em] text-[#13293d] sm:text-[3.2rem] lg:text-[3.75rem]">
            Your next interview
            <span className="block bg-gradient-to-r from-indigo-700 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              won’t be your first.
            </span>
          </TypographyH1>

          <TypographyLead className="mt-5 max-w-[30rem] text-slate-600">
            Practice out loud with role-specific AI questions. Get a clear,
            answer-by-answer review so you know what to work on next.
          </TypographyLead>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              asChild
              className="h-12 w-full bg-gradient-to-r from-indigo-500 to-blue-500 px-6 text-[0.86rem] text-white shadow-[0_14px_38px_-16px_rgba(99,102,241,0.9)] transition-transform hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
            >
              <Link href="/signup">
                Start your first practice
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
            </Button>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-slate-600 transition-colors hover:text-indigo-700"
            >
              Explore the experience
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[0.68rem] font-medium text-slate-500">
            {["Voice or text", "11 languages", "No card for free plan"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-3 text-indigo-600" aria-hidden />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="hero-rise hero-rise-delayed relative">
          <div
            aria-hidden
            className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-300/35 via-blue-200/20 to-cyan-200/35 blur-2xl"
          />
          <div className="relative rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_30px_75px_-38px_rgba(55,65,125,0.32)] backdrop-blur-xl sm:p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-[0.67rem] font-bold tracking-wide text-slate-700">
                INSIDE YOUR PRACTICE ROOM
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[0.58rem] font-semibold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                SAMPLE PREVIEW
              </span>
            </div>
            <SessionPreview />
            <p className="mt-3 px-1 text-[0.62rem] leading-relaxed text-slate-500">
              Example interface only. Your feedback is generated from your own
              interview answers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
