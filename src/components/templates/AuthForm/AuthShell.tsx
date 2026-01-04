"use client";

import AuthLayout, {
  type AuthLayoutProps,
} from "@/components/templates/layout/Auth/layout";

export type { AuthLayoutProps };

export default function AuthShell(props: AuthLayoutProps) {
  return <AuthLayout {...props} />;
}
