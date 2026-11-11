import { publicEnv } from "@/lib/env";

export type NavItem = {
  title: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: NavItem[];
};

export const siteConfig = {
  name: "MockMate AI",
  tagline: "Your AI-Powered Interview Partner",
  description:
    "Practise with role-tailored AI questions, voice or text answers, and clear answer-by-answer feedback.",
  url: publicEnv.siteUrl,
  locale: "en_IN",
  supportEmail: "support@mockmate.ai",
  companyName: "TRA Services Pvt Ltd",
  /** Static so the footer stays prerenderable; bump with each release year. */
  copyrightYear: 2026,
  nav: [
    { title: "Features", href: "/features" },
    { title: "How it works", href: "/how-it-works" },
    { title: "Interviews", href: "/features#categories" },
    { title: "Pricing", href: "/pricing" },
    { title: "FAQ", href: "/faq" },
  ] satisfies NavItem[],
  footer: [
    {
      title: "Product",
      links: [
        { title: "Features", href: "/features" },
        { title: "How it works", href: "/how-it-works" },
        { title: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Practice",
      links: [
        { title: "Interview categories", href: "/features#categories" },
        { title: "Interview languages", href: "/features#languages" },
        { title: "Sample questions", href: "/interview-questions" },
      ],
    },
    {
      title: "Company",
      links: [
        { title: "FAQ", href: "/faq" },
        { title: "Contact and deletion requests", href: "/contact" },
      ],
    },
  ] satisfies FooterColumn[],
} as const;
