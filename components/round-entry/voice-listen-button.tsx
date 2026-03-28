"use client";

import { cn } from "@/lib/utils";
import type { VoiceState } from "@/hooks/use-voice-recognition";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceListenButtonProps {
  state: VoiceState;
  transcript: string;
  error: string | null;
  onPress: () => void;
}

export function VoiceListenButton({
  state,
  transcript,
  error,
  onPress,
}: VoiceListenButtonProps) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isError = state === "error";

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Transcript display — shown after AI processing */}
      {transcript && (
        <div className="w-full rounded-md border bg-muted/30 p-3">
          <div className="text-xs font-semibold text-white/60 mb-1">
            Heard:
          </div>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      {/* Mic button */}
      <button
        type="button"
        onClick={onPress}
        disabled={isProcessing}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md",
          isRecording && "bg-destructive text-white animate-pulse",
          isProcessing && "bg-muted-foreground text-white cursor-not-allowed",
          isError && "bg-destructive text-white",
          !isRecording && !isProcessing && !isError && "bg-primary text-white hover:bg-primary/90",
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isRecording ? (
          <Square className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>

      {/* State label */}
      <span
        className={cn(
          "text-sm",
          isError ? "text-destructive" : "text-white/60"
        )}
      >
        {isError
          ? error
          : isRecording
            ? "Tap to stop"
            : isProcessing
              ? "Processing..."
              : "Tap to speak"}
      </span>
    </div>
  );
}
