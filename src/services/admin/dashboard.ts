import handleAPI from "@/axios/handleAPI";
import { toNumber, toString } from "@/services/shared";
import type {
  IAdminDashboardOrder,
  IAdminDashboardChange,
  IAdminDashboardSummary,
  IAdminDashboardTrendPoint,
  IOrderSummary,
  IReviewSummary,
} from "@/types/type";

type DashboardResponse = {
  status?: number;
  data?: unknown;
};

const normalizeOrderSummary = (payload: any): IOrderSummary => ({
  total: toNumber(payload?.total ?? payload?.Total),
  pending: toNumber(payload?.pending ?? payload?.Pending),
  shipped: toNumber(payload?.shipped ?? payload?.Shipped),
  delivered: toNumber(payload?.delivered ?? payload?.Delivered),
  cancelled: toNumber(payload?.cancelled ?? payload?.Cancelled),
  paid: toNumber(payload?.paid ?? payload?.Paid),
  unpaid: toNumber(payload?.unpaid ?? payload?.Unpaid),
  revenue: toNumber(payload?.revenue ?? payload?.Revenue),
});

const normalizeReviewSummary = (payload: any): IReviewSummary => ({
  total: toNumber(payload?.total ?? payload?.Total),
  updated: toNumber(payload?.updated ?? payload?.Updated),
  averageRating: toNumber(payload?.averageRating ?? payload?.AverageRating),
});

const normalizeRecentOrder = (payload: any): IAdminDashboardOrder => ({
  id: toNumber(payload?.id ?? payload?.Id),
  customerName: toString(payload?.customerName ?? payload?.CustomerName),
  customerEmail: toString(payload?.customerEmail ?? payload?.CustomerEmail),
  itemCount: toNumber(payload?.itemCount ?? payload?.ItemCount),
  totalPrice: toNumber(payload?.totalPrice ?? payload?.TotalPrice),
  statusOrder: toString(payload?.statusOrder ?? payload?.StatusOrder),
  statusPay: toString(payload?.statusPay ?? payload?.StatusPay),
  typePay: toString(payload?.typePay ?? payload?.TypePay),
  orderDate: toString(payload?.orderDate ?? payload?.OrderDate),
});

const normalizeDashboardChange = (payload: any): IAdminDashboardChange => ({
  revenuePercent: toNumber(payload?.revenuePercent ?? payload?.RevenuePercent),
  profitPercent: toNumber(payload?.profitPercent ?? payload?.ProfitPercent),
  orderPercent: toNumber(payload?.orderPercent ?? payload?.OrderPercent),
});

const normalizeTrendPoint = (payload: any): IAdminDashboardTrendPoint => ({
  date: toString(payload?.date ?? payload?.Date),
  revenue: toNumber(payload?.revenue ?? payload?.Revenue),
  cost: toNumber(payload?.cost ?? payload?.Cost),
  profit: toNumber(payload?.profit ?? payload?.Profit),
  orders: toNumber(payload?.orders ?? payload?.Orders),
});

const normalizeDashboardSummary = (payload: any): IAdminDashboardSummary => ({
  orderSummary: normalizeOrderSummary(payload?.orderSummary ?? payload?.OrderSummary),
  reviewSummary: normalizeReviewSummary(payload?.reviewSummary ?? payload?.ReviewSummary),
  totalCustomers: toNumber(payload?.totalCustomers ?? payload?.TotalCustomers),
  totalProducts: toNumber(payload?.totalProducts ?? payload?.TotalProducts),
  recentOrders: Array.isArray(payload?.recentOrders ?? payload?.RecentOrders)
    ? (payload?.recentOrders ?? payload?.RecentOrders).map(normalizeRecentOrder)
    : [],
  changes: normalizeDashboardChange(payload?.changes ?? payload?.Changes),
  trend: Array.isArray(payload?.trend ?? payload?.Trend)
    ? (payload?.trend ?? payload?.Trend).map(normalizeTrendPoint)
    : [],
  generatedAt: toString(payload?.generatedAt ?? payload?.GeneratedAt),
});

export const fetchDashboardSummary = async (): Promise<IAdminDashboardSummary> => {
  const response: DashboardResponse = await handleAPI(
    "admin/Dashboard/summary",
    undefined,
    "get"
  );
  const payload = (response?.data ?? response) as any;
  return normalizeDashboardSummary(payload);
};
