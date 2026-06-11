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
}: ProductActionsSectionProps) {
  const sizeId: string | null = hasSizes ? (selectedSize?.id ?? null) : null;
  const displayQty = displayQuantity(sizeId);
  const cartQty = cartQuantity(sizeId);
  const unitPrice = hasSizes ? selectedSize?.finalPrice ?? displayPrice : displayPrice;
  const clearKey = sizeId || "no_size";
  const showQtySection = !hasSizes || !!selectedSize;

  return (
    <div className="flex flex-col gap-[0.65rem]">
      {/* ── Cart section — unified style for sized and non-sized ── */}
      <div className="space-y-[0.4875rem]">
        {/* Size buttons — sized products only */}
        {hasSizes && sizes && sizes.length > 0 && (
          <>
            <p className="text-[0.4875rem] font-semibold uppercase tracking-wider text-muted-foreground">Choose Size</p>
            <div className="flex flex-wrap gap-[0.325rem]">
              {sizes.map((size) => {
                const szQty = displayQuantity(size.id);
                const isModified = modifiedSizes.has(size.id) && szQty !== cartQuantity(size.id);
                const isActive = selectedSize?.id === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => onSelectSize(size)}
                    className={cn(
                      "relative border-2 rounded-[0.4875rem] px-[0.65rem] py-[0.40625rem] text-left min-w-[76px] transition-all",
                      isActive ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm" : "border-border hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    {isActive && (
                      <div className="absolute -top-[0.24375rem] -right-[0.24375rem] bg-primary text-primary-foreground rounded-full p-[0.08125rem]">
                        <Check className="h-[0.40625rem] w-[0.40625rem]" />
                      </div>
                    )}
                    <div className="font-semibold text-[0.56875rem]">{size.name}</div>
                    <div className="flex items-center gap-[0.24375rem]">
                      <span className="text-primary font-bold text-[0.56875rem]">{formatCurrency(size.finalPrice)}</span>
                      {size.hasPromotion && <span className="text-[10px] text-muted-foreground line-through">{formatCurrency(size.price)}</span>}
                    </div>
                    {szQty > 0 && (
                      <div className={cn("absolute -top-[0.325rem] -left-[0.325rem] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold", isModified ? "bg-amber-500" : "bg-primary")}>
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
            <div className="space-y-[0.4875rem]">
              <h4 className="font-semibold text-[0.56875rem]">Quantity</h4>
              <div className="flex items-center gap-[0.325rem]">
                <QuantitySelector value={displayQty} onChange={(qty) => onQtyChange(sizeId, qty)} min={0} size="sm" pending={isPending} />
                {(displayQty > 0 || cartQty > 0) && (
                  <CustomButton
                    variant="outline"
                    size="sm"
                    className="h-[1.3rem] px-[0.325rem] shrink-0 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                    disabled={clearingSize === clearKey}
                    onClick={() => onClearSize(sizeId)}
                  >
                    {clearingSize === clearKey ? <Loader2 className="h-[0.56875rem] w-[0.56875rem] mr-[0.1625rem] animate-spin" /> : <Trash2 className="h-[0.56875rem] w-[0.56875rem] mr-[0.1625rem]" />}
                    Clear
                  </CustomButton>
                )}
                <div className="flex-1" />
                {/* "In Cart" status — always visible when anything is in cart, no icon */}
                {totalCartQtyAllSizes > 0 && (
                  <div className="h-[1.3rem] shrink-0 flex items-center px-[0.4875rem] text-[0.56875rem] font-medium rounded-md border border-border text-muted-foreground">{`In Cart · ${formatCurrency(totalCartValueAllSizes)}`}</div>
                )}
                {/* Action button — shown when there are pending changes OR nothing in cart */}
                {(modifiedSizes.size > 0 || totalCartQtyAllSizes === 0) && (
                  <CustomButton
                    size="sm"
                    className="h-[1.3rem] shrink-0 gap-[0.24375rem]"
                    variant={modifiedSizes.size > 0 ? "default" : "secondary"}
                    disabled={isSaving || modifiedSizes.size === 0 || productStatus !== "ACTIVE"}
                    onClick={onSave}
                  >
                    {isSaving && <Loader2 className="h-[0.56875rem] w-[0.56875rem] animate-spin" />}
                    {modifiedSizes.size > 0 && totalCartQtyAllSizes > 0 ? "Update Cart" : "Add to Cart"}
                  </CustomButton>
                )}
              </div>

              {/* Total — sum of ALL sizes × their pending/cart quantities */}
              <div className="flex justify-between items-center py-[0.4875rem] border-t">
                <span className="text-[0.56875rem] text-muted-foreground">Total</span>
                <div className="flex items-center gap-[0.325rem]">
                  {hasAnyPromotion && <span className="text-[0.56875rem] text-red-500 line-through">{formatCurrency(totalOrigValueAllSizes)}</span>}
                  <span className="text-[0.8125rem] font-bold text-primary">{formatCurrency(totalDisplayValueAllSizes)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Wishlist + Share */}
      <div className="grid grid-cols-2 gap-[0.4875rem]">
        <CustomButton
          size="lg"
          variant="outline"
          className={cn("h-[1.7875rem] rounded-[0.4875rem] gap-[0.325rem] transition-all font-medium", isFavorited ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100" : "")}
          onClick={onToggleFavorite}
          disabled={isTogglingFavorite}
        >
          {isTogglingFavorite ? <Loader2 className="h-[0.8125rem] w-[0.8125rem] animate-spin" /> : <Heart className={cn("h-[0.8125rem] w-[0.8125rem]", isFavorited && "fill-current")} />}
          {isFavorited ? "Saved" : "Wishlist"}
        </CustomButton>
        <CustomButton size="lg" variant="outline" className="h-[1.7875rem] rounded-[0.4875rem] gap-[0.325rem] font-medium" onClick={onShare}>
          <Share2 className="h-[0.8125rem] w-[0.8125rem]" />
          Share
        </CustomButton>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-[0.975rem] pt-[0.65rem] border-t text-muted-foreground">
        <div className="flex items-center gap-[0.24375rem] text-[0.56875rem]">
          <Eye className="h-[0.65rem] w-[0.65rem]" />
          <span>{viewCount.toLocaleString()}</span>
          <span className="text-[0.4875rem]">views</span>
        </div>
        <div className="flex items-center gap-[0.24375rem] text-[0.56875rem]">
          <Heart className="h-[0.65rem] w-[0.65rem]" />
          <span>{favoriteCount.toLocaleString()}</span>
          <span className="text-[0.4875rem]">saves</span>
        </div>
      </div>
    </div>
  );
}
