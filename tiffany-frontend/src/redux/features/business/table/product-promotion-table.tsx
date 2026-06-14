import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, RotateCcw, Zap } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { TableThumbnail } from "@/components/shared/common/table-thumbnail";
import { Badge } from "@/components/ui/badge";
import { useBusinessColors } from "@/hooks/use-business-colors";
import { cn } from "@/lib/utils";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../store/models/response/product-response";

interface ProductTableHandlers {
  handleEditProduct: (brand: ProductDetailResponseModel) => void;
  handleProductViewDetail: (brand: ProductDetailResponseModel) => void;
  handleDeleteProduct: (brand: ProductDetailResponseModel) => void;
  handleResetPromotion?: (brand: ProductDetailResponseModel) => void;
}

interface ProductPromotionTableOptions {
  data: AllProductResponseModel | null;
  handlers: ProductTableHandlers;
}

/**
 * SizesDisplay - Display product sizes in simple bordered boxes
 * Uses secondary color (yellow) from business theme for borders
 */
function SizesDisplay({ sizes }: { sizes: any[] | undefined }) {
  const { secondary } = useBusinessColors();

  if (!sizes || sizes.length === 0) {
    return <span className="text-muted-foreground">No sizes</span>;
  }

  return (
    <div className="flex flex-nowrap gap-[0.325rem] overflow-x-auto pb-[0.1625rem]">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="px-[0.325rem] py-[0.1625rem] rounded-[0.1625rem] bg-gray-50 text-foreground whitespace-nowrap"
          style={{
            border: `0.5px solid ${secondary}`,
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
 * StatusDisplay - Display product status badge (ACTIVE/INACTIVE only)
 */
function StatusDisplay({ value }: { value: string }) {
  const isActive = value === "ACTIVE";

  return (
    <Badge
      className={cn(
        "font-medium",
        isActive
          ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200",
      )}
      variant="outline"
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

export const productPromotionTableColumns = ({
  data,
  handlers,
}: ProductPromotionTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const {
    handleEditProduct,
    handleProductViewDetail,
    handleDeleteProduct,
    handleResetPromotion,
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
      render: (product) => (
        <TableThumbnail
          src={product?.mainImageUrl}
          alt={product.name}
          className="w-[2.275rem] h-[2.275rem] rounded-[0.325rem]"
        />
      ),
    },

    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-muted-foreground">{product?.name || "---"}</span>
      ),
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-muted-foreground">
          {product?.categoryName || "---"}
        </span>
      ),
    },

    {
      key: "price",
      label: "Price",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <div className="flex flex-col gap-[0.1625rem]">
          <span className="font-semibold text-foreground">
            ${parseFloat(product?.displayPrice?.toString() || "0").toFixed(2)}
          </span>
          {product?.hasPromotion && product?.displayOriginPrice && (
            <span className="text-muted-foreground line-through">
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
          <span className="font-semibold text-red-600">{displayValue}</span>
        );
      },
    },

    {
      key: "displayPromotionFromDate",
      label: "From Date",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-muted-foreground">
          {dateTimeFormat(product?.displayPromotionFromDate) || "---"}
        </span>
      ),
    },

    {
      key: "displayPromotionToDate",
      label: "To Date",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-muted-foreground">
          {dateTimeFormat(product?.displayPromotionToDate) || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <StatusDisplay value={product?.status || "ACTIVE"} />
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <span className="text-muted-foreground">
          {dateTimeFormat(product?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <div className="flex items-center gap-[0.325rem]">
          <ActionButton
            icon={<Eye className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="View Details"
            onClick={() => handleProductViewDetail(product)}
          />
          <ActionButton
            icon={<Edit className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Edit Product"
            onClick={() => handleEditProduct(product)}
          />
          {handleResetPromotion && product?.hasPromotion && (
            <ActionButton
              icon={<RotateCcw className="w-[0.65rem] h-[0.65rem]" />}
              tooltip="Reset Promotion"
              onClick={() => handleResetPromotion(product)}
            />
          )}
          <ActionButton
            icon={<Trash className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Delete Product"
            onClick={() => handleDeleteProduct(product)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
