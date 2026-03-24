"use client";

import { useRef, useState, useCallback } from "react";

interface DriverMissInputProps {
  missX: number;
  onChange: (missX: number) => void;
}

const WIDTH = 200;
const HEIGHT = 60;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const ZOOM_STEPS = [10, 25, 50, 75, 100];
const DEFAULT_ZOOM_INDEX = 1; // 25ft

function getTicks(maxFeet: number): number[] {
  const step = maxFeet <= 10 ? 2 : maxFeet <= 25 ? 5 : maxFeet <= 50 ? 10 : maxFeet <= 75 ? 15 : 20;
  const ticks: number[] = [];
  for (let t = step; t <= maxFeet; t += step) {
    ticks.push(t);
    ticks.push(-t);
  }
  return ticks;
}

export function DriverMissInput({ missX, onChange }: DriverMissInputProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const dragStart = useRef<{ pointerX: number; ballX: number } | null>(null);

  const maxFeet = ZOOM_STEPS[zoomIndex];
  const pxPerFoot = (WIDTH / 2 - 10) / maxFeet;
  const ticks = getTicks(maxFeet);

  const toPixel = (feet: number) => feet * pxPerFoot;
  const dotX = CENTER_X + toPixel(missX);
  const absMiss = Math.abs(missX);
  const dirLabel = missX === 0 ? "center" : missX < 0 ? "left" : "right";

  const snap = useCallback((v: number) => Math.round(v), []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragStart.current = { pointerX: e.clientX, ballX: missX };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.pointerX;
    const feetDx = dx / pxPerFoot;
    const newX = snap(Math.max(-maxFeet, Math.min(maxFeet, dragStart.current.ballX + feetDx)));
    onChange(newX);
  };

  const handlePointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0) setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));
    else if (e.deltaY < 0) setZoomIndex((i) => Math.max(0, i - 1));
  };

  return (
    <div className="flex flex-col items-center gap-1" onWheel={handleWheel}>
      <div className="text-xs text-muted-foreground">
        Drag to mark miss ({absMiss}ft {dirLabel}) · ±{maxFeet}ft
      </div>
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        className="touch-none cursor-crosshair bg-muted/30 rounded-lg border"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Center fairway line */}
        <line x1={CENTER_X} y1={8} x2={CENTER_X} y2={HEIGHT - 8}
          stroke="currentColor" strokeWidth={1.5} opacity={0.25} />

        {/* Tick marks */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={CENTER_X + toPixel(t)} y1={CENTER_Y - 8}
              x2={CENTER_X + toPixel(t)} y2={CENTER_Y + 8}
              stroke="currentColor" strokeWidth={0.5} opacity={0.15}
            />
            {Math.abs(t) % (maxFeet <= 25 ? 10 : 20) === 0 && (
              <text
                x={CENTER_X + toPixel(t)} y={HEIGHT - 4}
                textAnchor="middle" fontSize={7} fill="currentColor" opacity={0.3}
              >
                {Math.abs(t)}ft
              </text>
            )}
          </g>
        ))}

        {/* Direction labels */}
        <text x={8} y={CENTER_Y + 3} textAnchor="start" fontSize={9} fill="currentColor" opacity={0.35}>L</text>
        <text x={WIDTH - 8} y={CENTER_Y + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.35}>R</text>

        {/* Miss line */}
        {missX !== 0 && (
          <line x1={CENTER_X} y1={CENTER_Y} x2={dotX} y2={CENTER_Y}
            stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="4 2" />
        )}

        {/* Draggable dot */}
        <circle
          cx={dotX} cy={CENTER_Y} r={7}
          fill="hsl(var(--destructive))" stroke="white" strokeWidth={2}
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  );
}
