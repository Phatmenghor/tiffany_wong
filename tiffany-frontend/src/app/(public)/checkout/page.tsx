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
import { resetCart } from "@/redux/features/main/store/slice/cart-slice";
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
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const [successModalState, setSuccessModalState] = useState({
    isOpen: false,
    orderNumber: "",
    totalAmount: undefined as number | undefined,
    discountAmount: undefined as number | undefined,
    itemCount: undefined as number | undefined,
    paymentMethod: undefined as string | undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch cart to restore state after page refresh
  useEffect(() => {
    if (!mounted || !authReady || !isAuthenticated) return;
    dispatch(fetchCart());
  }, [mounted, authReady, isAuthenticated, dispatch]);

  // Redirect if not authenticated or cart empty (but wait for cart to load)
  useEffect(() => {
    if (!mounted || !authReady) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    // Only redirect if cart has been loaded from API and is empty, and no success modal is showing
    if (cartLoaded && items.length === 0 && !successModalState.isOpen) {
      router.push("/cart");
      return;
    }
  }, [mounted, authReady, isAuthenticated, items.length, cartLoaded, router]);

  const handleCheckout = async () => {
    const newErrors = {
      name: customerName.trim() ? "" : "Full name is required",
      phone: customerPhone.trim() ? "" : "Phone number is required",
    };
    setErrors(newErrors);
    if (newErrors.name || newErrors.phone) return;

    setIsProcessing(true);
    try {
      const payload = {
        ...(selectedAddress?.id ? { addressId: selectedAddress.id } : {}),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerNote: customerNote || "",
        orderStatus: "PENDING",
        PaymentBy: paymentMethod,
      };

      // Capture cart count before clearing — API response items may be empty
      // due to Hibernate first-level cache not reflecting separately-saved OrderItems
      const cartItemCount = items.length;

      const result = await dispatch(createOrderService(payload as any) as any).unwrap();

      // Clear cart in Redux state immediately
      dispatch(resetCart());

      // Show success modal with order details
      setSuccessModalState({
        isOpen: true,
        orderNumber: result?.orderNumber || "",
        totalAmount: result?.totalAmount,
        discountAmount: result?.discountAmount,
        itemCount: cartItemCount,
        paymentMethod: result?.paymentMethod,
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      setErrors((e) => ({ ...e, phone: error?.message || "Failed to create order" }));
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSuccessModal = () =>
    setSuccessModalState({ isOpen: false, orderNumber: "", totalAmount: undefined, discountAmount: undefined, itemCount: undefined, paymentMethod: undefined });

  const handleSuccessModalClose = () => {
    resetSuccessModal();
    router.push("/orders");
  };

  const handleBackToHome = () => {
    resetSuccessModal();
    router.push("/");
  };

  const handleAddLocation = () => {
    router.push("/location");
  };

  if (!mounted || !authReady) {
    return <PageContainer><CheckoutPageSkeleton /></PageContainer>;
  }

  return (
    <>
      <PageContainer className="py-[0.65rem] sm:py-[1.3rem] pb-[6.5rem] lg:pb-[1.3rem]">
        <PageHeader
          title="Checkout"
          icon={CreditCard}
          count={totalItems}
          subtitle={`${totalItems} ${totalItems === 1 ? "item" : "items"} • ${totalQuantity} total quantity`}
        />

        <div className="grid lg:grid-cols-3 gap-[0.65rem] sm:gap-[0.975rem] mt-[0.975rem]">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-[0.4875rem]">
            {/* Delivery Address - Top */}
            <DeliveryAddressSection
              selectedAddress={selectedAddress}
              onChangeSelected={setSelectedAddress}
              onAddLocation={handleAddLocation}
            />

            {/* Customer Information */}
            <div className="bg-card border rounded-[0.65rem] p-[0.8125rem]">
              <h3 className="text-[12px] font-bold mb-[0.65rem]">Customer Information</h3>
              {/* grid-cols-1 on mobile prevents two-column overflow at small/zoomed screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.65rem]">
                <div className="space-y-[0.24375rem]">
                  <label className="text-[11px] font-medium">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => { setCustomerName(e.target.value); setErrors((v) => ({ ...v, name: "" })); }}
                    className={`w-full px-[0.4875rem] py-[0.325rem] border rounded-[0.325rem] text-[11px] focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? "border-red-500 focus:ring-red-300" : ""}`}
                    disabled={isProcessing}
                  />
                  {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-[0.24375rem]">
                  <label className="text-[11px] font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={customerPhone}
                    onChange={(e) => { setCustomerPhone(e.target.value); setErrors((v) => ({ ...v, phone: "" })); }}
                    className={`w-full px-[0.4875rem] py-[0.325rem] border rounded-[0.325rem] text-[11px] focus:outline-none focus:ring-2 focus:ring-primary ${errors.phone ? "border-red-500 focus:ring-red-300" : ""}`}
                    disabled={isProcessing}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Cart Items */}
            {items.length > 0 && (
              <>
                <div className="text-[11px] text-muted-foreground mt-[0.975rem] mb-[0.325rem]">
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
        onViewOrders={handleSuccessModalClose}
        onBackToHome={handleBackToHome}
        orderNumber={successModalState.orderNumber}
        totalAmount={successModalState.totalAmount}
        discountAmount={successModalState.discountAmount}
        itemCount={successModalState.itemCount}
        paymentMethod={successModalState.paymentMethod}
      />
    </>
  );
}
