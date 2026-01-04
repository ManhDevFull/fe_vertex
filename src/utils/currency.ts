type FormatCurrencyOptions = {
  decimals?: number;
  locale?: string;
};
export function formatCurrency(
  value: number | string,
  options: FormatCurrencyOptions = {}
): string {
  const locale = options.locale ?? "en-US";
  const num = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(num)) {
    return `${value}$`;
  }

  let minimumFractionDigits: number;
  let maximumFractionDigits: number;

  if (typeof options.decimals === "number") {
    minimumFractionDigits = options.decimals;
    maximumFractionDigits = options.decimals;
  } else {
    minimumFractionDigits = 0;
    maximumFractionDigits = 2;
  }

  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return `${formatted}$`;
}
