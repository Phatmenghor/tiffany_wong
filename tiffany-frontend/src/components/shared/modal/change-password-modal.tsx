"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { TextField } from "@/components/shared/form-field/text-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { changePasswordService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { ROUTES } from "@/constants/app-routes/routes";
import { clearToken } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { selectError } from "@/redux/features/auth/store/selectors/auth-selectors";
import { clearError } from "@/redux/features/auth/store/slice/auth-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { getFieldError } from "@/utils/common/get-field-error";
import { changePasswordSchema } from "@/redux/features/auth/store/models/schema/user.schema";

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const reduxError = useAppSelector(selectError);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, dispatch, reset]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      await dispatch(changePasswordService(payload)).unwrap();

      // Changing the password invalidates all tokens server-side, so the
      // current session is dead. Log out and send the user to login to
      // re-authenticate (avoids the 400s from using a revoked token).
      showToast.success("Password changed successfully. Please sign in again.");
      handleClose();
      clearToken();
      clearUserInfo();
      router.replace(ROUTES.AUTH.LOGIN);
    } catch (error: any) {
      console.error("Error changing password:", error);
      showToast.error(error || "Failed to change password");
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 flex flex-col">
        {/* Header */}
        <FormHeader
          title="Change Password"
          description="Update your password to keep your account secure"
          showAvatar={false}
          isCreate={true}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Body */}
          <FormBody>
            {/* Error Display */}
            {reduxError && (
              <div className="p-[0.65rem] bg-destructive/10 border border-destructive rounded-[0.325rem]">
                <p className="text-[11px] text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-[0.65rem]">
              {/* Current Password */}
              <TextField
                control={control}
                name="currentPassword"
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                disabled={isSubmitting}
                required
                error={errors.currentPassword}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-[0.65rem] w-[0.65rem]" />
                    ) : (
                      <Eye className="h-[0.65rem] w-[0.65rem]" />
                    )}
                  </button>
                }
              />

              {/* New Password */}
              <TextField
                control={control}
                name="newPassword"
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password"
                disabled={isSubmitting}
                required
                error={errors.newPassword}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-[0.65rem] w-[0.65rem]" />
                    ) : (
                      <Eye className="h-[0.65rem] w-[0.65rem]" />
                    )}
                  </button>
                }
              />

              {/* Confirm Password */}
              <TextField
                control={control}
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                disabled={isSubmitting}
                required
                error={errors.confirmPassword}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-[0.65rem] w-[0.65rem]" />
                    ) : (
                      <Eye className="h-[0.65rem] w-[0.65rem]" />
                    )}
                  </button>
                }
              />
            </div>
          </FormBody>

          {/* Footer */}
          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={true}
            createMessage="Changing password..."
            updateMessage=""
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />

            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={true}
              createText="Change Password"
              updateText=""
              submittingCreateText="Changing..."
              submittingUpdateText=""
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
