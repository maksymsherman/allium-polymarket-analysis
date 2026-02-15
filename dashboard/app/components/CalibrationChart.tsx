"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { binaryCalibration, multiCalibration } from "../data";

const BLUE = "#2563eb";
const AMBER = "#d97706";

// Merge binary and multi-outcome into one dataset for the chart
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

// For the CI band area, recharts needs [lo, hi] range
const ciData = chartData.map((d) => ({
  ...d,
  binaryCiRange: [d.binaryCiLo, d.binaryCiHi] as [number, number],
}));

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof ciData[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-gray-900 mb-1">{d.bucket} implied</p>
      <p style={{ color: BLUE }}>
        Binary: {d.binaryWinRate}% actual
        <span className="text-gray-400 ml-1">(n={d.binaryN.toLocaleString()})</span>
      </p>
      <p style={{ color: AMBER }}>
        Multi: {d.multiWinRate}% actual
        <span className="text-gray-400 ml-1">(n={d.multiN.toLocaleString()})</span>
      </p>
      <p className="text-gray-400 mt-1">Perfect: {d.perfect}%</p>
    </div>
  );
}

export default function CalibrationChart() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Calibration: Implied Probability vs Actual Outcome
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Points above the diagonal = underpriced (events happen more than predicted).
        Below = overpriced. Shaded band = 95% CI for binary markets.
      </p>
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={ciData} margin={{ top: 8, right: 24, bottom: 32, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="midpoint"
            type="number"
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{ value: "Implied Probability (%)", position: "bottom", offset: 16, fontSize: 13, fill: "#374151" }}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{ value: "Actual Win Rate (%)", angle: -90, position: "insideLeft", offset: 4, fontSize: 13, fill: "#374151" }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Perfect calibration diagonal */}
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
            stroke="#d1d5db"
            strokeDasharray="6 4"
            strokeWidth={1.5}
          />

          {/* Binary CI band */}
          <Area
            dataKey="binaryCiRange"
            type="monotone"
            fill={BLUE}
            fillOpacity={0.1}
            stroke="none"
          />

          {/* Binary markets line */}
          <Line
            dataKey="binaryWinRate"
            type="monotone"
            stroke={BLUE}
            strokeWidth={2.5}
            dot={{ r: 4, fill: BLUE, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            name="Binary"
          />

          {/* Multi-outcome markets line */}
          <Line
            dataKey="multiWinRate"
            type="monotone"
            stroke={AMBER}
            strokeWidth={2.5}
            dot={{ r: 4, fill: AMBER, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            name="Multi-outcome"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: BLUE }} />
          Binary markets (n=11,296)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: AMBER }} />
          Multi-outcome tokens (n=65,145)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ backgroundColor: "#d1d5db", borderTop: "1px dashed #d1d5db" }} />
          Perfect calibration
        </span>
      </div>
    </div>
  );
}
