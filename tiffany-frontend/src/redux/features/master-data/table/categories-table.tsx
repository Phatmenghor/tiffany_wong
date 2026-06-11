import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { TableThumbnail } from "@/components/shared/common/table-thumbnail";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { formatProductCount } from "@/utils/format/product-count-formatter";
import {
  AllCategoriesResponseModel,
  CategoriesResponseModel,
} from "../store/models/response/categories-response";

interface CategoriesTableHandlers {
  handleEditCategories: (brand: CategoriesResponseModel) => void;
  handleCategoriesViewDetail: (brand: CategoriesResponseModel) => void;
  handleDeleteCategories: (brand: CategoriesResponseModel) => void;
  handleToggleCategoryStatus: (category: CategoriesResponseModel) => void;
}

interface CategoriesTableOptions {
  data: AllCategoriesResponseModel | null;
  handlers: CategoriesTableHandlers;
}

export const categoriesTableColumns = ({
  data,
  handlers,
}: CategoriesTableOptions): TableColumn<CategoriesResponseModel>[] => {
  const {
    handleEditCategories,
    handleCategoriesViewDetail,
    handleDeleteCategories,
    handleToggleCategoryStatus,
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
      label: "Categories Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => (
        <TableThumbnail
          src={categories.imageUrl}
          alt={categories?.name || "Category"}
          className="h-[1.95rem] w-[1.95rem] rounded-[0.24375rem]"
        />
      ),
    },

    {
      key: "name",
      label: "Brand Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <span className="text-muted-foreground">
          {categories?.name || "---"}
        </span>
      ),
    },

    {
      key: "totalProducts",
      label: "Total Products",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => {
        const total = categories?.totalProducts ?? 0;
        return (
          <span className="text-muted-foreground">
            {formatProductCount(total)}
          </span>
        );
      },
    },

    {
      key: "activeProducts",
      label: "Active Products",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => {
        const active = categories?.activeProducts ?? 0;
        return (
          <span className="text-muted-foreground">
            {formatProductCount(active)}
          </span>
        );
      },
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <div className="flex items-center gap-[0.325rem]">
          <Switch
            checked={categories?.status === "ACTIVE"}
            onCheckedChange={() => handleToggleCategoryStatus(categories)}
          />
          <span className="text-muted-foreground">
            {categories?.status ? formatEnumValue(categories.status) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => (
        <span className="text-muted-foreground">
          {dateTimeFormat(categories?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => (
        <div className="flex items-center gap-[0.325rem]">
          <ActionButton
            icon={<Eye className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="View Details"
            onClick={() => handleCategoriesViewDetail(categories)}
          />
          <ActionButton
            icon={<Edit className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Edit Brand"
            onClick={() => handleEditCategories(categories)}
          />
          <ActionButton
            icon={<Trash className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Delete Brand"
            onClick={() => handleDeleteCategories(categories)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
