"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { PlayerScorecard } from "@/components/live/player-scorecard";
import { useLiveEvent } from "@/hooks/use-live-event";

export default function PlayerScorecardPage({
  params,
}: {
  params: Promise<{ eventId: string; playerId: string }>;
}) {
  const { eventId, playerId } = use(params);
  const { data, isLoading, error } = useLiveEvent(eventId);

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">{error || "Event not found"}</p>
        <Link href="/live" className={buttonVariants({ variant: "outline" }) + " mt-4"}>
          Back to Live Events
        </Link>
      </div>
    );
  }

  const player = data.players.find((p) => p.id === playerId);

  return (
    <>
      <Link
        href={`/live/${eventId}/leaderboard`}
        className={buttonVariants({ variant: "ghost" }) + " mb-3"}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Leaderboard
      </Link>

      <PageHeader
        title={player?.name ?? "Player"}
        description={`${data.event.name} — ${data.event.courseName}`}
      />

      <PlayerScorecard data={data} playerId={playerId} />
    </>
  );
}
