"use client";

import Link from "next/link";
import { PlusCircle, Radio, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/rounds/new"
        className={cn(buttonVariants(), "gap-2")}
      >
        <PlusCircle className="h-4 w-4" />
        New Round
      </Link>
      <Link
        href="/live"
        className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
      >
        <Radio className="h-4 w-4" />
        Join Live
      </Link>
      <Link
        href="/insights/strokes-gained"
        className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
      >
        <TrendingUp className="h-4 w-4" />
        View Insights
      </Link>
    </div>
  );
}
