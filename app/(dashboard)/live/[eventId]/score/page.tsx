"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ScoreEntryForm } from "@/components/live/score-entry-form";
import { useLiveEvent } from "@/hooks/use-live-event";
import { useLiveSession } from "@/hooks/use-live-session";

export default function ScoreEntryPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data, isLoading, error } = useLiveEvent(eventId);
  const { playerId } = useLiveSession(eventId);

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

  if (!playerId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">You need to join this event to enter scores</p>
        <Link href={`/live/${eventId}`} className={buttonVariants({ variant: "outline" }) + " mt-4"}>
          Go to Event Lobby
        </Link>
      </div>
    );
  }

  if (data.event.status !== "active") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {data.event.status === "lobby" ? "Event hasn't started yet" : "Event is completed"}
        </p>
        <Link href={`/live/${eventId}`} className={buttonVariants({ variant: "outline" }) + " mt-4"}>
          Go to Event Lobby
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
        title="Score Entry"
        description={`${data.event.name} — ${data.event.courseName}`}
      />

      <ScoreEntryForm data={data} playerId={playerId} />
    </>
  );
}
