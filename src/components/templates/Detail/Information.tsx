import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";
import { PiHandbagSimple, PiShoppingCartSimpleLight } from "react-icons/pi";

import handleAPI from "@/axios/handleAPI";
import FlashDealBar from "@/components/ui/FlashDealBar";
import Quantity from "@/components/ui/Quantity";
import { Review } from "@/components/ui/Review";
import { formatCurrency } from "@/utils/currency";
import { addWishList, fetchWishList, removeWishList } from "@/services/wishlist";
import type { DiscountDTO, ProductUi, VariantDTO } from "@/types/type";

type AttributeOptions = Record<string, string[]>;

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const buildAttributeOptions = (variants: VariantDTO[]): AttributeOptions => {
  const map: Record<string, Set<string>> = {};
  variants.forEach((variant) => {
    Object.entries(variant.valuevariant ?? {}).forEach(([key, value]) => {
      if (!map[key]) map[key] = new Set();
      if (value) map[key].add(String(value));
    });
  });

  return Object.fromEntries(
    Object.entries(map).map(([key, values]) => [key, Array.from(values)])
  );
};

const fillMissingSelectedOptions = (
  options: AttributeOptions,
  selected: Record<string, string>
) => {
  const filled: Record<string, string> = { ...selected };
  Object.entries(options).forEach(([key, values]) => {
    if (!filled[key] && values.length > 0) filled[key] = values[0];
  });
  return filled;
};

const matchesSelection = (
  variant: VariantDTO,
  selection: Record<string, string>
) =>
  Object.entries(selection).every(
    ([key, value]) => variant.valuevariant?.[key] === value
  );


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

