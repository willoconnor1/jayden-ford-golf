"use client";

import { useRef, useState, useCallback } from "react";

interface ShotMissInputProps {
  missX: number;
  missY: number;
  onChange: (missX: number, missY: number) => void;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const MAX_FEET = 25;
const PX_PER_FOOT = (SIZE / 2 - 10) / MAX_FEET; // leave 10px padding
const RINGS = [5, 10, 15, 20, 25];

export function ShotMissInput({ missX, missY, onChange }: ShotMissInputProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const toPixel = (feet: number) => feet * PX_PER_FOOT;
  const dotX = CENTER + toPixel(missX);
  const dotY = CENTER - toPixel(missY); // invert Y: positive = up

  const distanceFt = Math.sqrt(missX * missX + missY * missY);

  const getCoords = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const feetX = Math.round((px - CENTER) / PX_PER_FOOT);
      const feetY = Math.round(-(py - CENTER) / PX_PER_FOOT);
      // Clamp to max range
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

  // Label position (midpoint of line, offset slightly)
  const labelX = (CENTER + dotX) / 2;
  const labelY = (CENTER + dotY) / 2 - 8;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs text-muted-foreground">
        Drag to mark miss ({distanceFt.toFixed(0)}ft)
      </div>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        className="touch-none cursor-crosshair bg-muted/30 rounded-lg border"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Concentric rings */}
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
        {RINGS.filter((r) => r % 10 === 0).map((r) => (
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

        {/* Axis lines */}
        <line x1={CENTER} y1={10} x2={CENTER} y2={SIZE - 10} stroke="currentColor" strokeWidth={0.5} opacity={0.1} />
        <line x1={10} y1={CENTER} x2={SIZE - 10} y2={CENTER} stroke="currentColor" strokeWidth={0.5} opacity={0.1} />

        {/* Direction labels */}
        <text x={CENTER} y={14} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>Long</text>
        <text x={CENTER} y={SIZE - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>Short</text>
        <text x={8} y={CENTER + 3} textAnchor="start" fontSize={9} fill="currentColor" opacity={0.35}>L</text>
        <text x={SIZE - 8} y={CENTER + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.35}>R</text>

        {/* Center crosshair (target) */}
        <circle cx={CENTER} cy={CENTER} r={3} fill="currentColor" opacity={0.3} />

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
            {/* Distance label */}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fontSize={10}
              fontWeight="bold"
              fill="hsl(var(--destructive))"
            >
              {distanceFt.toFixed(0)}ft
            </text>
          </>
        )}

        {/* Draggable dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r={7}
          fill="hsl(var(--destructive))"
          stroke="white"
          strokeWidth={2}
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  );
}
