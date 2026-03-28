"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Play, Trophy, ClipboardEdit } from "lucide-react";
import type { LiveEventData } from "@/lib/types";

interface EventLobbyProps {
  data: LiveEventData;
  isOrganizer: boolean;
  organizerSecret: string | null;
  playerId: string | null;
}

export function EventLobby({
  data,
  isOrganizer,
  organizerSecret,
  playerId,
}: EventLobbyProps) {
  const router = useRouter();
  const { event, players } = data;
  const [updating, setUpdating] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(event.joinCode);
      toast.success("Join code copied!");
    } catch {
      toast.info(`Join code: ${event.joinCode}`);
    }
  }

  async function updatePlayerGroup(pid: string, groupNumber: number | null) {
    if (!organizerSecret) return;
    try {
      await fetch(`/api/live/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerSecret,
          playerGroups: [{ playerId: pid, groupNumber }],
        }),
      });
    } catch {
      toast.error("Failed to update group");
    }
  }

  async function startEvent() {
    if (!organizerSecret) return;
    setUpdating(true);
    try {
      await fetch(`/api/live/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerSecret, status: "active" }),
      });
      toast.success("Event started!");
    } catch {
      toast.error("Failed to start event");
    } finally {
      setUpdating(false);
    }
  }

  const allAssigned = players.length > 0 && players.every((p) => p.groupNumber !== null);
  const myGroup = playerId
    ? players.find((p) => p.id === playerId)?.groupNumber
    : null;

  return (
    <div className="space-y-4">
      {/* Join Code */}
      <Card
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={copyCode}
      >
        <CardContent className="py-6 text-center">
          <p className="text-xs text-white/60 mb-1">Share this code to join</p>
          <p className="text-3xl font-bold font-mono tracking-[0.3em]">
            {event.joinCode}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-white/60">
            <Copy className="h-3 w-3" />
            Tap to copy
          </div>
        </CardContent>
      </Card>

      {/* Event Status */}
      {event.status === "active" && (
        <div className="flex gap-2">
          {(playerId && myGroup) && (
            <Link href={`/live/${event.id}/score`} className="flex-1">
              <Button className="w-full" size="lg">
                <ClipboardEdit className="mr-2 h-4 w-4" />
                Score Entry
              </Button>
            </Link>
          )}
          <Link href={`/live/${event.id}/leaderboard`} className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
        </div>
      )}

      {/* Players */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Players ({players.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {players.length === 0 && (
            <p className="text-sm text-white/60 text-center py-4">
              Waiting for players to join...
            </p>
          )}
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{player.name}</span>
                {player.id === playerId && (
                  <Badge variant="outline" className="text-[10px]">You</Badge>
                )}
              </div>
              {isOrganizer && event.status === "lobby" ? (
                <select
                  className="text-sm border rounded px-2 py-1 bg-background"
                  value={player.groupNumber ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updatePlayerGroup(
                      player.id,
                      val ? parseInt(val) : null
                    );
                  }}
                >
                  <option value="">No Group</option>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>Group {g}</option>
                  ))}
                </select>
              ) : (
                player.groupNumber && (
                  <Badge variant="secondary">Group {player.groupNumber}</Badge>
                )
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Start Button (organizer only, lobby status) */}
      {isOrganizer && event.status === "lobby" && (
        <Button
          className="w-full"
          size="lg"
          onClick={startEvent}
          disabled={!allAssigned || updating}
        >
          <Play className="mr-2 h-4 w-4" />
          {!allAssigned
            ? "Assign all players to groups first"
            : updating
              ? "Starting..."
              : "Start Event"}
        </Button>
      )}

      {/* Organizer: Complete Event */}
      {isOrganizer && event.status === "active" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            setUpdating(true);
            try {
              await fetch(`/api/live/events/${event.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizerSecret, status: "completed" }),
              });
              toast.success("Event completed!");
            } catch {
              toast.error("Failed to complete event");
            } finally {
              setUpdating(false);
            }
          }}
          disabled={updating}
        >
          Complete Event
        </Button>
      )}
    </div>
  );
}
