"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  LayoutGrid,
  ShoppingCart,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useAuthModal } from "@/context/auth-modal-context";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Shop", href: "/products", icon: ShoppingBag },
  { name: "Categories", href: "/categories", icon: LayoutGrid },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Profile", href: "/profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems: cartCount } = useCartState();
  const { isAuthenticated } = useAuthState();
  const { openLoginModal } = useAuthModal();

  const handleProtectedTab = (href: string) => {
    if ((href === "/cart" || href === "/profile") && !isAuthenticated) {
      openLoginModal();
      return;
    }
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Nav height = 3.5rem (56px) — iOS standard tab bar height */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-lg border-t border-border/60 shadow-[0_-1px_12px_0_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch h-[3.5rem]">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            const Icon = tab.icon;
            const isCart = tab.href === "/cart";
            const needsAuth = tab.href === "/cart" || tab.href === "/profile";

            return (
              <button
                key={tab.name}
                type="button"
                onClick={() =>
                  needsAuth
                    ? handleProtectedTab(tab.href)
                    : router.push(tab.href)
                }
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-[0.25rem] py-[0.5rem] transition-colors duration-150 active:opacity-60",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-[1.375rem] w-[1.375rem] transition-transform duration-150",
                      active && "scale-110"
                    )}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  {isCart && cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-[0.325rem] -right-[0.4rem] h-[0.75rem] min-w-[18px] px-[0.1rem] flex items-center justify-center text-[10px] leading-none"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium leading-none",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.name}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5rem] h-[0.125rem] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        {/*
         * Safe-area spacer — automatically 0px on phones without home indicator,
         * ~34px on iPhone X/11/12/13/14/15 (with home indicator).
         * env(safe-area-inset-bottom) requires viewport-fit=cover in the meta tag
         * (already set in app/layout.tsx via Next.js viewport export).
         */}
        <div className="h-safe-bottom bg-background" />
      </nav>

    </>
  );
}
