import { useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";

import { Review } from "@/components/ui/Review";
import { formatDateTime, formatVariant } from "@/utils/orderHelpers";
import type { IProductReview, ProductUi, VariantDTO } from "@/types/type";

type Tab = {
  id: "description" | "details" | "specs" | "reviews";
  label: string;
};

const tabs: Tab[] = [
  { id: "description", label: "Description" },
  { id: "details", label: "Details" },
  { id: "specs", label: "Specifications" },
  { id: "reviews", label: "Reviews" },
];

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const buildSpecifications = (variants: VariantDTO[]) => {
  const map: Record<string, Set<string>> = {};
  variants.forEach((variant) => {
    Object.entries(variant.valuevariant ?? {}).forEach(([key, value]) => {
      if (!map[key]) map[key] = new Set();
      if (value) map[key].add(String(value));
    });
  });

  return Object.entries(map).map(([key, values]) => ({
    key,
    values: Array.from(values),
  }));
};

type DescriptionProps = {
  product: ProductUi;
  reviews?: IProductReview[];
  reviewsLoading?: boolean;
};

const renderStars = (rating: number) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }).map((_, index) => (
    <FaStar
      key={index}
      className={safeRating > index ? "text-amber-400" : "text-slate-200"}
      size={14}
    />
  ));
};

export default function Description({
  product,
  reviews = [],
  reviewsLoading = false,
}: DescriptionProps) {
  const [active, setActive] = useState<Tab["id"]>("description");

  const specifications = useMemo(
    () => buildSpecifications(product.variant ?? []),
    [product.variant]
  );
  const totalStock = useMemo(
    () =>
      (product.variant ?? []).reduce(
        (sum, variant) => sum + (variant.stock ?? 0),
        0
      ),
    [product.variant]
  );

  const detailItems = [
    { label: "Brand", value: product.brand || "Unknown" },
    { label: "Category", value: product.categoryName || "Unknown" },
    { label: "SKU", value: `#${product.id}` },
    { label: "Variants", value: String(product.variant?.length ?? 0) },
    { label: "Total stock", value: String(totalStock) },
  ];

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#1B4B66] text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        {active === "description" && (
          <div className="space-y-3 text-sm text-slate-600">
            <p className="text-base font-semibold text-slate-900">
              Product description
            </p>
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>No description available yet.</p>
            )}
          </div>
        )}

        {active === "details" && (
          <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold uppercase text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {active === "specs" && (
          <div className="space-y-3 text-sm text-slate-600">
            {specifications.length === 0 ? (
              <p>No specifications available for this product.</p>
            ) : (
              specifications.map((spec) => (
                <div key={spec.key} className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-700">
                    {toTitle(spec.key)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {spec.values.join(", ")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {active === "reviews" && (
          <div className="space-y-4 text-sm text-slate-600">
            <Review ratingReviews={product.rating} totalReviews={product.order} />
            {reviewsLoading ? (
              <p>Loading product reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">
                  Product reviews
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {reviews.map((review) => {
                    const ratingValue = Number.isFinite(review.rating)
                      ? review.rating
                      : 0;
                    const ratingLabel = ratingValue.toFixed(1);
                    const variantLabel = review.variantAttributes
                      ? formatVariant(review.variantAttributes)
                      : "-";
                    return (
                      <div
                        key={review.id}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {review.customerName || "Anonymous"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                {renderStars(ratingValue)}
                              </div>
                              <span>{ratingLabel}/5</span>
                              <span>{formatDateTime(review.createDate)}</span>
                            </div>
                          </div>
                        </div>
                        {variantLabel !== "-" && (
                          <p className="mt-2 text-xs text-slate-400">
                            Variant: {variantLabel}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-slate-600">
                          {review.content || "No comment provided."}
                        </p>
                        {review.imageUrls && review.imageUrls.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {review.imageUrls.slice(0, 6).map((url, index) => (
                              <img
                                key={`${review.id}-${index}`}
                                src={url}
                                alt={review.customerName || "Review image"}
                                className="h-20 w-full rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p>No reviews for this product yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
