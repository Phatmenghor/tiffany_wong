"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAppDispatch } from '@/redux/store/hooks';
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import { createOrderService } from "@/redux/features/main/store/thunks/order-thunks";
import { fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { fetchAllLocationsService } from "@/redux/features/location/store/thunks/location-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";
import { OrderSuccessModal } from "@/components/shared/modal/order-success-modal";
import { DeliveryAddressSection } from "./components/delivery-address-section";
import { OrderNoteSection } from "./components/order-note-section";
import { OrderSummary } from "./components/order-summary";
import { MobileCheckoutBar } from "./components/mobile-checkout-bar";

import { CheckoutPageSkeleton } from "./components/checkout-page-skeleton";
export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, authReady } = useAuthState();
  const { items, totalItems, totalQuantity, subtotal, discountAmount, finalTotal, loaded: cartLoaded } = useCartState();

  const [mounted, setMounted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<LocationResponseModel | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK">("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModalState, setSuccessModalState] = useState({
    isOpen: false,
    orderNumber: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch cart to restore state after page refresh
  useEffect(() => {
    if (!mounted || !authReady || !isAuthenticated) return;
    dispatch(fetchCart());
  }, [mounted, authReady, isAuthenticated, dispatch]);

  // Fetch and auto-select default address on mount
  useEffect(() => {
    if (!mounted || !authReady || !isAuthenticated) return;

    const autoSelectDefaultAddress = async () => {
      try {
        const result = await dispatch(
          fetchAllLocationsService({
            pageNo: 1,
            pageSize: 15,
          })
        ).unwrap();

        if (result?.content && result.content.length > 0) {
          // Find default address
          const defaultAddr = result.content.find(
            (addr: any) => addr.isDefault === true
          );
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          } else {
            // Fallback to first address if no default
            setSelectedAddress(result.content[0]);
          }
        }
      } catch (error) {
        console.error("Failed to auto-select default address:", error);
      }
    };

    autoSelectDefaultAddress();
  }, [mounted, authReady, isAuthenticated, dispatch]);

  // Redirect if not authenticated or cart empty (but wait for cart to load)
  useEffect(() => {
    if (!mounted || !authReady) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    // Only redirect if cart has been loaded from API and is empty
    if (cartLoaded && items.length === 0) {
      router.push("/cart");
      return;
    }
  }, [mounted, authReady, isAuthenticated, items.length, cartLoaded, router]);

  const handleCheckout = async () => {
    if (!selectedAddress?.id) {
      showToast.error("Please select a delivery address");
      return;
    }

    if (!customerName.trim()) {
      showToast.error("Please enter your name");
      return;
    }

    if (!customerPhone.trim()) {
      showToast.error("Please enter your phone number");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        addressId: selectedAddress.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerNote: customerNote || "",
        orderStatus: "PENDING",
        PaymentBy: paymentMethod,
      };

      const result = await dispatch(createOrderService(payload as any) as any).unwrap();

      // Show success modal with order number
      setSuccessModalState({
        isOpen: true,
        orderNumber: result?.orderNumber || "",
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      showToast.error(error?.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, orderNumber: "" });
    router.push("/orders");
  };

  const handleAddLocation = () => {
    router.push("/location");
  };

  if (!mounted || !authReady) {
    return <PageContainer><CheckoutPageSkeleton /></PageContainer>;
  }

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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-3">
            {/* Delivery Address - Top */}
            <DeliveryAddressSection
              selectedAddress={selectedAddress}
              onChangeSelected={setSelectedAddress}
              onAddLocation={handleAddLocation}
            />

            {/* Customer Information */}
            <div className="bg-card border rounded-2xl p-5">
              <h3 className="text-base font-bold mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items */}
            {items.length > 0 && (
              <>
                <div className="text-xs text-muted-foreground mt-6 mb-2">
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
              </>
            )}

            {/* Customer Note */}
            <OrderNoteSection
              customerNote={customerNote}
              onNoteChange={setCustomerNote}
            />

          </div>

          {/* Order Summary */}
          <OrderSummary
            totalItems={totalItems}
            totalQuantity={totalQuantity}
            subtotal={subtotal}
            discountAmount={discountAmount}
            finalTotal={finalTotal}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onCheckout={handleCheckout}
            isProcessing={isProcessing}
            selectedAddressId={selectedAddress?.id}
            customerName={customerName}
            customerPhone={customerPhone}
          />
        </div>
      </PageContainer>

      {/* Mobile sticky checkout bar */}
      <MobileCheckoutBar
        totalItems={totalItems}
        totalQuantity={totalQuantity}
        discountAmount={discountAmount}
        finalTotal={finalTotal}
        onCheckout={handleCheckout}
        isProcessing={isProcessing}
        selectedAddressId={selectedAddress?.id}
      />

      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={successModalState.isOpen}
        onClose={handleSuccessModalClose}
        orderNumber={successModalState.orderNumber}
      />
    </>
  );
}
