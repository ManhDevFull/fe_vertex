"use client";

import { useEffect, useState } from "react";
import handleAPI from "@/axios/handleAPI";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import LoaderText from "@/components/ui/LoadingText";
import { Button } from "@/components/ui/button";
import { IOrderAdmin } from "@/types/type";
import {
  formatCurrency,
  formatDateTime,
  formatVariant,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  PAY_TYPE_STYLES,
  badgeClass,
  extractErrorMessage,
} from "@/utils/orderHelpers";

interface OrderDetailModalProps {
  open: boolean;
  orderId: number | null;
  fallback?: IOrderAdmin | null;
  onClose: () => void;
}

export default function OrderDetailModal({
  open,
  orderId,
  fallback,
  onClose,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<IOrderAdmin | null>(fallback ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && fallback) {
      setOrder(fallback);
    }
  }, [open, fallback]);

  useEffect(() => {
    let cancelled = false;
    if (!open || !orderId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await handleAPI(`/admin/Order/${orderId}`);
        if (cancelled) return;
        if (res.status === 200) {
          const payload = (res as any)?.data ?? res;
          const normalized = payload?.data ?? payload;
          setOrder(normalized as IOrderAdmin);
        } else {
          setError("KhA'ng tA�m th���y thA'ng tin �`��n hA�ng");
        }
      } catch (err) {
        if (!cancelled) {
          setError(extractErrorMessage(err, "KhA'ng th��� t���i chi ti���t �`��n hA�ng"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [open, orderId]);

  if (!open) return null;

  const orderDetails = order?.orderdetails ?? [];
  const totalPrice = orderDetails.reduce((sum, detail) => {
    return sum + (detail.variant?.price ?? 0) * detail.quantity;
  }, 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="centered"
      size="lg"
      showOverlay
      className="bg-white"
    >
      <ModalHeader>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[#2b2b2b]">
            Order #{order?.id ?? orderId ?? ""}
          </h3>
          {order && (
            <span className="text-xs text-gray-500">
              Placed on {formatDateTime(order.orderdate)}
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase ${badgeClass(
            order?.statusorder ?? "",
            ORDER_STATUS_STYLES
          )}`}
        >
          {order?.statusorder ?? "-"}
        </span>
      </ModalHeader>

      <ModalBody className="gap-4" scrollable>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="w-32">
              <LoaderText />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : order ? (
          <div className="flex flex-col gap-4 text-sm text-[#474747]">
            <section className="rounded-lg border border-gray-200 bg-[#fafafa] px-4 py-3">
              <h4 className="mb-2 text-sm font-semibold text-[#242424]">Order summary</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-gray-500">Order date</p>
                  <p className="text-sm font-medium text-[#242424]">
                    {formatDateTime(order.orderdate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Receive date</p>
                  <p className="text-sm font-medium text-[#242424]">
                    {formatDateTime(order.receivedate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Payment status</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass(
                      order.statuspay,
                      PAYMENT_STATUS_STYLES
                    )}`}
                  >
                    {order.statuspay || "-"}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Payment method</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass(
                      order.typepay,
                      PAY_TYPE_STYLES
                    )}`}
                  >
                    {order.typepay || "-"}
                  </span>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <h4 className="mb-2 text-sm font-semibold text-[#242424]">Customer</h4>
                <div className="flex">
                  <div className="mr-2 flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-[#fafafa]">
                    {order.account?.avatarimg ? (
                      <img
                        src={order.account.avatarimg}
                        alt={order.account.firstname ?? "N/A"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#242424]">
                      {(order.account?.firstname ?? "") + " " + (order.account?.lastname ?? "") || "Unknown customer"}
                    </p>
                    <p className="break-all text-xs text-gray-500">
                      {order.account?.email || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.address?.tel || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <h4 className="mb-2 text-sm font-semibold text-[#242424]">Shipping address</h4>
                <p className="text-sm text-[#474747]">
                  {order.address?.detail || order.address?.description || String(order.address?.codeward ?? "") || "No shipping address"}
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <h4 className="mb-2 border-b border-b-gray-200 pb-3 text-sm font-semibold text-[#242424]">
                Products
              </h4>
              {orderDetails.map((item, index) => {
                const product = item.variant?.product;
                const thumb = product?.imageurls?.[0];
                return (
                  <div
                    className={`flex w-full justify-between border-b border-gray-100 py-2 ${index === orderDetails.length - 1 ? "border-b-0" : ""}`}
                    key={item.id}
                  >
                    <div className="flex gap-2">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-[#fafafa]">
                        {thumb ? (
                          <img
                            className="h-full w-full object-cover"
                            src={thumb}
                            alt={product?.nameproduct ?? "N/A"}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#242424]">
                          {product?.nameproduct ?? "_"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatVariant(item.variant?.valuevariant) ?? "_"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-end text-xs text-gray-500">
                        Quantity: <strong>{item?.quantity ?? 0}</strong>
                      </p>
                      <p className="text-end text-sm font-medium text-[#242424]">
                        Price({formatCurrency(item?.variant?.price ?? 0)}):{" "}
                        {formatCurrency((item?.variant?.price ?? 0) * (item?.quantity ?? 0))}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-end border-t border-gray-200 pt-3 font-medium">
                <p className="mr-1 text-sm">Total price: </p>{" "}
                <u>{formatCurrency(totalPrice)}</u>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            No detail available for this order.
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" className="px-6" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
