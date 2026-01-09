"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { Theme } from "@clerk/types";
import { X } from "lucide-react";
import { useEffect } from "react";

const authAppearance: Theme = {
  layout: {
    socialButtonsPlacement: "bottom",
  },
  variables: {
    colorPrimary: "#7A7FEE",
    colorText: "#ffffff",
    colorBackground: "transparent",
    borderRadius: "12px",
  },
  elements: {
    card: "bg-[#0f1115]/80 border border-white/10 shadow-2xl backdrop-blur text-white",
    headerTitle: "text-white",
    headerSubtitle: "text-gray-300",
    formFieldLabel: "text-gray-200",
    formFieldInput:
      "bg-[#1b1d22] border border-white/10 text-white placeholder:text-gray-500 focus:border-[#7A7FEE]",
    formButtonPrimary:
      "bg-[#7A7FEE] text-white hover:bg-[#6B73E8] transition-colors shadow-md",
    socialButtonsBlockButton: "bg-[#1b1d22] border border-white/10 text-white hover:border-[#7A7FEE]",
    footerActionText: "text-gray-300",
    footerActionLink: "text-[#7A7FEE] hover:text-[#6B73E8]",
  },
};

type AuthModalProps = {
  open: boolean;
  mode: "signin" | "signup";
  onClose: () => void;
};

export function AuthModal({ open, mode, onClose }: AuthModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-2xl">
        <div className="card relative overflow-hidden p-6 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#161820] to-[#0b0c10] opacity-90"
            aria-hidden="true"
          />
          <button
            aria-label="Close auth modal"
            className="absolute top-3 right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-8 items-start">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[#7A7FEE]">
                {mode === "signin" ? "Welcome back" : "Join the lab"}
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                {mode === "signin" ? "Sign in to continue" : "Create your account"}
              </h1>
              <p className="text-sm text-gray-300 max-w-xl">
                {mode === "signin"
                  ? "Access your saved circuits, keep building where you left off, and stay synced across devices with the same polished look as the landing page."
                  : "Build, save, and share digital circuits with the same refined aesthetic as the landing page. Your workspace stays in sync everywhere."}
              </p>
            </div>

            <div className="relative">
              {mode === "signin" ? (
                <SignIn routing="hash" afterSignInUrl="/dashboard" appearance={authAppearance} />
              ) : (
                <SignUp routing="hash" afterSignUpUrl="/dashboard" appearance={authAppearance} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
