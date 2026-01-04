'use client';
import BackNavigation from "@/components/ui/BackNavigation";
import handleAPI from "@/axios/handleAPI";
import { clearCheckoutCart } from "@/redux/reducers/checkoutReducer";
import { useDispatch } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { GrFormNextLink } from "react-icons/gr";
import { IoLogoBuffer } from "react-icons/io5";
import { VscError } from "react-icons/vsc";

type Status = "checking" | "pending" | "success" | "failed";

const readParam = (params: { get: (key: string) => string | null }, keys: string[]) => {
    for (const key of keys) {
        const value = params.get(key);
        if (value) return value;
    }
    return null;
};

const safeDecode = (value: string | null) => {
    if (!value) return "";
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const errorMessage = (error: any) => {
    if (!error) return "Failed to confirm payment.";
    if (typeof error === "string") return error;
    if (error?.error) return String(error.error);
    if (error?.message) return String(error.message);
    return "Failed to confirm payment.";
};

export default function ProductConfirmation() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<Status>("checking");
    const [detail, setDetail] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const orderToken = useMemo(
        () => readParam(searchParams, ["orderId", "orderid", "order_id", "vnp_TxnRef", "vnp_txnref"]),
        [searchParams]
    );
    const resultCode = useMemo(
        () => readParam(searchParams, ["resultCode", "resultcode", "result_code", "vnp_ResponseCode", "vnp_responsecode"]),
        [searchParams]
    );
    const vnpTransactionStatus = useMemo(
        () => readParam(searchParams, ["vnp_TransactionStatus", "vnp_transactionstatus"]),
        [searchParams]
    );
    const providerMessage = useMemo(
        () => safeDecode(readParam(searchParams, ["message", "msg", "error", "vnp_Message", "vnp_message"])),
        [searchParams]
    );

    const createOrder = async (orderId: string) => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            await handleAPI(`/payment/verify-and-confirm/${orderId}`, undefined, "post");
            setStatus("success");
            setDetail("Your order has been confirmed.");
            dispatch(clearCheckoutCart());
        } catch (err) {
            const details = typeof (err as any)?.details === "string" ? (err as any).details : "";
            if (details.includes("Cart is empty") || errorMessage(err).includes("Cart is empty")) {
                setStatus("success");
                setDetail("Your order was already confirmed.");
                dispatch(clearCheckoutCart());
            } else {
                setStatus("failed");
                setDetail(errorMessage(err));
            }
        } finally {
            setIsCreating(false);
        }
    };

    const verifyAndConfirm = async (orderId: string) => {
        const maxRetries = 3;
        const retryDelayMs = 1500;
        setStatus("checking");
        setDetail("Checking payment status...");

        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
            try {
                const res: any = await handleAPI(`/payment/status/${orderId}`);
                const rawStatus = res?.status ?? res?.data?.status ?? "";
                const normalized = String(rawStatus).toUpperCase();

                if (normalized === "SUCCESS") {
                    await createOrder(orderId);
                    return;
                }
                if (normalized === "FAILED") {
                    setStatus("failed");
                    setDetail(res?.message ?? "Payment failed.");
                    return;
                }

                if (attempt < maxRetries) {
                    setStatus("pending");
                    setDetail(`Payment is pending. Retrying (${attempt}/${maxRetries})...`);
                    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
                }
            } catch (err) {
                setStatus("failed");
                setDetail(errorMessage(err));
                return;
            }
        }

        // User has returned to the returnUrl, so we can force order creation on final retry.
        await createOrder(orderId);
    };

    useEffect(() => {
        if (!orderToken) {
            setStatus("failed");
            setDetail("Missing order id from payment redirect.");
            return;
        }

        const isMoMoSuccess = resultCode === "0";
        const isVnPaySuccess = resultCode === "00" || vnpTransactionStatus === "00";
        const hasProviderResult = !!resultCode || !!vnpTransactionStatus;

        if (isMoMoSuccess || isVnPaySuccess) {
            createOrder(orderToken);
            return;
        }

        if (hasProviderResult) {
            setStatus("pending");
            setDetail(providerMessage || "Payment is being verified.");
            verifyAndConfirm(orderToken);
            return;
        }

        verifyAndConfirm(orderToken);
    }, [orderToken, resultCode, vnpTransactionStatus, providerMessage]);

    const isSuccess = status === "success";
    const isFailed = status === "failed";
    const isPending = status === "pending" || status === "checking";

    const title = isSuccess
        ? "Your order is successfully placed"
        : isFailed
          ? "Payment was not successful"
          : "Processing your payment";

    const description = detail
        ? detail
        : isSuccess
          ? "Thank you for your purchase. Your order is now in our system."
          : "Please wait while we confirm your payment.";

    const heroImage = isFailed
        ? "https://res.cloudinary.com/do0im8hgv/image/upload/v1758725048/Untitled-1_uspr9d.png"
        : "https://res.cloudinary.com/do0im8hgv/image/upload/v1758722974/e87b5a38137755e77ecde5dec85f34504e426b41_csmqzy.png";

    const handlePrimaryAction = () => {
        if (isFailed) {
            router.push("/my-cart");
            return;
        }
        if (isPending) {
            router.push("/");
            return;
        }
        router.push("/user");
    };

    const handleSecondaryAction = () => {
        if (isPending) {
            if (orderToken) {
                verifyAndConfirm(orderToken);
            }
            return;
        }
        router.push("/");
    };

    return (
        <main className="min-h-screen">
            <BackNavigation />

            {/* Title */}
            <div className="max-w-[1000px] mx-auto pt-6">
                <h1 className="font-bold text-5xl sm:text-6xl text-gray-900 mb-2">Product Confirmation</h1>
                <p className="text-2xl text-gray-400 font-normal">Review your payment status</p>
            </div>

            <div className="max-w-[1000px] mx-auto mt-10 flex flex-col md:flex-row items-center justify-center gap-30">
                <div className="flex-1 flex justify-center">
                    <img
                        src={heroImage}
                        alt="Order status"
                        className="w-[700px] h-[400px] object-contain"
                    />
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    {isSuccess ? (
                        <IoIosCheckmarkCircleOutline className="text-green-500 text-6xl mb-4 self-center" />
                    ) : isFailed ? (
                        <VscError className="text-red-500 text-6xl mb-4 self-center" />
                    ) : (
                        <IoLogoBuffer className="text-blue-600 text-6xl mb-4 self-center" />
                    )}
                    <h2 className="font-bold text-2xl sm:text-3xl mb-2 text-center md:text-center">
                        {title}
                    </h2>
                    <p className="text-gray-500 text-base mb-3 text-center md:text-center">
                        {description}
                    </p>
                    {orderToken && (
                        <p className="text-sm text-gray-400 mb-6 text-center md:text-center">
                            Order token: {orderToken}
                        </p>
                    )}
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={handlePrimaryAction}
                            className="flex-1 border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                        >
                            <IoLogoBuffer />
                            {isFailed ? "BACK TO CART" : isPending ? "GO TO HOME" : "GO TO DASHBOARD"}
                        </button>
                        <button
                            onClick={handleSecondaryAction}
                            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                        >
                            {isPending ? "CHECK AGAIN" : "GO TO HOME"} <GrFormNextLink className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
