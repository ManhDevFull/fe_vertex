"use client";
import handleAPI from "@/axios/handleAPI";
import {
  facebookProvider,
  firebaseConfigReady,
  getAuthClient,
  googleProvider,
} from "@/firebase/firebaseConfig";
import { addAuth, type UserAuth } from "@/redux/reducers/authReducer";
import { signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { getPostLoginRoute } from "@/utils/auth";
export default function FormAuth(props: {
  type: "login" | "sign-up";
  handle?: (val: { email?: string; name?: string; pass?: string }) => void;
  email?: string;
  fullName?: string;
  password?: string;
  onChange?: (data: {
    email?: string;
    fullName?: string;
    password?: string;
  }) => void;
}) {
  const { type, handle, email, fullName, password, onChange } = props;
  const route = useRouter();
  const dispatch = useDispatch();
  const [state, setState] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
    loading: boolean;
  }>({
    loading: false,
  });
  const [stateProps, setStateProps] = useState({
    email: email || "",
    password: password || "",
    fullName: fullName || "",
    loading: false,
  });

  // mỗi khi prop thay đổi, sync lại
  useEffect(() => {
    setState((ps) => ({
      ...ps,
      email: email || "",
      fullName: fullName || "",
      password: password || "",
    }));
  }, [email, fullName, password]);

  const handleInput = (
    field: "email" | "fullName" | "password",
    value: string
  ) => {
    setState((ps) => ({ ...ps, [field]: value }));
    onChange?.({ [field]: value });
  };
  const extractAuthData = (res: any): UserAuth => {
    const payload = res?.data ?? {};
    const user = payload?.user ?? {};

    return {
      token: payload?.accessToken,
      name: user?.name,
      avata: user?.avatarUrl,
      email: user?.email,
      id: user?.id,
      role: user?.rule ?? user?.role,
    };
  };

  const applyAuthResult = (res: any, successMessage: string) => {
    if (!res || res.status !== 200) return false;

    const authData = extractAuthData(res);
    if (!authData?.token) {
      toast.error("Missing authentication token from server response.");
      return false;
    }

    dispatch(addAuth(authData));
    route.replace(getPostLoginRoute(authData.role));
    toast.success(successMessage);
    return true;
  };

  const getAuthErrorMessage = (error: any, fallback: string) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.response?.data?.detail) return error.response.data.detail;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.detail) return error.detail;
    if (typeof error?.message === "string") return error.message;
    if (typeof error === "string") return error;
    if (typeof error?.code === "string") return error.code;
    return fallback;
  };

  const handleLoginWithGoogle = async () => {
    if (!firebaseConfigReady) {
      toast.error("Missing Firebase config. Please check NEXT_PUBLIC_* env values.");
      return;
    }
    try {
      const auth = getAuthClient();
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      const res = await handleAPI(
        "Auth/social-auth",
        { IdToken: idToken },
        "post"
      );
      if (!applyAuthResult(res, "Login successful!")) {
        toast.error("Google login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        getAuthErrorMessage(error, "Failed to login with Google. Please try again.")
      );
    }
  };
  const loginWithFacebook = async () => {
    if (!firebaseConfigReady) {
      toast.error("Missing Firebase config. Please check NEXT_PUBLIC_* env values.");
      return;
    }
    try {
      const auth = getAuthClient();
      const result = await signInWithPopup(auth, facebookProvider);
      const idToken = await result.user.getIdToken(true);
      const res = await handleAPI(
        "Auth/social-auth",
        { IdToken: idToken },
        "post"
      );
      if (!applyAuthResult(res, "Login successful!")) {
        toast.error("Facebook login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        getAuthErrorMessage(error, "Failed to login with Facebook. Please try again.")
      );
    }
  };
  const authSubmit = async () => {
    if (state.email && state.password) {
      setState((ps) => ({ ...ps, loading: true }));
      try {
        const res = await handleAPI(
          "Auth/login",
          { Email: state.email, Password: state.password },
          "post"
        );
        applyAuthResult(res, "Login successful!");
      } catch (error) {
        console.error(error);
        toast.error(getAuthErrorMessage(error, "Login failed."));
      } finally {
        setState((ps) => ({ ...ps, loading: false }));
      }
    } else {
      toast.warning("Please enter complete information!");
    }
  };
  if (type === "login")
    return (
      <div className="flex w-full flex-col gap-8">
        <div className="space-y-6">
          <label className="flex flex-col gap-3">
            <span className="text-2xl font-bold">Email</span>
            <input
              className="rounded-xl bg-gray-100 px-5 py-4 text-lg outline-none"
              type="email"
              placeholder="Enter your email address"
              onChange={(e) =>
                setState((ps) => ({ ...ps, email: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-3">
            <span className="text-2xl font-bold">Password</span>
            <input
              className="rounded-xl bg-gray-100 px-5 py-4 text-lg outline-none"
              type="password"
              placeholder="Enter your password"
              onChange={(e) =>
                setState((ps) => ({ ...ps, password: e.target.value }))
              }
            />
          </label>
          <button
            disabled={state.loading}
            onClick={authSubmit}
            className={`flex w-full justify-center rounded-xl bg-black py-4 text-lg text-white transition ${
              state.loading ? "cursor-wait opacity-70" : "hover:bg-black/90"
            }`}
          >
            Login
          </button>
        </div>

        <div className="relative">
          <hr className="my-0 w-full border-t border-black/15" />
          <p className="absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 bg-white px-5 text-xs font-semibold uppercase tracking-[0.35em] text-black/55">
            Or
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleLoginWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/15 py-3 text-lg text-black transition hover:border-black/30"
          >
            <FcGoogle size={40} />
            <span>Login with Google</span>
          </button>
          <button
            onClick={loginWithFacebook}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] py-3 text-lg text-white transition hover:bg-[#0f6de0]"
          >
            <FaFacebook size={40} color="white" />
            <span>Login with Facebook</span>
          </button>
          <p className="text-center text-lg text-black/60">
            First time here?{" "}
            <Link
              className="text-black underline decoration-black"
              href="/auth/sign-up"
            >
              Signup
            </Link>
          </p>
        </div>
      </div>
    );
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="space-y-6">
        <label className="flex flex-col gap-3">
          <span className="text-2xl font-bold">Full name</span>
          <input
            className="rounded-xl bg-gray-100 px-5 py-4 text-lg outline-none"
            type="text"
            placeholder="Enter your full name"
            value={state.fullName}
            onChange={(e) => handleInput("fullName", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-3">
          <span className="text-2xl font-bold">Email</span>
          <input
            className="rounded-xl bg-gray-100 px-5 py-4 text-lg outline-none"
            type="email"
            placeholder="Enter your email address"
            value={state.email}
            onChange={(e) => handleInput("email", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-3">
          <span className="text-2xl font-bold">Password</span>
          <input
            className="rounded-xl bg-gray-100 px-5 py-4 text-lg outline-none"
            type="password"
            placeholder="Enter your password"
            value={state.password}
            onChange={(e) => handleInput("password", e.target.value)}
          />
        </label>
        <button
          disabled={state.loading}
          onClick={async () => {
            if (!state.fullName || !state.email || !state.password) {
              toast.warning("Please enter complete information!");
              return;
            }
            setState((ps) => ({ ...ps, loading: true }));
            try {
              await handle?.({
                email: state.email,
                name: state.fullName,
                pass: state.password,
              });
            } finally {
              setState((ps) => ({ ...ps, loading: false }));
            }
          }}
          className={`flex w-full justify-center rounded-xl bg-black py-4 text-lg text-white transition ${
            state.loading ? "cursor-wait opacity-70" : "hover:bg-black/90"
          }`}
        >
          Sign Up
        </button>
      </div>
      <div className="relative">
        <hr className="my-0 w-full border-t border-black/15" />
        <p className="absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 bg-white px-5 text-xs font-semibold uppercase tracking-[0.35em] text-black/55">
          Or
        </p>
      </div>
      <div className="space-y-6">
        <button
          onClick={handleLoginWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/15 py-3 text-lg text-black transition hover:border-black/30"
        >
          <FcGoogle size={40} />
          <span>Sign Up with Google</span>
        </button>
        <button
          onClick={loginWithFacebook}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] py-3 text-lg text-white transition hover:bg-[#0f6de0]"
        >
          <FaFacebook size={40} color="white" />
          <span>Sign Up with Facebook</span>
        </button>
        <p className="text-center text-lg text-black/60">
          Already a member?{" "}
          <Link
            className="text-black underline decoration-black"
            href="/auth/login"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
