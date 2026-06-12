"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { adminChangePasswordService } from "@/redux/features/auth/store/thunks/users-thunks";
import { selectIsResettingPassword } from "@/redux/features/auth/store/selectors/users-selectors";
import { showToast } from "../common/show-toast";
import { FormHeader } from "../form-field/form-header";
import { FormBody } from "../form-field/form-body";
import { formatEnumValue } from "@/utils/format/enum-formatter";

interface ResetPasswordModalProps {
  userId?: string;
  userName?: string;
  userRole?: string[];
  profileImageUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({
  userId,
  isOpen,
  userName,
  userRole,
  profileImageUrl,
  onClose,
}: ResetPasswordModalProps) {
  const dispatch = useAppDispatch();

  // Get resetting password state from Redux
  const isResettingPassword = useAppSelector(selectIsResettingPassword);

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(AppDefault.RESET_PASSWORD);

  const onReset = async () => {
    if (!userId) {
      toast.error("User ID missing");
      return;
    }

    try {
      await dispatch(
        adminChangePasswordService({
          userId: userId,
          newPassword: newPassword,
          confirmPassword: newPassword,
        })
      ).unwrap();

      showToast.success("Password reset successfully");

      handleClose();
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast.error(error || "Reset failed. Please try again.");
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setNewPassword(AppDefault.RESET_PASSWORD);
    onClose();
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      toast.success("Password copied to clipboard");
    } catch (error) {
      console.error("Failed to copy password:", error);
      toast.error("Failed to copy password");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-md max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title="Reset Password"
          description="Reset the user's password to the default value"
          avatarName={userName}
        />

        <FormBody>
          <div className="space-y-[0.975rem]">
            {/* User Preview Card */}
            <Card>
              <CardContent className="pt-[0.975rem]">
                <div className="flex items-center gap-[0.65rem]">
                  <div className="h-[1.95rem] w-[1.95rem] rounded-[0.24375rem] bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-semibold text-primary">
                        {userName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">
                      {userName || "Unknown User"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {userRole && userRole.length > 0
                        ? userRole.map(role => formatEnumValue(role)).join(", ")
                        : "User Account"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Default Password Section */}
            <div className="space-y-[0.4875rem]">
              <div className="flex items-center gap-[0.325rem]">
                <Key className="h-[0.65rem] w-[0.65rem] text-muted-foreground" />
                <Label className="text-[12px] font-semibold">New Password</Label>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-[3.25rem] font-mono text-[12px] h-[1.95rem] py-[0.4875rem]"
                />
                <div className="absolute right-[0.1625rem] top-1/2 -translate-y-1/2 flex gap-[0.1625rem]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-[1.3rem] w-[1.3rem] p-0"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[0.65rem] w-[0.65rem]" />
                    ) : (
                      <Eye className="h-[0.65rem] w-[0.65rem]" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    className="h-[1.3rem] w-[1.3rem] p-0"
                    title="Copy password"
                  >
                    <Copy className="h-[0.65rem] w-[0.65rem]" />
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                User must change this password on first login
              </p>
            </div>

            {/* Warning Card */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="pt-[0.975rem]">
                <div className="flex gap-[0.4875rem]">
                  <AlertTriangle className="h-[0.8125rem] w-[0.8125rem] text-orange-600 flex-shrink-0 mt-[0.08125rem]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-orange-900">
                      Important Notice
                    </p>
                    <p className="text-[12px] text-orange-800 mt-[0.1625rem]">
                      This action will log out the user from all devices. They must use the new password to sign in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FormBody>

        <div className="flex gap-[0.4875rem] px-[0.65rem] py-[0.65rem] border-t bg-muted/30 flex-shrink-0 sm:px-[0.975rem] justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isResettingPassword}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onReset}
            disabled={isResettingPassword}
            variant="destructive"
          >
            {isResettingPassword ? (
              <>
                <Loader2 className="mr-[0.325rem] h-[0.65rem] w-[0.65rem] animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
