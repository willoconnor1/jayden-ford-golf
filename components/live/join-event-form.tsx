"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { LiveEvent } from "@/lib/types";

export function JoinEventForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [foundEvent, setFoundEvent] = useState<LiveEvent | null>(null);
  const [looking, setLooking] = useState(false);
  const [joining, setJoining] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLooking(true);
    try {
      const res = await fetch(`/api/live/events/join?code=${code.trim().toUpperCase()}`);
      if (!res.ok) {
        toast.error("Event not found");
        setFoundEvent(null);
        return;
      }
      const { event } = await res.json();
      setFoundEvent(event);
    } catch {
      toast.error("Failed to search for event");
    } finally {
      setLooking(false);
    }
  }

  async function handleJoin() {
    if (!foundEvent || !playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`/api/live/events/${foundEvent.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to join");
        return;
      }

      const { player } = await res.json();
      localStorage.setItem(
        `live-session-${foundEvent.id}`,
        JSON.stringify({ playerId: player.id })
      );

      toast.success(`Joined ${foundEvent.name}!`);
      router.push(`/live/${foundEvent.id}`);
    } catch {
      toast.error("Failed to join event");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleLookup} className="space-y-2">
        <Label htmlFor="join-code">Join Code</Label>
        <div className="flex gap-2">
          <Input
            id="join-code"
            placeholder="EAGLE7"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="text-center text-lg font-mono tracking-widest uppercase"
            maxLength={6}
          />
          <Button type="submit" disabled={looking || !code.trim()}>
            {looking ? "..." : "Find"}
          </Button>
        </div>
      </form>

      {foundEvent && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="font-semibold">{foundEvent.name}</p>
              <p className="text-sm text-white/60">{foundEvent.courseName}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleJoin}
              disabled={joining || !playerName.trim()}
            >
              {joining ? "Joining..." : "Join Event"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
