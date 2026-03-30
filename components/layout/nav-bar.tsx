"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Target,
  Radio,
  LogOut,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useImpersonating } from "@/lib/impersonation-context";
import { ThemeToggleCompact } from "@/components/theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/rounds", label: "Rounds", icon: ClipboardList },
  { href: "/insights", label: "Insights", icon: TrendingUp },
  { href: "/tactics", label: "Tactics", icon: Target },
  { href: "/live", label: "Live", icon: Radio },
];

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const impersonating = useImpersonating();

  const isAdmin = user?.email
    ? ADMIN_EMAILS.includes(user.email.toLowerCase())
    : false;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop top navigation */}
      <header className={cn("hidden md:block fixed left-0 right-0 z-50", impersonating ? "top-10" : "top-0")}>
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 pt-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-foreground drop-shadow-sm font-logo"
          >
            jolf.
          </Link>

          {/* Center nav pill */}
          <nav className="glass-nav rounded-full px-1.5 py-1.5 flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Profile avatar dropdown */}
          <Popover>
            <PopoverTrigger className="glass-card rounded-full flex items-center gap-2.5 cursor-pointer pl-4 pr-1 py-1">
              <span className="text-sm font-medium text-foreground/80 hidden lg:block">
                {user?.name ?? "Jolf"}
              </span>
              <span className="bg-primary text-primary-foreground rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shadow-sm">
                {initials}
              </span>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-52 p-1.5 glass-card rounded-xl"
            >
              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                View Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <ThemeToggleCompact />
              <div className="my-1 border-t border-border" />
              <button
                onClick={logout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Mobile top bar (avatar only) */}
      <header className={cn("md:hidden fixed left-0 right-0 z-50 flex items-center justify-between px-4 pt-3 pb-2", impersonating ? "top-10" : "top-0")}>
        <Link
          href="/"
          className="text-lg font-bold text-foreground drop-shadow-sm font-logo"
        >
          jolf.
        </Link>
        <Popover>
          <PopoverTrigger className="glass-card rounded-full p-1 cursor-pointer">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-sm">
              {initials}
            </span>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-48 p-1.5 glass-card rounded-xl"
          >
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              View Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
            <div className="my-1 border-t border-border" />
            <button
              onClick={logout}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </PopoverContent>
        </Popover>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[3rem] py-1.5 text-[10px] transition-colors",
                isActive(item.href)
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
