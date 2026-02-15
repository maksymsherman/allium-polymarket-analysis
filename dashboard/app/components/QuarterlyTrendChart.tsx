"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { quarterData, type QuarterRow } from "../data";
import { FONT, BLACK, GRAY, RULE, TICK, AXIS_LINE, TOOLTIP_STYLE, BINARY_COLOR, MULTI_COLOR } from "./chartTheme";

function isIncomplete(row: QuarterRow): boolean {
  if (!row.maxResolutionDate) return false;
  const maxDate = new Date(row.maxResolutionDate);
  const qStart = new Date(row.quarter.replace("-Q1", "-01-01").replace("-Q2", "-04-01").replace("-Q3", "-07-01").replace("-Q4", "-10-01"));
  const daysSinceStart = (maxDate.getTime() - qStart.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceStart < 75;
}

const chartData = quarterData.map((q) => ({
  ...q,
  incomplete: isIncomplete(q),
  label: `'${q.quarter.slice(2, 4)}-${q.quarter.slice(5)}`,
}));

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <p style={{ fontWeight: 500, marginBottom: 2 }}>
        {d.quarter}
        {d.incomplete && <span style={{ color: GRAY }}> (incomplete)</span>}
      </p>
      {d.binaryAcc != null && (
        <p style={{ color: BINARY_COLOR }}>Binary: {d.binaryAcc}% <span style={{ color: GRAY }}>(n={d.binaryN.toLocaleString()})</span></p>
      )}
      {d.multiAcc != null && (
        <p style={{ color: MULTI_COLOR }}>Multi: {d.multiAcc}% <span style={{ color: GRAY }}>(n={d.multiN.toLocaleString()})</span></p>
      )}
    </div>
  );
}

export default function QuarterlyTrendChart() {
  if (quarterData.length === 0) return null;

  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: BLACK, marginBottom: 4 }}>
        Competitive accuracy over time
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 14, color: GRAY, marginBottom: 16 }}>
        Accuracy for markets priced 10&ndash;90%, by quarter (2023+).{" "}
        <span style={{ color: BINARY_COLOR }}>Solid = binary</span>,{" "}
        <span style={{ color: MULTI_COLOR }}>dashed = multi-outcome</span>.
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
          {[60, 70, 80].map((y) => (
            <ReferenceLine key={y} y={y} stroke={RULE} strokeWidth={0.5} />
          ))}
          <XAxis
            dataKey="label"
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
          />
          <YAxis
            domain={[50, 100]}
            ticks={[50, 60, 70, 80, 90, 100]}
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Binary — solid */}
          <Line
            dataKey="binaryAcc"
            type="monotone"
            stroke={BINARY_COLOR}
            strokeWidth={1.8}
            dot={{ r: 2.5, fill: BINARY_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 1.5, stroke: "white" }}
            connectNulls
          />

          {/* Multi-outcome — dashed */}
          <Line
            dataKey="multiAcc"
            type="monotone"
            stroke={MULTI_COLOR}
            strokeWidth={1.8}
            strokeDasharray="6 3"
            dot={{ r: 2.5, fill: MULTI_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 1.5, stroke: "white" }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
