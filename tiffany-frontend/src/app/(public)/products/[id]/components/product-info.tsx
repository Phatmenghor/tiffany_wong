"use client";

import { Tag, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";

interface ProductInfoProps {
  categoryName?: string;
  brandName?: string;
  status: string;
  name: string;
  displayPrice: number;
  originalPrice?: number;
  description?: string;
}

export function ProductInfo({
  categoryName,
  brandName,
  status,
  name,
  displayPrice,
  originalPrice,
  description,
}: ProductInfoProps) {
  const savings = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {categoryName && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Tag className="h-3 w-3" />
            {categoryName}
          </Badge>
        )}
        {brandName && (
          <Badge variant="outline" className="gap-1 text-xs">
            <Store className="h-3 w-3" />
            {brandName}
          </Badge>
        )}
        <Badge className={cn("text-xs", status === "OUT_OF_STOCK" ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600")}>
          {status === "OUT_OF_STOCK" ? "Out of Stock" : "In Stock"}
        </Badge>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">{name}</h1>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-3xl sm:text-4xl font-bold text-primary leading-none">{formatCurrency(displayPrice)}</span>
        {originalPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through leading-none">{formatCurrency(originalPrice)}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Save {formatCurrency(originalPrice - displayPrice)}
            </span>
          </>
        )}
      </div>

      {/* Description */}
      {description && <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
}
