"use client";

import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";

import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import ReviewDetailModal from "@/components/modules/review/ReviewDetailModalClient";
import { fetchOrderDetail, type OrderDetail } from "@/services/orders";
import { resolveWardLocation } from "@/utils/addressLookup";

type OrderDetailProps = {
  orderId: number;
  onBack?: () => void;
};

const formatPrice = (price: number) =>
  (price ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const formatDate = (dateString: string) => {
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

const renderVariantAttributes = (attrs?: Record<string, string>) => {
  if (!attrs) return "";
  return Object.entries(attrs)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

export default function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemForReview, setSelectedItemForReview] = useState<
    OrderDetail["items"][number] | null
  >(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewEditable, setReviewEditable] = useState(true);

  const loadOrderDetail = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrderDetail(id);
      setOrderDetail(data);
    } catch (err: any) {
      console.error("Failed to fetch order detail", err);
      const message =
        err?.response?.data?.message || "Unable to load order details.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order id.");
      setIsLoading(false);
      return;
    }

    loadOrderDetail(orderId);
  }, [orderId]);

  const handleOpenReview = (
    item: OrderDetail["items"][number],
    allowEdit: boolean
  ) => {
    setSelectedItemForReview(item);
    setReviewEditable(allowEdit);
    setIsReviewModalOpen(true);
  };

  if (isLoading) {
    return (
      <Panel title={`Order #${orderId}`}>
        <div className="text-sm text-slate-500">Loading order details...</div>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel
        title={`Order #${orderId}`}
        actions={
          onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              <FiArrowLeft />
              Back to orders
            </button>
          ) : undefined
        }
      >
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </Panel>
    );
  }

  if (!orderDetail) {
    return (
      <Panel title={`Order #${orderId}`}>
        <div className="text-sm text-slate-500">Order not found.</div>
      </Panel>
    );
  }

  const isDelivered =
    orderDetail.statusOrder?.toUpperCase?.() === "DELIVERED";
  const locationLabel = resolveWardLocation(
    orderDetail.addressInfo?.codeWard
  )?.label;

  return (
    <div className="space-y-6">
      <Panel
        title={`Order #${orderDetail.orderId}`}
        description={formatDate(orderDetail.orderDate)}
        actions={
          onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              <FiArrowLeft />
              Back to orders
            </button>
          ) : undefined
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>Status</span>
          <StatusBadge status={orderDetail.statusOrder} />
          <span className="text-slate-300">|</span>
          <span>Payment: {orderDetail.statusPay}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 font-semibold">Product</th>
                <th className="py-3 font-semibold">Price</th>
                <th className="py-3 font-semibold">Qty</th>
                <th className="py-3 font-semibold">Subtotal</th>
                <th className="py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orderDetail.items.map((item) => {
                const canWriteReview = item.canReview !== false;
                const canOpenReview = isDelivered;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.product?.thumbnail || "/placeholder.png"}
                          alt={item.product?.name || "Product"}
                          className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                          onError={(event) => {
                            event.currentTarget.src =
                              "https://via.placeholder.com/64?text=No+Img";
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.product?.name}
                          </p>
                          {item.product?.variantAttributes && (
                            <p className="text-xs text-slate-500">
                              {renderVariantAttributes(
                                item.product.variantAttributes
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-semibold">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="py-4">{item.quantity}</td>
                    <td className="py-4 font-semibold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(item, canWriteReview)}
                        disabled={!canOpenReview}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {!isDelivered
                          ? "Review locked"
                          : canWriteReview
                            ? "Review"
                            : "View review"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Order summary" className="h-full">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(orderDetail.totalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span className="font-semibold text-slate-900">
                -{formatPrice(orderDetail.totalDiscount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery fee</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(0)}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(orderDetail.totalPriceAfterDiscount)}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Payment" className="h-full">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Method</span>
              <span className="font-semibold text-slate-900">
                {orderDetail.typePay}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <StatusBadge status={orderDetail.statusPay} />
            </div>
          </div>
        </Panel>

        <Panel title="Delivery address" className="h-full">
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">
              {orderDetail.addressInfo?.nameRecipient}
            </p>
            <p>{orderDetail.addressInfo?.tel}</p>
            <p>{orderDetail.addressInfo?.detail || "-"}</p>
            {locationLabel && (
              <p className="text-xs text-slate-500">{locationLabel}</p>
            )}
            {orderDetail.addressInfo?.description && (
              <p className="text-xs text-slate-400">
                {orderDetail.addressInfo.description}
              </p>
            )}
          </div>
        </Panel>
      </div>

      {isReviewModalOpen && selectedItemForReview && (
        <ReviewDetailModal
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          productName={selectedItemForReview.product.name}
          productImage={selectedItemForReview.product.thumbnail}
          orderDetailId={selectedItemForReview.id}
          canEdit={reviewEditable}
          onSuccess={() => {
            toast.success("Review saved.");
            loadOrderDetail(orderId);
          }}
        />
      )}
    </div>
  );
}
