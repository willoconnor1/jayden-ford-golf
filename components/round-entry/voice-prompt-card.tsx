"use client";

import { cn } from "@/lib/utils";
import type { VoiceTemplate } from "@/lib/voice/voice-templates";

interface VoicePromptCardProps {
  template: VoiceTemplate;
}

export function VoicePromptCard({ template }: VoicePromptCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {template.title}
      </div>
      <ul className="space-y-1.5">
        {template.checklistItems.map((item, i) => (
          <li
            key={i}
            className={cn(
              "flex items-baseline gap-2 text-sm",
              item.optional && "opacity-50"
            )}
          >
            <span className="text-muted-foreground font-medium min-w-[100px] shrink-0">
              {item.label}:
            </span>
            <span className="text-primary font-semibold italic">
              {item.example}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground text-center">
        Tap the mic and say your data — any order works
      </p>
    </div>
  );
}
