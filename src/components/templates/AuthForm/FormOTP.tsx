"use client";
import handleAPI from "@/axios/handleAPI"; // NEW CODE: reuse API helper for OTP endpoints
import { formatTime } from "@/utils/formatTime";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface FormOTPProps {
  email: string;
  fullName: string;
  password: string;
  onBack?: () => void;
  expiresAt?: string | null; // NEW CODE: track expiry countdown
  onResent?: (expiresAt?: string | null) => void; // NEW CODE: notify parent when resend succeeds
  onComplete?: () => void; // NEW CODE: allow parent to reset state after verification
}

const RESEND_INTERVAL = 300; 
const OTP_LENGTH = 6;

export default function FormOTP({
  email,
  fullName,
  password,
  onBack,
  expiresAt,
  onResent,
  onComplete,
}: FormOTPProps) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const initialCountdown = useMemo(() => {
    if (!expiresAt) return RESEND_INTERVAL;
    const ms = new Date(expiresAt).getTime() - Date.now();
    if (Number.isNaN(ms)) return RESEND_INTERVAL;
    return Math.max(0, Math.ceil(ms / 1000));
  }, [expiresAt]);
  const [countdown, setCountdown] = useState(initialCountdown);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setCountdown(initialCountdown);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }, [email, initialCountdown]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formattedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  // ✅ xử lý khi nhập
  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return; // chỉ cho số
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);

    // nếu nhập đúng 1 ký tự, tự qua ô kế
    if (val && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  // ✅ xử lý backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.warning("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res:any = await handleAPI(
        "Auth/register/verify-otp",
        {
          Email: formattedEmail,
          Password: password,
          FullName: fullName,
          Code: code,
        },
        "post"
      );
      if (res?.status === 200) {
        toast.success(res?.message ?? "Account verified successfully!");
        onComplete?.();
        router.replace("/auth/login");
        return;
      }
      toast.error(res?.message ?? "Verification failed. Please try again.");
    } catch (error: any) {
      const message =
        error?.message ??
        error?.detail ??
        error?.error ??
        "Verification failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading || countdown > 0) return;
    if (!password) {
      toast.error("Missing password. Please restart the sign-up process.");
      onBack?.();
      return;
    }
    setResendLoading(true);
    try {
      const res:any = await handleAPI(
        "Auth/register/send-otp",
        {
          Email: formattedEmail,
          Password: password,
          FullName: fullName,
        },
        "post"
      );
      if (res?.status === 200) {
        toast.success(
          res?.message ?? "A new verification code has been sent to your email."
        );
        const newExpiresAt = res?.data?.expiresAt ?? null;
        onResent?.(newExpiresAt);
        if (newExpiresAt) {
          const ms = new Date(newExpiresAt).getTime() - Date.now();
          const seconds = Number.isNaN(ms)
            ? RESEND_INTERVAL
            : Math.max(0, Math.ceil(ms / 1000));
          setCountdown(seconds > 0 ? seconds : RESEND_INTERVAL);
        } else {
          setCountdown(RESEND_INTERVAL);
        }
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        toast.error(res?.message ?? "Failed to resend verification code.");
      }
    } catch (error: any) {
      const message =
        error?.message ??
        error?.detail ??
        error?.error ??
        "Failed to resend verification code.";
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full mt-25 rounded-3xl border border-black/10 bg-white px-2 py-7 shadow-sm sm:px-8 md:px-10 md:py-8">
      <h3 className="mb-3 text-center text-2xl font-bold sm:text-left sm:text-3xl">
        We just sent an OTP to your email
      </h3>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="mb-2 text-center text-base leading-7 text-black/60 sm:mb-6 sm:text-left md:text-lg">
          Enter the security code we sent to{" "}
          <span className="font-semibold text-black">{formattedEmail}</span>
        </p>
        <button
          type="button"
          onClick={() => onBack?.()}
          className="text-sm font-semibold text-blue-500 transition hover:text-blue-600 sm:text-base"
        >
          Edit
        </button>
      </div>

      {/* ✅ input 6 ô */}
      <div className="mb-5 flex justify-center gap-3 sm:gap-5">
        {otp.map((val, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-gray-300 text-center text-2xl font-bold text-black outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
          />
        ))}
      </div>

      <p className="text-sm text-black/60 sm:text-base">
        Didn’t get the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || countdown > 0}
          className={`font-medium ${
            resendLoading || countdown > 0
              ? "cursor-not-allowed text-gray-400"
              : "text-blue-500 transition hover:text-blue-600"
          }`}
        >
          {resendLoading
            ? "Sending..."
            : countdown > 0
            ? `Resend in ${formatTime(countdown)}`
            : "Resend it"}
        </button>
      </p>

      <button
        onClick={handleVerify}
        disabled={loading}
        className={`mt-6 w-full rounded-xl bg-black py-4 text-lg text-white transition ${
          loading ? "cursor-wait opacity-70" : "hover:bg-black/90"
        }`}
      >
        Submit
      </button>
    </div>
  );
}
