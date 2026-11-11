"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FileText,
  History,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  User,
  X,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Start Interview", href: "/interview/setup", icon: PlusCircle, highlight: true },
  { title: "My Resumes", href: "/dashboard/resume", icon: FileText },
  { title: "Interview History", href: "/dashboard/history", icon: History },
  { title: "Progress & Analytics", href: "/dashboard/progress", icon: BarChart3 },
  { title: "My Profile", href: "/dashboard/profile", icon: User },
  { title: "Plans & Billing", href: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth guard: redirect to login if unauthenticated after loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f4ff] dark:bg-[#0b1b29]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Loading MockMate AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8faff] dark:bg-[#0b1b29]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/80 bg-card p-4 justify-between">
        <div className="space-y-6">
          <div className="px-2 pt-1">
            <Logo />
          </div>

          {/* User profile snippet */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-white text-xs">
                {user?.full_name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.full_name || "Student"}
                </p>
                <p className="truncate text-[0.68rem] text-muted-foreground">
                  {profile?.course ? `${profile.course} • ${profile.target_role || "Candidate"}` : user?.email}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2 text-[0.68rem]">
              <span className="text-muted-foreground">Plans &amp; usage</span>
              <Link href="/dashboard/billing" className="font-semibold text-primary hover:underline">
                Manage
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : item.highlight
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                  {item.highlight && (
                    <span className="ml-auto rounded bg-primary/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-primary">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border/60 pt-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-border/80 bg-card px-4 md:hidden">
          <Logo />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border/80 bg-card p-4 md:hidden space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-border/60">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-white text-xs">
                {user?.full_name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.full_name || "Student"}</p>
                <p className="truncate text-[0.68rem] text-muted-foreground">
                  {profile?.course || "Candidate"}
                </p>
              </div>
            </div>
            <nav className="grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md p-2 text-xs font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-md p-2 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
