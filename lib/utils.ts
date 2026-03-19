import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Hole-level score-to-par text color */
export function holeScoreColor(scoreToPar: number): string {
  if (scoreToPar <= -2) return "text-red-700";      // eagle or better — dark red
  if (scoreToPar === -1) return "text-red-500";      // birdie — red
  if (scoreToPar === 0) return "";                   // even — standard
  if (scoreToPar === 1) return "text-sky-500";       // bogey — light blue
  return "text-blue-700";                            // double+ — dark blue
}

/** Round-level score-to-par badge classes (bg + text) */
export function roundBadgeColor(scoreToPar: number): string {
  if (scoreToPar === 0) return "bg-muted text-muted-foreground";
  if (scoreToPar < 0) {
    const abs = Math.abs(scoreToPar);
    if (abs === 1) return "bg-red-400 text-white";
    if (abs === 2) return "bg-red-500 text-white";
    if (abs === 3) return "bg-red-600 text-white";
    return "bg-red-700 text-white";                  // -4 or better
  }
  // over par
  if (scoreToPar === 1) return "bg-sky-400 text-white";
  if (scoreToPar === 2) return "bg-sky-500 text-white";
  if (scoreToPar === 3) return "bg-blue-500 text-white";
  return "bg-blue-700 text-white";                   // +4 or worse
}
