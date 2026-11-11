import type { Metadata } from "next";
import { Mail, ShieldCheck, Timer } from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import {
  TypographyH3,
  TypographyP,
} from "@/components/typography";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact — support and account deletion",
  description:
    "Contact MockMate AI support for account help, resume deletion, billing questions and data deletion requests.",
  alternates: { canonical: "/contact" },
};

const channels = [
  {
    icon: Mail,
    title: "Support",
    body: "Plans, billing, interview setup or a session that will not resume. Include the email on your account and the session id if you have one.",
    action: siteConfig.supportEmail,
    href: `mailto:${siteConfig.supportEmail}`,
  },
  {
    icon: ShieldCheck,
    title: "Account and resume deletion",
    body: "Ask for account deletion, resume deletion or a copy of your stored data. Requests are verified against the account email before anything is removed.",
    action: "Send a deletion request",
    href: `mailto:${siteConfig.supportEmail}?subject=Data%20deletion%20request`,
  },
  {
    icon: Timer,
    title: "Response time",
    body: "Support answers on working days. Deletion requests are actioned within the window stated in the privacy policy once your identity is verified.",
    action: "Privacy policy is being finalised",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact support"
        description="One team handles support, billing questions and data deletion. No ticket dashboards to sign up for."
        breadcrumb={[{ label: "Contact" }]}
      />

      <Section>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map(({ icon: Icon, title, body, action, href }) => (
            <div
              key={title}
              className="border-border/80 bg-card flex flex-col rounded-lg border p-5"
            >
              <Icon className="text-accent size-4" aria-hidden />
              <TypographyH3 className="mt-3 text-[0.92rem]">{title}</TypographyH3>
              <TypographyP className="mt-1.5 text-[0.78rem]">{body}</TypographyP>
              {href ? (
                <a
                  href={href}
                  className="text-accent border-accent/25 hover:border-accent mt-4 inline-flex w-fit items-center border-b pb-0.5 text-[0.76rem] font-semibold transition-colors"
                >
                  {action}
                </a>
              ) : (
                <p className="text-ink-50 mt-4 text-[0.72rem]">{action}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
