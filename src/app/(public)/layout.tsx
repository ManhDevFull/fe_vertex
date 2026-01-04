"use client";
import "../globals.css";
import { Provider } from "react-redux";
import store from "@/redux/store";
import Link from "next/link";
import HeaderComponent from "@/components/templates/layout/HeaderComponent";
import FooterComponent from "@/components/templates/layout/FooterComponent";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { ChatClient } from "@/components/templates/Chat/ChatClient";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/reducers/authReducer";
import { useRouter } from "next/navigation";

function ChatClientGate() {
  const auth = useSelector(authSelector);
  if (!auth?.token) return null;
  return (
    <div className="fixed bottom-20 right-18 z-[9999]">
      <ChatClient />
    </div>
  );
}

export default function PublicRootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <Toaster
            richColors
            position="top-right"
            toastOptions={{ className: "!text-base !pl-7 !py-5 !shadow-xl" }}
          />
          <HeaderComponent />
          {children}
          <ChatClientGate />
          <FooterComponent />
        </Provider>
      </body>
    </html>
  );
}
