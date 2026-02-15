"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { categoryData } from "../data";

const BLUE = "#2563eb";
const AMBER = "#d97706";

// Sort by multi-outcome N descending (most data first)
const sorted = [...categoryData].sort((a, b) => b.multiN + b.binaryN - (a.multiN + a.binaryN));

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof sorted[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-gray-900 mb-1">{d.category}</p>
      <p style={{ color: BLUE }}>
        Binary: {d.binaryAcc}%
        <span className="text-gray-400 ml-1">(n={d.binaryN.toLocaleString()})</span>
      </p>
      <p style={{ color: AMBER }}>
        Multi: {d.multiAcc}%
        <span className="text-gray-400 ml-1">(n={d.multiN.toLocaleString()})</span>
      </p>
    </div>
  );
}

export default function CategoryChart() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Competitive Accuracy by Category
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Markets priced 10–90% only. Sports are hardest to predict; weather is easiest.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            domain={[50, 100]}
            ticks={[50, 60, 70, 80, 90, 100]}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{ value: "Competitive Accuracy (%)", position: "bottom", offset: 0, fontSize: 13, fill: "#374151" }}
          />
          <YAxis
            dataKey="category"
            type="category"
            width={80}
            tick={{ fontSize: 13, fill: "#374151" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="binaryAcc" name="Binary" fill={BLUE} maxBarSize={14} radius={[0, 3, 3, 0]} />
          <Bar dataKey="multiAcc" name="Multi-outcome" fill={AMBER} maxBarSize={14} radius={[0, 3, 3, 0]} />
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
