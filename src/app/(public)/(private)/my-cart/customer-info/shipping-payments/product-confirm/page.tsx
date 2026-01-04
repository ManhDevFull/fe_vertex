"use client";
import BackNavigation from "@/components/ui/BackNavigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { FaShare, FaGift } from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";
import handleAPI from "@/axios/handleAPI";
import { useRouter } from "next/navigation";
import { setCheckoutCart } from "@/redux/reducers/checkoutReducer";
import { formatCurrency } from "@/utils/currency";

type CartItem = { cartId: number; productName: string; imageUrl?: string; color?: string; unitPrice: number; quantity: number };
type Summary = { itemsPrice: number; shipping: number; tax: number; discountPrice: number; giftBoxPrice: number; totalPrice: number };

export default function ProductConfirmation() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { giftBox, giftBoxPrice } = useSelector((state: RootState) => state.cart);
  const { customerInfo, selectedPayment, selectedShipping, paymentMethods, shippingMethods, checkoutItems, checkoutSummary, selectedCartIds, selectedAddressId } = useSelector((state: RootState) => state.checkout);
  const auth = useSelector((state: RootState) => state.authReducer.data);
  const [summary, setSummary] = useState<Summary | null>(checkoutSummary ?? null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const calcSummary = (items: CartItem[], baseSummary?: Summary | null): Summary => {
    const itemsPrice = items.reduce((s, i) => s + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0);
    const totalAll = baseSummary?.itemsPrice ?? itemsPrice;
    const ratio = totalAll > 0 ? itemsPrice / totalAll : 0;
    const shipping = (baseSummary?.shipping ?? 0) * ratio;
    const tax = (baseSummary?.tax ?? 0) * ratio;
    const discountPrice = (baseSummary?.discountPrice ?? 0) * ratio;
    const giftBoxPrice = (baseSummary?.giftBoxPrice ?? 0) * ratio;
    const totalPrice = itemsPrice + shipping + tax - discountPrice;
    return { itemsPrice, shipping, tax, discountPrice, giftBoxPrice, totalPrice };
  };

  // hydrate from store or fetch once if user lands directly
  useEffect(() => {
    const init = async () => {
      if (checkoutItems.length) {
        const filtered = selectedCartIds.length
          ? checkoutItems.filter((i: any) => selectedCartIds.includes(i.cartId ?? i.id))
          : checkoutItems;
        const sum = calcSummary(filtered as any, checkoutSummary ?? undefined);
        setCartItems(filtered as any);
        setSummary(sum);
        dispatch(setCheckoutCart({ items: filtered as any, summary: sum, selectedIds: selectedCartIds }));
        return;
      }

      try {
        const data = await handleAPI(`/Cart`);
        const payload = (data as any)?.data ?? data ?? {};
        const items = payload.items ?? [];
        const baseSummary: Summary | null = payload.summary ?? null;
        const ids = items.map((i: any) => i.cartId ?? i.id ?? 0);
        const filtered = selectedCartIds.length
          ? items.filter((i: any) => selectedCartIds.includes(i.cartId ?? i.id))
          : items;
        const sum = calcSummary(filtered as any, baseSummary ?? undefined);
        setCartItems(filtered);
        setSummary(sum);
        dispatch(setCheckoutCart({ items: filtered, summary: sum, selectedIds: ids }));
      } catch (e) {
        console.error('Failed to load cart data:', e);
      }
    };
    init();
  }, [checkoutItems, checkoutSummary, dispatch, selectedCartIds]);

  // Handle CONFIRM button click - Create payment
  const handleConfirm = async () => {
    if (!summary || !cartItems.length) {
      alert('Please wait for cart data to load');
      return;
    }

    const baseTotal = summary.totalPrice ?? 0;
    const totalPrice = baseTotal + (giftBox ? giftBoxPrice : 0);

    if (totalPrice <= 0) {
      alert('Total price must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const amountInVND = Math.round(totalPrice);
      const orderId = `ORD-${Date.now()}`;

      const cartIds = selectedCartIds.length
        ? selectedCartIds
        : cartItems.map((item) => item.cartId);

      const response = await handleAPI('/payment/create', {
        amount: amountInVND,
        orderInfo: `Payment for order ${orderId} - ${cartItems.length} items`,
        returnUrl: `${window.location.origin}/product-confirmation`,
        orderId,
        paymentMethod: selectedPaymentMethod?.id ?? selectedPayment,
        // order: 
        accountId: auth?.id ?? 0,
        addressId: selectedAddressId && selectedAddressId > 0 ? selectedAddressId : undefined,
        selectedCartIds: cartIds.length ? cartIds : undefined,
      }, 'post');

      const payload = (response as any)?.data ?? response ?? {};

      if (payload.success && payload.paymentUrl) {
        window.location.href = payload.paymentUrl;
      } else {
        alert(payload.message || 'Failed to create payment');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error creating payment - Full error object:', error);
      let errorMessage = 'Failed to create payment. Please try again.';

      if (error?.error) {
        errorMessage = error.error;
        if (error.details) errorMessage += ` - ${error.details}`;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || error.response.statusText || `HTTP ${error.response.status}`;
      }

      alert(errorMessage);
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find((p: { id: string }) => p.id === selectedPayment);
  const selectedShippingMethod = shippingMethods.find((s: { id: string }) => s.id === selectedShipping);

  const price = useMemo(() => summary?.itemsPrice ?? cartItems.reduce((s, i) => s + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0), [summary, cartItems]);
  const shipping = useMemo(() => summary?.shipping ?? 0, [summary]);
  const tax = useMemo(() => summary?.tax ?? 0, [summary]);
  const discount = useMemo(() => summary?.discountPrice ?? 0, [summary]);
  const totalPrice = useMemo(() => {
    const base = summary?.totalPrice ?? price + shipping + tax - discount;
    return base + (giftBox ? giftBoxPrice : 0);
  }, [summary, price, shipping, tax, discount, giftBox, giftBoxPrice]);

  return (
    <main className="min-h-screen pb-16">
      <BackNavigation />

      {/* Header */}
      <div className="px-40 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-5xl sm:text-6xl text-gray-900 mb-2">Product Confirmation</h1>
            <p className="text-2xl text-gray-400 font-normal">Review and confirm your order</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-2">
            <FaShare className="text-2xl" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 px-8 xl:px-40 mt-10">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Shopping Items */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h2 className="font-semibold text-xl mb-4">Shopping items</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.cartId} className="flex items-center gap-4 bg-white p-4 rounded-xl">
                  <img
                    src={item.imageUrl || ''}
                    alt={item.productName}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-base">{item.productName}</div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      Color:{" "}
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ background: item.color || '#eee' }}
                      ></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-base">{formatCurrency(item.unitPrice)}</div>
                    <div className="text-sm text-gray-500">x{item.quantity}</div>
                    <div className="font-semibold text-base">{formatCurrency(item.unitPrice * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h2 className="font-semibold text-xl mb-4">Payment method</h2>
            <div className="flex items-center justify-between bg-white p-4 rounded-xl">
              <span className="font-semibold text-base">{selectedPaymentMethod?.name}</span>
              {selectedPaymentMethod?.img && (
                <img
                  src={selectedPaymentMethod.img}
                  alt={selectedPaymentMethod.name}
                  className="w-16 h-8 object-contain"
                />
              )}
            </div>
          </div>

          {/* Shipping Company */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h2 className="font-semibold text-xl mb-4">Shipping company</h2>
            <div className="flex items-center justify-between bg-white p-4 rounded-xl">
              <span className="font-semibold text-base">{selectedShippingMethod?.name}</span>
              {selectedShippingMethod?.img && (
                <img
                  src={selectedShippingMethod.img}
                  alt={selectedShippingMethod.name}
                  className="w-16 h-8 object-contain"
                />
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h2 className="font-semibold text-xl mb-4">Shipping Address</h2>
            <div className="bg-white p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <div className="font-medium">{customerInfo.firstName} {customerInfo.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Country:</span>
                  <div className="font-medium">{customerInfo.country}</div>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span>
                  <div className="font-medium">{customerInfo.address}</div>
                </div>
                <div>
                  <span className="text-gray-500">City:</span>
                  <div className="font-medium">{customerInfo.state}</div>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <div className="font-medium">{customerInfo.phone}</div>
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
                  <span className="ml-auto">{formatCurrency(giftBox ? giftBoxPrice : 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-6 mb-6">
                  <span>Total Price</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </>
            );
          })()}
          <button 
            onClick={handleConfirm}
            disabled={loading || !summary}
            className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaGift />
            <span>{loading ? 'Processing...' : 'CONFIRM'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
