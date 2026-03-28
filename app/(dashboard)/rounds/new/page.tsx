"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { RoundEntryWizard } from "@/components/round-entry/round-entry-wizard";
import { useDraftRoundStore } from "@/stores/draft-round-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Plus } from "lucide-react";

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewRoundPage() {
  const draft = useDraftRoundStore((s) => s.draft);
  const clearDraft = useDraftRoundStore((s) => s.clearDraft);
  const [choice, setChoice] = useState<"undecided" | "continue" | "fresh">("undecided");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  // If no draft or still hydrating, skip prompt
  const showPrompt = hydrated && draft !== null && choice === "undecided";

  if (!hydrated) {
    return (
      <>
        <PageBackground image="/jacks-point.jpg" />
        <div className="relative z-10">
          <PageHeader title="Log New Round" description="Enter your hole-by-hole data" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageBackground image="/jacks-point.jpg" />
      <div className="relative z-10">
      <PageHeader
        title={showPrompt ? "Round in Progress" : "Log New Round"}
        description={showPrompt ? undefined : "Enter your hole-by-hole data"}
      />

      {showPrompt ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">You have an unfinished round</p>
              <p className="text-sm text-white/60">
                {draft.wizard.course.name || "Unnamed course"} &middot;{" "}
                {draft.wizard.entryMode} mode &middot;{" "}
                {formatTimeAgo(draft.savedAt)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setChoice("continue")} className="flex-1 h-12">
                <PlayCircle className="mr-2 h-4 w-4" />
                Continue Round
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearDraft();
                  setChoice("fresh");
                }}
                className="flex-1 h-12"
              >
                <Plus className="mr-2 h-4 w-4" />
                Start Fresh
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <RoundEntryWizard
          initialDraft={
            choice === "continue" && draft
              ? { wizard: draft.wizard, shotFlow: draft.shotFlow }
              : undefined
          }
        />
      )}
      </div>
    </>
  );
}
