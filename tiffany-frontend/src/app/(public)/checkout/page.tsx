"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, MessageSquare, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useLocationState } from "@/redux/features/location/store/state/location-state";
import { useAppDispatch } from "@/redux/store";
import { createOrderService } from "@/redux/features/main/store/thunks/order-thunks";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, authReady } = useAuthState();
  const { items, totalItems, totalQuantity, subtotal, discountAmount, finalTotal } = useCartState();
  const { locations } = useLocationState();

  const [mounted, setMounted] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !authReady) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
    // Set first address as default
    if (locations && locations.length > 0 && !selectedAddressId) {
      const defaultAddr = locations.find((loc: any) => loc.isDefault) || locations[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [mounted, authReady, isAuthenticated, items.length, locations, selectedAddressId, router]);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      showToast.error("Please select a delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        customerNote: customerNote || "",
        orderStatus: "PENDING",
      };

      await dispatch(createOrderService(payload) as any).unwrap();
      showToast.success("Order created successfully!");
      router.push("/orders");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted || !authReady) {
    return null;
  }

  const selectedAddress = locations?.find((loc: any) => loc.id === selectedAddressId);

  return (
    <>
      <PageContainer className="py-4 sm:py-8 pb-40 sm:pb-8">
        <PageHeader
          title="Checkout"
          icon={CreditCard}
          count={totalItems}
          subtitle={`${totalItems} ${totalItems === 1 ? "item" : "items"} • ${totalQuantity} total quantity`}
        />

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs text-muted-foreground mb-4">
              Review your items before placing order
            </div>
            {items.map((item, index) => {
              const uniqueKey = `checkout-${item.id}-${index}`;
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
                  onQuantityChange={() => {}}
                  onRemove={() => {}}
                  showLink={true}
                  showControls={false}
                />
              );
            })}

            {/* Delivery Address */}
            <div className="bg-card border rounded-2xl p-4 sm:p-5 mt-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>
              <select
                value={selectedAddressId || ""}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full border rounded-xl p-3 bg-background text-foreground mb-4 text-sm"
              >
                <option value="">Select an address</option>
                {locations?.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.fullAddress || `${loc.streetNumber}, ${loc.village}, ${loc.commune}`}
                  </option>
                ))}
              </select>
              {selectedAddress && (
                <div className="text-sm text-muted-foreground space-y-1 bg-muted/50 rounded-lg p-3">
                  <p>{(selectedAddress as any).fullAddress}</p>
                  {(selectedAddress as any).note && <p>Note: {(selectedAddress as any).note}</p>}
                </div>
              )}
            </div>

            {/* Customer Note */}
            <div className="bg-card border rounded-2xl p-4 sm:p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Order Note (Optional)
              </h2>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Add any special instructions or notes for your order..."
                className="w-full border rounded-xl p-3 bg-background text-foreground text-sm resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card border rounded-2xl p-5 sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </h2>

              <div className="space-y-3 mb-5">
                {/* Items count with quantity */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-muted-foreground mb-2">Items Breakdown</div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {totalItems} unique {totalItems === 1 ? "product" : "products"}
                    </span>
                    <span className="text-lg font-bold text-foreground">{totalQuantity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">total quantity</div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm bg-red-50/30 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200/50 dark:border-red-800/30">
                    <span className="text-red-700 dark:text-red-400 font-medium">Discount Applied</span>
                    <span className="font-bold text-red-600 dark:text-red-500">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Shipping & Fees</span>
                  <span className="text-muted-foreground text-xs">Free</span>
                </div>

                {/* Total */}
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400 text-right pt-2 border-t border-primary/10">
                      💰 You save <span className="font-bold">{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              <CustomButton
                className="w-full mb-2.5 gap-2 h-11 rounded-xl"
                onClick={handleCheckout}
                disabled={isProcessing || !selectedAddressId}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Place Order
                  </>
                )}
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs">
            <div className="text-muted-foreground font-medium">
              {totalItems} items • {totalQuantity} qty
            </div>
            {discountAmount > 0 && (
              <div className="text-red-600 dark:text-red-400 font-semibold mt-0.5">
                Save {formatCurrency(discountAmount)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-xl font-bold text-primary">{formatCurrency(finalTotal)}</div>
          </div>
        </div>
        <CustomButton
          className="w-full gap-2 h-11 rounded-xl"
          onClick={handleCheckout}
          disabled={isProcessing || !selectedAddressId}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Place Order
              <ArrowRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </CustomButton>
      </div>
    </>
  );
}
