"use client";

import type { VoiceTemplate } from "@/lib/voice/voice-templates";

interface VoicePromptCardProps {
  template: VoiceTemplate;
}

export function VoicePromptCard({ template }: VoicePromptCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {template.title}
      </div>
      <div className="bg-background rounded-md p-3">
        <p className="text-lg leading-relaxed">
          {template.promptParts.map((part, i) =>
            part.isSlot ? (
              <span key={i} className="text-primary font-bold italic">
                {part.example || "___"}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
        </p>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Click the mic and read the script, filling in the highlighted parts
      </p>
    </div>
  );
}
