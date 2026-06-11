import { indexDisplay } from "@/utils/common/common";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductDetailResponseModel } from "../store/models/response/product-response";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Edit, RotateCcw } from "lucide-react";
import { ActionButton } from "@/components/shared/button/action-button";

interface BulkPromotionTableOptions {
  selectedProductIds: Map<string, boolean>;
  onSelectProduct: (productId: string) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
  isLoading: boolean;
  pageNo: number;
  pageSize: number;
  selectedSizes?: Map<string, Set<string>>; // productId -> sizeIds
  onSizeToggle?: (productId: string, sizeId: string) => void;
  onViewDetails?: (product: ProductDetailResponseModel) => void;
  onEditProduct?: (product: ProductDetailResponseModel) => void;
  onResetPromotion?: (product: ProductDetailResponseModel) => void;
}

/**
 * ProductImagePreview - Display product image with square rounded-[0.1625rem] styling
 */
function ProductImagePreview({
  product,
}: {
  product: ProductDetailResponseModel;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-[1.95rem] h-[1.95rem] flex items-center justify-center overflow-hidden rounded-[0.325rem] bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300">
      {!imageError && product?.mainImageUrl ? (
        <>
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-[0.325rem]" />
          )}
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            width={48}
            height={48}
            className={cn(
              "w-full h-full object-cover transition-all duration-300 hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </>
      ) : (
        <span className="text-[0.73125rem] font-bold text-primary/80 hover:text-primary transition-colors">
          {product?.name?.charAt(0).toUpperCase() || "P"}
        </span>
      )}
    </div>
  );
}

export const bulkPromotionTableColumns = ({
  selectedProductIds,
  onSelectProduct,
  onSelectAll,
  allSelected,
  someSelected,
  isLoading,
  pageNo,
  pageSize,
  selectedSizes = new Map(),
  onSizeToggle,
  onViewDetails,
  onEditProduct,
  onResetPromotion,
}: BulkPromotionTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  return [
    {
      key: "index",
      label: "#",
      width: "50px",
      minWidth: "10px",
      maxWidth: "120px",
      className: "pr-[0.325rem]",
      render: (_, index) => (
        <span className="font-medium text-[0.4875rem] pointer-events-none">
          {indexDisplay(pageNo || 1, pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "120px",
      className: "px-[0.325rem]",
      render: (product) => (
        <div className="flex items-center gap-[0.325rem]">
          <CustomCheckbox
            checked={selectedProductIds.has(product.id)}
            onCheckedChange={() => onSelectProduct(product.id)}
            disabled={isLoading}
            size="lg"
            variant="default"
            ariaLabel={`Select ${product.name}`}
          />

          <ActionButton
            icon={<Eye className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="View Details"
            onClick={() => onViewDetails?.(product)}
          />
          {product?.hasPromotion && (
            <ActionButton
              icon={<RotateCcw className="w-[0.65rem] h-[0.65rem]" />}
              tooltip="Reset Promotion"
              onClick={() => onResetPromotion?.(product)}
            />
          )}
        </div>
      ),
    },

    {
      key: "image",
      label: "Image",
      width: "60px",
      minWidth: "10px",
      maxWidth: "120px",
      className: "px-[0.325rem]",
      render: (product) => <ProductImagePreview product={product} />,
    },
    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      className: "px-[0.65rem]",
      render: (product) => (
        <span className="text-[0.4875rem] text-muted-foreground">
          {product?.name || "---"}
        </span>
      ),
    },

    {
      key: "promotionStatus",
      label: "Promotion",
      minWidth: "10px",
      maxWidth: "120px",
      className: "px-[0.65rem]",
      render: (product) => {
        if (!product.hasPromotion) {
          return <span className="text-[0.56875rem] text-foreground">No Promotion</span>;
        }

        return (
          <span className="text-[0.56875rem] font-medium text-green-600">Active</span>
        );
      },
    },
    {
      key: "sizes",
      label: "Sizes",
      minWidth: "10px",
      maxWidth: "400px",
      className: "px-[0.65rem]",
      render: (product) => {
        if (!product.hasSizes || !product.sizes || product.sizes.length === 0) {
          return <span className="text-[0.4875rem] text-muted-foreground">- - -</span>;
        }

        return (
          <div className="flex flex-row gap-[0.24375rem] items-center flex-nowrap overflow-x-auto max-w-full pb-[0.1625rem]">
            {product.sizes.map((size) => {
              const isSelected =
                selectedSizes.get(product.id)?.has(size.id) || false;
              const hasPromotion = size.promotionType && size.promotionValue;

              return (
                <label
                  key={size.id}
                  className={cn(
                    "flex items-center gap-[0.24375rem] px-[0.325rem] py-[0.1625rem] rounded-[0.24375rem] border text-[0.4875rem] transition-all duration-150 cursor-pointer group whitespace-nowrap flex-shrink-0",
                    isSelected
                      ? "bg-primary/15 border-primary/50 hover:bg-primary/20 hover:border-primary/70 shadow-sm"
                      : "bg-white border-border/50 hover:bg-gray-50 hover:border-border/70",
                  )}
                >
                  {/* Custom Checkbox */}
                  <CustomCheckbox
                    checked={isSelected}
                    onCheckedChange={() => onSizeToggle?.(product.id, size.id)}
                    size="sm"
                    variant="default"
                    ariaLabel={`Select ${size.name}`}
                  />

                  {/* Size Name */}
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {size.name}
                  </span>

                  {/* Size Promotion Status Badge */}
                  {hasPromotion && (
                    <span className="bg-green-100/70 text-green-700 text-[0.4875rem] h-fit px-[0.1625rem] py-[0.08125rem] rounded-[0.1625rem] inline-block font-semibold">
                      {size.promotionType === "PERCENTAGE"
                        ? `${size.promotionValue}%`
                        : `$${size.promotionValue}`}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        );
      },
    },
    {
      key: "displayPrice",
      label: "Display Price",
      minWidth: "100px",
      maxWidth: "150px",
      className: "px-[0.65rem]",
      render: (product) => {
        // Only show for products WITHOUT sizes
        if (product.hasSizes) {
          return <span className="text-[0.4875rem] text-muted-foreground">---</span>;
        }

        return (
          <div className="flex flex-col gap-[0.1625rem]">
            <span className="text-[0.56875rem] font-semibold text-foreground">
              ${Number(product.displayPrice || 0).toFixed(2)}
            </span>
            {product.displayOriginPrice &&
              product.displayPrice <
                Number(product.displayOriginPrice || 0) && (
                <span className="text-[0.4875rem] text-muted-foreground line-through">
                  ${Number(product.displayOriginPrice).toFixed(2)}
                </span>
              )}
          </div>
        );
      },
    },
    {
      key: "discount",
      label: "Discount",
      minWidth: "100px",
      maxWidth: "150px",
      className: "px-[0.65rem]",
      render: (product) => {
        // Only show for products WITHOUT sizes
        if (product.hasSizes) {
          return <span className="text-[0.4875rem] text-muted-foreground">---</span>;
        }

        if (!product.hasPromotion || !product.displayPromotionType) {
          return <span className="text-[0.4875rem] text-muted-foreground">---</span>;
        }

        return (
          <span className="bg-green-100/70 text-green-700 text-[0.4875rem] h-fit px-[0.325rem] py-[0.08125rem] rounded-[0.1625rem] inline-block font-semibold">
            {product.displayPromotionType === "PERCENTAGE"
              ? `${product.displayPromotionValue}%`
              : `$${Number(product.displayPromotionValue || 0).toFixed(2)}`}
          </span>
        );
      },
    },
  ];
};
