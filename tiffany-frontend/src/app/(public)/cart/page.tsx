"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import { clearCart, fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { updateLocalCartItem } from "@/redux/features/main/store/slice/cart-slice";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { useAuthModal } from "@/context/auth-modal-context";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";
import { CartPageSkeleton } from "./components/cart-page-skeleton";
import { CartEmptyState } from "./components/cart-empty-state";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuthState();
  const {
    dispatch,
    items,
    totalItems,
    totalQuantity,
    subtotal,
    discountAmount,
    finalTotal,
    loading,
    loaded,
  } = useCartState();

  const { debouncedUpdate, immediateUpdate } = useCartDebounce(dispatch);
  const { openLoginModal } = useAuthModal();
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fetch all cart items on mount
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) return;
    if (!loaded && !loading.fetch) {
      dispatch(fetchCart());
    }
  }, [authReady, isAuthenticated, loaded, loading.fetch, dispatch]);

  const handleUpdateQuantity = useCallback(
    (productId: string, productSizeId: string | null, newQuantity: number) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: newQuantity, optimisticTimestamp: timestamp }));
      debouncedUpdate(key, productId, productSizeId, newQuantity, timestamp);
    },
    [dispatch, debouncedUpdate],
  );

  const handleRemoveItem = useCallback(
    (productId: string, productSizeId: string | null) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: 0, optimisticTimestamp: timestamp }));
      immediateUpdate(key, productId, productSizeId, 0, timestamp);
    },
    [dispatch, immediateUpdate],
  );

  const handleClearCart = async () => {
    await dispatch(clearCart()).unwrap();
    showToast.success("Cart cleared");
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (!mounted || !authReady) return <CartPageSkeleton />;
  if (loading.fetch && !loaded) return <CartPageSkeleton />;

  if (!isAuthenticated) {
    return (
      <>
        <CartEmptyState
          title="Your Cart"
          message="Please sign in to view your cart and start shopping."
          onLogin={openLoginModal}
          showLogin
        />
      </>
    );
  }

  if (items.length === 0 && loaded) {
    return (
      <CartEmptyState
        title="Your Cart is Empty"
        message="Add some items to get started!"
      />
    );
  }

  return (
    <>
      {/* pb-[6.5rem] covers: bottom-nav (4rem) + mobile checkout bar (~5rem) + breathing room.
          lg:pb-[1.3rem] resets once the sticky bar and bottom nav are both gone. */}
      <PageContainer className="py-[0.65rem] sm:py-[1.3rem] pb-[6.5rem] lg:pb-[1.3rem]">

        <PageHeader
          title="Shopping Cart"
          count={totalItems}
          countLabel={totalItems === 1 ? "item" : "items"}
          actions={
            items.length > 0 ? (
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={() => setClearCartModalOpen(true)}
                disabled={loading.clear}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-[11px] rounded-[0.4875rem]"
              >
                Clear All
              </CustomButton>
            ) : undefined
          }
        />

        <div className="grid lg:grid-cols-3 gap-[0.65rem] sm:gap-[0.975rem]">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-[0.4875rem]">
            {items.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                Showing {items.length} items with total quantity {totalQuantity}
              </div>
            )}
            {items.map((item, index) => {
              const uniqueKey = `cart-${item.id}-${index}`;
              return (
              <CartItemCard
                key={uniqueKey}
                id={item.id}
                productId={item.productId}
                productName={item.productName}
                productImageUrl={item.productImageUrl}
                productSizeId={item.productSizeId}
                sizeName={item.sizeName}
                quantity={item.quantity}
                displayPrice={item.displayPrice}
                displayOriginPrice={item.displayOriginPrice}
                displayPromotionType={item.displayPromotionType}
                displayPromotionValue={item.displayPromotionValue}
                hasActivePromotion={item.hasActivePromotion}
                onQuantityChange={(newQuantity) =>
                  handleUpdateQuantity(item.productId, item.productSizeId, newQuantity)
                }
                onRemove={() => handleRemoveItem(item.productId, item.productSizeId)}
                showLink={true}
                showControls={true}
              />
            );
            })}

          </div>

          {/* ── Order Summary (desktop) ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card border rounded-[0.65rem] p-[0.8125rem] sticky top-[3.9rem]">
              <h2 className="text-[13px] font-bold mb-[0.65rem] flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-[11px] font-normal text-muted-foreground bg-muted px-[0.325rem] py-[0.1625rem] rounded-[0.325rem]">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </h2>

              <div className="space-y-[0.4875rem] mb-[0.8125rem]">
                {/* Items count with quantity */}
                <div className="bg-muted/50 rounded-[0.325rem] p-[0.4875rem] mb-[0.65rem]">
                  <div className="text-[11px] text-muted-foreground mb-[0.325rem]">Items Breakdown</div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium">{totalItems} unique {totalItems === 1 ? 'product' : 'products'}</span>
                    <span className="text-[13px] font-bold text-foreground">{totalQuantity}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-[0.1625rem]">total quantity</div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] bg-red-50/30 p-[0.40625rem] rounded-[0.325rem] border border-red-200/50">
                    <span className="text-red-700 font-medium">Discount Applied</span>
                    <span className="font-bold text-red-600">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-[11px] pt-[0.325rem] border-t">
                  <span className="text-muted-foreground">Shipping & Fees</span>
                  <span className="text-muted-foreground text-[11px]">Calculated at checkout</span>
                </div>

                {/* Total */}
                <div className="bg-primary/10 rounded-[0.325rem] p-[0.4875rem] border border-primary/20">
                  <div className="flex justify-between items-center mb-[0.325rem]">
                    <span className="font-bold text-foreground">Total Amount</span>
                    <span className="text-[14px] font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-[11px] text-red-600 text-right pt-[0.325rem] border-t border-primary/10">
                      💰 You save <span className="font-bold">{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              <CustomButton className="w-full mb-[0.40625rem] gap-[0.325rem] h-[2.125rem] sm:h-[1.7875rem] rounded-[0.4875rem]" onClick={handleCheckout}>
                <CreditCard className="h-[0.65rem] w-[0.65rem]" />
                Proceed to Checkout
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Mobile sticky checkout bar — sits above the bottom nav (4rem) + safe area */}
      <div className="fixed bottom-nav-safe left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t px-[0.65rem] py-[0.4875rem]">
        <div className="flex items-center justify-between mb-[0.40625rem]">
          <div className="text-[11px]">
            <div className="text-muted-foreground font-medium">{totalItems} items • {totalQuantity} qty</div>
            {discountAmount > 0 && (
              <div className="text-red-600 font-semibold mt-[0.08125rem]">
                Save {formatCurrency(discountAmount)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">Total</div>
            <div className="text-[13px] font-bold text-primary">{formatCurrency(finalTotal)}</div>
          </div>
        </div>
        <CustomButton className="w-full gap-[0.325rem] h-[2.125rem] sm:h-[1.7875rem] rounded-[0.4875rem]" onClick={handleCheckout}>
          <CreditCard className="h-[0.65rem] w-[0.65rem]" />
          Proceed to Checkout
          <ArrowRight className="h-[0.65rem] w-[0.65rem] ml-auto" />
        </CustomButton>
      </div>

      <DeleteConfirmationModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        onDelete={handleClearCart}
        title="Clear Cart"
        description="Are you sure you want to remove all items from your cart?"
        variant="critical"
      />
    </>
  );
}
