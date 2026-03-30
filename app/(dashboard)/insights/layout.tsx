"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/insights/strokes-gained", label: "Strokes Gained" },
  { href: "/insights/dispersion", label: "Dispersion" },
];

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="flex gap-1 p-1 glass-card rounded-full w-fit mb-6">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
              pathname.startsWith(tab.href)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
