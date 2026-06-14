"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, Loader2, ShoppingCart, X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import {
  addToCart,
  updateCartItem,
  fetchCart,
} from "@/redux/features/main/store/thunks/cart-thunks";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/redux/features/main/store/slice/cart-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { fetchPublicProductById } from "@/redux/features/main/store/thunks/public-product-thunks";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { getSizeQuantity } from "@/utils/common/quantity-utils";

interface SizeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetailResponseModel | null;
  onSuccess?: () => void;
}

export function SizeSelectionModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: SizeSelectionModalProps) {
  const { dispatch, items: cartItems } = useCartState();
  const { dispatch: productDispatch } = usePublicProductState();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [fullProduct, setFullProduct] =
    useState<ProductDetailResponseModel | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const isSaving = false;
  const [clearingSize, setClearingSize] = useState<string | null>(null);

  // Local pending quantities: key = sizeId (or "no_size"), value = quantity
  const [pendingQuantities, setPendingQuantities] = useState<
    Map<string, number>
  >(new Map());

  // Track which sizes have been modified
  const [modifiedSizes, setModifiedSizes] = useState<Set<string>>(new Set());

  // The product to display
  const displayProduct = fullProduct || product;

  // Get quantity for a specific size - standardized naming
  // Returns: quantity from Redux cart if available, otherwise from API quantityInCart
  const getQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!displayProduct) return 0;
      const cartItem = cartItems.find(
        (item) =>
          item.productId === displayProduct.id &&
          item.productSizeId === sizeId,
      );
      // Use Redux cart state if available (this is the authoritative source during session)
      if (cartItem) return cartItem.quantity;

      // Fallback to API response quantityInCart
      if (sizeId) {
        const size = displayProduct.sizes?.find((s) => s.id === sizeId);
        return getSizeQuantity(size);
      }
      // For unsized products, use quantityInCart from product
      return displayProduct.quantityInCart || 0;
    },
    [cartItems, displayProduct],
  );

  // Get display quantity - shows pending edits if any, otherwise actual quantity
  // Standard naming: displayQuantity = UI quantity (includes pending edits)
  const getDisplayQuantity = useCallback(
    (sizeId: string | null) => {
      const key = sizeId || "no_size";
      // If user made unsaved edits, show those (pendingQuantity)
      if (pendingQuantities.has(key)) {
        return pendingQuantities.get(key)!;
      }
      // Otherwise show actual quantity from cart/API
      return getQuantityForSize(sizeId);
    },
    [pendingQuantities, getQuantityForSize],
  );

  // Check if there are any unsaved changes
  const hasUnsavedChanges = modifiedSizes.size > 0;

  // Current quantity for selected size
  const currentQuantity = selectedSize
    ? getDisplayQuantity(selectedSize.id)
    : displayProduct
      ? getDisplayQuantity(null)
      : 0;

  // Initialize when modal opens
  useEffect(() => {
    if (open && product) {
      const needsFetch =
        product.hasSizes && (!product.sizes || product.sizes.length === 0);

      if (needsFetch) {
        setIsLoadingDetail(true);
        setFullProduct(null);
        setSelectedSize(null);

        productDispatch(fetchPublicProductById(product.id))
          .unwrap()
          .then((detail: ProductDetailResponseModel) => {
            setFullProduct(detail);
            if (detail.sizes && detail.sizes.length > 0) {
              setSelectedSize(detail.sizes[0]);
            }
          })
          .catch(() => {
            showToast.error("Failed to load product details");
          })
          .finally(() => {
            setIsLoadingDetail(false);
          });
      } else {
        setFullProduct(null);
        if (product.sizes && product.sizes.length > 0) {
          setSelectedSize(product.sizes[0]);
        } else {
          setSelectedSize(null);
        }
      }
    }

    if (!open) {
      setFullProduct(null);
      setSelectedSize(null);
      setIsLoadingDetail(false);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
    }
  }, [open, product, productDispatch]);

  // Handle local quantity change (no API call)
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (!displayProduct) return;

      const sizeId = selectedSize?.id || null;
      const key = sizeId || "no_size";
      const currentQuantity = getQuantityForSize(sizeId);

      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.set(key, newQuantity);
        return next;
      });

      // Track if this is actually different from cart
      setModifiedSizes((prev) => {
        const next = new Set(prev);
        if (newQuantity === currentQuantity) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [displayProduct, selectedSize, getQuantityForSize],
  );

  // Clear a specific size from cart - calls API immediately
  const handleClearSize = useCallback(
    async (sizeId: string | null) => {
      if (!displayProduct) return;

      const key = sizeId || "no_size";
      const currentQty = getQuantityForSize(sizeId);

      // If already 0 in cart and just pending, just reset the pending state
      if (currentQty === 0) {
        setPendingQuantities((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        setModifiedSizes((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        return;
      }

      // Optimistic local update with timestamp
      const ts = Date.now();
      dispatch(
        updateLocalCartItem({
          productId: displayProduct.id,
          productSizeId: sizeId,
          quantity: 0,
          optimisticTimestamp: ts,
        }),
      );

      // Clear any pending state for this size since we're syncing directly
      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
      setModifiedSizes((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      // Call API immediately
      setClearingSize(key);
      try {
        await dispatch(
          updateCartItem({
            productId: displayProduct.id,
            productSizeId: sizeId,
            quantity: 0,
            optimisticTimestamp: ts,
          }),
        ).unwrap();
        showToast.success("Removed from cart");
      } catch (error: any) {
        showToast.error(error?.message || "Failed to remove from cart");
      } finally {
        setClearingSize(null);
      }
    },
    [displayProduct, dispatch, getQuantityForSize],
  );

  // Discard all pending changes
  const handleDiscard = useCallback(() => {
    setPendingQuantities(new Map());
    setModifiedSizes(new Set());
    onOpenChange(false);
  }, [onOpenChange]);

  // Save all pending changes — update local immediately, fire API in background
  const handleAddToCart = useCallback(() => {
    if (!displayProduct || modifiedSizes.size === 0) return;

    const ts = Date.now();

    for (const key of modifiedSizes) {
      const sizeId = key === "no_size" ? null : key;
      const newQty = pendingQuantities.get(key) ?? getQuantityForSize(sizeId);
      const currentQuantity = getQuantityForSize(sizeId);

      if (newQty === currentQuantity) continue;

      if (currentQuantity === 0 && newQty > 0) {
        const size = displayProduct.sizes?.find((s) => s.id === sizeId);
        const itemFinalPrice = size?.finalPrice || displayProduct.displayPrice || 0;
        const itemCurrentPrice = size?.hasPromotion
          ? size.price
          : displayProduct.displayOriginPrice || itemFinalPrice;

        dispatch(
          addLocalCartItem({
            productId: displayProduct.id,
            productSizeId: sizeId,
            quantity: newQty,
            productName: displayProduct.name,
            productImageUrl: displayProduct.mainImageUrl,
            sizeName: size?.name || null,
            finalPrice: itemFinalPrice,
            currentPrice: itemCurrentPrice,
            hasPromotion: size ? size.hasPromotion : displayProduct.hasActivePromotion,
            promotionType: size?.promotionType ?? displayProduct.displayPromotionType ?? null,
            promotionValue: size?.promotionValue ?? displayProduct.displayPromotionValue ?? null,
            promotionFromDate: size?.promotionFromDate ?? displayProduct.displayPromotionFromDate ?? null,
            promotionToDate: size?.promotionToDate ?? displayProduct.displayPromotionToDate ?? null,
            optimisticTimestamp: ts,
          }),
        );
      } else {
        dispatch(
          updateLocalCartItem({
            productId: displayProduct.id,
            productSizeId: sizeId,
            quantity: newQty,
            optimisticTimestamp: ts,
          }),
        );
      }
    }

    // Close immediately after local update
    setPendingQuantities(new Map());
    setModifiedSizes(new Set());
    onOpenChange(false);
    onSuccess?.();

    // Fire API calls sequentially to avoid race conditions (each call builds on previous server state)
    // then fetch once at the end to get authoritative server state
    const syncCart = async () => {
      try {
        for (const key of modifiedSizes) {
          const sizeId = key === "no_size" ? null : key;
          const newQty = pendingQuantities.get(key) ?? getQuantityForSize(sizeId);
          const currentQty = getQuantityForSize(sizeId);
          if (newQty === currentQty) continue;

          // Use ts-1 so local items (stamped ts) stay "newer" during conflict resolution
          if (newQty > 0) {
            await dispatch(addToCart({ productId: displayProduct.id, productSizeId: sizeId, quantity: newQty, optimisticTimestamp: ts - 1 })).unwrap();
          } else {
            await dispatch(updateCartItem({ productId: displayProduct.id, productSizeId: sizeId, quantity: 0, optimisticTimestamp: ts - 1 })).unwrap();
          }
        }
        // Fetch authoritative cart state after all updates are done
        dispatch(fetchCart());
      } catch {
        showToast.error("Failed to sync cart. Please try again.");
        dispatch(fetchCart());
      }
    };
    syncCart();
  }, [
    displayProduct,
    modifiedSizes,
    pendingQuantities,
    dispatch,
    getQuantityForSize,
    onOpenChange,
    onSuccess,
  ]);

  if (!product) return null;

  const displayPrice =
    selectedSize?.finalPrice || displayProduct?.displayPrice || 0;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : displayProduct?.hasActivePromotion
      ? displayProduct?.displayOriginPrice
      : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : displayProduct?.hasActivePromotion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-[0.65rem] pb-0">
          <DialogTitle className="text-[13px] font-bold">Choose Size</DialogTitle>
        </DialogHeader>

        <div className="p-[0.65rem] pt-[0.325rem]">
          {/* Loading State */}
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-[1.95rem]">
              <Loader2 className="h-[1.3rem] w-[1.3rem] animate-spin text-primary mb-[0.4875rem]" />
              <p className="text-[11px] text-muted-foreground">
                Loading product details...
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex gap-[0.65rem] mb-[0.65rem]">
                <div className="relative w-[3.25rem] h-[3.25rem] rounded-[0.325rem] overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={displayProduct?.mainImageUrl || appImages.NoImage}
                    alt={displayProduct?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[11px] line-clamp-2 mb-[0.1625rem]">
                    {displayProduct?.name}
                  </h3>
                  <div className="flex items-center gap-[0.325rem]">
                    <span className="text-[13px] font-bold text-primary">
                      {formatCurrency(displayPrice)}
                    </span>
                    {hasDiscount && originalPrice && (
                      <span className="text-[11px] text-muted-foreground line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <Badge variant="destructive" className="text-[11px] mt-[0.1625rem]">
                      {selectedSize?.hasPromotion
                        ? `-${Math.round(
                            ((selectedSize.price - selectedSize.finalPrice) /
                              selectedSize.price) *
                              100,
                          )}%`
                        : displayProduct?.displayPromotionType === "PERCENTAGE"
                          ? `${displayProduct?.displayPromotionValue}%`
                          : `-${formatCurrency(
                              displayProduct?.displayPromotionValue || 0,
                            )}`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {displayProduct?.hasSizes &&
                displayProduct?.sizes &&
                displayProduct.sizes.length > 0 && (
                  <div className="mb-[0.65rem]">
                    <h4 className="font-semibold mb-[0.325rem] text-[11px]">Choose Size</h4>
                    <div className="flex flex-wrap gap-[0.325rem]">
                      {displayProduct.sizes.map((size) => {
                        const sizeDisplayQty = getDisplayQuantity(size.id);
                        const sizeCartQty = getQuantityForSize(size.id);
                        const isModified =
                          modifiedSizes.has(size.id) &&
                          sizeDisplayQty !== sizeCartQty;
                        return (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "relative border-2 rounded-[0.325rem] px-[0.4875rem] py-[0.325rem] transition-all cursor-pointer hover:border-primary",
                              selectedSize?.id === size.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border",
                              isModified && "ring-2 ring-amber-400/50",
                            )}
                          >
                            <div className="font-semibold text-[11px] text-left">
                              {size.name}
                            </div>
                            <div className="flex items-center gap-[0.24375rem]">
                              <span className="text-primary font-bold text-[11px]">{formatCurrency(size.finalPrice)}</span>
                              {size.hasPromotion && (
                                <span className="text-[10px] text-muted-foreground line-through">{formatCurrency(size.price)}</span>
                              )}
                            </div>
                            {selectedSize?.id === size.id && (
                              <div className="absolute -top-[0.24375rem] -right-[0.24375rem] bg-primary text-primary-foreground rounded-full p-[0.08125rem]">
                                <Check className="h-[0.40625rem] w-[0.40625rem]" />
                              </div>
                            )}
                            {/* Show quantity badge */}
                            {sizeDisplayQty > 0 && (
                              <div
                                className={cn(
                                  "absolute -top-[0.24375rem] -left-[0.24375rem] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold",
                                  isModified ? "bg-amber-500" : "bg-green-500",
                                )}
                              >
                                {sizeDisplayQty}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Quantity Selector + Clear button */}
              <div className="mb-[0.65rem]">
                <h4 className="font-semibold mb-[0.325rem] text-[11px]">Quantity</h4>
                <div className="flex items-center gap-[0.325rem]">
                  <QuantitySelector
                    value={currentQuantity}
                    onChange={handleQuantityChange}
                    min={0}
                    size="sm"
                  />
                  {/* Clear button for selected size - calls API immediately */}
                  {(currentQuantity > 0 || getQuantityForSize(selectedSize?.id || null) > 0) && (
                    <CustomButton
                      variant="outline"
                      size="sm"
                      className="h-[1.3rem] px-[0.325rem] text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                      disabled={clearingSize === (selectedSize?.id || "no_size")}
                      onClick={() =>
                        handleClearSize(selectedSize?.id || null)
                      }
                    >
                      {clearingSize === (selectedSize?.id || "no_size") ? (
                        <Loader2 className="h-[0.56875rem] w-[0.56875rem] mr-[0.1625rem] animate-spin" />
                      ) : (
                        <Trash2 className="h-[0.56875rem] w-[0.56875rem] mr-[0.1625rem]" />
                      )}
                      Clear
                    </CustomButton>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-[0.4875rem] border-t mb-[0.65rem]">
                <span className="text-muted-foreground">Total</span>
                <span className="text-[13px] font-bold text-primary">
                  {formatCurrency(displayPrice * currentQuantity)}
                </span>
              </div>

              {/* Action buttons: Discard & Add to Cart */}
              <div className="flex gap-[0.4875rem]">
                <CustomButton
                  variant="outline"
                  className="flex-1"
                  onClick={handleDiscard}
                  disabled={isSaving}
                >
                  <X className="h-[0.65rem] w-[0.65rem] mr-[0.24375rem]" />
                  Discard
                </CustomButton>
                <CustomButton
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!hasUnsavedChanges}
                >
                  <ShoppingCart className="h-[0.65rem] w-[0.65rem] mr-[0.24375rem]" />
                  Add to Cart
                </CustomButton>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
