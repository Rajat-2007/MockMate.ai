import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f2f4ff] dark:bg-[#0b1b29]">
      <header className="border-border/60 border-b bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-ink-70 hover:text-foreground text-xs font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="border-border/40 border-t py-4 text-center text-xs text-muted-foreground">
        © {siteConfig.copyrightYear} {siteConfig.name}. Practice Smarter. Interview Better.
      </footer>
    </div>
  );
}
