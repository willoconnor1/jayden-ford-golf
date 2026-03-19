import { cn, holeScoreColor } from "@/lib/utils";

interface ScoreIndicatorProps {
  score: number;
  par: number;
}

/**
 * Traditional golf scorecard indicator:
 * Eagle or better: double circle
 * Birdie: single circle
 * Par: plain number
 * Bogey: single square
 * Double bogey: double square
 * Triple bogey+: triple square
 */
export function ScoreIndicator({ score, par }: ScoreIndicatorProps) {
  const diff = score - par;
  const color = holeScoreColor(diff);
  const gap = "var(--color-background, white)";

  // Par — plain number
  if (diff === 0) return <span>{score}</span>;

  // Birdie — single circle
  if (diff === -1) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded-full border-[1.5px] border-current",
          color
        )}
      >
        {score}
      </span>
    );
  }

  // Eagle or better — double circle
  if (diff <= -2) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded-full border-[1.5px] border-current",
          color
        )}
        style={{
          boxShadow: `0 0 0 1.5px ${gap}, 0 0 0 3px currentColor`,
        }}
      >
        {score}
      </span>
    );
  }

  // Bogey — single square
  if (diff === 1) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 border-[1.5px] border-current",
          color
        )}
      >
        {score}
      </span>
    );
  }

  // Double bogey — double square
  if (diff === 2) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 border-[1.5px] border-current",
          color
        )}
        style={{
          boxShadow: `0 0 0 1.5px ${gap}, 0 0 0 3px currentColor`,
        }}
      >
        {score}
      </span>
    );
  }

  // Triple bogey or worse — triple square
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-5 h-5 border-[1.5px] border-current",
        color
      )}
      style={{
        boxShadow: `0 0 0 1.5px ${gap}, 0 0 0 3px currentColor, 0 0 0 4.5px ${gap}, 0 0 0 6px currentColor`,
      }}
    >
      {score}
    </span>
  );
}
