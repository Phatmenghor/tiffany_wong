"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, MessageSquare, Loader2 } from "lucide-react";
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

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, authReady } = useAuthState();
  const { items, finalTotal, subtotal, discountAmount } = useCartState();
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
      const defaultAddr = locations.find((loc) => loc.isDefault) || locations[0];
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

      await dispatch(createOrderService(payload)).unwrap();
      showToast.success("Order created successfully!");
      router.push("/orders");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted || !authReady) {
    return <div className="min-h-screen" />;
  }

  const selectedAddress = locations?.find((loc) => loc.id === selectedAddressId);

  return (
    <PageContainer className="py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </CustomButton>
        </div>

        <PageHeader title="Checkout" />

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-4">Order Items</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.productSizeId}`}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sizeName} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(item.displayPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>
              <select
                value={selectedAddressId || ""}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full border rounded-lg p-3 bg-background text-foreground mb-4"
              >
                <option value="">Select an address</option>
                {locations?.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.fullAddress || `${loc.streetNumber}, ${loc.village}, ${loc.commune}`}
                  </option>
                ))}
              </select>
              {selectedAddress && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{selectedAddress.fullAddress}</p>
                  {selectedAddress.note && <p>Note: {selectedAddress.note}</p>}
                </div>
              )}
            </div>

            {/* Customer Note */}
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Order Note (Optional)
              </h2>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Add any special instructions or notes for your order..."
                className="w-full border rounded-lg p-3 bg-background text-foreground text-sm"
                rows={4}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-4 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm bg-red-50/50 dark:bg-red-950/20 p-2 rounded">
                    <span className="text-red-700 dark:text-red-400">Discount</span>
                    <span className="font-semibold text-red-600 dark:text-red-500">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-xs text-muted-foreground">Free</span>
                </div>

                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <CustomButton
                onClick={handleCheckout}
                disabled={isProcessing || !selectedAddressId}
                className="w-full h-11 gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
