"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArchive,
  FiDollarSign,
  FiLayers,
  FiPackage,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Skeleton from "@/components/ui/Skeleton";
import { Separator } from "@/components/ui/separator";
import DashboardCharts from "@/components/templates/Admin/Dashboard/DashboardCharts";
import RecentOrdersTable from "@/components/templates/Admin/Dashboard/RecentOrdersTable";
import StatCard from "@/components/templates/Admin/Dashboard/StatCard";
import { fetchDashboardSummary } from "@/services/admin/dashboard";
import type { IAdminDashboardSummary } from "@/types/type";
import { formatCurrency, formatDateTime } from "@/utils/orderHelpers";

const EMPTY_SUMMARY: IAdminDashboardSummary = {
  orderSummary: {
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    paid: 0,
    unpaid: 0,
    revenue: 0,
  },
  reviewSummary: {
    total: 0,
    updated: 0,
    averageRating: 0,
  },
  totalCustomers: 0,
  totalProducts: 0,
  recentOrders: [],
  changes: {
    revenuePercent: 0,
    profitPercent: 0,
    orderPercent: 0,
  },
  trend: [],
  generatedAt: "",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<IAdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
      setError("Unable to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const resolvedSummary = summary ?? EMPTY_SUMMARY;
  const lastUpdated = resolvedSummary.generatedAt
    ? formatDateTime(resolvedSummary.generatedAt)
    : "-";

  const recentWindow = useMemo(() => {
    if (resolvedSummary.trend.length <= 7) return resolvedSummary.trend;
    return resolvedSummary.trend.slice(-7);
  }, [resolvedSummary.trend]);

  // Summary cards use the last 7 days to match the trend change percentages.
  const recentRevenue = useMemo(
    () => recentWindow.reduce((sum, item) => sum + item.revenue, 0),
    [recentWindow]
  );
  const recentCost = useMemo(
    () => recentWindow.reduce((sum, item) => sum + item.cost, 0),
    [recentWindow]
  );
  const recentProfit = useMemo(
    () => recentWindow.reduce((sum, item) => sum + item.profit, 0),
    [recentWindow]
  );
  const recentOrders = useMemo(
    () => recentWindow.reduce((sum, item) => sum + item.orders, 0),
    [recentWindow]
  );

  return (
    <div className="flex h-full flex-col rounded-lg bg-[#D9D9D940] p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Snapshot of orders, revenue, and activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">Updated: {lastUpdated}</p>
          <button
            type="button"
            onClick={loadSummary}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Refresh
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-4 flex-1 overflow-auto pr-1">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="space-y-3 pt-5">
                    <Skeleton type="title" width="40%" height="12px" />
                    <Skeleton type="title" width="60%" height="28px" />
                    <Skeleton type="text" width="50%" height="10px" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  title="Revenue"
                  value={formatCurrency(recentRevenue)}
                  subtitle="Last 7 days"
                  icon={<FiDollarSign />}
                  accent="bg-emerald-600"
                  trend={resolvedSummary.changes.revenuePercent}
                  trendLabel="vs previous 7 days"
                />
                <StatCard
                  title="Profit"
                  value={formatCurrency(recentProfit)}
                  subtitle="Last 7 days"
                  icon={<FiTrendingUp />}
                  accent="bg-slate-900"
                  trend={resolvedSummary.changes.profitPercent}
                  trendLabel="vs previous 7 days"
                />
                <StatCard
                  title="Cost"
                  value={formatCurrency(recentCost)}
                  subtitle="Last 7 days"
                  icon={<FiArchive />}
                  accent="bg-amber-500"
                />
                <StatCard
                  title="Orders"
                  value={recentOrders.toString()}
                  subtitle="Last 7 days"
                  icon={<FiPackage />}
                  accent="bg-sky-600"
                  trend={resolvedSummary.changes.orderPercent}
                  trendLabel="vs previous 7 days"
                />
                <StatCard
                  title="Customers"
                  value={resolvedSummary.totalCustomers.toString()}
                  subtitle="All time"
                  icon={<FiUsers />}
                  accent="bg-indigo-600"
                />
                <StatCard
                  title="Products"
                  value={resolvedSummary.totalProducts.toString()}
                  subtitle="Active listings"
                  icon={<FiLayers />}
                  accent="bg-slate-700"
                />
              </>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="space-y-3 pt-5">
                    <Skeleton type="title" width="35%" height="12px" />
                    <Skeleton type="img" height="220px" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : resolvedSummary.trend.length === 0 ? (
            <Card>
              <CardContent className="pt-5 text-sm text-slate-500">
                Not enough data yet to build the trend charts.
              </CardContent>
            </Card>
          ) : (
            <DashboardCharts data={resolvedSummary.trend} />
          )}
        </div>
      </div>
    </div>
  );
}
