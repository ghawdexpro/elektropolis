"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn, formatPrice } from "@/lib/utils";

interface RevenueChartProps {
  data: { date: string; revenue: number; orders: number }[];
}

const PERIODS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "All", days: 0 },
] as const;

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { date: string; revenue: number; orders: number } }[];
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg shadow-black/[0.06]">
      <p className="text-xs font-medium text-muted">{formatDateShort(d.date)}</p>
      <p className="mt-1 text-lg font-bold tracking-tight text-charcoal">
        {formatPrice(d.revenue)}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {d.orders} order{d.orders !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<number>(30);

  const filtered = useMemo(() => {
    if (period === 0) return data;
    return data.slice(-period);
  }, [data, period]);

  const totalRevenue = filtered.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = filtered.reduce((sum, d) => sum + d.orders, 0);

  // Determine tick interval based on data length
  const tickInterval = filtered.length <= 10 ? 0 : Math.floor(filtered.length / 6);

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-base font-semibold text-charcoal">Revenue</h3>
            <span className="text-xs text-muted">
              {totalOrders} order{totalOrders !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-charcoal">
            {formatPrice(totalRevenue)}
          </p>
        </div>

        {/* Period tabs */}
        <div className="flex rounded-lg border border-border bg-surface/50 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.days)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                period === p.days
                  ? "bg-card text-charcoal shadow-sm"
                  : "text-muted hover:text-charcoal"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-2 pt-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={filtered}
            margin={{ top: 4, right: 12, bottom: 0, left: 12 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF580D" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#FF580D" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#8A8A86", fontFamily: "DM Sans" }}
              tickFormatter={formatDateShort}
              interval={tickInterval}
              dy={8}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#E8E8E4",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF580D"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#FF580D",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
