"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { marketStructure } from "../data";

const BLUE = "#2563eb";
const AMBER = "#d97706";
const GRAY = "#9ca3af";

const data = [
  {
    label: "Binary",
    tokens: marketStructure.binary.tokens,
    questions: marketStructure.binary.questions,
    color: BLUE,
  },
  {
    label: "Multi-outcome",
    tokens: marketStructure.multi.tokens,
    questions: marketStructure.multi.questions,
    color: AMBER,
  },
  {
    label: "Unknown",
    tokens: marketStructure.unknown.tokens,
    questions: marketStructure.unknown.questions,
    color: GRAY,
  },
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof data[0] }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-gray-900">{d.label}</p>
      <p className="text-gray-600">{d.tokens.toLocaleString()} tokens</p>
      <p className="text-gray-600">{d.questions.toLocaleString()} questions</p>
      {d.label === "Multi-outcome" && (
        <p className="text-gray-400 text-xs mt-1">Avg 7.1 tokens per question</p>
      )}
    </div>
  );
}

export default function CompositionChart() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Market Composition
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Multi-outcome tokens outnumber binary 7:1, but represent roughly equal question counts.
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">By Token Count</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 13, fill: "#374151" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tokens" maxBarSize={28} radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 12, fill: "#6b7280", formatter: (v) => Number(v).toLocaleString() }}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">By Question Count</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 13, fill: "#374151" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="questions" maxBarSize={28} radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 12, fill: "#6b7280", formatter: (v) => Number(v).toLocaleString() }}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
