'use client';

import { memo, useMemo } from 'react';
import LoaderText from '@/components/ui/LoadingText';
import OrderAction from '@/components/templates/Admin/OrderAction';

import type { IOrderAdmin } from '@/types/type';

import {
  ORDER_STATUS_STYLES,
  badgeClass,
  formatCurrency,
  formatDateTime,
  formatVariant,
} from '@/utils/orderHelpers';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type OrdersTableProps = {
  orders: IOrderAdmin[];
  loading: boolean;
  onView: (order: IOrderAdmin) => void;
  onShip: (order: IOrderAdmin) => void;
  onDeliver: (order: IOrderAdmin) => void;
  onCancel: (order: IOrderAdmin) => void;
};

function OrdersTable({
  orders,
  loading,
  onView,
  onShip,
  onDeliver,
  onCancel,
}: OrdersTableProps) {
  const scrollContainerStyle = useMemo(
    () => ({ height: 'calc(100vh - 330px)' }),
    []
  );

  return (
    <div className="relative mt-4 rounded-lg border border-gray-200 bg-white shadow">
      <div
        className={`grid grid-cols-24 overflow-hidden rounded-t-lg bg-[#f4f4f4] text-[#474747] ${loading ? 'opacity-50' : ''
          }`}
      >
        <div className="col-span-3 py-3 text-center text-sm font-medium">Order ID</div>
        <div className="col-span-5 py-3 pl-3 text-sm font-medium">Customer</div>

        {/* PRODUCT (gộp Product + Qty) */}
        <div className="col-span-7 py-3 pl-3 text-sm font-medium">Product</div>

        {/* TOTAL */}
        <div className="col-span-3 py-3 text-center text-sm font-medium">Total</div>

        <div className="col-span-4 py-3 text-center text-sm font-medium">Status</div>
        <div className="col-span-2 py-3 text-center text-sm font-medium">Actions</div>

        <div
          className="col-span-24 overflow-y-auto bg-white scrollbar-hidden"
          style={scrollContainerStyle}
        >
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoaderText />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-[#474747]">
              <p className="text-sm text-gray-500">No orders matched the current filters.</p>
            </div>
          ) : (
            orders.map((order) => {
              const orderDetails = order.orderdetails ?? [];
              const statusUpper = (order.statusorder ?? '').toUpperCase();
              const isPending = statusUpper === 'PENDING';
              const isShipped = statusUpper === 'SHIPPED';
              const isDelivered = statusUpper === 'DELIVERED';
              const isCancelled = statusUpper === 'CANCELLED';

              const disabledActions = {
                ship: !isPending,
                deliver: !(isPending || isShipped),
                cancel: isDelivered || isCancelled,
              };

              const firstDetail = orderDetails[0];
              const variant = firstDetail?.variant;
              const product = variant?.product;
              const totalPrice = orderDetails.reduce((sum, detail) => {
                return sum + (detail.variant?.price ?? 0) * detail.quantity;
              }, 0) ?? 0;
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-24 items-start border-t border-[#00000008] bg-white text-[#474747]"
                >
                  {/* Order ID */}
                  <div className="col-span-3 flex flex-col items-center justify-center gap-1 py-3 text-center">
                    <span className="text-sm font-medium text-[#2b2b2b]">#{order.id}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(order.orderdate)}</span>
                  </div>

                  {/* Customer */}
                  <div className="col-span-5 flex flex-col justify-center gap-1 border-l border-[#00000008] px-3 py-3">
                    <span className="text-sm font-medium text-[#242424]">
                      {(order.account.firstname + " " + order.account.lastname) || 'Unknown customer'}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{order.account?.email || "Unknow email"}</span>
                    <span className="text-xs text-gray-500">{order.address.tel || '-'}</span>
                    <span className="text-xs text-gray-500">{order.address.codeward || '-'}</span>
                  </div>

                  {/* PRODUCT + QTY */}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="col-span-7 flex h-full gap-3 border-l border-[#00000008] px-3 py-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-[#fafafa]">
                            {product?.imageurls?.[0] ? (
                              <img
                                src={product.imageurls[0]}
                                alt={product?.nameproduct ?? 'N/A'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-[#242424]">
                              {product?.nameproduct ?? '_'}
                            </span>

                            <span className="text-xs text-gray-500">
                              Variant: {formatVariant(variant?.valuevariant) ?? '_'}
                            </span>

                            <span className="text-xs text-gray-500">
                              Qty: <strong>{firstDetail?.quantity ?? 0}</strong>
                            </span>

                            <span className="text-xs text-gray-500">
                              Price: {formatCurrency(variant?.price ?? 0)}
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      {orderDetails.length < 2 ? null : (
                        <TooltipContent side="top">
                          {orderDetails.map((detail, index) => {
                            const detailVariant = detail.variant;
                            const detailProduct = detailVariant?.product;
                            return (
                              <div
                                className={`flex h-full gap-3 border-b border-gray-100 py-2 ${index === orderDetails.length - 1 ? 'border-b-0' : ''
                                  }`}
                                key={index}
                              >
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-[#fafafa]">
                                  {detailProduct?.imageurls?.[0] ? (
                                    <img
                                      src={detailProduct.imageurls[0]}
                                      alt={detailProduct?.nameproduct ?? 'N/A'}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400">N/A</span>
                                  )}
                                </div>

                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium text-[#242424]">
                                    {detailProduct?.nameproduct ?? '_'}
                                  </span>

                                  <span className="text-xs text-gray-500">
                                    Variant: {formatVariant(detailVariant?.valuevariant) ?? '_'}
                                  </span>

                                  <span className="text-xs text-gray-500">
                                    Qty: <strong>{detail?.quantity ?? 0}</strong>
                                  </span>

                                  <span className="text-xs text-gray-500">
                                    Price: {formatCurrency(detailVariant?.price ?? 0)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </TooltipContent>
                      )}

                    </Tooltip>
                  </TooltipProvider>

                  {/* TOTAL PRICE (Của cả đơn) */}
                  <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-l border-[#00000008] py-3">
                    <span className="text-sm font-semibold text-[#242424]">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-4 flex flex-col items-center justify-center gap-2 border-l border-[#00000008] py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${badgeClass(
                        order.statusorder,
                        ORDER_STATUS_STYLES
                      )}`}
                    >
                      {order.statusorder || '-'}
                    </span>

                    {order.typepay === 'COD' && order.statuspay === 'UNPAID' && (
                      <span className="text-xs text-gray-500">Collect on delivery</span>
                    )}
                  </div>

                  {/* Actions */}
                <div className="col-span-2 flex items-center justify-center border-l border-[#00000008] py-3">
                  <OrderAction
                    onView={() => onView(order)}
                    onShip={() => onShip(order)}
                    onDeliver={() => onDeliver(order)}
                      onCancel={() => onCancel(order)}
                      disabled={disabledActions}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(OrdersTable);
