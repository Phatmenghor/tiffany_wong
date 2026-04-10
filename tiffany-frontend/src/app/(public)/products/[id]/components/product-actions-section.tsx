"use client";

import { Loader2, Heart, Share2, Eye, Trash2, Check } from "lucide-react";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductSize } from "@/redux/features/business/store/models/response/product-response";

interface ProductActionsSectionProps {
  hasSizes: boolean;
  sizes?: ProductSize[];
  selectedSize: ProductSize | null;
  onSelectSize: (size: ProductSize) => void;
  displayQuantity: (sizeId: string | null) => number;
  cartQuantity: (sizeId: string | null) => number;
  modifiedSizes: Set<string>;
  onQtyChange: (sizeId: string | null, qty: number) => void;
  onClearSize: (sizeId: string | null) => void;
  onSave: () => void;
  isSaving: boolean;
  clearingSize: string | null;
  totalCartQtyAllSizes: number;
  totalCartValueAllSizes: number;
  totalDisplayValueAllSizes: number;
  totalOrigValueAllSizes: number;
  hasAnyPromotion: boolean;
  displayPrice: number;
  productStatus: string;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  isTogglingFavorite: boolean;
  viewCount: number;
  favoriteCount: number;
  productId: string;
}

export function ProductActionsSection({
  hasSizes,
  sizes,
  selectedSize,
  onSelectSize,
  displayQuantity,
  cartQuantity,
  modifiedSizes,
  onQtyChange,
  onClearSize,
  onSave,
  isSaving,
  clearingSize,
  totalCartQtyAllSizes,
  totalCartValueAllSizes,
  totalDisplayValueAllSizes,
  totalOrigValueAllSizes,
  hasAnyPromotion,
  displayPrice,
  productStatus,
  isFavorited,
  onToggleFavorite,
  onShare,
  isTogglingFavorite,
  viewCount,
  favoriteCount,
  productId,
}: ProductActionsSectionProps) {
  const sizeId: string | null = hasSizes ? (selectedSize?.id ?? null) : null;
  const displayQty = displayQuantity(sizeId);
  const cartQty = cartQuantity(sizeId);
  const unitPrice = hasSizes ? selectedSize?.finalPrice ?? displayPrice : displayPrice;
  const clearKey = sizeId || "no_size";
  const showQtySection = !hasSizes || !!selectedSize;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Cart section — unified style for sized and non-sized ── */}
      <div className="space-y-3">
        {/* Size buttons — sized products only */}
        {hasSizes && sizes && sizes.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Choose Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const szQty = displayQuantity(size.id);
                const isModified = modifiedSizes.has(size.id) && szQty !== cartQuantity(size.id);
                const isActive = selectedSize?.id === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => onSelectSize(size)}
                    className={cn(
                      "relative border-2 rounded-xl px-4 py-2.5 text-left min-w-[76px] transition-all",
                      isActive ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm" : "border-border hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    {isActive && (
                      <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                    <div className="font-semibold text-sm">{size.name}</div>
                    <div className="text-primary font-bold text-sm">{formatCurrency(size.finalPrice)}</div>
                    {size.hasPromotion && <div className="text-[10px] text-muted-foreground line-through">{formatCurrency(size.price)}</div>}
                    {szQty > 0 && (
                      <div className={cn("absolute -top-2 -left-2 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold", isModified ? "bg-amber-500" : "bg-primary")}>
                        {szQty}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Qty + Clear + Add to Cart — same for all products */}
        {showQtySection && (() => {
          const key = sizeId || "no_size";
          const isPending = modifiedSizes.has(key) && displayQty !== cartQty;
          return (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Quantity</h4>
              <div className="flex items-center gap-2">
                <QuantitySelector value={displayQty} onChange={(qty) => onQtyChange(sizeId, qty)} min={0} size="sm" pending={isPending} />
                {(displayQty > 0 || cartQty > 0) && (
                  <CustomButton
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 shrink-0 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                    disabled={clearingSize === clearKey}
                    onClick={() => onClearSize(sizeId)}
                  >
                    {clearingSize === clearKey ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                    Clear
                  </CustomButton>
                )}
                <div className="flex-1" />
                {/* "In Cart" status — always visible when anything is in cart, no icon */}
                {totalCartQtyAllSizes > 0 && (
                  <div className="h-8 shrink-0 flex items-center px-3 text-sm font-medium rounded-md border border-border text-muted-foreground">{`In Cart · ${formatCurrency(totalCartValueAllSizes)}`}</div>
                )}
                {/* Action button — shown when there are pending changes OR nothing in cart */}
                {(modifiedSizes.size > 0 || totalCartQtyAllSizes === 0) && (
                  <CustomButton
                    size="sm"
                    className="h-8 shrink-0 gap-1.5"
                    variant={modifiedSizes.size > 0 ? "default" : "secondary"}
                    disabled={isSaving || modifiedSizes.size === 0 || productStatus === "OUT_OF_STOCK"}
                    onClick={onSave}
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {modifiedSizes.size > 0 && totalCartQtyAllSizes > 0 ? "Update Cart" : "Add to Cart"}
                  </CustomButton>
                )}
              </div>

              {/* Total — sum of ALL sizes × their pending/cart quantities */}
              <div className="flex justify-between items-center py-3 border-t">
                <span className="text-sm text-muted-foreground">Total</span>
                <div className="flex items-center gap-2">
                  {hasAnyPromotion && <span className="text-sm text-red-500 line-through">{formatCurrency(totalOrigValueAllSizes)}</span>}
                  <span className="text-xl font-bold text-primary">{formatCurrency(totalDisplayValueAllSizes)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Wishlist + Share */}
      <div className="grid grid-cols-2 gap-3">
        <CustomButton
          size="lg"
          variant="outline"
          className={cn("h-11 rounded-xl gap-2 transition-all font-medium", isFavorited ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100" : "")}
          onClick={onToggleFavorite}
          disabled={isTogglingFavorite}
        >
          {isTogglingFavorite ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />}
          {isFavorited ? "Saved" : "Wishlist"}
        </CustomButton>
        <CustomButton size="lg" variant="outline" className="h-11 rounded-xl gap-2 font-medium" onClick={onShare}>
          <Share2 className="h-5 w-5" />
          Share
        </CustomButton>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t text-muted-foreground">
        <div className="flex items-center gap-1.5 text-sm">
          <Eye className="h-4 w-4" />
          <span>{viewCount.toLocaleString()}</span>
          <span className="text-xs">views</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Heart className="h-4 w-4" />
          <span>{favoriteCount.toLocaleString()}</span>
          <span className="text-xs">saves</span>
        </div>
        <div className="ml-auto text-xs font-mono text-muted-foreground/70">SKU: {productId.slice(0, 8).toUpperCase()}</div>
      </div>
    </div>
  );
}
