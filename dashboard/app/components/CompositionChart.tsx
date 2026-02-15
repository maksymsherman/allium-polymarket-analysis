"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { marketStructure } from "../data";
import { FONT, BLACK, GRAY, LIGHT, BINARY_COLOR, MULTI_COLOR } from "./chartTheme";

const data = [
  { label: "Binary", tokens: marketStructure.binary.tokens, questions: marketStructure.binary.questions, color: BINARY_COLOR },
  { label: "Multi-outcome", tokens: marketStructure.multi.tokens, questions: marketStructure.multi.questions, color: MULTI_COLOR },
  { label: "Unknown", tokens: marketStructure.unknown.tokens, questions: marketStructure.unknown.questions, color: LIGHT },
];

const formatN = (v: unknown) => Number(v).toLocaleString();

export default function CompositionChart() {
  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: BLACK, marginBottom: 4 }}>
        Market composition
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 14, color: GRAY, marginBottom: 16 }}>
        Multi-outcome tokens outnumber binary 7:1, but represent roughly equal question counts.
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p style={{ fontFamily: FONT, fontSize: 13, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            By token count
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={100} tick={{ fontFamily: FONT, fontSize: 13, fill: BLACK }} axisLine={false} tickLine={false} />
              <Bar dataKey="tokens" maxBarSize={24} radius={0}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="tokens" position="right" formatter={formatN} style={{ fontFamily: FONT, fontSize: 13, fill: BLACK }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p style={{ fontFamily: FONT, fontSize: 13, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            By question count
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={100} tick={{ fontFamily: FONT, fontSize: 13, fill: BLACK }} axisLine={false} tickLine={false} />
              <Bar dataKey="questions" maxBarSize={24} radius={0}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="questions" position="right" formatter={formatN} style={{ fontFamily: FONT, fontSize: 13, fill: BLACK }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
