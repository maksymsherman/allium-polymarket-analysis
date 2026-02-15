"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { binaryCalibration, multiCalibration } from "../data";
import { FONT, BLACK, GRAY, TICK, AXIS_LINE, TOOLTIP_STYLE, BINARY_COLOR, MULTI_COLOR } from "./chartTheme";

const biasData = binaryCalibration.map((b, i) => {
  const m = multiCalibration[i];
  return {
    midpoint: String(b.midpoint),
    binaryBias: b.bias,
    multiBias: m.bias,
    bucket: b.bucket,
  };
});

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof biasData[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <p style={{ fontWeight: 500, marginBottom: 2 }}>{d.bucket}</p>
      <p style={{ color: BINARY_COLOR }}>Binary: {d.binaryBias > 0 ? "+" : ""}{d.binaryBias} pp</p>
      <p style={{ color: MULTI_COLOR }}>Multi: {d.multiBias > 0 ? "+" : ""}{d.multiBias} pp</p>
    </div>
  );
}

export default function BiasChart() {
  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: BLACK, marginBottom: 4 }}>
        Calibration bias by probability bucket
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 14, color: GRAY, marginBottom: 16 }}>
        Positive = underpriced. Negative = overpriced. Midpoint shown on axis.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={biasData} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
          <XAxis
            dataKey="midpoint"
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            label={{ value: "Implied probability (%)", position: "bottom", offset: 8, fontFamily: FONT, fontSize: 13, fill: BLACK }}
          />
          <YAxis
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            domain={[-8, 10]}
            ticks={[-5, 0, 5, 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke={BLACK} strokeWidth={0.5} />
          <Bar dataKey="binaryBias" fill={BINARY_COLOR} maxBarSize={16} radius={0} />
          <Bar dataKey="multiBias" fill={MULTI_COLOR} maxBarSize={16} radius={0} />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontFamily: FONT, fontSize: 13, color: GRAY, textAlign: "center", marginTop: 4 }}>
        <span style={{ color: BINARY_COLOR }}>Indigo = binary</span> &ensp;
        <span style={{ color: MULTI_COLOR }}>Rose = multi-outcome</span> &ensp;
        Units: percentage points
      </p>
    </div>
  );
}
