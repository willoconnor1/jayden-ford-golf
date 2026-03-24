"use client";

import { useRef, useState, useCallback } from "react";

interface ShotMissInputProps {
  missX: number;
  missY: number;
  onChange: (missX: number, missY: number) => void;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const ZOOM_STEPS = [10, 25, 50, 75, 100];
const DEFAULT_ZOOM_INDEX = 1; // 25ft

function getRings(maxFeet: number): number[] {
  const step = maxFeet <= 10 ? 2 : maxFeet <= 25 ? 5 : maxFeet <= 50 ? 10 : maxFeet <= 75 ? 15 : 20;
  const rings: number[] = [];
  for (let r = step; r <= maxFeet; r += step) rings.push(r);
  return rings;
}

export function ShotMissInput({ missX, missY, onChange }: ShotMissInputProps) {
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

  const snap = useCallback((v: number) => Math.round(v), []);

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
    <div className="flex flex-col items-center gap-1" onWheel={handleWheel}>
      <div className="text-xs text-muted-foreground">
        Drag to mark miss ({distanceFt.toFixed(0)}ft) · ±{maxFeet}ft
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
        {rings.map((r) => (
          <circle key={r} cx={CENTER} cy={CENTER} r={toPixel(r)}
            fill="none" stroke="currentColor" strokeWidth={0.5} opacity={0.15} strokeDasharray="3 3" />
        ))}
        {rings.filter((r) => r % (maxFeet <= 25 ? 10 : 20) === 0 || rings.length <= 5).map((r) => (
          <text key={r} x={CENTER + toPixel(r) + 2} y={CENTER - 2}
            fontSize={8} fill="currentColor" opacity={0.3}>{r}ft</text>
        ))}

        <line x1={CENTER} y1={10} x2={CENTER} y2={SIZE - 10} stroke="currentColor" strokeWidth={0.5} opacity={0.1} />
        <line x1={10} y1={CENTER} x2={SIZE - 10} y2={CENTER} stroke="currentColor" strokeWidth={0.5} opacity={0.1} />

        <text x={CENTER} y={14} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>Long</text>
        <text x={CENTER} y={SIZE - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>Short</text>
        <text x={8} y={CENTER + 3} textAnchor="start" fontSize={9} fill="currentColor" opacity={0.35}>L</text>
        <text x={SIZE - 8} y={CENTER + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.35}>R</text>

        <circle cx={CENTER} cy={CENTER} r={3} fill="currentColor" opacity={0.3} />

        {(missX !== 0 || missY !== 0) && (
          <>
            <line x1={CENTER} y1={CENTER} x2={dotX} y2={dotY}
              stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={labelX} y={labelY} textAnchor="middle"
              fontSize={10} fontWeight="bold" fill="hsl(var(--destructive))">
              {distanceFt.toFixed(0)}ft
            </text>
          </>
        )}

        <circle cx={dotX} cy={dotY} r={7}
          fill="hsl(var(--destructive))" stroke="white" strokeWidth={2} className="drop-shadow-sm" />
      </svg>
    </div>
  );
}
