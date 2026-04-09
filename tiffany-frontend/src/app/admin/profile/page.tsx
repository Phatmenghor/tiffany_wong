"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getProfileService,
  updateProfileService,
  deleteAccountService,
} from "@/redux/features/auth/store/thunks/auth-thunks";
import {
  selectProfile,
  selectIsProfileLoading,
  selectError,
} from "@/redux/features/auth/store/selectors/auth-selectors";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError } from "@/redux/features/auth/store/slice/auth-slice";
import ChangePasswordModal from "@/components/shared/modal/change-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ProfilePictureModal } from "@/components/shared/modal/profile-picture-modal";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { clearToken } from "@/utils/local-storage/token";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { isBase64Image, uploadImage } from "@/utils/common/upload-image";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import Link from "next/link";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { GENDER_OPTIONS } from "@/constants/form-options";
import {
  updateUserSchema,
  UserFormData,
} from "@/redux/features/auth/store/models/schema/user.schema";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userProfile = useAppSelector(selectProfile);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: "",
      profileImageUrl: "",
      firstName: "",
      lastName: "",
      nickname: "",
      phoneNumber: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      remark: "",
    },
    mode: "onChange",
  });

  // Load profile on mount
  useEffect(() => {
    if (!userProfile && !isProfileLoading) {
      dispatch(getProfileService());
    }
  }, [dispatch, userProfile, isProfileLoading]);

  // Update form when profile loads
  useEffect(() => {
    if (userProfile) {
      reset({
        id: userProfile.id || "",
        profileImageUrl: userProfile.profileImageUrl || "",
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        nickname: userProfile.nickname || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        remark: userProfile.remark || "",
      });
    }
  }, [userProfile, reset]);

  const profileImageUrl = watch("profileImageUrl");

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsUploadingImage(true);

      // Upload profile image if it's base64
      let uploadedImageUrl = profileImageUrl;
      if (profileImageUrl && isBase64Image(profileImageUrl)) {
        try {
          uploadedImageUrl = await uploadImage(profileImageUrl);
        } catch (error) {
          console.error("Failed to upload profile image:", error);
          showToast.error("Failed to upload profile image");
          setIsUploadingImage(false);
          return;
        }
      }

      setIsUploadingImage(false);

      // Build payload with only backend-supported fields
      const payload: any = {};

      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;
      if (data.phoneNumber) payload.phoneNumber = data.phoneNumber;
      if (data.email) payload.email = data.email;
      if (data.nickname) payload.nickname = data.nickname;
      if (data.gender) payload.gender = data.gender;
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
      if (uploadedImageUrl) payload.profileImageUrl = uploadedImageUrl;
      if (data.remark) payload.remark = data.remark;

      const updatedProfile = await dispatch(updateProfileService(payload)).unwrap();

      // Reload profile data
      await dispatch(getProfileService()).unwrap();

      showToast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast.error(error || "Failed to update profile");
      setIsUploadingImage(false);
    }
  };

  const handleAutoUploadProfilePicture = async (imageData: string) => {
    try {
      setIsUploadingImage(true);

      let profileImageUrl = imageData;
      if (isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch (error) {
          console.error("Failed to upload image:", error);
          showToast.error("Failed to upload image");
          setIsUploadingImage(false);
          return;
        }
      }

      setValue("profileImageUrl", profileImageUrl, {
        shouldDirty: true,
      });

      const payload = {
        profileImageUrl,
      };

      await dispatch(updateProfileService(payload)).unwrap();
      await dispatch(getProfileService()).unwrap();

      showToast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      showToast.error(error || "Failed to update profile picture");
      if (userProfile?.profileImageUrl) {
        setValue("profileImageUrl", userProfile.profileImageUrl);
      }
    } finally {
      setIsUploadingImage(false);
      setIsProfilePictureModalOpen(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      reset({
        id: userProfile.id || "",
        profileImageUrl: userProfile.profileImageUrl || "",
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        nickname: userProfile.nickname || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        remark: userProfile.remark || "",
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccountService()).unwrap();
      clearToken();
      clearUserInfo();
      showToast.success("Account deleted successfully");
      router.push(ROUTES.LOGIN);
    } catch (error: any) {
      showToast.error(error || "Failed to delete account");
    }
  };

  if (isProfileLoading && !userProfile) {
    return <Loading />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account information
            </p>
          </div>
          <Button
            variant={isEditing ? "destructive" : "default"}
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            className="gap-2"
          >
            {isEditing ? "Cancel" : <Edit className="h-4 w-4" />}
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <CustomAvatar
                  src={profileImageUrl || userProfile?.profileImageUrl}
                  alt={userProfile?.firstName || "Profile"}
                  initials={
                    (userProfile?.firstName?.charAt(0) || "") +
                    (userProfile?.lastName?.charAt(0) || "")
                  }
                  className="h-20 w-20"
                />
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Change Picture"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="firstName"
                      label="First Name"
                      placeholder="First Name"
                      error={errors.firstName}
                    />
                    <TextField
                      control={control}
                      name="lastName"
                      label="Last Name"
                      placeholder="Last Name"
                      error={errors.lastName}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="email"
                      label="Email"
                      placeholder="Email"
                      type="email"
                      error={errors.email}
                    />
                    <TextField
                      control={control}
                      name="phoneNumber"
                      label="Phone Number"
                      placeholder="Phone Number"
                      error={errors.phoneNumber}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DisplayField
                    label="First Name"
                    value={userProfile?.firstName}
                  />
                  <DisplayField label="Last Name" value={userProfile?.lastName} />
                  <DisplayField label="Email" value={userProfile?.email} />
                  <DisplayField
                    label="Phone Number"
                    value={userProfile?.phoneNumber}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="nickname"
                      label="Nickname"
                      placeholder="Nickname"
                      error={errors.nickname}
                    />
                    <SelectField
                      control={control}
                      name="gender"
                      label="Gender"
                      placeholder="Select gender"
                      options={GENDER_OPTIONS}
                      error={errors.gender}
                    />
                  </div>
                  <DateTimePickerField
                    control={control}
                    name="dateOfBirth"
                    label="Date of Birth"
                    mode="date"
                    placeholder="Date of Birth"
                    error={errors.dateOfBirth}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DisplayField label="Nickname" value={userProfile?.nickname} />
                  <DisplayField label="Gender" value={userProfile?.gender} />
                  <DisplayField
                    label="Date of Birth"
                    value={userProfile?.dateOfBirth}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DisplayField label="Account Status" value={userProfile?.accountStatus} />
                <DisplayField label="User Role" value={userProfile?.userRole} />
                <DisplayField label="User Type" value={userProfile?.userType} />
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <TextareaField
                  control={control}
                  name="remark"
                  label="Remarks"
                  placeholder="Add any additional information..."
                  error={errors.remark}
                />
              ) : (
                <DisplayField label="Remarks" value={userProfile?.remark} />
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          {isEditing && (
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}

          {/* Security Section */}
          {!isEditing && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-500" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="w-full justify-start gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full justify-start gap-2"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>

      {/* Modals */}
      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        onImageSelected={handleAutoUploadProfilePicture}
        isUploading={isUploadingImage}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone."
        itemName="Account"
      />
    </div>
  );
}
