"use client";
import BackNavigation from "@/components/ui/BackNavigation";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleGiftBox } from "@/redux/reducers/cartReducer";
import {
  setCheckoutCart,
  setSelectedCartIds,
} from "@/redux/reducers/checkoutReducer";
import { formatCurrency } from "@/utils/currency";
import { GoTrash } from "react-icons/go";
import { FiCheck, FiPlus } from "react-icons/fi";
import { HiMiniMinus } from "react-icons/hi2";
import { IoCaretBackOutline, IoCaretForwardOutline } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import handleAPI from "@/axios/handleAPI";
import { authSelector } from "@/redux/reducers/authReducer";
import { toast } from "sonner";
import { capitalize } from "@/utils/orderHelpers";

type Suggestion = {
  productId: number;
  productName: string;
  imageUrl?: string;
  minPrice: number;
  oldPrice?: number | null;
  discountPercent?: number | null;
  categoryName: string;
};
const SUGGEST_PAGE_SIZE = 12;
const SLIDE_STEP = 4;

type CartItemApi = {
  cartId: number;
  accountId: number;
  variantId: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  color?: string;
  variantAttributes?: Record<string, string>;
  unitPrice: number;
  quantity: number;
};

type CartSummaryApi = {
  itemsPrice: number;
  shipping: number;
  tax: number;
  discountPrice: number;
  giftBoxPrice: number;
  totalPrice: number;
};

type CartCheckboxProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

const CartCheckbox = ({ checked, onChange, disabled }: CartCheckboxProps) => (
  <label
    className={`inline-flex items-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="sr-only"
    />
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-md border bg-white shadow-sm transition ${
        checked ? "border-slate-900 bg-slate-900" : "border-slate-300"
      }`}
    >
      {checked ? <FiCheck className="h-3 w-3 text-white" /> : null}
    </span>
  </label>
);

