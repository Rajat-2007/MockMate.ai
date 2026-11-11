import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility; stagger is expressed as CSS delay. */
  delay?: number;
  distance?: number;
};

/**
 * Scroll-linked reveal built on CSS `animation-timeline: view()`.
 *
 * Deliberately a server component: the markup ships visible, so content is
 * never hidden from crawlers or from visitors without JavaScript. Browsers that
 * do not support scroll timelines just show the final state.
 */
export function Reveal({ children, className }: RevealProps) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
