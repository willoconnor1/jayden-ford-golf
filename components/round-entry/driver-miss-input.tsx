"use client";

import { useRef, useState, useCallback } from "react";
import { Minus, Plus } from "lucide-react";

interface DriverMissInputProps {
  missX: number;
  onChange: (missX: number) => void;
}

const WIDTH = 200;
const HEIGHT = 60;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const ZOOM_STEPS = [10, 25, 50, 75, 100];
const DEFAULT_ZOOM_INDEX = 2; // 50yds

function getTicks(maxYards: number): number[] {
  const step = maxYards <= 10 ? 2 : maxYards <= 25 ? 5 : maxYards <= 50 ? 10 : maxYards <= 75 ? 15 : 20;
  const ticks: number[] = [];
  for (let t = step; t <= maxYards; t += step) {
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

  const maxYards = ZOOM_STEPS[zoomIndex];
  const pxPerYard = (WIDTH / 2 - 10) / maxYards;
  const ticks = getTicks(maxYards);

  const toPixel = (yards: number) => yards * pxPerYard;
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
    const yardsDx = dx / pxPerYard;
    const newX = snap(Math.max(-maxYards, Math.min(maxYards, dragStart.current.ballX + yardsDx)));
    onChange(newX);
  };

  const handlePointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const zoomIn = () => setZoomIndex((i) => Math.max(0, i - 1));
  const zoomOut = () => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="text-xs text-white/60">
        Drag to mark miss ({Math.round(absMiss)}yds {dirLabel}) · ±{maxYards}yds
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={zoomIn}
          className="flex items-center justify-center w-7 h-7 rounded-md border bg-background text-white/60 hover:bg-muted transition-colors"
          aria-label="Decrease range"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <svg
          ref={svgRef}
          width={WIDTH}
          height={HEIGHT}
          className="touch-none cursor-crosshair rounded-lg border"
          style={{ background: "rgba(74, 222, 128, 0.15)" }}
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
              {Math.abs(t) % (maxYards <= 25 ? 10 : 20) === 0 && (
                <text
                  x={CENTER_X + toPixel(t)} y={HEIGHT - 4}
                  textAnchor="middle" fontSize={7} fill="currentColor" opacity={0.3}
                >
                  {Math.abs(t)}yds
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
              stroke="rgba(74, 222, 128, 0.7)" strokeWidth={1.5} strokeDasharray="4 2" />
          )}

          {/* Golf ball */}
          <circle cx={dotX} cy={CENTER_Y} r={8} fill="white" stroke="#b0b0b0" strokeWidth={1} className="drop-shadow-sm" />
          <circle cx={dotX - 1} cy={CENTER_Y - 1} r={5} fill="none" stroke="#d4d4d4" strokeWidth={0.5} />
        </svg>
        <button
          type="button"
          onClick={zoomOut}
          className="flex items-center justify-center w-7 h-7 rounded-md border bg-background text-white/60 hover:bg-muted transition-colors"
          aria-label="Increase range"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="text-[10px] text-white/60/60">
        Use +/− to adjust range
      </div>
    </div>
  );
}
