import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

type ChartContainerProps = {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
};

export function ChartContainer({ config, children, className }: ChartContainerProps) {
  // Inject CSS variables so Recharts can reference series colors.
  const style = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [`--color-${key}`, item.color])
  ) as React.CSSProperties;

  return (
    <div className={cn("h-72 w-full", className)} style={style}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  );
}

type ChartTooltipContentProps = TooltipProps<number, string> & {
  hideLabel?: boolean;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      {!hideLabel && (
        <div className="mb-1 text-[11px] font-semibold text-slate-500">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600">{item.name}</span>
            <span className="ml-auto font-semibold text-slate-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return (
    <RechartsTooltip
      cursor={{ strokeDasharray: "4 4" }}
      content={<ChartTooltipContent />}
      {...props}
    />
  );
}

type ChartLegendProps = {
  config: ChartConfig;
  className?: string;
};

export function ChartLegend({ config, className }: ChartLegendProps) {
  return (
    <div className={cn("flex flex-wrap gap-3 text-xs text-slate-500", className)}>
      {Object.entries(config).map(([key, item]) => (
        <div key={key} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
