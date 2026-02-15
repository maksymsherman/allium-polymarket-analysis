"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { categoryData } from "../data";
import { FONT, BLACK, GRAY, RULE, TICK, AXIS_LINE, TOOLTIP_STYLE, BINARY_COLOR, MULTI_COLOR } from "./chartTheme";

// Sort by total N descending
const sorted = [...categoryData].sort((a, b) => (b.multiN + b.binaryN) - (a.multiN + a.binaryN));

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof sorted[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <p style={{ fontWeight: 500, marginBottom: 2 }}>{d.category}</p>
      <p style={{ color: BINARY_COLOR }}>Binary: {d.binaryAcc}% <span style={{ color: GRAY }}>(n={d.binaryN.toLocaleString()})</span></p>
      <p style={{ color: MULTI_COLOR }}>Multi: {d.multiAcc}% <span style={{ color: GRAY }}>(n={d.multiN.toLocaleString()})</span></p>
    </div>
  );
}

export default function CategoryChart() {
  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: BLACK, marginBottom: 4 }}>
        Competitive accuracy by category
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 14, color: GRAY, marginBottom: 16 }}>
        Markets priced 10&ndash;90% only.{" "}
        <span style={{ color: BINARY_COLOR }}>Indigo = binary</span>,{" "}
        <span style={{ color: MULTI_COLOR }}>rose = multi-outcome</span>.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
          {[60, 70, 80, 90].map((x) => (
            <ReferenceLine key={x} x={x} stroke={RULE} strokeWidth={0.5} />
          ))}
          <XAxis
            type="number"
            domain={[50, 100]}
            ticks={[50, 60, 70, 80, 90, 100]}
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
          />
          <YAxis
            dataKey="category"
            type="category"
            width={80}
            tick={{ fontFamily: FONT, fontSize: 13, fill: BLACK }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="binaryAcc" fill={BINARY_COLOR} maxBarSize={12} radius={0}>
            <LabelList dataKey="binaryAcc" position="right" style={{ fontFamily: FONT, fontSize: 12, fill: BINARY_COLOR }} />
          </Bar>
          <Bar dataKey="multiAcc" fill={MULTI_COLOR} maxBarSize={12} radius={0}>
            <LabelList dataKey="multiAcc" position="right" style={{ fontFamily: FONT, fontSize: 12, fill: MULTI_COLOR }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
