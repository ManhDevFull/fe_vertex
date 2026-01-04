import handleAPI from "@/axios/handleAPI";
import { toNumber, toOptionalString, toString } from "@/services/shared";

export type OrderHistoryItem = {
  orderId: number;
  orderDate: string;
  statusOrder: string;
  totalPriceAfterDiscount: number;
};

export type OrderProductInfo = {
  name: string;
  thumbnail: string;
  variantAttributes?: Record<string, string>;
};

export type OrderItem = {
  id: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  canReview?: boolean;
  product: OrderProductInfo;
};

export type OrderAddressInfo = {
  title: string;
  nameRecipient: string;
  tel: string;
  codeWard: number;
  detail: string;
  description: string;
  fullAddress: string;
};

export type OrderDetail = {
  orderId: number;
  orderDate: string;
  statusOrder: string;
  typePay: string;
  statusPay: string;
  totalPrice: number;
  totalDiscount: number;
  totalPriceAfterDiscount: number;
  addressInfo: OrderAddressInfo;
  items: OrderItem[];
};

const normalizeOrderHistory = (payload: any): OrderHistoryItem => ({
  orderId: toNumber(payload?.orderId ?? payload?.OrderId),
  orderDate: toString(payload?.orderDate ?? payload?.OrderDate),
  statusOrder: toString(payload?.statusOrder ?? payload?.StatusOrder),
  totalPriceAfterDiscount: toNumber(
    payload?.totalPriceAfterDiscount ?? payload?.TotalPriceAfterDiscount
  ),
});

const normalizeOrderItem = (payload: any): OrderItem => ({
  id: toNumber(payload?.id ?? payload?.Id),
  variantId: toNumber(payload?.variantId ?? payload?.VariantId),
  quantity: toNumber(payload?.quantity ?? payload?.Quantity),
  unitPrice: toNumber(payload?.unitPrice ?? payload?.UnitPrice),
  totalPrice: toNumber(payload?.totalPrice ?? payload?.TotalPrice),
  canReview:
    typeof payload?.canReview === "boolean" ? payload.canReview : undefined,
  product: {
    name: toString(payload?.product?.name ?? payload?.product?.Name),
    thumbnail: toString(
      payload?.product?.thumbnail ?? payload?.product?.Thumbnail
    ),
    variantAttributes:
      payload?.product?.variantAttributes ??
      payload?.product?.VariantAttributes ??
      undefined,
  },
});

const normalizeOrderDetail = (payload: any): OrderDetail => ({
  orderId: toNumber(payload?.orderId ?? payload?.OrderId),
  orderDate: toString(payload?.orderDate ?? payload?.OrderDate),
  statusOrder: toString(payload?.statusOrder ?? payload?.StatusOrder),
  typePay: toString(payload?.typePay ?? payload?.TypePay),
  statusPay: toString(payload?.statusPay ?? payload?.StatusPay),
  totalPrice: toNumber(payload?.totalPrice ?? payload?.TotalPrice),
  totalDiscount: toNumber(payload?.totalDiscount ?? payload?.TotalDiscount),
  totalPriceAfterDiscount: toNumber(
    payload?.totalPriceAfterDiscount ?? payload?.TotalPriceAfterDiscount
  ),
  addressInfo: {
    title: toString(payload?.addressInfo?.title ?? payload?.AddressInfo?.Title),
    nameRecipient: toString(
      payload?.addressInfo?.nameRecipient ?? payload?.AddressInfo?.NameRecipient
    ),
    tel: toString(payload?.addressInfo?.tel ?? payload?.AddressInfo?.Tel),
    codeWard: toNumber(
      payload?.addressInfo?.codeWard ?? payload?.AddressInfo?.CodeWard
    ),
    detail: toString(
      payload?.addressInfo?.detail ?? payload?.AddressInfo?.Detail
    ),
    description: toString(
      payload?.addressInfo?.description ?? payload?.AddressInfo?.Description
    ),
    fullAddress: toString(
      payload?.addressInfo?.fullAddress ?? payload?.AddressInfo?.FullAddress
    ),
  },
  items: Array.isArray(payload?.items ?? payload?.Items)
    ? (payload?.items ?? payload?.Items).map(normalizeOrderItem)
    : [],
});

export const fetchOrderHistory = async (): Promise<OrderHistoryItem[]> => {
  const response = await handleAPI("Order/my-orders", undefined, "get");
  if (!Array.isArray(response)) return [];
  return response.map(normalizeOrderHistory);
};

export const fetchOrderDetail = async (
  orderId: number
): Promise<OrderDetail> => {
  const response = await handleAPI(
    `Order/my-orders/${orderId}`,
    undefined,
    "get"
  );
  return normalizeOrderDetail(response);
};
