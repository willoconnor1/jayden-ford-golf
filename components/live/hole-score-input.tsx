"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface HoleScoreInputProps {
  playerName: string;
  score: number;
  par: number;
  onChange: (score: number) => void;
}

export function HoleScoreInput({
  playerName,
  score,
  par,
  onChange,
}: HoleScoreInputProps) {
  const diff = score - par;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm font-medium w-24 truncate">{playerName}</span>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full"
          onClick={() => onChange(Math.max(1, score - 1))}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <div className="text-center w-12">
          <p className="text-2xl font-bold tabular-nums">{score}</p>
          <p className="text-[10px] text-white/60">
            {diff === 0 ? "E" : diff > 0 ? `+${diff}` : diff}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full"
          onClick={() => onChange(Math.min(15, score + 1))}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
