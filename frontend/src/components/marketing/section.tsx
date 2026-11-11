import { cn } from "@/lib/utils";

type Tone = "default" | "band" | "sunken";

const toneClass: Record<Tone, string> = {
  default: "",
  band: "bg-band",
  sunken: "bg-surface-sunken",
};

type SectionProps = React.ComponentProps<"section"> & {
  tone?: Tone;
  /** Vertical rhythm; defaults to the standard marketing spacing. */
  spacing?: "default" | "tight";
};

/** Full-bleed section with the shared page gutter. */
export function Section({
  tone = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "border-border/70 border-t first:border-t-0",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      <div className="container-page py-14 sm:py-16 lg:py-20">{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
  /** Keep the heading and description in a left column, action on the right. */
  layout?: "split" | "stack";
};

export function SectionHeader({
  title,
  description,
  className,
  action,
  layout = "split",
}: SectionHeaderProps) {
  if (layout === "stack") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <h2 className="text-[1.4rem] leading-[1.15] font-semibold tracking-[-0.022em] text-balance sm:text-3xl lg:text-[2.1rem]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-md text-[0.9rem] leading-relaxed text-ink-70">
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        className,
      )}
    >
      <h2 className="max-w-xl text-[1.4rem] leading-[1.15] font-semibold tracking-[-0.022em] text-balance sm:text-3xl lg:text-[2.1rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-sm text-[0.9rem] leading-relaxed text-ink-70 lg:text-right">
          {description}
        </p>
      ) : null}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
