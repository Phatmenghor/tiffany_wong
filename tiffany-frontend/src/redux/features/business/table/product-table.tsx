import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, Package, RotateCcw, Zap, Check } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../store/models/response/product-response";
import { getImageWithFallback } from "@/constants/image-defaults";

interface ProductTableHandlers {
  handleEditProduct: (brand: ProductDetailResponseModel) => void;
  handleProductViewDetail: (brand: ProductDetailResponseModel) => void;
  handleDeleteProduct: (brand: ProductDetailResponseModel) => void;
  handleResetPromotion?: (product: ProductDetailResponseModel) => void;
  handleStatusChange?: (productId: string, status: string) => void;
}

interface ProductTableOptions {
  data: AllProductResponseModel | null;
  handlers: ProductTableHandlers;
}

/**
 * ProductImagePreview - Display product image with preview styling
 */
function ProductImagePreview({
  product,
}: {
  product: ProductDetailResponseModel;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-[2.275rem] h-[2.275rem] flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300">
      {!imageLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
      )}
      <Image
        src={getImageWithFallback(product?.mainImageUrl, "product")}
        alt={product.name}
        width={56}
        height={56}
        className={cn(
          "w-full h-full object-cover transition-all duration-300 hover:scale-105",
          imageLoaded ? "opacity-100" : "opacity-0",
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
}

/**
 * SizesDisplay - Display product sizes in simple bordered boxes
 */
function SizesDisplay({ sizes }: { sizes: any[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-[0.4875rem] text-muted-foreground">No sizes</span>;
  }

  return (
    <div className="flex flex-nowrap gap-[0.325rem] overflow-x-auto pb-[0.1625rem]">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="px-[0.325rem] py-[0.1625rem] rounded-[0.1625rem] bg-gray-50 text-[0.4875rem] text-foreground whitespace-nowrap"
          style={{
            border: "0.5px solid #FCD34D",
          }}
        >
          {size.name} ${size.finalPrice}
          {size.hasPromotion && (
            <span className="text-red-600 font-semibold ml-[0.1625rem]">
              {size.promotionType === "FIXED_AMOUNT"
                ? `-$${size.promotionValue}`
                : `-${size.promotionValue}%`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * StatusSwitch - Toggle switch for ACTIVE/INACTIVE status
 */
function StatusSwitch({
  value,
  onStatusChange,
  productId,
}: {
  value: string;
  onStatusChange?: (productId: string, status: string) => void;
  productId: string;
}) {
  const isActive = value === "ACTIVE";

  return (
    <div className="flex items-center gap-[0.325rem]">
      <Switch
        checked={isActive}
        onCheckedChange={(checked) =>
          onStatusChange?.(productId, checked ? "ACTIVE" : "INACTIVE")
        }
      />
      <span
        className={cn(
          "text-[0.4875rem] font-medium",
          isActive ? "text-green-600" : "text-muted-foreground",
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

export const productTableColumns = ({
  data,
  handlers,
}: ProductTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const {
    handleEditProduct,
    handleProductViewDetail,
    handleDeleteProduct,
    handleResetPromotion,
    handleStatusChange,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "imageUrl",
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => {
        return <ProductImagePreview product={product} />;
      },
    },

    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-[0.4875rem] text-muted-foreground">
          {product?.name || "---"}
        </span>
      ),
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-[0.4875rem] text-muted-foreground">
          {product?.categoryName || "---"}
        </span>
      ),
    },

    {
      key: "price",
      label: "Price",
      minWidth: "150px",
      maxWidth: "200px",
      render: (product) => (
        <div className="flex flex-col gap-[0.1625rem]">
          <span className="text-[0.56875rem] font-semibold text-foreground">
            ${parseFloat(product?.displayPrice?.toString() || "0").toFixed(2)}
          </span>
          {product?.hasPromotion && product?.displayOriginPrice && (
            <span className="text-[0.4875rem] text-muted-foreground line-through">
              ${parseFloat(product.displayOriginPrice.toString()).toFixed(2)}
            </span>
          )}
        </div>
      ),
    },

    {
      key: "sizes",
      label: "Sizes",
      minWidth: "25px",
      maxWidth: "400px",
      render: (product) => <SizesDisplay sizes={product?.sizes} />,
    },

    {
      key: "displayPromotionValue",
      label: "Promo Value",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => {
        const value = product?.displayPromotionValue;
        const type = product?.displayPromotionType;

        let displayValue = "---";
        if (value) {
          if (type === "PERCENTAGE") {
            displayValue = `${value}%`;
          } else if (type === "FIXED_AMOUNT") {
            displayValue = `$${parseFloat(value.toString()).toFixed(2)}`;
          } else {
            displayValue = value.toString();
          }
        }

        return (
          <span className="text-[0.4875rem] font-semibold text-red-600">
            {displayValue}
          </span>
        );
      },
    },

    {
      key: "status",
      label: "Status",
      minWidth: "150px",
      maxWidth: "350px",
      render: (product) => (
        <StatusSwitch
          value={product?.status || "ACTIVE"}
          onStatusChange={handleStatusChange}
          productId={product?.id || ""}
        />
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-[0.56875rem] text-muted-foreground">
          {dateTimeFormat(banner?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (brand) => (
        <div className="flex items-center gap-[0.325rem]">
          <ActionButton
            icon={<Eye className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="View Details"
            onClick={() => handleProductViewDetail(brand)}
          />
          <ActionButton
            icon={<Edit className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Edit Product"
            onClick={() => handleEditProduct(brand)}
          />
          {brand?.hasPromotion && (
            <ActionButton
              icon={<RotateCcw className="w-[0.65rem] h-[0.65rem]" />}
              tooltip="Reset Promotion"
              onClick={() => handleResetPromotion?.(brand)}
              variant="outline"
            />
          )}
          <ActionButton
            icon={<Trash className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Delete Product"
            onClick={() => handleDeleteProduct(brand)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