export default function MyCart() {
  const router = useRouter();
  const auth = useSelector(authSelector);
  if (!auth?.token) {
    router.push("/");
    return;
  }
  const dispatch = useDispatch();
  const { giftBox, giftBoxPrice } = useSelector(
    (state: RootState) => state.cart
  );

  const [items, setItems] = useState<CartItemApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [baseSummary, setBaseSummary] = useState<CartSummaryApi | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestOffset, setSuggestOffset] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0); // index of first visible card
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res: any = await handleAPI(`/Cart`);
      const newItems: any[] = res.items || [];
      const newSummary = res.summary || null;
      setItems(newItems);
      setBaseSummary(newSummary);
      const ids = newItems.map((i) => i.cartId);
      setSelectedIds(ids);
      dispatch(
        setCheckoutCart({
          items: newItems,
          summary: newSummary,
          selectedIds: ids,
        })
      );
    } catch (e) {
      console.error(e);
      toast.error("Unable to load cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async (
    offset: number,
    excludeIds: number[] = []
  ) => {
    try {
      setLoadingSuggest(true);
      const query = new URLSearchParams();
      query.set("offset", String(offset));
      query.set("limit", String(SUGGEST_PAGE_SIZE));
      if (excludeIds.length) query.set("exclude", excludeIds.join(","));
      const data = await handleAPI(`/Cart/suggestions?${query.toString()}`);
      if (Array.isArray(data) && data.length) {
        // de-dup on FE just in case
        const existing = new Set(suggestions.map((s) => s.productId));
        const merged = [...suggestions];
        data.forEach((d) => {
          if (!existing.has(d.productId)) merged.push(d);
        });
        setSuggestions(merged);
        setSuggestOffset(offset + SUGGEST_PAGE_SIZE);
      }
    } catch (e) {
      console.error(e);
      toast.error("Unable to load recommendations.");
    } finally {
      setLoadingSuggest(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // initial suggestions
    fetchSuggestions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQtyChange = async (cartId: number, delta: number) => {
    const current = items.find((i: CartItemApi) => i.cartId === cartId);
    if (!current) return;
    const nextQty = Math.max(1, current.quantity + delta);
    if (nextQty === current.quantity) return;
    try {
      setUpdatingId(cartId);
      const res: any = await handleAPI(
        `/Cart/quantity`,
        { cartId, quantity: nextQty },
        "put"
      );
      const newItems: CartItemApi[] = res.items || [];
      const newSummary = res.summary || null;
      setItems(newItems);
      setBaseSummary(newSummary);
      const ids = selectedIds.filter((id) =>
        newItems.some((i: CartItemApi) => i.cartId === id)
      );
      setSelectedIds(ids);
      dispatch(
        setCheckoutCart({
          items: newItems,
          summary: newSummary,
          selectedIds: ids,
        })
      );
      toast.success("Quantity updated.");
    } catch (e) {
      console.error(e);
      toast.error("Unable to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartId: number) => {
    try {
      setRemovingId(cartId);
      const res: any = await handleAPI(`/Cart/${cartId}`, undefined, "delete");
      const newItems: CartItemApi[] = res.items || [];
      const newSummary = res.summary || null;
      setItems(newItems);
      setBaseSummary(newSummary);
      const ids = selectedIds.filter(
        (id) =>
          id !== cartId && newItems.some((i: CartItemApi) => i.cartId === id)
      );
      setSelectedIds(ids);
      dispatch(
        setCheckoutCart({
          items: newItems,
          summary: newSummary,
          selectedIds: ids,
        })
      );
      toast.success("Removed from cart.");
    } catch (e) {
      console.error(e);
      toast.error("Unable to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const onSlideRight = async () => {
    const nextIndex = Math.min(
      slideIndex + SLIDE_STEP,
      Math.max(0, suggestions.length - SLIDE_STEP)
    );
    setSlideIndex(nextIndex);
    // If we are about to expose items beyond what we have (approaching end), prefetch more
    if (nextIndex + SLIDE_STEP * 2 > suggestions.length && !loadingSuggest) {
      const excludeIds = suggestions.map((s) => s.productId);
      await fetchSuggestions(suggestOffset, excludeIds);
    }
  };

  const onSlideLeft = () => {
    setSlideIndex(Math.max(0, slideIndex - SLIDE_STEP));
  };

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.includes(i.cartId)),
    [items, selectedIds]
  );
  const baseItemsTotal = useMemo(
    () =>
      items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0),
    [items]
  );
  const selectedItemsPrice = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) => sum + (i.unitPrice ?? 0) * (i.quantity ?? 1),
        0
      ),
    [selectedItems]
  );
  const selectionSummary = useMemo(() => {
    const ratio = baseItemsTotal > 0 ? selectedItemsPrice / baseItemsTotal : 0;
    const shipping = (baseSummary?.shipping ?? 0) * ratio;
    const tax = (baseSummary?.tax ?? 0) * ratio;
    const discountPrice = (baseSummary?.discountPrice ?? 0) * ratio;
    const giftBoxFromBase = baseSummary?.giftBoxPrice ?? 0;
    const totalPrice = selectedItemsPrice + shipping + tax - discountPrice;
    return {
      itemsPrice: selectedItemsPrice,
      shipping,
      tax,
      discountPrice,
      giftBoxPrice: giftBoxFromBase * ratio,
      totalPrice,
    };
  }, [baseSummary, baseItemsTotal, selectedItemsPrice]);
  const totalPrice = useMemo(
    () =>
      selectionSummary.totalPrice +
      (giftBox && selectedIds.length > 0 ? giftBoxPrice : 0),
    [selectionSummary.totalPrice, giftBox, giftBoxPrice, selectedIds.length]
  );

  const toggleSelect = (cartId: number) => {
    setSelectedIds((prev) => {
      const next = prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId];
      dispatch(setSelectedCartIds(next));
      return next;
    });
  };

  const getVariantAttributes = (item: CartItemApi) => {
    if (item.variantAttributes && Object.keys(item.variantAttributes).length) {
      return item.variantAttributes;
    }
    return item.color ? { color: item.color } : {};
  };

  useEffect(() => {
    dispatch(
      setCheckoutCart({
        items: selectedItems,
        summary: selectionSummary,
        selectedIds,
      })
    );
  }, [dispatch, selectedItems, selectionSummary, selectedIds]);

  const canCheckout = selectedIds.length > 0;

  return (
    <main className="min-h-screen pb-16">
      <BackNavigation />
      {/* Title */}
      <div className="px-40 pt-6">
        <h1 className="font-bold text-5xl sm:text-6xl text-gray-900 mb-2">
          My Cart
        </h1>
        <p className="text-2xl text-gray-400 font-normal">
          Review your items and proceed to checkout
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 px-8 xl:px-40 mt-10">
        {/* Cart List */}
        <div className="flex-1">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Items in your cart
                </h2>
                <p className="text-sm text-slate-500">
                  {items.length} items | {selectedIds.length} selected
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-6 text-sm text-slate-500">Loading cart...</div>
            ) : items.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  title="Your cart is empty"
                  description="Browse products and add your favorites."
                  action={
                    <button
                      type="button"
                      onClick={() => router.push("/all-products")}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Browse products
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {items.map((item) => {
                  const variantAttributes = getVariantAttributes(item);
                  const variantEntries = Object.entries(variantAttributes);
                  return (
                    <div
                      key={item.cartId}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="flex flex-1 items-start gap-4">
                          <CartCheckbox
                            checked={selectedIds.includes(item.cartId)}
                            onChange={() => toggleSelect(item.cartId)}
                          />
                          <div className="h-20 w-20 overflow-hidden rounded-lg bg-slate-100">
                            <img
                              src={item.imageUrl || ""}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="line-clamp-2 text-sm font-semibold text-slate-900">
                              {item.productName}
                            </div>
                            {variantEntries.length ? (
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                {variantEntries.map(([key, value]) => {
                                  const isColor = key.toLowerCase() === "color";
                                  return (
                                    <span
                                      key={`${key}-${value}`}
                                      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1"
                                    >
                                      {isColor ? (
                                        <span
                                          className="h-3 w-3 rounded-full border"
                                          style={{ background: value }}
                                        />
                                      ) : null}
                                      <span className="font-semibold text-slate-600">
                                        {capitalize(key)}:
                                      </span>
                                      <span className="text-slate-500">
                                        {value}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-slate-400">
                                Variant: N/A
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 lg:justify-end lg:text-right">
                          <div className="min-w-[90px]">
                            <div className="text-xs text-slate-500">Price</div>
                            <div className="text-sm font-semibold text-slate-900">
                              {formatCurrency(item.unitPrice)}
                            </div>
                          </div>

                          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                            <button
                              onClick={() => handleQtyChange(item.cartId, -1)}
                              disabled={updatingId === item.cartId}
                              className="px-3 py-2 text-base font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <HiMiniMinus />
                            </button>
                            <span className="min-w-[32px] text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item.cartId, 1)}
                              disabled={updatingId === item.cartId}
                              className="px-3 py-2 text-base font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FiPlus />
                            </button>
                          </div>

                          <div className="min-w-[100px]">
                            <div className="text-xs text-slate-500">Subtotal</div>
                            <div className="text-sm font-semibold text-slate-900">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemove(item.cartId)}
                            disabled={removingId === item.cartId}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Remove"
                          >
                            <GoTrash />
                            {removingId === item.cartId ? "Removing" : "Remove"}
                          </button>
                        </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[350px] h-fit">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="mb-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Selected items:{" "}
              <span className="font-semibold text-slate-900">
                {selectedIds.length}
              </span>
            </div>
            <div className="flex justify-between mb-3 text-sm text-slate-600">
              <span>Price</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(selectionSummary.itemsPrice)}
              </span>
            </div>
            <div className="flex justify-between mb-3 text-sm text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(selectionSummary.shipping)}
              </span>
            </div>
            <div className="flex justify-between mb-3 text-sm text-slate-600">
              <span>Tax</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(selectionSummary.tax)}
              </span>
            </div>
            <div className="flex justify-between mb-3 text-sm text-slate-600">
              <span>Discount</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(selectionSummary.discountPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 mb-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CartCheckbox
                  checked={giftBox}
                  onChange={() => dispatch(toggleGiftBox())}
                  disabled={!canCheckout}
                />
                <span>Pack in a Gift Box</span>
              </div>
              <span className="font-semibold text-slate-900">
                {formatCurrency(giftBox && canCheckout ? giftBoxPrice : 0)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base mt-6 mb-6">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <button
              onClick={() => router.push("/my-cart/customer-info")}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canCheckout}
            >
              Proceed to checkout
            </button>
            <button
              onClick={() => router.push("/all-products")}
              className="mt-3 w-full rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-12 px-8 xl:px-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-bold text-base sm:text-lg">
              You might also like
            </h4>
            <p className="text-sm text-slate-500">
              Quick picks based on your cart
            </p>
          </div>
          <div
            className="flex border rounded-lg overflow-hidden w-[80px] h-10 bg-white"
            style={{ borderColor: "#D1D5DB" }}
          >
            <button
              onClick={onSlideLeft}
              className="flex-1 flex items-center justify-center text-xl text-gray-300 hover:bg-gray-100"
              style={{ borderRight: "1px solid #E5E7EB" }}
            >
              <span>
                <IoCaretBackOutline />
              </span>
            </button>
            <button
              onClick={onSlideRight}
              className="flex-1 flex items-center justify-center text-xl text-gray-800 hover:bg-gray-100"
            >
              <span>
                <IoCaretForwardOutline />
              </span>
            </button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {suggestions.slice(slideIndex, slideIndex + 4).map((item) => (
            <div
              key={item.productId}
              className="flex min-w-[260px] flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={item.imageUrl || ""}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="line-clamp-2 text-sm font-semibold text-slate-900">
                  {item.productName}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {item.categoryName}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.minPrice)}
                  </span>
                  {item.oldPrice ? (
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(item.oldPrice)}
                    </span>
                  ) : null}
                  {item.discountPercent ? (
                    <span className="rounded-lg bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                      -{item.discountPercent}%
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                onClick={() => router.push(`/detail-product/${item.productId}`)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                View detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
