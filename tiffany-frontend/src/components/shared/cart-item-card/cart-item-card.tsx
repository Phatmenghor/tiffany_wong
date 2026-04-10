"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

export interface CartItemCardProps {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId?: string | null;
  sizeName?: string | null;
  quantity: number;
  displayPrice: number;
  displayOriginPrice: number;
  displayPromotionType: string | null;
  displayPromotionValue: number | null;
  hasActivePromotion: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  showLink?: boolean;
  showControls?: boolean;
}

export function CartItemCard({
  id,
  productId,
  productName,
  productImageUrl,
  sizeName,
  quantity,
  displayPrice,
  displayOriginPrice,
  displayPromotionType,
  displayPromotionValue,
  hasActivePromotion,
  onQuantityChange,
  onRemove,
  showLink = true,
  showControls = true,
}: CartItemCardProps) {
  const ImageComponent = (
    <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <Image
        src={sanitizeImageUrl(productImageUrl, appImages.NoImage)}
        alt={productName}
        fill
        className="object-cover"
      />
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 relative group">
      <CustomButton
        size="icon"
        variant="outline"
        className="absolute top-3 right-3 h-8 w-8 shrink-0 text-red-600 hover:bg-red-100"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-4 w-4" />
      </CustomButton>

      <div className="flex gap-4">
        {showLink ? (
          <Link href={`/products/${productId}`} className="flex-shrink-0 group/link">
            {ImageComponent}
          </Link>
        ) : (
          ImageComponent
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
          <div className="flex items-center gap-2 min-w-0 mb-2">
            {showLink ? (
              <Link href={`/products/${productId}`}>
                <h3 className="font-semibold text-sm leading-tight text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                  {productName}
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-sm leading-tight text-slate-900 line-clamp-1">
                {productName}
              </h3>
            )}
            {hasActivePromotion && displayPromotionValue != null && (
              <Badge className="text-[10px] px-2 py-0.5 leading-none flex-shrink-0 bg-red-100 text-red-700 border-0 font-semibold">
                {displayPromotionType === "PERCENTAGE"
                  ? `-${displayPromotionValue}%`
                  : `-${formatCurrency(displayPromotionValue)}`}
              </Badge>
            )}
          </div>

          {sizeName && (
            <div className="mb-2">
              <span className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap inline-block border border-primary/30">
                {sizeName}
              </span>
            </div>
          )}

          {showControls && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base text-slate-900">{formatCurrency(displayPrice)}</span>
                {hasActivePromotion && displayOriginPrice > displayPrice && (
                  <span className="text-xs text-slate-500 line-through font-medium">{formatCurrency(displayOriginPrice)}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </CustomButton>
                <div className="flex-1 text-center h-8 bg-primary/10 text-primary font-semibold text-sm rounded-lg border border-primary/20 flex items-center justify-center w-10">
                  {quantity}
                </div>
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => onQuantityChange(quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
