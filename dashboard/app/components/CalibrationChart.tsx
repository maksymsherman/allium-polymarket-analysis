"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import { binaryCalibration, multiCalibration } from "../data";
import { FONT, BLACK, GRAY, RULE, TICK, AXIS_LINE, TOOLTIP_STYLE, BINARY_COLOR, MULTI_COLOR } from "./chartTheme";

const chartData = binaryCalibration.map((b, i) => {
  const m = multiCalibration[i];
  return {
    midpoint: b.midpoint,
    bucket: b.bucket,
    perfect: b.midpoint,
    binaryWinRate: b.winRate,
    binaryCiLo: b.ciLo,
    binaryCiHi: b.ciHi,
    binaryN: b.n,
    multiWinRate: m.winRate,
    multiN: m.n,
  };
});

const ciData = chartData.map((d) => ({
  ...d,
  binaryCiRange: [d.binaryCiLo, d.binaryCiHi] as [number, number],
}));

const last = ciData[ciData.length - 1];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof ciData[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <p style={{ fontWeight: 500, marginBottom: 2 }}>{d.bucket} implied</p>
      <p style={{ color: BINARY_COLOR }}>Binary: {d.binaryWinRate}% <span style={{ color: GRAY }}>(n={d.binaryN.toLocaleString()})</span></p>
      <p style={{ color: MULTI_COLOR }}>Multi: {d.multiWinRate}% <span style={{ color: GRAY }}>(n={d.multiN.toLocaleString()})</span></p>
      <p style={{ color: GRAY, marginTop: 2, fontSize: 11 }}>Perfect: {d.perfect}%</p>
    </div>
  );
}

export default function CalibrationChart() {
  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: BLACK, marginBottom: 4 }}>
        Calibration: implied probability vs actual outcome
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 14, color: GRAY, marginBottom: 16 }}>
        Above the diagonal = underpriced. Below = overpriced. Band = 95% CI for binary.
      </p>
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={ciData} margin={{ top: 12, right: 24, bottom: 32, left: 8 }}>
          <XAxis
            dataKey="midpoint"
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            label={{ value: "Implied probability (%)", position: "bottom", offset: 16, fontFamily: FONT, fontSize: 13, fill: BLACK }}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            label={{ value: "Actual outcome (%)", angle: -90, position: "insideLeft", offset: 4, fontFamily: FONT, fontSize: 13, fill: BLACK }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Thin horizontal rules */}
          {[25, 50, 75].map((y) => (
            <ReferenceLine key={y} y={y} stroke={RULE} strokeWidth={0.5} />
          ))}

          {/* Perfect calibration diagonal */}
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
            stroke={GRAY}
            strokeDasharray="4 3"
            strokeWidth={0.8}
          />

          {/* Binary CI band */}
          <Area
            dataKey="binaryCiRange"
            type="monotone"
            fill={BINARY_COLOR}
            fillOpacity={0.08}
            stroke="none"
          />

          {/* Binary — solid line */}
          <Line
            dataKey="binaryWinRate"
            type="monotone"
            stroke={BINARY_COLOR}
            strokeWidth={1.8}
            dot={{ r: 2.5, fill: BINARY_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 1.5, stroke: "white" }}
          />

          {/* Multi-outcome — dashed line */}
          <Line
            dataKey="multiWinRate"
            type="monotone"
            stroke={MULTI_COLOR}
            strokeWidth={1.8}
            strokeDasharray="6 3"
            dot={{ r: 2.5, fill: MULTI_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 1.5, stroke: "white" }}
          />

          {/* Direct labels where lines diverge most */}
          <ReferenceDot x={75} y={82.5} r={0}
            label={{ value: "Binary", position: "top", fill: BINARY_COLOR, fontFamily: FONT, fontSize: 13, offset: 6 }}
          />
          <ReferenceDot x={45} y={33} r={0}
            label={{ value: "Multi-outcome", position: "bottom", fill: MULTI_COLOR, fontFamily: FONT, fontSize: 13, offset: 8 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
