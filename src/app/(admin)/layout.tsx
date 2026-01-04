"use client";
import "../globals.css";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { Toaster } from "sonner";
import HeaderAdminComponent from "@/components/templates/layout/admin/HeaderAdminComponent";
import SiderAdminComponent from "@/components/templates/layout/admin/SiderAdminComponent";
import RevenueComponent from "@/components/templates/layout/admin/RevenueComponent";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAuth, authSelector, type UserAuth } from "@/redux/reducers/authReducer";
import { useRouter } from "next/navigation";
import { getPostLoginRoute, isAdminRole } from "@/utils/auth";
import type { ReactNode } from "react";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lakki+Reddy&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Provider store={store}>
          <Toaster
            richColors
            position="top-right"
            toastOptions={{ className: "!text-base !pl-7 !py-5 !shadow-xl" }}
          />

          <AdminAppFrame>{children}</AdminAppFrame>
        </Provider>
      </body>
    </html>
  );
}

function AdminAppFrame({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth: UserAuth = useSelector(authSelector);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("token");
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch(addAuth(parsed));
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
      return;
    }

    if (!isAdminRole(auth?.role)) {
      router.replace(getPostLoginRoute(auth?.role));
    }
  }, [auth?.role, auth?.token, hydrated, router]);

  if (!hydrated || !auth?.token || !isAdminRole(auth?.role)) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-slate-50 text-sm text-slate-500">
        Redirecting...
      </main>
    );
  }

  return (
    <>
      <HeaderAdminComponent />
      <div className="grid grid-cols-24">
        <SiderAdminComponent className="col-span-5" />
        <div className="col-span-19 h-[calc(100vh-70px)] grid grid-cols-19">
          <div className="col-span-14 p-4 h-full">{children}</div>
          <RevenueComponent className="col-span-5" />
        </div>
      </div>
    </>
  );
}
