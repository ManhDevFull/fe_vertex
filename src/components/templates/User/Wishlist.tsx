"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

import EmptyState from "@/components/ui/EmptyState";
import Panel from "@/components/ui/Panel";
import { formatCurrency } from "@/utils/currency";
import {
  fetchWishList,
  removeWishList,
  type WishListItem,
} from "@/services/wishlist";

type WishListProps = {
  title?: string;
  description?: string;
  className?: string;
};

const STOCK_LABELS = {
  inStock: "In stock",
  outOfStock: "Out of stock",
};

export default function WishList({
  title = "Wishlist",
  description = "Save products you want to buy later.",
  className = "",
}: WishListProps) {
  const router = useRouter();
  const [items, setItems] = useState<WishListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const totalItems = items.length;

  const loadWishlist = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchWishList();
      setItems(data);
    } catch (error: any) {
      console.error("Failed to load wishlist", error);
      setLoadError(
        error?.response?.data?.message || "Unable to load wishlist."
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    if (actionId) return;
    setActionId(productId);
    try {
      const updated = await removeWishList(productId);
      setItems(updated);
      toast.success("Removed from wishlist.");
    } catch (error: any) {
      console.error("Failed to remove wishlist item", error);
      toast.error(
        error?.response?.data?.message || "Unable to remove item."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleNavigate = (productId: number) => {
    router.push(`/detail-product/${productId}`);
  };

  const renderStock = (stock: number) =>
    stock > 0 ? STOCK_LABELS.inStock : STOCK_LABELS.outOfStock;

  const stockClassName = (stock: number) =>
    stock > 0 ? "text-emerald-600" : "text-red-500";

  const wishlistContent = (() => {
    if (isLoading) {
      return <div className="text-sm text-slate-500">Loading wishlist...</div>;
    }

    if (loadError) {
      return (
        <EmptyState
          title="Unable to load wishlist"
          description={loadError}
          action={
            <button
              type="button"
              onClick={loadWishlist}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Try again
            </button>
          }
        />
      );
    }

    if (!totalItems) {
      return (
        <EmptyState
          title="No wishlist items"
          description="Save products to keep track of your favorites."
        />
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <button
              type="button"
              onClick={() => handleNavigate(item.productId)}
              className="flex items-start gap-4 text-left"
            >
              <div className="h-20 w-20 overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://via.placeholder.com/80?text=No+Img";
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {item.productName}
                </p>
                <p className="text-sm text-slate-600">
                  {formatCurrency(item.minPrice)}
                </p>
                <p
                  className={`text-xs font-semibold ${stockClassName(item.totalStock)}`}
                >
                  {renderStock(item.totalStock)}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNavigate(item.productId)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                View detail
              </button>
              <button
                type="button"
                onClick={() => handleRemove(item.productId)}
                disabled={actionId === item.productId}
                className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiTrash2 size={14} />
                {actionId === item.productId ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  })();

  return (
    <Panel
      title={title}
      description={description}
      icon={<FiHeart />}
      className={className}
      actions={
        totalItems > 0 ? (
          <span className="text-xs font-semibold text-slate-400">
            {totalItems} item{totalItems === 1 ? "" : "s"}
          </span>
        ) : undefined
      }
    >
      {wishlistContent}
    </Panel>
  );
}
