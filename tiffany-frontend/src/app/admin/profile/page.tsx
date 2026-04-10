"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit,
  Loader2,
  Trash2,
  Lock,
  User,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
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

// Profile update schema
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
  const [activeSection, setActiveSection] = useState<"profile" | "security">(
    "profile"
  );

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

  // Type assertion for control to fix TypeScript compatibility
  const typedControl = control as any;

  // Load profile on mount (only if not already loaded or loading)
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

  // Clear errors when they appear
  useEffect(() => {
    if (reduxError) {
      showToast.error(reduxError);
      dispatch(clearError());
    }
  }, [reduxError, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsUploadingImage(true);

      // Process profile image URL
      let profileImageUrl = data.profileImageUrl;
      if (profileImageUrl && isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
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
      if (profileImageUrl) payload.profileImageUrl = profileImageUrl;
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

      // First upload the base64 image to CDN/storage
      let profileImageUrl = imageData;
      if (isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch (error) {
          console.error("Failed to upload image to CDN:", error);
          showToast.error("Failed to upload image");
          setIsUploadingImage(false);
          return;
        }
      }

      // Update form with the CDN URL
      setValue("profileImageUrl", profileImageUrl, {
        shouldDirty: true,
      });

      // Send only the URL to API
      const payload = {
        profileImageUrl,
      };

      const updatedProfile = await dispatch(updateProfileService(payload)).unwrap();

      // Reload profile to ensure we have the latest from server
      const freshProfile = await dispatch(getProfileService()).unwrap();

      showToast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      showToast.error(error || "Failed to update profile picture");
      // Reset the form value on error
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

  const handleRemoveProfilePicture = async () => {
    try {
      setIsUploadingImage(true);

      // Send request to remove profile picture
      const payload = {
        profileImageUrl: "",
      };

      const updatedProfile = await dispatch(updateProfileService(payload)).unwrap();

      // Reload profile to ensure we have the latest from server
      const freshProfile = await dispatch(getProfileService()).unwrap();

      // Clear form value
      setValue("profileImageUrl", "");

      showToast.success("Profile picture removed successfully");
    } catch (error: any) {
      console.error("Error removing profile picture:", error);
      showToast.error(error || "Failed to remove profile picture");
    } finally {
      setIsUploadingImage(false);
      setIsProfilePictureModalOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccountService()).unwrap();
      showToast.success("Account deleted successfully");

      clearToken();
      clearUserInfo();

      setTimeout(() => {
        router.replace(ROUTES.AUTH.LOGIN);
      }, 100);
    } catch (error: any) {
      showToast.error(error || "Failed to delete account");
    }
  };

  if (isProfileLoading && !userProfile) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        {/* Profile Header */}
        <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {/* Profile Image - Camera Icon */}
              <div
                className="relative group cursor-pointer"
                onClick={() => setIsProfilePictureModalOpen(true)}
              >
                <div className="relative ring-2 ring-primary/20 rounded-2xl">
                  <CustomAvatar
                    imageUrl={userProfile?.profileImageUrl || undefined}
                    name={userProfile?.fullName}
                    size="xxl"
                  />
                  {/* Camera Icon Overlay - Auto show on hover */}
                  <div className="absolute bottom-1 right-1 bg-primary rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-primary/50 hover:bg-primary/80">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {userProfile?.fullName}
                    </h2>
                    <p className="text-primary/70 text-sm font-medium">
                      {userProfile?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                        {userProfile?.userType}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isProfileLoading || isUploadingImage}
                          className="border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSubmit(onSubmit)}
                          disabled={
                            isProfileLoading ||
                            isUploadingImage ||
                            !isDirty
                          }
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isProfileLoading || isUploadingImage ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {isUploadingImage ? "Uploading..." : "Saving..."}
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs - Premium Clean Design */}
        <div className="flex gap-0 mb-8 w-full relative group border border-primary/30 rounded-xl overflow-hidden">
          {/* Background indicator */}
          <div
            className={cn(
              "absolute inset-y-0 h-full bg-primary/5 transition-all duration-500 ease-out",
              activeSection === "profile" ? "left-0 w-1/2" : "left-1/2 w-1/2"
            )}
          />

          {/* Center divider line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />

          {/* Profile Tab */}
          <button
            onClick={() => setActiveSection("profile")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2.5 py-4 px-6 relative z-10",
              "text-sm font-semibold transition-all duration-300",
              "border-r border-primary/20",
              activeSection === "profile"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <User className={cn(
              "h-4 w-4 transition-all duration-300",
              activeSection === "profile" ? "scale-110" : "scale-100"
            )} />
            <span>Profile</span>
          </button>

          {/* Security Tab */}
          <button
            onClick={() => setActiveSection("security")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2.5 py-4 px-6 relative z-10",
              "text-sm font-semibold transition-all duration-300",
              activeSection === "security"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <Lock className={cn(
              "h-4 w-4 transition-all duration-300",
              activeSection === "security" ? "scale-110" : "scale-100"
            )} />
            <span>Security</span>
          </button>
        </div>

        {/* Profile Section */}
        {activeSection === "profile" && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <TextField
                          control={typedControl}
                          name="firstName"
                          label="First Name"
                          placeholder="First name"
                          error={errors.firstName}
                        />

                        <TextField
                          control={typedControl}
                          name="lastName"
                          label="Last Name"
                          placeholder="Last name"
                          error={errors.lastName}
                        />

                        <TextField
                          control={typedControl}
                          name="nickname"
                          label="Nickname"
                          placeholder="Nickname"
                          error={errors.nickname}
                        />

                        <TextField
                          control={typedControl}
                          name="email"
                          label="Email"
                          placeholder="Email"
                          type="email"
                          error={errors.email}
                        />

                        <TextField
                          control={typedControl}
                          name="phoneNumber"
                          label="Phone Number"
                          placeholder="Phone"
                          error={errors.phoneNumber}
                        />

                        <SelectField
                          control={typedControl}
                          name="gender"
                          label="Gender"
                          placeholder="Select gender"
                          options={GENDER_OPTIONS}
                          error={errors.gender}
                        />

                        <DateTimePickerField
                          control={typedControl}
                          name="dateOfBirth"
                          label="Date of Birth"
                          mode="date"
                          placeholder="Date of birth"
                          error={errors.dateOfBirth}
                        />

                        <TextareaField
                          control={typedControl}
                          name="remark"
                          label="Remark"
                          placeholder="Add any additional notes"
                          error={errors.remark}
                        />
                      </>
                    ) : (
                      <>
                        <DisplayField label="First Name" value={watch("firstName")} />
                        <DisplayField label="Last Name" value={watch("lastName")} />
                        <DisplayField label="Nickname" value={watch("nickname")} />
                        <DisplayField label="Email" value={watch("email")} />
                        <DisplayField label="Phone Number" value={watch("phoneNumber")} />
                        <DisplayField
                          label="Gender"
                          value={
                            GENDER_OPTIONS.find((o) => o.value === watch("gender"))?.label
                          }
                        />
                        <DisplayField label="Date of Birth" value={watch("dateOfBirth")} />
                        <DisplayField
                          label="Account Status"
                          value={userProfile?.accountStatus || "-"}
                        />
                        <DisplayField
                          label="User Role"
                          value={userProfile?.userRole || "-"}
                        />
                        <DisplayField label="Remark" value={watch("remark")} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        )}

        {/* Security Section */}
        {activeSection === "security" && (
          <div className="w-full space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-end">
                <p className="text-sm text-muted-foreground mb-4 w-full">
                  Update your password to keep your account secure.
                </p>
                <Button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-end">
                <p className="text-sm text-muted-foreground mb-4 w-full">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          open={isChangePasswordModalOpen}
          onOpenChange={setIsChangePasswordModalOpen}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteConfirmationModal
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          description="Are you sure you want to delete your account? This action cannot be undone."
          isLoading={isProfileLoading}
        />
      )}

      {isProfilePictureModalOpen && (
        <ProfilePictureModal
          open={isProfilePictureModalOpen}
          onOpenChange={setIsProfilePictureModalOpen}
          onImageCapture={handleAutoUploadProfilePicture}
          onImageRemove={handleRemoveProfilePicture}
          currentImageUrl={userProfile?.profileImageUrl || undefined}
          userName={userProfile?.fullName}
          isLoading={isUploadingImage}
        />
      )}
    </div>
  );
}
