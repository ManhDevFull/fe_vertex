import type { ReactNode } from "react";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: string;
  trend?: number;
  trendLabel?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "bg-slate-900",
  trend,
  trendLabel = "vs last period",
}: StatCardProps) {
  const hasTrend = typeof trend === "number";
  const trendUp = hasTrend ? trend >= 0 : false;
  const trendText = hasTrend
    ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`
    : "";

  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-between gap-4 pt-5">
        <div>
          <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {hasTrend && (
            <div
              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
                trendUp ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trendUp ? <FiArrowUpRight /> : <FiArrowDownRight />}
              <span>{trendText}</span>
              <span className="font-normal text-slate-400">{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${accent}`}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
