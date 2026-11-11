import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "YouTube", href: "https://www.youtube.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "X", href: "https://x.com" },
];

export function SiteFooter() {
  return (
    <footer className="border-border/80 border-t">
      <div className="container-page py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.7fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <Logo />
            <p className="text-ink-70 mt-3 max-w-[15rem] text-xs leading-relaxed">
              AI mock interview practice with role-tailored questions and feedback.
            </p>
            <p className="text-ink-50 mt-2 text-[0.68rem]">
              A product by {siteConfig.companyName}
            </p>
          </div>

          {siteConfig.footer.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-ink-50 text-metric mb-3 text-[0.62rem] tracking-[0.08em] uppercase">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-ink-70 hover:text-accent text-xs transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-border/70 mt-10 flex flex-col items-start justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">
          <p className="text-ink-50 text-[0.68rem]">
            © {siteConfig.copyrightYear} {siteConfig.name}
          </p>
          <ul className="flex flex-wrap items-center gap-4">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="text-ink-50 hover:text-accent text-[0.68rem] transition-colors"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
