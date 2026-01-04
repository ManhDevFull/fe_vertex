import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import type { IAdminDashboardTrendPoint } from "@/types/type";
import { formatCurrency } from "@/utils/orderHelpers";

export type DashboardChartsProps = {
  data: IAdminDashboardTrendPoint[];
};

const revenueConfig = {
  revenue: { label: "Revenue", color: "#0f766e" },
  cost: { label: "Cost", color: "#f59e0b" },
  profit: { label: "Profit", color: "#2563eb" },
};

const ordersConfig = {
  orders: { label: "Orders", color: "#0f172a" },
};

const formatAxisDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN", { month: "short", day: "2-digit" });
};

const formatCompactCurrency = (value: number) => {
  if (Math.abs(value) < 1000) return formatCurrency(value);
  return `${(value / 1000000).toFixed(1)}M`;
};

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // Trend data is already aggregated per-day by the backend.
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle>Revenue, cost & profit</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ChartContainer config={revenueConfig}>
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatCompactCurrency}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <ChartTooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.15}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="var(--color-cost)"
                fill="var(--color-cost)"
                fillOpacity={0.12}
                name="Cost"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="var(--color-profit)"
                fill="var(--color-profit)"
                fillOpacity={0.2}
                name="Profit"
              />
            </AreaChart>
          </ChartContainer>
          <ChartLegend config={revenueConfig} className="mt-3" />
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle>Orders trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ChartContainer config={ordersConfig}>
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={12}
                allowDecimals={false}
              />
              <ChartTooltip />
              <Bar
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[6, 6, 0, 0]}
                name="Orders"
              />
            </BarChart>
          </ChartContainer>
          <ChartLegend config={ordersConfig} className="mt-3" />
        </CardContent>
      </Card>
    </div>
  );
}
