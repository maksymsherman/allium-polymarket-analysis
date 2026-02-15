"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { binaryCalibration, multiCalibration } from "../data";

const BLUE = "#2563eb";
const BLUE_LIGHT = "#93bbfd";
const AMBER = "#d97706";
const AMBER_LIGHT = "#fbbf24";

const biasData = binaryCalibration.map((b, i) => {
  const m = multiCalibration[i];
  return {
    bucket: b.bucket,
    binaryBias: b.bias,
    multiBias: m.bias,
    binaryN: b.n,
    multiN: m.n,
  };
});

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof biasData[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-gray-900 mb-1">{d.bucket}</p>
      <p style={{ color: BLUE }}>
        Binary: {d.binaryBias > 0 ? "+" : ""}{d.binaryBias} pp
      </p>
      <p style={{ color: AMBER }}>
        Multi: {d.multiBias > 0 ? "+" : ""}{d.multiBias} pp
      </p>
    </div>
  );
}

export default function BiasChart() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Calibration Bias by Probability Bucket
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Positive = underpriced (events happen more). Negative = overpriced (events happen less).
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={biasData} margin={{ top: 8, right: 16, bottom: 32, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            angle={-35}
            textAnchor="end"
            height={60}
            label={{ value: "Implied Probability", position: "bottom", offset: 16, fontSize: 13, fill: "#374151" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{ value: "Bias (pp)", angle: -90, position: "insideLeft", offset: 4, fontSize: 13, fill: "#374151" }}
            domain={[-8, 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
          <Bar dataKey="binaryBias" name="Binary" maxBarSize={20} radius={[2, 2, 0, 0]}>
            {biasData.map((d, i) => (
              <Cell key={i} fill={d.binaryBias >= 0 ? BLUE : BLUE_LIGHT} />
            ))}
          </Bar>
          <Bar dataKey="multiBias" name="Multi-outcome" maxBarSize={20} radius={[2, 2, 0, 0]}>
            {biasData.map((d, i) => (
              <Cell key={i} fill={d.multiBias >= 0 ? AMBER : AMBER_LIGHT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-1 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: BLUE }} />
          Binary
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: AMBER }} />
          Multi-outcome
        </span>
      </div>
    </div>
  );
}
