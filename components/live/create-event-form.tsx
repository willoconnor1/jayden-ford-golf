"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLiveSession } from "@/hooks/use-live-session";

const DEFAULT_PARS = [4, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5];

export function CreateEventForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [holePars, setHolePars] = useState<number[]>(DEFAULT_PARS);
  const [submitting, setSubmitting] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const { setOrganizer } = useLiveSession(createdEventId);

  function updatePar(index: number, value: number) {
    const next = [...holePars];
    next[index] = Math.max(3, Math.min(6, value));
    setHolePars(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !courseName.trim()) {
      toast.error("Please fill in event name and course name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/live/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), courseName: courseName.trim(), holePars }),
      });

      if (!res.ok) throw new Error("Failed to create event");
      const { event, organizerSecret } = await res.json();

      // Store organizer secret before navigating
      setCreatedEventId(event.id);
      localStorage.setItem(
        `live-organizer-${event.id}`,
        JSON.stringify({ organizerSecret })
      );

      toast.success(`Event created! Join code: ${event.joinCode}`);
      router.push(`/live/${event.id}`);
    } catch {
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-name">Event Name</Label>
        <Input
          id="event-name"
          placeholder="Saturday Comp"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-name">Course Name</Label>
        <Input
          id="course-name"
          placeholder="Royal Wellington"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Hole Pars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Front 9 */}
            <div>
              <p className="text-xs text-white/60 mb-1.5">Front 9</p>
              <div className="grid grid-cols-9 gap-1">
                {holePars.slice(0, 9).map((par, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[10px] text-white/60 mb-0.5">{i + 1}</p>
                    <button
                      type="button"
                      className="w-full h-8 rounded border text-sm font-medium bg-background hover:bg-muted transition-colors"
                      onClick={() => updatePar(i, par === 5 ? 3 : par + 1)}
                    >
                      {par}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Back 9 */}
            <div>
              <p className="text-xs text-white/60 mb-1.5">Back 9</p>
              <div className="grid grid-cols-9 gap-1">
                {holePars.slice(9, 18).map((par, i) => (
                  <div key={i + 9} className="text-center">
                    <p className="text-[10px] text-white/60 mb-0.5">{i + 10}</p>
                    <button
                      type="button"
                      className="w-full h-8 rounded border text-sm font-medium bg-background hover:bg-muted transition-colors"
                      onClick={() => updatePar(i + 9, par === 5 ? 3 : par + 1)}
                    >
                      {par}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-white/60 text-right">
              Total Par: {holePars.reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
}
