"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EventLobby } from "@/components/live/event-lobby";
import { useLiveEvent } from "@/hooks/use-live-event";
import { useLiveSession } from "@/hooks/use-live-session";

export default function EventLobbyPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data, isLoading, error } = useLiveEvent(eventId);
  const { playerId, isOrganizer, organizerSecret } = useLiveSession(eventId);

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

  return (
    <>
      <Link href="/live" className={buttonVariants({ variant: "ghost" }) + " mb-3"}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>

      <PageHeader
        title={data.event.name}
        description={data.event.courseName}
      />

      <EventLobby
        data={data}
        isOrganizer={isOrganizer}
        organizerSecret={organizerSecret}
        playerId={playerId}
      />
    </>
  );
}
