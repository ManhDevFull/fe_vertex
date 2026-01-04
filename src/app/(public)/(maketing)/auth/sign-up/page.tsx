"use client";
import { useState } from "react";
import { toast } from "sonner";
import FormAuth from "@/components/templates/AuthForm/FormAuth";
import FormOTP from "@/components/templates/AuthForm/FormOTP";
import AuthShell from "@/components/templates/AuthForm/AuthShell";
import BackNavigation from "@/components/ui/BackNavigation";
import handleAPI from "@/axios/handleAPI"; // NEW CODE: call backend OTP endpoints

// NEW CODE: typing for local register state
type RegisterState = {
  pageOTP: boolean;
  fullName: string;
  email: string;
  password: string;
  expiresAt: string | null;
};

export default function SignUpPage() {
  const initialRegisterState: RegisterState = {
    pageOTP: false,
    fullName: "",
    email: "",
    password: "",
    expiresAt: null,
  };
  const [state, setState] = useState<RegisterState>(initialRegisterState);

  const illo = state.pageOTP
    ? "https://res.cloudinary.com/do0im8hgv/image/upload/v1755839130/6736e108-8132-4433-9182-33a099b345b2.png"
    : "https://res.cloudinary.com/do0im8hgv/image/upload/v1755761340/370e0dbb-f34c-4ba7-8e5c-797f036749ee.png";

  return (
    <>
      <BackNavigation />
      <AuthShell
        title={state.pageOTP ? "Verify your account" : "Create an account"}
        subtitle={
          state.pageOTP
            ? "Check your email for the verification code"
            : "Sign up to start your journey"
        }
        illustrationSrc={illo}
      >
        {state.pageOTP && state.email ? (
          <FormOTP
            email={state.email}
            fullName={state.fullName}
            password={state.password}
            expiresAt={state.expiresAt}
            onBack={() =>
              setState((ps) => ({
                ...ps,
                pageOTP: false,
                expiresAt: null, // NEW CODE: reset expiry when user edits info
              }))
            }
            onResent={(expiresAt) =>
              setState((ps) => ({
                ...ps,
                expiresAt: expiresAt ?? null,
              }))
            }
            onComplete={() => setState(() => ({ ...initialRegisterState }))} // NEW CODE: reset state after successful registration
          />
        ) : (
          <FormAuth
            type="sign-up"
            fullName={state.fullName}
            email={state.email}
            password={state.password}
            onChange={(data) =>
              setState((ps) => ({
                ...ps,
                ...data,
              }))
            }
            handle={async (val) => {
              const email = (val.email ?? "").trim().toLowerCase();
              const fullName = (val.name ?? "").trim();
              const password = val.pass ?? "";
              if (!email || !fullName || !password) {
                toast.warning("Please enter complete information!");
                return;
              }
              try {
                const res : any= await handleAPI(
                  "Auth/register/send-otp",
                  {
                    Email: email,
                    Password: password,
                    FullName: fullName,
                  },
                  "post"
                );
                if (res?.status === 200) {
                  toast.success(
                    res?.message ??
                      "Verification code sent. Please check your email."
                  );
                  setState((ps) => ({
                    ...ps,
                    pageOTP: true,
                    email,
                    fullName,
                    password,
                    expiresAt: res?.data?.expiresAt ?? null,
                  }));
                } else {
                  toast.error(res?.message ?? "Failed to send verification code.");
                }
              } catch (error: any) {
                const message =
                  error?.message ??
                  error?.detail ??
                  error?.error ??
                  "Failed to send verification code.";
                toast.error(message);
              }
            }}
          />
        )}
      </AuthShell>
    </>
  );
}
