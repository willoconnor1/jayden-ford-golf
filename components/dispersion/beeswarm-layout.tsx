"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { EnrichedTeeShot } from "@/lib/stats/dispersion";
import { CLUB_COLORS, CLUBS } from "@/lib/constants-clubs";

interface BeeswarmLayoutProps {
  shots: EnrichedTeeShot[];
  mode: "fairway" | "left-right";
}

/**
 * Beeswarm layout: jitters dots to avoid overlap.
 * In "fairway" mode: X = missX, Y = distanceHit (jittered on X to avoid overlap)
 * In "left-right" mode: X = missX (jittered on Y to avoid overlap)
 */
export function BeeswarmLayout({ shots, mode }: BeeswarmLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isFairway = mode === "fairway";
  const padding = isFairway
    ? { top: 30, bottom: 40, left: 45, right: 15 }
    : { top: 15, bottom: 25, left: 15, right: 15 };

  const width = containerWidth;
  const innerW = width - padding.left - padding.right;
  const innerH = isFairway ? innerW * 2.5 : 130;
  const height = innerH + padding.top + padding.bottom;

  const maxAbsX = Math.max(30, ...shots.map((s) => Math.abs(s.missX)));
  const xRange: [number, number] = [-maxAbsX * 1.15, maxAbsX * 1.15];
  const pxPerFoot = innerW / (xRange[1] - xRange[0]);

  const rawMax = Math.max(...shots.map((s) => s.distanceHit));
  const rawMin = Math.min(...shots.map((s) => s.distanceHit));
  const distSpan = rawMax - rawMin;
  const distStep = distSpan <= 30 ? 5 : distSpan <= 80 ? 10 : 25;
  const yRange: [number, number] = [
    Math.max(0, Math.floor(rawMin / distStep) * distStep - distStep),
    Math.ceil(rawMax / distStep) * distStep + distStep,
  ];
  const pxPerYard = innerH / (yRange[1] - yRange[0]);

  const toSvgX = (ft: number) => padding.left + (ft - xRange[0]) * pxPerFoot;
  const toSvgY = (yds: number) =>
    height - padding.bottom - (yds - yRange[0]) * pxPerYard;

  // Simple force-jitter: for each shot, offset position slightly to avoid overlaps
  const positioned = useMemo(() => {
    const r = 5;
    const placed: { x: number; y: number; shot: EnrichedTeeShot }[] = [];

    for (const shot of shots) {
      let baseX = toSvgX(shot.missX);
      let baseY = isFairway
        ? toSvgY(shot.distanceHit)
        : padding.top + innerH / 2;

      // Check for overlaps and nudge
      let attempts = 0;
      let offsetX = 0;
      let offsetY = 0;
      while (attempts < 20) {
        const cx = baseX + offsetX;
        const cy = baseY + offsetY;
        const overlaps = placed.some(
          (p) => Math.hypot(p.x - cx, p.y - cy) < r * 2.2
        );
        if (!overlaps) break;
        attempts++;
        if (isFairway) {
          // Jitter horizontally
          offsetX = (attempts % 2 === 0 ? 1 : -1) * Math.ceil(attempts / 2) * r * 1.2;
        } else {
          // Jitter vertically
          offsetY = (attempts % 2 === 0 ? 1 : -1) * Math.ceil(attempts / 2) * r * 1.2;
        }
      }
      placed.push({ x: baseX + offsetX, y: baseY + offsetY, shot });
    }
    return placed;
  }, [shots, isFairway, toSvgX, toSvgY, padding.top, innerH]);

  const centerX = toSvgX(0);
  const hoveredShot = hoveredIdx !== null ? positioned[hoveredIdx] : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
        {/* Background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={innerW}
          height={innerH}
          rx={8}
          fill="rgba(74, 222, 128, 0.10)"
        />

        {/* Center line */}
        <line
          x1={centerX}
          x2={centerX}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="white"
          strokeWidth={0.5}
          opacity={0.25}
        />

        {/* Axis labels */}
        <text x={padding.left + 4} y={height - padding.bottom + 14} fill="white" fillOpacity={0.5} fontSize={10}>
          ← Left
        </text>
        <text x={width - padding.right - 4} y={height - padding.bottom + 14} textAnchor="end" fill="white" fillOpacity={0.5} fontSize={10}>
          Right →
        </text>

        {/* Dots */}
        {positioned.map(({ x, y, shot }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5}
            fill={CLUB_COLORS[shot.club]}
            fillOpacity={0.75}
            stroke="white"
            strokeWidth={hoveredIdx === i ? 1.5 : 0.5}
            className="cursor-pointer"
            onPointerEnter={() => setHoveredIdx(i)}
            onPointerLeave={() => setHoveredIdx(null)}
          />
        ))}
      </svg>

      {hoveredShot && (
        <div
          className="absolute z-10 bg-popover border rounded-md px-2.5 py-1.5 text-xs shadow-md pointer-events-none"
          style={{
            left: hoveredShot.x,
            top: hoveredShot.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-medium">
            {CLUBS.find((c) => c.value === hoveredShot.shot.club)?.label}
          </p>
          <p className="text-muted-foreground">
            {Math.abs(hoveredShot.shot.missX).toFixed(0)}ft{" "}
            {hoveredShot.shot.missX >= 0 ? "R" : "L"}
            {isFairway && ` · ${hoveredShot.shot.distanceHit.toFixed(0)}yd`}
          </p>
        </div>
      )}
    </div>
  );
}
