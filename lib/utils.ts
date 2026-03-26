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

/**
 * Round-level score-to-par badge classes (bg + text).
 * Gradient is smooth across a typical range (+8 to -10).
 * -1/-2 are light, -6 is solid, -9+ is dark. Same idea for over par.
 */
export function roundBadgeColor(scoreToPar: number): string {
  if (scoreToPar === 0) return "bg-muted text-muted-foreground font-semibold";

  if (scoreToPar < 0) {
    const abs = Math.abs(scoreToPar);
    if (abs === 1) return "bg-red-300/70 text-red-900 font-semibold";
    if (abs === 2) return "bg-red-300 text-red-900 font-semibold";
    if (abs === 3) return "bg-red-400/80 text-white font-semibold";
    if (abs === 4) return "bg-red-400 text-white font-semibold";
    if (abs === 5) return "bg-red-500/80 text-white font-semibold";
    if (abs === 6) return "bg-red-500 text-white font-semibold";
    if (abs === 7) return "bg-red-600/80 text-white font-semibold";
    if (abs === 8) return "bg-red-600 text-white font-semibold";
    return "bg-red-700 text-white font-semibold";     // -9 or better
  }

  // over par
  if (scoreToPar === 1) return "bg-sky-300/70 text-sky-900 font-semibold";
  if (scoreToPar === 2) return "bg-sky-300 text-sky-900 font-semibold";
  if (scoreToPar === 3) return "bg-sky-400/80 text-white font-semibold";
  if (scoreToPar === 4) return "bg-sky-400 text-white font-semibold";
  if (scoreToPar === 5) return "bg-blue-400/80 text-white font-semibold";
  if (scoreToPar === 6) return "bg-blue-500 text-white font-semibold";
  if (scoreToPar === 7) return "bg-blue-600/80 text-white font-semibold";
  if (scoreToPar === 8) return "bg-blue-600 text-white font-semibold";
  return "bg-blue-700 text-white font-semibold";      // +9 or worse
}
