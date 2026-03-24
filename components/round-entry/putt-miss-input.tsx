"use client";

import { useRef, useState, useCallback } from "react";

interface PuttMissInputProps {
  missX: number;
  missY: number;
  onChange: (missX: number, missY: number) => void;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const MAX_FEET = 5;
const PX_PER_FOOT = (SIZE / 2 - 10) / MAX_FEET;
const RINGS = [1, 2, 3, 4, 5];

export function PuttMissInput({ missX, missY, onChange }: PuttMissInputProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const toPixel = (feet: number) => feet * PX_PER_FOOT;
  const dotX = CENTER + toPixel(missX);
  const dotY = CENTER - toPixel(missY); // invert Y: positive = up (past hole)

  const distanceFt = Math.sqrt(missX * missX + missY * missY);

  // Direction label
  const dirParts: string[] = [];
  if (missY > 0.25) dirParts.push("past");
  if (missY < -0.25) dirParts.push("short");
  if (missX < -0.25) dirParts.push("left");
  if (missX > 0.25) dirParts.push("right");
  const dirLabel = dirParts.join(", ") || "on line";

  const getCoords = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Snap to 0.5ft
      const feetX = Math.round(((px - CENTER) / PX_PER_FOOT) * 2) / 2;
      const feetY = Math.round((-(py - CENTER) / PX_PER_FOOT) * 2) / 2;
      const clampedX = Math.max(-MAX_FEET, Math.min(MAX_FEET, feetX));
      const clampedY = Math.max(-MAX_FEET, Math.min(MAX_FEET, feetY));
      return { x: clampedX, y: clampedY };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { x, y } = getCoords(e);
    onChange(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const { x, y } = getCoords(e);
    onChange(x, y);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const labelX = (CENTER + dotX) / 2;
  const labelY = (CENTER + dotY) / 2 - 8;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs text-muted-foreground">
        Drag ball to miss position ({distanceFt.toFixed(1)}ft, {dirLabel})
      </div>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        className="touch-none cursor-crosshair rounded-lg border"
        style={{ background: "oklch(0.96 0.02 145 / 0.3)" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Concentric rings at 1ft intervals */}
        {RINGS.map((r) => (
          <circle
            key={r}
            cx={CENTER}
            cy={CENTER}
            r={toPixel(r)}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.15}
            strokeDasharray="3 3"
          />
        ))}

        {/* Ring labels */}
        {RINGS.map((r) => (
          <text
            key={r}
            x={CENTER + toPixel(r) + 2}
            y={CENTER - 2}
            fontSize={8}
            fill="currentColor"
            opacity={0.3}
          >
            {r}ft
          </text>
        ))}

        {/* Putt approach line from bottom to center */}
        <line
          x1={CENTER}
          y1={SIZE - 10}
          x2={CENTER}
          y2={CENTER}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.2}
        />
        {/* Approach arrow */}
        <polygon
          points={`${CENTER},${CENTER + 2} ${CENTER - 3},${CENTER + 8} ${CENTER + 3},${CENTER + 8}`}
          fill="currentColor"
          opacity={0.2}
        />

        {/* Direction labels */}
        <text x={CENTER} y={14} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>
          Past
        </text>
        <text x={CENTER} y={SIZE - 4} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>
          Putt
        </text>
        <text x={8} y={CENTER + 3} textAnchor="start" fontSize={9} fill="currentColor" opacity={0.35}>
          L
        </text>
        <text x={SIZE - 8} y={CENTER + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.35}>
          R
        </text>

        {/* Hole (cup) at center */}
        <circle cx={CENTER} cy={CENTER} r={5} fill="oklch(0.25 0.02 155)" opacity={0.5} />
        <circle cx={CENTER} cy={CENTER} r={3} fill="oklch(0.15 0.01 155)" opacity={0.7} />

        {/* Miss line */}
        {(missX !== 0 || missY !== 0) && (
          <>
            <line
              x1={CENTER}
              y1={CENTER}
              x2={dotX}
              y2={dotY}
              stroke="hsl(var(--destructive))"
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fontSize={10}
              fontWeight="bold"
              fill="hsl(var(--destructive))"
            >
              {distanceFt.toFixed(1)}ft
            </text>
          </>
        )}

        {/* Golf ball (draggable) */}
        <circle
          cx={dotX}
          cy={dotY}
          r={8}
          fill="white"
          stroke="oklch(0.4 0 0)"
          strokeWidth={1.5}
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  );
}
