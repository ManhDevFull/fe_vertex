"use client";
import BackNavigation from "@/components/ui/BackNavigation";
import NavigationPath from "@/components/ui/NavigationPath";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setCheckoutCart, setSelectedAddressId, setSelectedCartIds, updateCustomerInfo } from "@/redux/reducers/checkoutReducer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import handleAPI from "@/axios/handleAPI";
import { formatCurrency } from "@/utils/currency";
import { resolveWardLocation } from "@/utils/addressLookup";

// Only Vietnam is needed for this project
const countries = [
  { code: "VN", name: "Vietnam", flag: "vn" },
];

type SavedAddress = {
  id: number;
  accountid: number;
  title?: string;
  namerecipient?: string;
  tel?: string;
  codeward?: number;
  description?: string;
  detail?: string;
  fullText?: string;
  locationLabel?: string;
};

export default function CustomerInfo() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { customerInfo, checkoutItems, checkoutSummary, selectedCartIds, selectedAddressId } = useSelector((state: RootState) => state.checkout);
    const auth = useSelector((state: RootState) => state.authReducer.data);
    // Read giftBox state from cartReducer (set in my-cart page)
    const { giftBox, giftBoxPrice } = useSelector((state: RootState) => state.cart);
    // We read cart summary directly from backend so it's consistent with My Cart page
    const [summary, setSummary] = useState<{ itemsPrice: number; shipping: number; tax: number; discountPrice: number; giftBoxPrice: number; totalPrice: number } | null>(null);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [resolvingAddress, setResolvingAddress] = useState(false);
    
    // Province display is read-only because address selection provides it
    const ProvinceSelect = () => (
      <input
        readOnly
        value={customerInfo.state || "Auto-selected"}
        className={`w-full h-10 border rounded px-3 text-left bg-gray-100 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
      />
    );
    
    const handleInputChange = (field: string, value: string) => {
        dispatch(updateCustomerInfo({ [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!customerInfo.email || customerInfo.email.trim() === '') {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!selectedAddressId) {
            newErrors.address = 'Please select a saved address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const price = summary?.itemsPrice ?? 0;
    const shipping = summary?.shipping ?? 0;
    const tax = summary?.tax ?? 0;
    const discount = summary?.discountPrice ?? 0;
    // Calculate totalPrice: backend totalPrice (without giftBox) + giftBoxPrice if checkbox is checked
    // Backend returns totalPrice without giftBox, so we add it if giftBox is true
    const baseTotal = summary?.totalPrice ?? 0;
    const totalPrice = baseTotal + (giftBox ? giftBoxPrice : 0);

    const handleContinue = () => {
        if (validateForm()) {
            router.push('/my-cart/customer-info/shipping-payments');
        }
    };

    const calcSummary = (
      items: any[],
      baseSummary?: { itemsPrice: number; shipping: number; tax: number; discountPrice: number; giftBoxPrice: number; totalPrice: number } | null
    ) => {
      const itemsPrice = items.reduce(
        (s, i) => s + (i.unitPrice ?? 0) * (i.quantity ?? 1),
        0
      );
      const totalAll = baseSummary?.itemsPrice ?? itemsPrice;
      const ratio = totalAll > 0 ? itemsPrice / totalAll : 0;
      const shipping = (baseSummary?.shipping ?? 0) * ratio;
      const tax = (baseSummary?.tax ?? 0) * ratio;
      const discountPrice = (baseSummary?.discountPrice ?? 0) * ratio;
      const giftBoxPrice = (baseSummary?.giftBoxPrice ?? 0) * ratio;
      const totalPrice = itemsPrice + shipping + tax - discountPrice;
      return { itemsPrice, shipping, tax, discountPrice, giftBoxPrice, totalPrice };
    };

    // On first render: load order summary
    useEffect(() => {
        (async () => {
            try {
                if (checkoutItems.length || checkoutSummary) {
                    const filtered = selectedCartIds.length
                        ? checkoutItems.filter((i: any) => selectedCartIds.includes(i.cartId ?? i.id))
                        : checkoutItems;
                    const nextSum = checkoutSummary ?? calcSummary(filtered, checkoutSummary);
                    setCartItems(filtered);
                    setSummary(nextSum);
                    return;
                }

                const data:any = await handleAPI(`/Cart`);
                const payload = (data as any)?.data ?? data ?? {};
                const items = payload.items ?? [];
                const baseSummary = payload.summary ?? null;
                const filtered = selectedCartIds.length
                    ? items.filter((i: any) => selectedCartIds.includes(i.cartId ?? i.id))
                    : items;
                const sum = calcSummary(filtered, baseSummary);
                const ids = filtered.map((i: any) => i.cartId ?? i.id ?? 0);
                setCartItems(filtered);
                setSummary(sum);
                dispatch(setCheckoutCart({ items: filtered, summary: sum, selectedIds: ids }));
                dispatch(setSelectedCartIds(ids));
            } catch (e) {
                // ignore; UI stays empty if not logged in
            }
        })();
        // Ensure country is preset to VN once
        if (!customerInfo.country) {
            dispatch(updateCustomerInfo({ country: 'VN' }));
        }
        // Ensure email is prefilled from auth once
        if (auth?.email && !customerInfo.email) {
            dispatch(updateCustomerInfo({ email: auth.email }));
        }
    }, [dispatch, customerInfo.country, auth?.email, customerInfo.email]);

    // Load saved addresses for the current user (if any)
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!auth?.id) return;
            setAddressLoading(true);
            try {
                const res = await handleAPI("/Address/my-addresses", undefined, "get");
                const list = (res as any)?.data ?? res ?? [];
                const normalized = Array.isArray(list) ? list : [];
                const resolved = await Promise.all(
                  normalized.map(async (adr: SavedAddress) => {
                    const locationLabel =
                      resolveWardLocation(adr.codeward)?.label ?? "";
                    return {
                      ...adr,
                      fullText: await resolveFullAddress(adr, locationLabel),
                      locationLabel,
                    };
                  })
                );
                setAddresses(resolved);
                if (resolved.length) {
                    const preferred = selectedAddressId
                        ? resolved.find((item) => item.id === selectedAddressId) ?? resolved[0]
                        : resolved[0];
                    if (preferred) {
                        dispatch(setSelectedAddressId(preferred.id));
                        applyAddressToForm(preferred);
                    }
                } else {
                    dispatch(setSelectedAddressId(null));
                }
            } catch {
                setAddresses([]);
                dispatch(setSelectedAddressId(null));
            } finally {
                setAddressLoading(false);
            }
        };
        fetchAddresses();
    }, [auth?.id]);

    const resolveFullAddress = async (
        adr: SavedAddress,
        locationLabel?: string
    ) => {
        const parts = [adr.detail, locationLabel].filter(Boolean);
        return parts.join(", ");
    };

    const applyAddressToForm = async (adr: SavedAddress) => {
        if (!adr) return;
        setResolvingAddress(true);
        try {
            const fullName = adr.namerecipient?.trim() ?? "";
            // Best-effort split: last word as last name
            const parts = fullName.split(" ").filter(Boolean);
            const lastName = parts.length > 1 ? parts.pop() : "";
            const firstName = parts.join(" ") || fullName;

            const composedAddress =
                adr.fullText || (await resolveFullAddress(adr, adr.locationLabel));
            const stateName = composedAddress.split(", ").pop() || "";

            dispatch(updateCustomerInfo({
                firstName,
                lastName: lastName || firstName || "",
                address: composedAddress,
                phone: adr.tel ?? "",
                state: stateName,
            }));
        } finally {
            setResolvingAddress(false);
        }
    };

    return(
        <main className="min-h-screen">
            <BackNavigation />
        {/* Title */}
        <div className="px-40 pt-6">
            <h1 className="font-bold text-5xl sm:text-6xl text-gray-900 mb-2">Customer Information</h1>
            <p className="text-2xl text-gray-400 font-normal">Add your delivery details</p>
        </div>


        {/* Form and Order Summary */}
        <div className="flex flex-col lg:flex-row gap-10 px-8 xl:px-40 mt-8">
            {/* Form */}
            <div className="flex-1">
                {/* Saved addresses */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Saved addresses</div>
                      <div className="text-xs text-gray-500">
                        {addressLoading ? "Loading..." : `${addresses.length} address${addresses.length === 1 ? "" : "es"}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      + Add address
                    </button>
                  </div>
                  {addressLoading ? (
                    <div className="text-sm text-gray-500">Loading saved addresses...</div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.map((adr) => (
                        <button
                          key={adr.id}
                          type="button"
                          className={`w-full text-left rounded-lg border px-4 py-3 transition ${
                            selectedAddressId === adr.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                          }`}
                          onClick={() => {
                            if (selectedAddressId === adr.id) return;
                            dispatch(setSelectedAddressId(adr.id));
                            applyAddressToForm(adr);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-gray-800">{adr.title || "Address"}</div>
                              <div className="text-sm text-gray-700">
                                {adr.namerecipient || "Recipient"} - {adr.tel || "No phone"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {adr.detail || "-"}
                              </div>
                              {adr.locationLabel && (
                                <div className="text-xs text-gray-500">
                                  {adr.locationLabel}
                                </div>
                              )}
                              {adr.description && (
                                <div className="text-xs text-gray-400">
                                  {adr.description}
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">#{adr.id}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                      You have no saved addresses. Enter your address below.
                    </div>
                  )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[350px] bg-white rounded-2xl shadow-xl p-8 h-fit">
                <h3 className="font-bold text-xl mb-6">Order Summary</h3>
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
