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
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/rounds/new", label: "New Round", mobileLabel: "New", icon: PlusCircle },
  { href: "/rounds", label: "Rounds", mobileLabel: "Rounds", icon: ClipboardList },
  { href: "/strokes-gained", label: "Strokes Gained", mobileLabel: "SG", icon: TrendingUp },
  { href: "/goals", label: "Goals", mobileLabel: "Goals", icon: Target },
  { href: "/practice", label: "Practice", mobileLabel: "Practice", icon: Dumbbell },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
        <div className="flex h-14 items-center px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              JF
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm">Jayden Ford</span>
              <span className="text-[10px] text-muted-foreground font-normal">Golf Performance</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
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
