import { indexDisplay } from "@/utils/common/common";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import { TableThumbnail } from "@/components/shared/common/table-thumbnail";
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
      minWidth: "10px",
      maxWidth: "400px",
      className: "pr-[0.325rem]",
      render: (_, index) => (
        <span className="font-medium pointer-events-none">
          {indexDisplay(pageNo || 1, pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
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
      minWidth: "10px",
      maxWidth: "400px",
      className: "px-[0.325rem]",
      render: (product) => (
        <TableThumbnail
          src={product?.mainImageUrl}
          alt={product.name}
          className="w-[1.95rem] h-[1.95rem] rounded-[0.325rem]"
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      className: "px-[0.65rem]",
      render: (product) => (
        <span className="text-muted-foreground">{product?.name || "---"}</span>
      ),
    },

    {
      key: "promotionStatus",
      label: "Promotion",
      minWidth: "10px",
      maxWidth: "400px",
      className: "px-[0.65rem]",
      render: (product) => {
        if (!product.hasPromotion) {
          return <span className="text-foreground">No Promotion</span>;
        }

        return <span className="font-medium text-green-600">Active</span>;
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
          return <span className="text-muted-foreground">- - -</span>;
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
                    "flex items-center gap-[0.24375rem] px-[0.325rem] py-[0.1625rem] rounded-[0.24375rem] border transition-all duration-150 cursor-pointer group whitespace-nowrap flex-shrink-0",
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
                    <span className="bg-green-100/70 text-green-700 h-fit px-[0.1625rem] py-[0.08125rem] rounded-[0.1625rem] inline-block font-semibold">
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
      minWidth: "10px",
      maxWidth: "400px",
      className: "px-[0.65rem]",
      render: (product) => {
        // Only show for products WITHOUT sizes
        if (product.hasSizes) {
          return <span className="text-muted-foreground">---</span>;
        }

        return (
          <div className="flex flex-col gap-[0.1625rem]">
            <span className="font-semibold text-foreground">
              ${Number(product.displayPrice || 0).toFixed(2)}
            </span>
            {product.displayOriginPrice &&
              product.displayPrice <
                Number(product.displayOriginPrice || 0) && (
                <span className="text-muted-foreground line-through">
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
      minWidth: "10px",
      maxWidth: "400px",
      className: "px-[0.65rem]",
      render: (product) => {
        // Only show for products WITHOUT sizes
        if (product.hasSizes) {
          return <span className="text-muted-foreground">---</span>;
        }

        if (!product.hasPromotion || !product.displayPromotionType) {
          return <span className="text-muted-foreground">---</span>;
        }

        return (
          <span className="bg-green-100/70 text-green-700 h-fit px-[0.325rem] py-[0.08125rem] rounded-[0.1625rem] inline-block font-semibold">
            {product.displayPromotionType === "PERCENTAGE"
              ? `${product.displayPromotionValue}%`
              : `$${Number(product.displayPromotionValue || 0).toFixed(2)}`}
          </span>
        );
      },
    },
  ];
};
