"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addAuth, authSelector, type UserAuth } from "@/redux/reducers/authReducer";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth: UserAuth = useSelector(authSelector);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("token");
      if (stored) {
        dispatch(addAuth(JSON.parse(stored)));
      }
    } catch (error) {
      console.error("Failed to restore auth session", error);
      window.localStorage.removeItem("token");
    } finally {
      setHydrated(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    if (!auth?.token) {
      router.replace("/auth/login");
    }
  }, [auth?.token, hydrated, router]);

  if (!hydrated || !auth?.token) {
    return (
      <main className="flex min-h-[40vh] w-full items-center justify-center text-sm text-slate-500">
        Redirecting...
      </main>
    );
  }

  return <>{children}</>;
}
