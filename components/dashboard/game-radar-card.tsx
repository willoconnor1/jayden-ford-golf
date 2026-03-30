"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

interface GameRadarCardProps {
  sgAverages: {
    sgOffTheTee: number;
    sgApproach: number;
    sgAroundTheGreen: number;
    sgPutting: number;
  };
}

export function GameRadarCard({ sgAverages }: GameRadarCardProps) {
  // Normalize values to 0-100 scale for radar display
  // SG typically ranges from -2 to +2, shift to positive range
  const normalize = (val: number) => Math.max(0, Math.min(100, (val + 2) * 25));

  const data = [
    { stat: "Tee", value: normalize(sgAverages.sgOffTheTee) },
    { stat: "Approach", value: normalize(sgAverages.sgApproach) },
    { stat: "Short", value: normalize(sgAverages.sgAroundTheGreen) },
    { stat: "Putting", value: normalize(sgAverages.sgPutting) },
  ];

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium">Game Profile</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <Radar
                dataKey="value"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