export default function Information({ product }: { product: ProductUi }) {
  const router = useRouter();
  const variants = product.variant ?? [];
  const attributeOptions = useMemo(
    () => buildAttributeOptions(variants),
    [variants]
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );
  const [currentVariant, setCurrentVariant] = useState<VariantDTO | null>(null);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (variants.length === 0) {
      setSelectedOptions({});
      setCurrentVariant(null);
      return;
    }
    const baseVariant = variants[0];
    setSelectedOptions(
      fillMissingSelectedOptions(attributeOptions, baseVariant.valuevariant ?? {})
    );
    setCurrentVariant(baseVariant);
  }, [attributeOptions, variants]);

  useEffect(() => {
    let cancelled = false;
    const syncWishlist = async () => {
      try {
        const list = await fetchWishList();
        if (!cancelled) {
          setIsWishlisted(list.some((item) => item.productId === product.id));
        }
      } catch (error) {
        if (!cancelled) {
          setIsWishlisted(false);
        }
      }
    };

    syncWishlist();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const handleSelectOption = (key: string, value: string) => {
    const nextSelection = fillMissingSelectedOptions(attributeOptions, {
      ...selectedOptions,
      [key]: value,
    });
    const exactMatch = variants.find((variant) =>
      matchesSelection(variant, nextSelection)
    );

    setSelectedOptions(nextSelection);
    setCurrentVariant(exactMatch ?? null);
  };

  const isValueAvailable = (key: string, value: string) => {
    const nextSelection = { ...selectedOptions, [key]: value };
    return variants.some((variant) => matchesSelection(variant, nextSelection));
  };

  const hasVariant = Boolean(currentVariant);
  const discount = hasVariant ? getActiveDiscount(currentVariant) : null;
  const price = currentVariant?.price ?? 0;
  const discountedPrice = hasVariant
    ? getDiscountedPrice(price, discount)
    : 0;
  const showOriginalPrice = hasVariant && discount && discountedPrice < price;
  const discountLabel = discount
    ? discount.typediscount === 1
      ? `${discount.discount}% off`
      : `Save ${formatCurrency(discount.discount)}`
    : "";

  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;

  const addToCart = async () => {
    if (!currentVariant?.id || quantity <= 0 || isOutOfStock) return false;
    setAdding(true);
    try {
      const safeQuantity = Math.min(quantity, currentVariant.stock);
      await handleAPI(
        "Cart/add",
        {
          variantId: currentVariant.id,
          quantity: safeQuantity,
        },
        "post"
      );
      toast.success("Added to cart.");
      return true;
    } catch (error) {
      console.error("Add to cart failed:", error);
      return false;
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (buying) return;
    setBuying(true);
    const ok = await addToCart();
    if (ok) {
      router.push("/my-cart");
    }
    setBuying(false);
  };

  const handleToggleWishlist = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeWishList(product.id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist.");
      } else {
        await addWishList(product.id);
        setIsWishlisted(true);
        toast.success("Added to wishlist.");
      }
    } catch (error: any) {
      console.error("Add to wishlist failed:", error);
      if (error?.status === 401 || error?.response?.status === 401) {
        toast.error("Please sign in to use wishlist.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to update wishlist."
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Review ratingReviews={product.rating} totalReviews={product.order} />
        <h1 className="text-2xl font-semibold text-slate-900">
          {product.name}
        </h1>
        {product.description ? (
          <p className="text-sm text-slate-500 line-clamp-3">
            {product.description}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-lg bg-slate-100 px-3 py-1">
          SKU: #{product.id}
        </span>
        {product.brand && (
          <span className="rounded-lg bg-slate-100 px-3 py-1">
            Brand: {product.brand}
          </span>
        )}
        {product.categoryName && (
          <span className="rounded-lg bg-slate-100 px-3 py-1">
            Category: {product.categoryName}
          </span>
        )}
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-2xl font-semibold text-slate-900">
            {hasVariant ? formatCurrency(discountedPrice) : "Unavailable"}
          </p>
          {showOriginalPrice && (
            <p className="text-sm text-slate-400 line-through">
              {formatCurrency(price)}
            </p>
          )}
          {hasVariant && discountLabel && (
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {discountLabel}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span
            className={`rounded-lg px-2 py-1 text-xs font-semibold ${
              !hasVariant || isOutOfStock
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {!hasVariant ? "Unavailable" : isOutOfStock ? "Out of stock" : "In stock"}
          </span>
          {currentVariant && (
            <span>Stock: {currentVariant.stock}</span>
          )}
        </div>
        {hasVariant && discount?.endtime && (
          <div className="mt-3">
            <FlashDealBar endTime={discount.endtime} />
          </div>
        )}
      </div>

      {Object.keys(attributeOptions).length > 0 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Choose variant
            </p>
            <p className="text-xs text-slate-400">
              Pick the options that match your preference.
            </p>
          </div>
          {Object.entries(attributeOptions).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                {toTitle(key)}
              </p>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const selected = selectedOptions[key] === value;
                  const available = isValueAvailable(key, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSelectOption(key, value)}
                      className={`rounded-lg border px-3 py-1 text-sm font-semibold transition ${
                        selected
                          ? "border-[#1B4B66] bg-[#1B4B66] text-white"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      } ${!available ? "opacity-40" : ""}`}
                    >
                      {toTitle(value)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[160px]">
          <Quantity onchange={(value: number) => setQuantity(value)} />
        </div>
        <button
          type="button"
          onClick={addToCart}
          disabled={adding || isOutOfStock}
          className="flex items-center gap-2 rounded-lg border border-[#1B4B66] px-4 py-2 text-sm font-semibold text-[#1B4B66] transition hover:bg-[#1B4B66] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PiShoppingCartSimpleLight size={18} />
          {adding ? "Adding..." : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={buying || isOutOfStock}
          className="flex items-center gap-2 rounded-lg bg-[#1B4B66] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163d52] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PiHandbagSimple size={18} />
          {buying ? "Processing..." : "Buy now"}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            isWishlisted
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          {isWishlisted ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
          {wishlistLoading
            ? "Saving..."
            : isWishlisted
              ? "Wishlisted"
              : "Add to wishlist"}
        </button>
        <p className="text-xs text-slate-400">
          Secure checkout and fast support.
        </p>
      </div>
    </div>
  );
}
