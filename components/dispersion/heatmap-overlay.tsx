"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { EnrichedTeeShot, computeHeatmapGrid } from "@/lib/stats/dispersion";

interface HeatmapOverlayProps {
  shots: EnrichedTeeShot[];
}

export function HeatmapOverlay({ shots }: HeatmapOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

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

  const gridCols = 16;
  const gridRows = 24;

  const { cells, xRange, yRange, width, height, padding } = useMemo(() => {
    const pad = { top: 30, bottom: 40, left: 45, right: 15 };
    const w = containerWidth;
    const maxAbsX = Math.max(30, ...shots.map((s) => Math.abs(s.missX)));
    const xR: [number, number] = [-maxAbsX * 1.1, maxAbsX * 1.1];
    const rawMax = Math.max(...shots.map((s) => s.distanceHit));
    const rawMin = Math.min(...shots.map((s) => s.distanceHit));
    const span = rawMax - rawMin;
    const step = span <= 30 ? 5 : span <= 80 ? 10 : 25;
    const yR: [number, number] = [
      Math.max(0, Math.floor(rawMin / step) * step - step),
      Math.ceil(rawMax / step) * step + step,
    ];

    const innerW = w - pad.left - pad.right;
    const innerH = innerW * 2.5;
    const h = innerH + pad.top + pad.bottom;

    const c = computeHeatmapGrid(shots, gridCols, gridRows, xR, yR, "distanceHit");

    return { cells: c, xRange: xR, yRange: yR, width: w, height: h, padding: pad };
  }, [shots, containerWidth]);

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const cellW = innerW / gridCols;
  const cellH = innerH / gridRows;

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
          width={innerW}
          height={innerH}
          rx={8}
          fill="rgba(74, 222, 128, 0.08)"
        />

        {/* Heatmap cells */}
        {cells.map((cell) => (
          <rect
            key={`${cell.row}-${cell.col}`}
            x={padding.left + cell.col * cellW}
            y={padding.top + (gridRows - 1 - cell.row) * cellH}
            width={cellW}
            height={cellH}
            fill={`rgba(255, 100, 50, ${cell.opacity})`}
            rx={2}
          />
        ))}

        {/* Center line */}
        <line
          x1={width / 2}
          x2={width / 2}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="white"
          strokeWidth={0.5}
          opacity={0.2}
          strokeDasharray="4 3"
        />

        {/* Distance labels */}
        {(() => {
          const span = yRange[1] - yRange[0];
          const step = span <= 100 ? 25 : 50;
          const labels: React.ReactNode[] = [];
          const start = Math.ceil(yRange[0] / step) * step;
          for (let v = start; v <= yRange[1]; v += step) {
            const py =
              height -
              padding.bottom -
              ((v - yRange[0]) / (yRange[1] - yRange[0])) * innerH;
            labels.push(
              <text
                key={`yl-${v}`}
                x={padding.left - 5}
                y={py + 3}
                textAnchor="end"
                fill="white"
                fillOpacity={0.4}
                fontSize={9}
              >
                {v}yd
              </text>
            );
          }
          return labels;
        })()}

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
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 justify-center mt-2">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div className="flex h-2.5 rounded-sm overflow-hidden">
          {[0.1, 0.2, 0.35, 0.5, 0.65, 0.8].map((op) => (
            <div
              key={op}
              className="w-5 h-full"
              style={{ backgroundColor: `rgba(255, 100, 50, ${op})` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">High</span>
      </div>
    </div>
  );
}
