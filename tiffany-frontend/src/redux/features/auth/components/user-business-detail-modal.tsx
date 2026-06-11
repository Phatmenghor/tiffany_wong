"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchUserByIdService } from "@/redux/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/redux/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";

interface UserDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserBusinessDetailModal({
  userId,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const userData = useAppSelector(selectSelectedUser);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen) return;

      try {
        await dispatch(fetchUserByIdService(userId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedUser());
    onClose();
  };

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">User Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!userData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">User Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No user data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">User Details - {userData.fullName}</DialogTitle>
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
              {userData.profileImageUrl ? (
                <img
                  src={userData.profileImageUrl}
                  alt={userData.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <span className="text-2xl font-semibold text-primary">
                    {userData.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                User Details
              </h2>
              <p className="text-sm text-foreground mt-1">
                View detailed information about the user
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="First Name" value={userData.firstName} />
                  <DisplayField label="Last Name" value={userData.lastName} />
                  <DisplayField label="Nickname" value={userData.nickname} />
                  <DisplayField label="Email" value={userData.email} />
                  <DisplayField label="Phone Number" value={userData.phoneNumber} />
                  <DisplayField label="Gender" value={userData.gender ? formatEnumValue(userData.gender) : "-"} />
                  <DisplayField label="Date of Birth" value={userData.dateOfBirth} />
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="User Identifier" value={userData.userIdentifier} />
                  <DisplayField label="User Type" value={formatEnumValue(userData.userType)} />
                  <DisplayField label="User Role" value={userData.userRole ? formatEnumValue(userData.userRole) : "-"} />
                  <DisplayField label="Account Status" value={userData.accountStatus ? formatEnumValue(userData.accountStatus) : "-"} />
                </div>
              </CardContent>
            </Card>

            {/* Remarks */}
            {userData.remark && (
              <Card>
                <CardHeader>
                  <CardTitle>Remarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DisplayField label="Remarks" value={userData.remark} />
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="User ID" value={userData.id} />
                  <DisplayField label="Created At" value={dateTimeFormat(userData.createdAt ?? "")} />
                  <DisplayField label="Created By" value={userData.createdBy} />
                  <DisplayField label="Last Updated" value={dateTimeFormat(userData.updatedAt ?? "")} />
                  <DisplayField label="Updated By" value={userData.updatedBy} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
