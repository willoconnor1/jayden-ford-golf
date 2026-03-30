"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { EnrichedTeeShot } from "@/lib/stats/dispersion";
import { CLUB_COLORS, CLUBS } from "@/lib/constants-clubs";

interface FairwayScatterSvgProps {
  shots: EnrichedTeeShot[];
}

export function FairwayScatterSvg({ shots }: FairwayScatterSvgProps) {
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

  const { xRange, yRange, pxPerFoot, pxPerYard, width, height, padding } =
    useMemo(() => {
      const pad = { top: 30, bottom: 40, left: 45, right: 15 };
      const w = containerWidth;
      const maxAbsX = Math.max(30, ...shots.map((s) => Math.abs(s.missX)));
      const xR: [number, number] = [-maxAbsX * 1.1, maxAbsX * 1.1];

      const rawMax = Math.max(...shots.map((s) => s.distanceHit));
      const rawMin = Math.min(...shots.map((s) => s.distanceHit));
      const span = rawMax - rawMin;
      // Pick a nice rounding step based on the data range
      const step = span <= 30 ? 5 : span <= 80 ? 10 : 25;
      const yR: [number, number] = [
        Math.max(0, Math.floor(rawMin / step) * step - step),
        Math.ceil(rawMax / step) * step + step,
      ];

      const innerW = w - pad.left - pad.right;
      const aspectRatio = 2.5;
      const innerH = innerW * aspectRatio;
      const h = innerH + pad.top + pad.bottom;

      const ppf = innerW / (xR[1] - xR[0]);
      const ppy = innerH / (yR[1] - yR[0]);

      return {
        xRange: xR,
        yRange: yR,
        pxPerFoot: ppf,
        pxPerYard: ppy,
        width: w,
        height: h,
        padding: pad,
      };
    }, [shots, containerWidth]);

  const toSvgX = (ft: number) => padding.left + (ft - xRange[0]) * pxPerFoot;
  const toSvgY = (yds: number) =>
    height - padding.bottom - (yds - yRange[0]) * pxPerYard;

  const yGridStep = useMemo(() => {
    const span = yRange[1] - yRange[0];
    if (span <= 100) return 25;
    if (span <= 200) return 50;
    return 50;
  }, [yRange]);

  const xGridStep = useMemo(() => {
    const span = xRange[1] - xRange[0];
    if (span <= 60) return 10;
    if (span <= 120) return 20;
    return 30;
  }, [xRange]);

  const yGridLines = useMemo(() => {
    const lines: number[] = [];
    const start = Math.ceil(yRange[0] / yGridStep) * yGridStep;
    for (let v = start; v <= yRange[1]; v += yGridStep) lines.push(v);
    return lines;
  }, [yRange, yGridStep]);

  const xGridLines = useMemo(() => {
    const lines: number[] = [];
    const start = Math.ceil(xRange[0] / xGridStep) * xGridStep;
    for (let v = start; v <= xRange[1]; v += xGridStep) lines.push(v);
    return lines;
  }, [xRange, xGridStep]);

  const centerX = toSvgX(0);
  const roughWidth = Math.max(20, (width - padding.left - padding.right) * 0.08);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
      >
        {/* Fairway background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={width - padding.left - padding.right}
          height={height - padding.top - padding.bottom}
          rx={8}
          fill="rgba(74, 222, 128, 0.12)"
        />

        {/* Rough edges */}
        <rect
          x={padding.left}
          y={padding.top}
          width={roughWidth}
          height={height - padding.top - padding.bottom}
          rx={8}
          fill="rgba(34, 120, 50, 0.15)"
        />
        <rect
          x={width - padding.right - roughWidth}
          y={padding.top}
          width={roughWidth}
          height={height - padding.top - padding.bottom}
          rx={8}
          fill="rgba(34, 120, 50, 0.15)"
        />

        {/* Y-axis grid (distance) */}
        {yGridLines.map((v) => (
          <g key={`yg-${v}`}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={toSvgY(v)}
              y2={toSvgY(v)}
              stroke="white"
              strokeWidth={0.5}
              opacity={0.15}
              strokeDasharray="4 3"
            />
            <text
              x={padding.left - 5}
              y={toSvgY(v) + 3}
              textAnchor="end"
              fill="white"
              fillOpacity={0.4}
              fontSize={9}
            >
              {v}yd
            </text>
          </g>
        ))}

        {/* X-axis grid (lateral) */}
        {xGridLines.map((v) => (
          <g key={`xg-${v}`}>
            <line
              x1={toSvgX(v)}
              x2={toSvgX(v)}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="white"
              strokeWidth={0.5}
              opacity={v === 0 ? 0.3 : 0.1}
              strokeDasharray={v === 0 ? undefined : "4 3"}
            />
            {v !== 0 && (
              <text
                x={toSvgX(v)}
                y={height - padding.bottom + 14}
                textAnchor="middle"
                fill="white"
                fillOpacity={0.4}
                fontSize={9}
              >
                {v > 0 ? `${v}ft R` : `${Math.abs(v)}ft L`}
              </text>
            )}
          </g>
        ))}

        {/* Center line */}
        <line
          x1={centerX}
          x2={centerX}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="white"
          strokeWidth={1}
          opacity={0.25}
        />

        {/* Tee box marker */}
        <rect
          x={centerX - 15}
          y={height - padding.bottom - 8}
          width={30}
          height={6}
          rx={2}
          fill="rgba(139, 119, 80, 0.4)"
        />

        {/* Axis labels */}
        <text
          x={padding.left + 4}
          y={height - padding.bottom + 14}
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          ← Left
        </text>
        <text
          x={width - padding.right - 4}
          y={height - padding.bottom + 14}
          textAnchor="end"
          fill="white"
          fillOpacity={0.5}
          fontSize={10}
        >
          Right →
        </text>

        {/* Shot dots */}
        {shots.map((shot, i) => {
          const cx = toSvgX(shot.missX);
          const cy = toSvgY(shot.distanceHit);
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
            {hoveredShot.distanceHit.toFixed(0)}yd drive
            {hoveredShot.missX !== 0 &&
              ` · ${Math.abs(hoveredShot.missX).toFixed(0)}ft ${hoveredShot.missX > 0 ? "right" : "left"}`}
          </p>
        </div>
      )}
    </div>
  );
}
