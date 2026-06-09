// src/app/(auth)/layout.tsx
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Authentication",
  description: "Sign in to your account",
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      {/* min-h-screen instead of h-screen: allows the page to grow when the
          mobile soft keyboard opens, preventing content from being clipped. */}
      <main className="min-h-screen w-full">{children}</main>
    </div>
  );
}
