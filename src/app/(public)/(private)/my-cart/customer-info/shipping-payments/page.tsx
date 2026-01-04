"use client";
import BackNavigation from "@/components/ui/BackNavigation";
import NavigationPath from "@/components/ui/NavigationPath";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setSelectedPayment,
  setSelectedShipping,
  setPaymentMethods,
  setShippingMethods,
  setCheckoutCart,
  setSelectedCartIds,
} from "@/redux/reducers/checkoutReducer";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import handleAPI from "@/axios/handleAPI";
import { formatCurrency } from "@/utils/currency";

type Summary = {
  itemsPrice: number;
  shipping: number;
  tax: number;
  discountPrice: number;
  giftBoxPrice: number;
  totalPrice: number;
};

export default function ShippingPayments() {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    customerInfo,
    selectedPayment,
    selectedShipping,
    paymentMethods,
    shippingMethods,
    checkoutItems,
    checkoutSummary,
    selectedCartIds,
    selectedAddressId,
  } = useSelector((state: RootState) => state.checkout);
  const auth = useSelector((state: RootState) => state.authReducer.data);
  const { giftBox, giftBoxPrice } = useSelector(
    (state: RootState) => state.cart
  );
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const calcSummary = (
    items: any[],
    baseSummary?: Summary | null,
    baseTotal?: number
  ): Summary => {
    const itemsPrice = items.reduce(
      (s, i) => s + (i.unitPrice ?? 0) * (i.quantity ?? 1),
      0
    );
    const totalAll = baseTotal ?? baseSummary?.itemsPrice ?? itemsPrice;
    const ratio = totalAll > 0 ? itemsPrice / totalAll : 0;
    const shipping = (baseSummary?.shipping ?? 0) * ratio;
    const tax = (baseSummary?.tax ?? 0) * ratio;
    const discountPrice = (baseSummary?.discountPrice ?? 0) * ratio;
    const giftBoxPrice = (baseSummary?.giftBoxPrice ?? 0) * ratio;
    const totalPrice = itemsPrice + shipping + tax - discountPrice;
    return { itemsPrice, shipping, tax, discountPrice, giftBoxPrice, totalPrice };
  };

  // Initialize cart data from store, otherwise fetch once
  useEffect(() => {
    const initCart = async () => {
      try {
        if (checkoutItems.length > 0 || checkoutSummary) {
          const filtered = selectedCartIds.length
            ? checkoutItems.filter((i: any) =>
                selectedCartIds.includes(i.cartId ?? i.id)
              )
            : checkoutItems;
          setCartItems(filtered);
          const nextSum =
            checkoutSummary ??
            calcSummary(filtered, checkoutSummary, checkoutSummary?.itemsPrice);
          setSummary(nextSum);
          setLoading(false);
          return;
        }

        const cartData = await handleAPI(`/Cart`);
        const payload = (cartData as any)?.data ?? cartData ?? {};
        const items = payload.items ?? [];
        const payloadSummary: Summary | null = payload.summary ?? null;
        const totalAll = payloadSummary?.itemsPrice ?? undefined;
        const filtered = selectedCartIds.length
          ? items.filter((i: any) => selectedCartIds.includes(i.cartId ?? i.id))
          : items;
        const sum = calcSummary(filtered, payloadSummary, totalAll);
        const ids = filtered.map((i: any) => i.cartId ?? i.id ?? 0);
        setCartItems(filtered);
        setSummary(sum);
        dispatch(setCheckoutCart({ items: filtered, summary: sum, selectedIds: ids }));
        dispatch(setSelectedCartIds(ids));
      } catch (e) {
        console.error("Failed to load cart data:", e);
      } finally {
        setLoading(false);
      }
    };
    initCart();
  }, [checkoutItems, checkoutSummary, dispatch, selectedCartIds]);

  // Load payment & shipping methods once, reuse from store otherwise
  useEffect(() => {
    const loadMeta = async () => {
      try {
        if (!paymentMethods.length) {
          const payments = await handleAPI("shipping/payment/providers");
          if (payments && Array.isArray(payments) && payments.length) {
            dispatch(
              setPaymentMethods(
                payments.map((p: any) => ({
                  id: String(p.code ?? p.id ?? ""),
                  providerId: Number.isFinite(Number(p.id)) ? Number(p.id) : undefined,
                  name: p.name ?? "",
                  desc: p.description ?? "",
                  img: p.logoUrl ?? "",
                }))
              )
            );
          }
        }

        if (!shippingMethods.length) {
          const shippings = await handleAPI("shipping/carriers-with-options");
          if (shippings && Array.isArray(shippings) && shippings.length) {
            const flattened = shippings.flatMap((carrier: any) => {
              const carrierName = carrier?.name ?? "";
              const logo = carrier?.logoUrl ?? "";
              const options = Array.isArray(carrier?.options)
                ? carrier.options
                : [];
              return options.map((opt: any) => ({
                id: Number.isFinite(Number(opt.id)) ? String(opt.id) : String(opt.code ?? `${carrierName}-${opt.name ?? "option"}`),
                optionId: Number.isFinite(Number(opt.id)) ? Number(opt.id) : undefined,
                name: `${carrierName} - ${opt.name ?? ""}`.trim(),
                deliveryTime: formatDelivery(
                  opt.deliveryMinDays,
                  opt.deliveryMaxDays
                ),
                shippingCost: formatCurrency(opt.shippingCost ?? 0),
                insurance: opt.insuranceAvailable ? "Available" : "Unavailable",
                img: logo,
              }));
            });
            dispatch(setShippingMethods(flattened));
          }
        }
      } catch (e: any) {
        console.error("Failed to load shipping/payment data:", e);
      }
    };
    loadMeta();
  }, [dispatch, paymentMethods.length, shippingMethods.length]);

  const saveSelection = async () => {
    const paymentMethod = paymentMethods.find((p) => p.id === selectedPayment);
    const shippingMethod = shippingMethods.find((s) => s.id === selectedShipping);
    const paymentProviderId = paymentMethod?.providerId;
    const shippingOptionId = shippingMethod?.optionId;

    if (!auth?.id || paymentProviderId == null || shippingOptionId == null) {
      return;
    }

    try {
      await handleAPI(
        "/shipping/checkout/selection",
        {
          accountId: auth.id,
          paymentProviderId,
          shippingOptionId,
          addressSnapshot: JSON.stringify({
            ...customerInfo,
            addressId: selectedAddressId ?? undefined,
          }),
        },
        "post"
      );
    } catch (e) {
      console.error("Failed to save checkout selection:", e);
    }
  };

  const handleContinue = async () => {
    if (!cartItems.length) return;
    const ids = cartItems.map((i: any) => i.cartId ?? i.id ?? 0);
    const safeSummary =
      summary ?? calcSummary(cartItems, checkoutSummary, summary?.itemsPrice);
    dispatch(setCheckoutCart({ items: cartItems, summary: safeSummary, selectedIds: ids }));
    dispatch(setSelectedCartIds(ids));
    await saveSelection();
    router.push("/my-cart/customer-info/shipping-payments/product-confirm");
  };

  const price = useMemo(
    () =>
      summary?.itemsPrice ??
      cartItems.reduce((s, i) => s + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0),
    [summary, cartItems]
  );
  const shipping = useMemo(() => summary?.shipping ?? 0, [summary]);
  const tax = useMemo(() => summary?.tax ?? 0, [summary]);
  const discount = useMemo(() => summary?.discountPrice ?? 0, [summary]);
  const totalPrice = useMemo(() => {
    const base = summary?.totalPrice ?? price + shipping + tax - discount;
    return base + (giftBox ? giftBoxPrice : 0);
  }, [summary, price, shipping, tax, discount, giftBox, giftBoxPrice]);

  return (
    <main className="min-h-screen">
      <BackNavigation />
      {/* Title */}
      <div className="px-40 pt-6">
        <h1 className="font-bold text-5xl sm:text-6xl text-gray-900 mb-2">
          Shipping & Payments
        </h1>
        <p className="text-2xl text-gray-400 font-normal">
          Choose your shipping method and payment method
        </p>
      </div>

      {/* Payment & Shipping */}
      <div className="flex flex-col lg:flex-row gap-10 px-8 xl:px-40 mt-10">
        <div className="flex-1">
          <div className="max-w-[900px]">
            <div className="flex flex-row gap-[10px]">
              {/* Payment */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg mb-1">Payment</div>
                <div className="text-gray-500 text-sm mb-4">
                  Please choose a payment method
                </div>
                <div className="flex flex-col gap-4">
                  {loading ? (
                    <div className="text-gray-500">
                      Loading payment methods...
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-gray-500">
                      No payment methods available
                    </div>
                  ) : (
                    paymentMethods.map(
                      (item: {
                        id: string;
                        name: string;
                        desc: string;
                        img: string;
                      }) => (
                        <label
                          key={item.id}
                          className={`border rounded-lg bg-gray-100 px-6 py-4 cursor-pointer transition
                            ${
                              selectedPayment === item.id
                                ? "border-blue-500 shadow"
                                : "border-gray-200"
                            }
                        `}
                          style={{ width: 410, minWidth: 410, minHeight: 130 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="payment"
                                checked={selectedPayment === item.id}
                                onChange={() =>
                                  dispatch(setSelectedPayment(item.id))
                                }
                                className="accent-blue-600 w-5 h-5 mr-3"
                              />
                              <span className="font-semibold text-base">
                                {item.name}
                              </span>
                            </div>
                            {item.img && (
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-[70px] h-[30px] object-contain bg-white rounded p-1"
                              />
                            )}
                          </div>
                          <div className="text-gray-600 text-sm mt-3 ml-[32px]">
                            {item.desc}
                          </div>
                        </label>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Shipping */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg mb-1">Shipping</div>
                <div className="text-gray-500 text-sm mb-4">
                  Please choose a shipping company based on your region
                </div>
                <div className="flex flex-col gap-4">
                  {loading ? (
                    <div className="text-gray-500">
                      Loading shipping methods...
                    </div>
                  ) : shippingMethods.length === 0 ? (
                    <div className="text-gray-500">
                      No shipping methods available
                    </div>
                  ) : (
                    shippingMethods.map(
                      (item: {
                        id: string;
                        name: string;
                        deliveryTime: string;
                        shippingCost: string;
                        insurance: string;
                        img: string;
                      }) => (
                        <label
                          key={item.id}
                          className={`border rounded-lg bg-gray-100 px-6 py-4 cursor-pointer transition
                            ${
                              selectedShipping === item.id
                                ? "border-blue-500 shadow"
                                : "border-gray-200"
                            }
                        `}
                          style={{ width: 410, minWidth: 410, minHeight: 130 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="shipping"
                                checked={selectedShipping === item.id}
                                onChange={() =>
                                  dispatch(setSelectedShipping(item.id))
                                }
                                className="accent-blue-600 w-5 h-5 mr-3"
                              />
                              <span className="font-semibold text-base">
                                {item.name}
                              </span>
                            </div>
                            {item.img && (
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-[70px] h-[30px] object-contain bg-white rounded p-1"
                              />
                            )}
                          </div>
                          <div className="text-gray-600 text-sm mt-3 ml-[32px]">
                            <div>Delivery time: {item.deliveryTime}</div>
                            <div>Shipping cost: {item.shippingCost}</div>
                            <div>Insurance: {item.insurance}</div>
                          </div>
                        </label>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[350px] bg-white rounded-2xl shadow-xl p-8 h-fit">
          <h3 className="font-bold text-xl mb-6">Order Summary</h3>
          {(() => {
            return (
              <>
                <div className="flex justify-between mb-3 text-base">
                  <span>Price</span>
                  <span>{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between mb-3 text-base">
                  <span>Shipping</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between mb-3 text-base">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between mb-3 text-base">
                  <span>Discount price</span>
                  <span>{formatCurrency(discount)}</span>
                </div>
                <div className="flex items-center mb-3 text-base">
                  <input
                    type="checkbox"
                    checked={giftBox}
                    disabled
                    className="mr-2 accent-blue-600"
                  />
                  <span>Pack in a Gift Box</span>
                  <span className="ml-auto">
                    {formatCurrency(giftBox ? giftBoxPrice : 0)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-6 mb-6">
                  <span>Total Price</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </>
            );
          })()}
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-blue-700 transition"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </main>
  );
}

const formatDelivery = (min?: number | null, max?: number | null) => {
  if (!min && !max) return "N/A";
  if (min && max) return `${min}-${max} days`;
  if (min) return `${min}+ days`;
  if (max) return `Up to ${max} days`;
  return "N/A";
};
