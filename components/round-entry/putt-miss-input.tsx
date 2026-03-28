"use client";

import { useRef, useState, useCallback } from "react";

interface PuttMissInputProps {
  missX: number;
  missY: number;
  onChange: (missX: number, missY: number) => void;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const ZOOM_STEPS = [3, 5, 8, 12, 15];
const DEFAULT_ZOOM_INDEX = 1; // 5ft

function getRings(maxFeet: number): number[] {
  const step = maxFeet <= 5 ? 1 : maxFeet <= 12 ? 2 : 3;
  const rings: number[] = [];
  for (let r = step; r <= maxFeet; r += step) rings.push(r);
  return rings;
}

export function PuttMissInput({ missX, missY, onChange }: PuttMissInputProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const dragStart = useRef<{ pointerX: number; pointerY: number; ballX: number; ballY: number } | null>(null);
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  const maxFeet = ZOOM_STEPS[zoomIndex];
  const pxPerFoot = (SIZE / 2 - 10) / maxFeet;
  const rings = getRings(maxFeet);

  const toPixel = (feet: number) => feet * pxPerFoot;
  const dotX = CENTER + toPixel(missX);
  const dotY = CENTER - toPixel(missY);
  const distanceFt = Math.sqrt(missX * missX + missY * missY);

  const dirParts: string[] = [];
  if (missY > 0.25) dirParts.push("past");
  if (missY < -0.25) dirParts.push("short");
  if (missX < -0.25) dirParts.push("left");
  if (missX > 0.25) dirParts.push("right");
  const dirLabel = dirParts.join(", ") || "on line";

  const snap = useCallback((v: number) => Math.round(v * 2) / 2, []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = { startDist: dist, startZoom: zoomIndex };
      setDragging(false);
      return;
    }

    setDragging(true);
    dragStart.current = { pointerX: e.clientX, pointerY: e.clientY, ballX: missX, ballY: missY };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / pinchRef.current.startDist;
      let newIndex = pinchRef.current.startZoom;
      if (ratio < 0.7) newIndex = Math.min(ZOOM_STEPS.length - 1, pinchRef.current.startZoom + 1);
      else if (ratio > 1.4) newIndex = Math.max(0, pinchRef.current.startZoom - 1);
      if (newIndex !== zoomIndex) setZoomIndex(newIndex);
      return;
    }

    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.pointerX;
    const dy = e.clientY - dragStart.current.pointerY;
    const feetDx = dx / pxPerFoot;
    const feetDy = -dy / pxPerFoot;
    const newX = snap(Math.max(-maxFeet, Math.min(maxFeet, dragStart.current.ballX + feetDx)));
    const newY = snap(Math.max(-maxFeet, Math.min(maxFeet, dragStart.current.ballY + feetDy)));
    onChange(newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      setDragging(false);
      dragStart.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0) setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));
    else if (e.deltaY < 0) setZoomIndex((i) => Math.max(0, i - 1));
  };

  const labelX = (CENTER + dotX) / 2;
  const labelY = (CENTER + dotY) / 2 - 8;

  return (
    <div className="flex flex-col items-center gap-1 select-none" onWheel={handleWheel}>
      <div className="text-xs text-white/60">
        Drag ball to miss position ({distanceFt.toFixed(1)}ft, {dirLabel}) · ±{maxFeet}ft
      </div>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        className="touch-none cursor-crosshair rounded-lg border"
        style={{ background: "rgba(74, 222, 128, 0.15)" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {rings.map((r) => (
          <circle key={r} cx={CENTER} cy={CENTER} r={toPixel(r)}
            fill="none" stroke="currentColor" strokeWidth={0.5} opacity={0.15} strokeDasharray="3 3" />
        ))}
        {rings.map((r) => (
          <text key={r} x={CENTER + toPixel(r) + 2} y={CENTER - 2}
            fontSize={8} fill="currentColor" opacity={0.3}>{r}ft</text>
        ))}

        <line x1={CENTER} y1={SIZE - 10} x2={CENTER} y2={CENTER}
          stroke="currentColor" strokeWidth={1} opacity={0.2} />
        <polygon
          points={`${CENTER},${CENTER + 2} ${CENTER - 3},${CENTER + 8} ${CENTER + 3},${CENTER + 8}`}
          fill="currentColor" opacity={0.2} />

        <text x={CENTER} y={14} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>Past</text>
        <text x={CENTER} y={SIZE - 4} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>Putt</text>
        <text x={8} y={CENTER + 3} textAnchor="start" fontSize={9} fill="currentColor" opacity={0.35}>L</text>
        <text x={SIZE - 8} y={CENTER + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.35}>R</text>

        <circle cx={CENTER} cy={CENTER} r={5} fill="oklch(0.25 0.02 155)" opacity={0.5} />
        <circle cx={CENTER} cy={CENTER} r={3} fill="oklch(0.15 0.01 155)" opacity={0.7} />

        {(missX !== 0 || missY !== 0) && (
          <>
            <line x1={CENTER} y1={CENTER} x2={dotX} y2={dotY}
              stroke="rgba(74, 222, 128, 0.7)" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={labelX} y={labelY} textAnchor="middle"
              fontSize={10} fontWeight="bold" fill="rgba(34, 197, 94, 0.8)">
              {distanceFt.toFixed(1)}ft
            </text>
          </>
        )}

        {/* Golf ball */}
        <circle cx={dotX} cy={dotY} r={8} fill="white" stroke="#b0b0b0" strokeWidth={1} className="drop-shadow-sm" />
        <circle cx={dotX - 1} cy={dotY - 1} r={5} fill="none" stroke="#d4d4d4" strokeWidth={0.5} />
      </svg>
    </div>
  );
}
