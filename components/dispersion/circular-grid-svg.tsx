"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { EnrichedApproachShot } from "@/lib/stats/dispersion";
import { CLUB_COLORS, CLUBS } from "@/lib/constants-clubs";
import { useDistanceUnit } from "@/hooks/use-distance-unit";

interface CircularGridSvgProps {
  shots: EnrichedApproachShot[];
}

export function CircularGridSvg({ shots }: CircularGridSvgProps) {
  const { dFeet, fLabel } = useDistanceUnit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [hoveredShot, setHoveredShot] = useState<EnrichedApproachShot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  const size = Math.min(containerWidth, 500);
  const center = size / 2;
  const padOuter = 40;

  const { rings, ringStep, pxPerFoot } = useMemo(() => {
    const maxMiss = Math.max(
      10,
      ...shots.map((s) => Math.sqrt(s.missX * s.missX + s.missY * s.missY))
    );
    const paddedMax = maxMiss * 1.15;

    let step: number;
    if (paddedMax <= 20) step = 5;
    else if (paddedMax <= 50) step = 10;
    else if (paddedMax <= 100) step = 20;
    else step = 30;

    const ringCount = Math.ceil(paddedMax / step);
    const r: number[] = [];
    for (let i = 1; i <= ringCount; i++) r.push(i * step);

    const maxRadius = center - padOuter;
    const ppf = maxRadius / (ringCount * step);

    return { rings: r, ringStep: step, pxPerFoot: ppf };
  }, [shots, center, padOuter]);

  const toSvgX = (ft: number) => center + ft * pxPerFoot;
  const toSvgY = (ft: number) => center - ft * pxPerFoot; // Y inverted: positive = long = up

  return (
    <div ref={containerRef} className="relative w-full flex justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {/* Background */}
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          rx={12}
          fill="rgba(74, 222, 128, 0.08)"
        />

        {/* Concentric circles */}
        {rings.map((r) => (
          <g key={`ring-${r}`}>
            <circle
              cx={center}
              cy={center}
              r={r * pxPerFoot}
              fill="none"
              stroke="white"
              strokeWidth={0.5}
              opacity={0.15}
              strokeDasharray="3 3"
            />
            <text
              x={center + r * pxPerFoot + 3}
              y={center - 3}
              fill="white"
              fillOpacity={0.35}
              fontSize={9}
            >
              {dFeet(r)}{fLabel}
            </text>
          </g>
        ))}

        {/* Crosshair */}
        <line
          x1={center}
          x2={center}
          y1={padOuter - 10}
          y2={size - padOuter + 10}
          stroke="white"
          strokeWidth={0.5}
          opacity={0.2}
        />
        <line
          x1={padOuter - 10}
          x2={size - padOuter + 10}
          y1={center}
          y2={center}
          stroke="white"
          strokeWidth={0.5}
          opacity={0.2}
        />

        {/* Axis labels */}
        <text
          x={center}
          y={padOuter - 16}
          textAnchor="middle"
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          Long
        </text>
        <text
          x={center}
          y={size - padOuter + 22}
          textAnchor="middle"
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          Short
        </text>
        <text
          x={padOuter - 16}
          y={center + 3}
          textAnchor="middle"
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          L
        </text>
        <text
          x={size - padOuter + 16}
          y={center + 3}
          textAnchor="middle"
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          R
        </text>

        {/* Target center (blue) — pin/flag */}
        <line
          x1={center}
          y1={center}
          x2={center}
          y2={center - 14}
          stroke="#3b82f6"
          strokeWidth={1.5}
        />
        <polygon
          points={`${center},${center - 14} ${center + 8},${center - 11} ${center},${center - 8}`}
          fill="#3b82f6"
          fillOpacity={0.8}
        />
        <circle cx={center} cy={center} r={7} fill="#3b82f6" fillOpacity={0.9} stroke="white" strokeWidth={1.5} />

        {/* Shot pattern center (red) */}
        {shots.length > 0 && (() => {
          const meanX = shots.reduce((s, sh) => s + sh.missX, 0) / shots.length;
          const meanY = shots.reduce((s, sh) => s + sh.missY, 0) / shots.length;
          return (
            <circle cx={toSvgX(meanX)} cy={toSvgY(meanY)} r={7} fill="#ef4444" fillOpacity={0.9} stroke="white" strokeWidth={1.5} />
          );
        })()}

        {/* Shot dots */}
        {shots.map((shot, i) => {
          const cx = toSvgX(shot.missX);
          const cy = toSvgY(shot.missY);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={5}
              fill={CLUB_COLORS[shot.club]}
              fillOpacity={0.75}
              stroke="white"
              strokeWidth={0.5}
              className="cursor-pointer"
              onPointerEnter={(e) => {
                setHoveredShot(shot);
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                  setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top - 10,
                  });
                }
              }}
              onPointerLeave={() => setHoveredShot(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredShot && (
        <div
          className="absolute z-10 bg-popover border rounded-md px-2.5 py-1.5 text-xs shadow-md pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-medium">
            {CLUBS.find((c) => c.value === hoveredShot.club)?.label}
          </p>
          <p className="text-muted-foreground">
            {hoveredShot.missX === 0 && hoveredShot.missY === 0
              ? "On target"
              : `${hoveredShot.missX !== 0 ? `${dFeet(Math.abs(hoveredShot.missX)).toFixed(0)}${fLabel} ${hoveredShot.missX > 0 ? "R" : "L"}` : ""}${hoveredShot.missX !== 0 && hoveredShot.missY !== 0 ? ", " : ""}${hoveredShot.missY !== 0 ? `${dFeet(Math.abs(hoveredShot.missY)).toFixed(0)}${fLabel} ${hoveredShot.missY > 0 ? "long" : "short"}` : ""}`}
          </p>
        </div>
      )}
    </div>
  );
}
