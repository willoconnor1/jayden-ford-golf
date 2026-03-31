"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { EnrichedTeeShot } from "@/lib/stats/dispersion";
import { CLUB_COLORS, CLUBS } from "@/lib/constants-clubs";
import { useDistanceUnit } from "@/hooks/use-distance-unit";

interface LeftRightStripSvgProps {
  shots: EnrichedTeeShot[];
}

export function LeftRightStripSvg({ shots }: LeftRightStripSvgProps) {
  const { dFeet, fLabel } = useDistanceUnit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [hoveredShot, setHoveredShot] = useState<EnrichedTeeShot | null>(null);
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

  const { xRange, width, height, padding, pxPerFoot } = useMemo(() => {
    const pad = { top: 15, bottom: 25, left: 15, right: 15 };
    const w = containerWidth;
    const h = 160;
    const maxAbsX = Math.max(30, ...shots.map((s) => Math.abs(s.missX)));
    const xR: [number, number] = [-maxAbsX * 1.15, maxAbsX * 1.15];
    const innerW = w - pad.left - pad.right;
    const ppf = innerW / (xR[1] - xR[0]);
    return { xRange: xR, width: w, height: h, padding: pad, pxPerFoot: ppf };
  }, [shots, containerWidth]);

  const toSvgX = (ft: number) => padding.left + (ft - xRange[0]) * pxPerFoot;
  const centerX = toSvgX(0);
  const stripY = padding.top + 30;
  const stripH = height - padding.top - padding.bottom - 30;

  const xGridStep = useMemo(() => {
    const span = xRange[1] - xRange[0];
    if (span <= 60) return 10;
    if (span <= 120) return 20;
    return 30;
  }, [xRange]);

  const xGridLines = useMemo(() => {
    const lines: number[] = [];
    const start = Math.ceil(xRange[0] / xGridStep) * xGridStep;
    for (let v = start; v <= xRange[1]; v += xGridStep) lines.push(v);
    return lines;
  }, [xRange, xGridStep]);

  // Jitter Y positions to avoid overlap
  const jitteredShots = useMemo(() => {
    return shots.map((shot) => ({
      shot,
      jitterY: stripY + 10 + Math.random() * (stripH - 20),
    }));
  }, [shots, stripY, stripH]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
      >
        {/* Fairway strip background */}
        <rect
          x={padding.left}
          y={stripY}
          width={width - padding.left - padding.right}
          height={stripH}
          rx={6}
          fill="rgba(74, 222, 128, 0.12)"
        />

        {/* Grid lines */}
        {xGridLines.map((v) => (
          <g key={`xg-${v}`}>
            <line
              x1={toSvgX(v)}
              x2={toSvgX(v)}
              y1={stripY}
              y2={stripY + stripH}
              stroke="white"
              strokeWidth={v === 0 ? 1 : 0.5}
              opacity={v === 0 ? 0.3 : 0.1}
              strokeDasharray={v === 0 ? undefined : "4 3"}
            />
            {v !== 0 && (
              <text
                x={toSvgX(v)}
                y={stripY + stripH + 14}
                textAnchor="middle"
                fill="white"
                fillOpacity={0.4}
                fontSize={9}
              >
                {v > 0 ? `${dFeet(v)}${fLabel}` : `${dFeet(Math.abs(v))}${fLabel}`}
              </text>
            )}
          </g>
        ))}

        {/* Center line label */}
        <text
          x={centerX}
          y={stripY - 6}
          textAnchor="middle"
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          Target
        </text>

        {/* Axis labels */}
        <text
          x={padding.left + 4}
          y={stripY - 6}
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          ← Left
        </text>
        <text
          x={width - padding.right - 4}
          y={stripY - 6}
          textAnchor="end"
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          Right →
        </text>

        {/* Target center (blue) & shot pattern center (red) */}
        {shots.length > 0 && (() => {
          const meanX = shots.reduce((s, sh) => s + sh.missX, 0) / shots.length;
          const midY = stripY + stripH / 2;
          return (
            <>
              <circle cx={toSvgX(0)} cy={midY} r={7} fill="#3b82f6" fillOpacity={0.9} stroke="white" strokeWidth={1.5} />
              <circle cx={toSvgX(meanX)} cy={midY} r={7} fill="#ef4444" fillOpacity={0.9} stroke="white" strokeWidth={1.5} />
            </>
          );
        })()}

        {/* Shot dots */}
        {jitteredShots.map(({ shot, jitterY }, i) => (
          <circle
            key={i}
            cx={toSvgX(shot.missX)}
            cy={jitterY}
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
        ))}
      </svg>

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
            {hoveredShot.missX === 0
              ? "On line"
              : `${dFeet(Math.abs(hoveredShot.missX)).toFixed(0)}${fLabel} ${hoveredShot.missX > 0 ? "right" : "left"}`}
          </p>
        </div>
      )}
    </div>
  );
}
