export const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "ALL", label: "All payments" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
];

export const PAY_TYPE_OPTIONS = [
  { value: "ALL", label: "All methods" },
  { value: "COD", label: "Cash on delivery" },
  { value: "BANK", label: "Bank transfer" },
];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export function capitalize(key: string) {
  if (!key) return key;
  return key.charAt(0).toUpperCase() + key.slice(1);
}
export const formatVariant = (attributes: Record<string, string>) => {
  const entries = Object.entries(attributes ?? {});
  if (entries.length === 0) return "-";
  return entries.map(([key, value]) => `${capitalize(key)}: ${value}`).join(", ");
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  SHIPPED: "border-sky-200 bg-sky-50 text-sky-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-600",
};

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  UNPAID: "border-amber-200 bg-amber-50 text-amber-600",
};

export const PAY_TYPE_STYLES: Record<string, string> = {
  COD: "border-blue-200 bg-blue-50 text-blue-600",
  BANK: "border-purple-200 bg-purple-50 text-purple-600",
};

export const badgeClass = (
  value: string,
  dictionary: Record<string, string>,
  fallback = "border-gray-200 bg-gray-50 text-gray-600"
) => dictionary[value?.toUpperCase?.() ?? ""] ?? fallback;

export const extractErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    const dataMessage = (error as { data?: { message?: unknown } }).data?.message;
    const responseMessage = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;
    const resolved = [maybeMessage, dataMessage, responseMessage].find(
      (msg): msg is string => typeof msg === "string" && msg.trim().length > 0
    );
    if (resolved) return resolved;
  }
  return fallback;
};
