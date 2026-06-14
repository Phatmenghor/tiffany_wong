import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllBannerResponseModel,
  BannerResponseModel,
} from "../store/models/response/banner-response";
import { ActionButton } from "@/components/shared/button/action-button";
import { TableThumbnail } from "@/components/shared/common/table-thumbnail";
import { Switch } from "@/components/ui/switch";

interface BannerTableHandlers {
  handleEditBanner: (banner: BannerResponseModel) => void;
  handleBannerViewDetail: (banner: BannerResponseModel) => void;
  handleDeleteBanner: (banner: BannerResponseModel) => void;
  handleToggleBannerStatus: (banner: BannerResponseModel) => void;
}

interface BannerTableOptions {
  data: AllBannerResponseModel | null;
  handlers: BannerTableHandlers;
}

export const bannerTableColumns = ({
  data,
  handlers,
}: BannerTableOptions): TableColumn<BannerResponseModel>[] => {
  const {
    handleEditBanner,
    handleBannerViewDetail,
    handleDeleteBanner,
    handleToggleBannerStatus,
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
      label: "Banner Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <TableThumbnail
          src={banner.imageUrl}
          alt="Banner"
          className="w-[10.4rem] h-[5.2rem] rounded-[0.325rem] shadow-sm"
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <h3 className="font-semibold text-foreground line-clamp-3">
          {banner.description || "---"}
        </h3>
      ),
    },
    {
      key: "linkUrl",
      label: "Link",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (banner) => (
        <span className="text-muted-foreground truncate">
          {banner?.linkUrl || "---"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <div className="flex items-center gap-[0.325rem]">
          <Switch
            checked={banner?.status === "ACTIVE"}
            onCheckedChange={() => handleToggleBannerStatus(banner)}
          />
          <span className="text-muted-foreground">
            {banner?.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-muted-foreground">
          {dateTimeFormat(banner?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <div className="flex items-center gap-[0.325rem]">
          <ActionButton
            icon={<Eye className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="View Details"
            onClick={() => handleBannerViewDetail(banner)}
          />
          <ActionButton
            icon={<Edit className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Edit Banner"
            onClick={() => handleEditBanner(banner)}
          />
          <ActionButton
            icon={<Trash className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Delete Banner"
            onClick={() => handleDeleteBanner(banner)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
