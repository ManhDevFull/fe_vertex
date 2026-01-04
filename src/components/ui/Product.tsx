import Link from "next/link";
import { FaHeart, FaStar } from "react-icons/fa";

import FlashDealBar from "./FlashDealBar";
import ImgProduct from "./ImgProduct";
import { formatCurrency } from "@/utils/currency";
import type { DiscountDTO, ProductUi, VariantDTO, valueFilter } from "@/types/type";

type ProductProps = {
  product: ProductUi;
  type: boolean;
  selectedFilter: valueFilter;
};

const EXCLUDED_FILTER_KEYS = new Set(["price", "brand", "namecategory"]);

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const getActiveDiscount = (variant?: VariantDTO | null) => {
  if (!variant?.discounts?.length) return null;
  const now = Date.now();
  return (
    variant.discounts.find((discount) => {
      const start = new Date(discount.starttime).getTime();
      const end = new Date(discount.endtime).getTime();
      const startsOk = Number.isNaN(start) || now >= start;
      const endsOk = Number.isNaN(end) || now <= end;
      return startsOk && endsOk;
    }) ?? null
  );
};

const getDiscountedPrice = (price: number, discount?: DiscountDTO | null) => {
  if (!discount) return price;
  const discountValue = Number(discount.discount ?? 0);
  if (discount.typediscount === 1) {
    return Math.max(0, price * (1 - discountValue / 100));
  }
  if (discount.typediscount === 2) {
    return Math.max(0, price - discountValue);
  }
  return price;
};

const getVariantLabel = (variant?: VariantDTO | null) => {
  const attributes =
    variant && typeof variant.valuevariant === "object"
      ? (variant.valuevariant as Record<string, string>)
      : {};
  const entries = Object.entries(attributes).filter(([, value]) => value);
  if (entries.length === 0) return "";
  return entries.map(([key, value]) => `${toTitle(key)}: ${value}`).join(" | ");
};

export default function Product({ product, selectedFilter, type }: ProductProps) {
  // Pick a matching variant to surface the right price/discount details.
  const matchedVariant =
    product.variant.find((variant) => {
      const variantFilters = Object.entries(selectedFilter).filter(
        ([key]) => !EXCLUDED_FILTER_KEYS.has(key)
      );
      if (variantFilters.length === 0) return true;
      return variantFilters.every(([key, values]) => {
        const attributeValue = variant.valuevariant?.[key];
        return attributeValue ? values.includes(attributeValue) : false;
      });
    }) ?? product.variant[0];

  const variant = matchedVariant ?? { price: 0, discounts: [] };
  const discount = getActiveDiscount(matchedVariant);
  const discountedPrice = getDiscountedPrice(variant.price ?? 0, discount);
  const showOriginalPrice = discount && discountedPrice < (variant.price ?? 0);
  const discountLabel = discount
    ? discount.typediscount === 1
      ? `${discount.discount}% off`
      : `Save ${formatCurrency(discount.discount)}`
    : "";
  const discountEnd = discount?.endtime ?? null;

  const averageRating =
    product.order > 0 ? product.rating / product.order : 0;
  const ratingLabel = averageRating ? averageRating.toFixed(1) : "0.0";
  const reviewsLabel =
    product.order > 0 ? `${product.order} reviews` : "No reviews";
  const variantLabel = getVariantLabel(matchedVariant);
  const wishlistCount = product.wishlistCount ?? 0;

  if (type) {
    return (
      <div className="group flex h-full flex-col rounded-lg border border-slate-100 bg-white p-4 shadow transition hover:-translate-y-1 hover:shadow-md">
        <Link href={`/detail-product/${product.id}`} className="block">
          <div className="relative overflow-hidden rounded-lg bg-slate-100">
            <ImgProduct type={type} img={product.imgUrls[0]} isNew={false} />
            {discountLabel && (
              <span className="absolute left-3 top-3 rounded-lg bg-[#1B4B66] px-3 py-1 text-xs font-semibold text-white">
                {discountLabel}
              </span>
            )}
          </div>
        </Link>

        {discountEnd && (
          <div className="mt-2">
            <FlashDealBar endTime={discountEnd} />
          </div>
        )}

        <div className="mt-3 flex flex-1 flex-col gap-2">
          <Link href={`/detail-product/${product.id}`}>
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-sm text-slate-500 line-clamp-2">
              {product.description}
            </p>
          )}
          {variantLabel && (
            <p className="text-xs text-slate-400">{variantLabel}</p>
          )}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                <FaStar />
                <span className="text-slate-700">{ratingLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-rose-500">
                <FaHeart />
                <span className="text-slate-700">{wishlistCount}</span>
              </div>
            </div>
            <span>{reviewsLabel}</span>
          </div>
          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(discountedPrice)}
              </p>
              {showOriginalPrice && (
                <p className="text-xs text-slate-400 line-through">
                  {formatCurrency(variant.price ?? 0)}
                </p>
              )}
            </div>
            <Link
              href={`/detail-product/${product.id}`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-4 rounded-lg border border-slate-100 bg-white p-4 shadow transition hover:shadow-md md:flex-row">
      <Link href={`/detail-product/${product.id}`} className="flex-shrink-0">
        <div className="relative overflow-hidden rounded-lg bg-slate-100">
          <ImgProduct type={type} img={product.imgUrls[0]} isNew={false} />
          {discountLabel && (
            <span className="absolute left-3 top-3 rounded-lg bg-[#1B4B66] px-3 py-1 text-xs font-semibold text-white">
              {discountLabel}
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={`/detail-product/${product.id}`}>
              <h3 className="text-xl font-semibold text-slate-900">
                {product.name}
              </h3>
            </Link>
            {product.description && (
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                {product.description}
              </p>
            )}
            {variantLabel && (
              <p className="mt-1 text-xs text-slate-400">{variantLabel}</p>
            )}
          </div>
          {discountEnd && (
            <div className="min-w-[140px]">
              <FlashDealBar endTime={discountEnd} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1 text-amber-500">
            <FaStar />
            <span className="text-slate-700">{ratingLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-500">
            <FaHeart />
            <span className="text-slate-700">{wishlistCount}</span>
          </div>
          <span>{reviewsLabel}</span>
          {product.brand && (
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {product.brand}
            </span>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {formatCurrency(discountedPrice)}
            </p>
            {showOriginalPrice && (
              <p className="text-xs text-slate-400 line-through">
                {formatCurrency(variant.price ?? 0)}
              </p>
            )}
          </div>
          <Link
            href={`/detail-product/${product.id}`}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
