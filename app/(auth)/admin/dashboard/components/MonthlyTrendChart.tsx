"use client";

// components/MonthlyTrendChart.tsx
// Client Component — ใช้ recharts วาด Line Chart รายเดือน

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyData {
  month: string;   // "ม.ค.", "ก.พ.", ...
  count: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyData[];
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs">
      <p className="font-bold text-slate-300 mb-1">{label}</p>
      <p className="text-2xl font-black">{payload[0].value} <span className="text-slate-400 text-xs font-normal">เคส</span></p>
    </div>
  );
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-300 text-sm">
        ไม่มีข้อมูลรายเดือน
      </div>
    );
  }

  // คำนวณ trend เปรียบเทียบ 2 เดือนล่าสุด
  const last = data[data.length - 1]?.count ?? 0;
  const prev = data[data.length - 2]?.count ?? 0;
  const diff = last - prev;
  const pct = prev > 0 ? Math.round((diff / prev) * 100) : 0;

  const avg = Math.round(data.reduce((s, d) => s + d.count, 0) / data.length);

  return (
    <div>
      {/* Mini summary row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1.5">
          {diff > 0 ? (
            <TrendingUp size={16} className="text-red-500" />
          ) : diff < 0 ? (
            <TrendingDown size={16} className="text-emerald-500" />
          ) : (
            <Minus size={16} className="text-slate-400" />
          )}
          <span
            className={`text-sm font-black ${
              diff > 0 ? "text-red-500" : diff < 0 ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {diff > 0 ? "+" : ""}{pct}%
          </span>
          <span className="text-xs text-slate-400 font-medium">vs เดือนก่อน</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">
          เฉลี่ย <span className="text-slate-700 font-bold">{avg}</span> เคส/เดือน
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }} />

          {/* เส้นค่าเฉลี่ย */}
          <ReferenceLine
            y={avg}
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            label={{ value: `avg ${avg}`, position: "insideTopRight", fontSize: 10, fill: "#94a3b8" }}
          />

          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#1d4ed8", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
