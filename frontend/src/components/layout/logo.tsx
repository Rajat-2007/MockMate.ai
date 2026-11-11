import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Switch to light text and mark for dark surfaces. */
  inverted?: boolean;
  href?: string;
};

/**
 * Wordmark plus the audio-signal mark used across the product.
 */
export function Logo({ className, inverted = false, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} home`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-[7px] bg-brand-gradient shadow-[0_3px_10px_-4px_rgba(79,70,229,0.8)] transition-transform group-hover:scale-[1.04]",
          inverted && "ring-1 ring-white/20",
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[1.15rem] text-white"
          fill="none"
        >
          <path
            d="M5 10v4m4-8v12m4-15v18m4-12v6m4-9v12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "text-[0.95rem] font-semibold tracking-[-0.012em]",
          inverted ? "text-background" : "text-foreground",
        )}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
