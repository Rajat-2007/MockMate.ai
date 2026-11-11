import { cn } from "@/lib/utils";

/**
 * Typography primitives. Every marketing surface uses these instead of ad-hoc
 * font utilities so the type scale stays consistent across pages.
 */

export function TypographyH1({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-[2rem] leading-[1.06] font-semibold tracking-[-0.028em] text-balance sm:text-[2.6rem] lg:text-[3.5rem] lg:leading-[1.03]",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH2({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-[1.4rem] leading-[1.15] font-semibold tracking-[-0.022em] text-balance sm:text-3xl lg:text-[2.1rem]",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH3({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-[-0.01em]", className)}
      {...props}
    />
  );
}

export function TypographyH4({
  className,
  ...props
}: React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn("text-sm font-semibold tracking-[-0.005em]", className)}
      {...props}
    />
  );
}

export function TypographyP({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-[0.9rem] leading-relaxed text-ink-70", className)}
      {...props}
    />
  );
}

export function TypographyLead({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-[0.98rem] leading-[1.65] text-ink-70 sm:text-[1.05rem]",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyMuted({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-xs leading-relaxed text-ink-50", className)}
      {...props}
    />
  );
}

export function TypographyMetric({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-metric text-xs tracking-[0.02em]", className)}
      {...props}
    />
  );
}
