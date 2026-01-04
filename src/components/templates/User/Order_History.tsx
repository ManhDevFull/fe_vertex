"use client";

import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { toast } from "sonner";

import EmptyState from "@/components/ui/EmptyState";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import { fetchOrderHistory, type OrderHistoryItem } from "@/services/orders";

type OrderHistoryProps = {
  onSelectOrder: (id: number) => void;
};

const formatOrderDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatPrice = (price: number) => {
  return (price ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export default function OrderHistory({ onSelectOrder }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrderHistory();
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to fetch order history", err);
      const errorMessage =
        err?.response?.data?.message || "Unable to load order history.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <Panel
      title="Order history"
      description="Review your recent purchases and track their status."
    >
      {isLoading ? (
        <div className="text-sm text-slate-500">Loading orders...</div>
      ) : error ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will show up here."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 font-semibold">Order</th>
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold">Total</th>
                  <th className="py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-slate-100 text-slate-700 transition hover:bg-slate-50"
                  >
                    <td className="py-3 font-semibold text-slate-900">
                      #{order.orderId}
                    </td>
                    <td className="py-3">{formatOrderDate(order.orderDate)}</td>
                    <td className="py-3">
                      <StatusBadge status={order.statusOrder} />
                    </td>
                    <td className="py-3 font-semibold">
                      {formatPrice(order.totalPriceAfterDiscount)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order.orderId)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                      >
                        View details
                        <FiArrowRight className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 md:hidden">
            {orders.map((order) => (
              <button
                key={order.orderId}
                type="button"
                onClick={() => onSelectOrder(order.orderId)}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    Order #{order.orderId}
                  </span>
                  <StatusBadge status={order.statusOrder} />
                </div>
                <div className="text-sm text-slate-500">
                  {formatOrderDate(order.orderDate)}
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {formatPrice(order.totalPriceAfterDiscount)}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
