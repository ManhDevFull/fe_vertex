"use client";
import BackNavigation from "@/components/ui/BackNavigation";
import type { ReactNode } from "react";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
