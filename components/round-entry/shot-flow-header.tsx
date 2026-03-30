"use client";

interface ShotFlowHeaderProps {
  holeNumber: number;
  totalHoles: number;
  par: number;
  distance: number;
  subtitle: string; // e.g. "Shot 2 · Fairway" or "Putt 1"
  progress: number; // 0–1
}

export function ShotFlowHeader({
  holeNumber,
  totalHoles,
  par,
  distance,
  subtitle,
  progress,
}: ShotFlowHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold">
          Hole {holeNumber} of {totalHoles}
          <span className="text-muted-foreground font-normal">
            {" "}· Par {par} · {distance} yds
          </span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${Math.max(1, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
