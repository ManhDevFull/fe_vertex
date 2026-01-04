"use client";

import AuthShell from "@/components/templates/AuthForm/AuthShell";
import FormAuth from "@/components/templates/AuthForm/FormAuth";
import BackNavigation from "@/components/ui/BackNavigation";
import { authSelector, type UserAuth } from "@/redux/reducers/authReducer";
import { getPostLoginRoute } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function LoginPage() {
  const auth: UserAuth = useSelector(authSelector);
  const router = useRouter();

  useEffect(() => {
    if (!auth?.token) return;
    router.replace(getPostLoginRoute(auth.role));
  }, [auth?.role, auth?.token, router]);

  return (
    <>
      <BackNavigation />
      <AuthShell
        title="Welcome Back"
        subtitle="Log in to your account"
        illustrationSrc="https://res.cloudinary.com/do0im8hgv/image/upload/v1755761340/370e0dbb-f34c-4ba7-8e5c-797f036749ee.png"
      >
        <FormAuth type="login" />
      </AuthShell>
    </>
  );
}
