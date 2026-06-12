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
    <div className="flex flex-col gap-[0.65rem]">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-[0.325rem]">
        {categoryName && (
          <Badge variant="secondary" className="gap-[0.1625rem] text-[11px]">
            <Tag className="h-[0.4875rem] w-[0.4875rem]" />
            {categoryName}
          </Badge>
        )}
        {brandName && (
          <Badge variant="outline" className="gap-[0.1625rem] text-[11px]">
            <Store className="h-[0.4875rem] w-[0.4875rem]" />
            {brandName}
          </Badge>
        )}
        <Badge className={cn("text-[11px]", status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-muted text-muted-foreground hover:bg-muted")}>
          {status === "ACTIVE" ? "In Stock" : "Inactive"}
        </Badge>
      </div>

      {/* Title */}
      <h1 className="text-[14px] sm:text-[1.21875rem] font-bold leading-snug tracking-tight">{name}</h1>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-x-[0.325rem] gap-y-[0.1625rem]">
        <span className="text-[1.21875rem] sm:text-[1.4625rem] font-bold text-primary leading-none">{formatCurrency(displayPrice)}</span>
        {originalPrice && (
          <>
            <span className="text-[13px] text-muted-foreground line-through leading-none">{formatCurrency(originalPrice)}</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-[0.40625rem] py-[0.1625rem] rounded-full">
              Save {formatCurrency(originalPrice - displayPrice)}
            </span>
          </>
        )}
      </div>

      {/* Description */}
      {description && <p className="text-[11px] sm:text-[12px] text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
}
