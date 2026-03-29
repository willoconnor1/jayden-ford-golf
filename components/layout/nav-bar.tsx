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

const baseLinks = [
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
];

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
  const links = isAdmin
    ? [...baseLinks, { href: "/admin", label: "Admin", mobileLabel: "Admin", icon: ShieldCheck }]
    : baseLinks;

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
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 border-r border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex h-14 items-center px-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {initials}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm">{user?.name ?? "Jolf"}</span>
              <span className="text-[10px] text-white/50 font-normal">Jolf</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-5 space-y-1.5">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  (link.href !== "/rounds" && pathname.startsWith(link.href + "/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 border-l-[3px]",
                  isActive
                    ? "bg-primary/10 text-primary border-primary font-semibold"
                    : "text-white/60 hover:bg-white/10 hover:text-white border-transparent"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all duration-150 w-full border-l-[3px] border-transparent"
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
                : pathname === link.href ||
                  (link.href !== "/rounds" && pathname.startsWith(link.href + "/"));
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
