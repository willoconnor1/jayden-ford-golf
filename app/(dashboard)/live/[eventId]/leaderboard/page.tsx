"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardTable } from "@/components/live/leaderboard-table";
import { useLiveEvent } from "@/hooks/use-live-event";

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data, isLoading, error } = useLiveEvent(eventId);

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || "Event not found"}</p>
        <Link href="/live" className={buttonVariants({ variant: "outline" }) + " mt-4"}>
          Back to Live Events
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href={`/live/${eventId}`} className={buttonVariants({ variant: "ghost" }) + " mb-3"}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>

      <PageHeader
        title="Leaderboard"
        description={`${data.event.name} — ${data.event.courseName}`}
      />

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Live Standings</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {data.event.status === "active" ? "Live" : data.event.status === "completed" ? "Final" : "Not Started"}
          </Badge>
        </CardHeader>
        <CardContent>
          <LeaderboardTable data={data} />
        </CardContent>
      </Card>
    </>
  );
}
