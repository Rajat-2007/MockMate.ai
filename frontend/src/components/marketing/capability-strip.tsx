import { TypographyMetric } from "@/components/typography";
import { capabilities } from "@/lib/marketing-data";

/**
 * Product-capability figures. These are counts of what exists in the product,
 * never user numbers or success claims.
 */
export function CapabilityStrip() {
  return (
    <section aria-label="Product capabilities" className="container-page">
      <dl className="border-border/70 grid grid-cols-2 gap-y-6 border-t py-7 sm:grid-cols-4 sm:gap-y-0">
        {capabilities.map((capability, index) => (
          <div
            key={capability.label}
            className={
              index === 0
                ? "sm:pr-6"
                : "border-border/70 sm:border-l sm:px-6 sm:last:pr-0"
            }
          >
            <TypographyMetric className="text-foreground block text-[1.7rem] leading-none">
              {capability.value}
            </TypographyMetric>
            <dt className="text-ink-70 mt-1.5 text-[0.72rem]">
              {capability.label}
            </dt>
            <dd className="sr-only">{capability.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
