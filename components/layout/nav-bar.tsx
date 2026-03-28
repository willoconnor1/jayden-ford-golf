"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  TrendingUp,
  Target,
  Dumbbell,
  Crosshair,
  Radio,
  Settings,
  LogOut,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const links = [
  { href: "/", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/rounds/new", label: "New Round", mobileLabel: "New", icon: PlusCircle },
  { href: "/rounds", label: "Rounds", mobileLabel: "Rounds", icon: ClipboardList },
  { href: "/courses", label: "Courses", mobileLabel: "Courses", icon: MapPinned },
  { href: "/strokes-gained", label: "Strokes Gained", mobileLabel: "SG", icon: TrendingUp },
  { href: "/goals", label: "Goals", mobileLabel: "Goals", icon: Target },
  { href: "/practice", label: "Practice", mobileLabel: "Practice", icon: Dumbbell },
  { href: "/dispersion", label: "Dispersion", mobileLabel: "Shots", icon: Crosshair },
  { href: "/live", label: "Live", mobileLabel: "Live", icon: Radio },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", mobileLabel: "Admin", icon: ShieldCheck },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-sidebar">
        <div className="flex h-14 items-center px-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {initials}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm">{user?.name ?? "Golf Dashboard"}</span>
              <span className="text-[10px] text-muted-foreground font-normal">Golf Performance</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-5 space-y-1.5">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 border-l-[3px]",
                  isActive
                    ? "bg-primary/10 text-primary border-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground border-transparent"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-all duration-150 w-full border-l-[3px] border-transparent"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[2.75rem] py-1.5 text-[10px] transition-colors",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.mobileLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
