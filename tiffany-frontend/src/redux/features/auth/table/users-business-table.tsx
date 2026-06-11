import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, RotateCw, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableThumbnail } from "@/components/shared/common/table-thumbnail";
import {
  AllUserResponseModel,
  UserResponseModel,
} from "../store/models/response/users-response";
import { ActionButton } from "@/components/shared/button/action-button";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Switch } from "@/components/ui/switch";

interface UserTableHandlers {
  handleEditUser: (user: UserResponseModel) => void;
  handleViewUserDetail: (user: UserResponseModel) => void;
  handleResetPassword: (user: UserResponseModel) => void;
  handleDeleteUser: (user: UserResponseModel) => void;
  handleToggleStatus: (user: UserResponseModel) => void;
}

interface UserTableOptions {
  data: AllUserResponseModel | null;
  handlers: UserTableHandlers;
}

export const userBusinessTableColumns = ({
  data,
  handlers,
}: UserTableOptions): TableColumn<UserResponseModel>[] => {
  const {
    handleEditUser,
    handleViewUserDetail,
    handleResetPassword,
    handleDeleteUser,
    handleToggleStatus,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "avatar",
      label: "Avatar",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <TableThumbnail
          src={user.profileImageUrl}
          alt={user?.firstName || "User"}
          className="h-[1.95rem] w-[1.95rem] rounded-[0.24375rem]"
        />
      ),
    },
    {
      key: "userIdentifier",
      label: "User Identifier",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-muted-foreground">
          {user?.userIdentifier || "---"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-muted-foreground">
          {user?.phoneNumber || "---"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-muted-foreground">
          {user?.email || "---"}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-muted-foreground">
          {user?.fullName || `${user.firstName} ${user.lastName}`}
        </span>
      ),
    },
    {
      key: "userRole",
      label: "Role",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-muted-foreground">
          {user.userRole ? formatEnumValue(user.userRole) : "---"}
        </span>
      ),
    },
    {
      key: "accountStatus",
      label: "Account Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <div className="flex items-center gap-[0.325rem]">
          <Switch
            checked={user?.accountStatus === "ACTIVE"}
            onCheckedChange={() => handleToggleStatus(user)}
          />
          <span className="text-muted-foreground">
            {user?.accountStatus ? formatEnumValue(user.accountStatus) : "---"}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <span className="text-muted-foreground">
          {dateTimeFormat(user?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <div className="flex items-center gap-[0.325rem]">
          <ActionButton
            icon={<Eye className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="View Details"
            onClick={() => handleViewUserDetail(user)}
          />
          <ActionButton
            icon={<Edit className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Edit User"
            onClick={() => handleEditUser(user)}
          />
          <ActionButton
            icon={<RotateCw className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Reset Password"
            onClick={() => handleResetPassword(user)}
          />
          <ActionButton
            icon={<Trash className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Delete User"
            onClick={() => handleDeleteUser(user)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
