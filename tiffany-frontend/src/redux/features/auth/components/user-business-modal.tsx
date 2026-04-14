"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import {
  CreateUserRequest,
  UpdateUserRequest,
} from "../store/models/request/users-request";
import {
  createUserSchema,
  updateUserSchema,
  UserFormData,
} from "../store/models/schema/user.schema";
import {
  fetchUserByIdService,
  createUserService,
  updateUserService,
} from "../store/thunks/users-thunks";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedUser } from "../store/slice/users-slice";
import {
  selectError,
  selectOperations,
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import {
  AccountStatus,
  ModalMode,
  UserGropeType,
} from "@/constants/status/status";
import {
  ACCOUNT_STATUS_CREATE_UPDATE,
  USER_BUSINESS_ROLE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { Loading } from "@/components/shared/common/loading";
import {
  GENDER_OPTIONS,
} from "@/constants/form-options";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";

type Props = {
  mode: ModalMode;
  userId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function UserBusinessModal({
  isOpen,
  onClose,
  userId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const userData = useAppSelector(selectSelectedUser);
  const { isCreating, isUpdating } = operations;

  // Use static role options from constants
  const roleOptions = USER_BUSINESS_ROLE_CREATE_UPDATE;

  const {
    control: formControl,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      isCreate ? createUserSchema : updateUserSchema,
    ) as any,
    defaultValues: {
      id: "",
      userIdentifier: "",
      email: "",
      firstName: "",
      lastName: "",
      nickname: "",
      phoneNumber: "",
      password: "",
      userType: UserGropeType.OWNER,
      userRole: "",
      accountStatus: AccountStatus.ACTIVE,
      gender: "",
      dateOfBirth: "",
      profileImageUrl: "",
      remark: "",
    },
    mode: "onChange",
  });

  // Cast control to any for compatibility with field components
  const control = formControl as any;

  const userIdentifier = watch("userIdentifier");
  const email = watch("email");

  // Fetch user data for edit mode
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchUserByIdService(userId));

        if (fetchUserByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            id: data.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            nickname: data.nickname || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            accountStatus: data.accountStatus,
            userRole: data.userRole || "",
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            profileImageUrl: data.profileImageUrl || "",
            remark: data.remark || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user business data:", error);
      }
    };

    fetchUserData();
  }, [userId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        id: "",
        userIdentifier: "",
        email: "",
        firstName: "",
        lastName: "",
        nickname: "",
        phoneNumber: "",
        password: "",
        userType: UserGropeType.OWNER,
        userRole: "",
        accountStatus: AccountStatus.ACTIVE,
        gender: "",
        dateOfBirth: "",
        profileImageUrl: "",
        remark: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

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

      if (isCreate) {
        const payload: CreateUserRequest = {
          userIdentifier: data.userIdentifier!,
          email: data.email!,
          password: data.password!,
          firstName: data.firstName || undefined,
          lastName: data.lastName || undefined,
          nickname: data.nickname || undefined,
          phoneNumber: data.phoneNumber || undefined,
          userType: data.userType!,
          accountStatus: data.accountStatus,
          userRole: data.userRole,
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImageUrl: profileImageUrl || undefined,
          remark: data.remark || undefined,
        } as any;

        const result = await dispatch(createUserService(payload)).unwrap();
        showToast.user({
          title: 'User Account Created',
          message: `New user business account has been successfully created and is ready to use.`,
          details: {
            'Email': result.email,
            'Name': result.userIdentifier || result.firstName || 'N/A',
            'Status': data.accountStatus || 'ACTIVE',
            'Role': data.userRole || 'N/A',
            'Created At': new Date().toLocaleString(),
          },
          duration: 6000,
        });
        handleClose();
      } else {
        const payload: UpdateUserRequest = {
          firstName: data.firstName || undefined,
          lastName: data.lastName || undefined,
          email: data.email || undefined,
          nickname: data.nickname || undefined,
          phoneNumber: data.phoneNumber || undefined,
          accountStatus: data.accountStatus,
          userRole: data.userRole,
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImageUrl: profileImageUrl || undefined,
          remark: data.remark || undefined,
        } as any;

        const result = await dispatch(
          updateUserService({ userId: data.id, userData: payload }),
        ).unwrap();
        showToast.user({
          title: 'User Account Updated',
          message: `User business account has been successfully updated with new information.`,
          details: {
            'Email': result.email || data.email,
            'Name': result.fullName || data.firstName || 'N/A',
            'Status': data.accountStatus || 'ACTIVE',
            'Role': data.userRole || 'N/A',
            'Updated At': new Date().toLocaleString(),
          },
          duration: 6000,
        });
        handleClose();
      }
    } catch (error: any) {
      showToast.error({
        title: `Failed to ${isCreate ? 'Create' : 'Update'} User`,
        message: error?.message || `Unable to ${isCreate ? 'create' : 'update'} user business account. Please try again.`,
        details: {
          'Email': data.email || 'N/A',
          'Action': isCreate ? 'CREATE' : 'UPDATE',
          'Attempted At': new Date().toLocaleString(),
          'Error': error?.message?.substring(0, 50) || 'Unknown error',
        },
        duration: 7000,
      });
    }
  };

  const handleClose = () => {
    reset();
    setShowPassword(false);
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = (isCreate ? isCreating : isUpdating) || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New User Business" : "Edit User Business"}
          description={
            isCreate
              ? "Fill out the form to create a new user business account"
              : "Update user business information below"
          }
          avatarName={userIdentifier || email}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Account Credentials - CREATE MODE */}
                {isCreate && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Account Credentials <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        control={control}
                        name="userIdentifier"
                        label="User Identifier"
                        placeholder="Enter user identifier"
                        required
                        disabled={isSubmitting}
                        error={errors.userIdentifier}
                      />

                      <TextField
                        control={control}
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        required
                        disabled={isSubmitting}
                        error={errors.email}
                      />

                      <TextField
                        control={control}
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        required
                        disabled={isSubmitting}
                        error={errors.password}
                      />

                      <SelectField
                        control={control}
                        name="userRole"
                        label="User Role"
                        placeholder="Select user role"
                        options={roleOptions}
                        required
                        disabled={isSubmitting || roleOptions.length === 0}
                        error={errors.userRole}
                      />

                      <SelectField
                        control={control}
                        name="accountStatus"
                        label="Account Status"
                        placeholder="Select account status"
                        options={ACCOUNT_STATUS_CREATE_UPDATE}
                        required
                        disabled={isSubmitting}
                        error={errors.accountStatus}
                      />
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    {/* User Role and Account Status - EDIT MODE ONLY */}
                    {!isCreate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                          control={control}
                          name="userRole"
                          label="User Role"
                          placeholder="Select user role"
                          options={roleOptions}
                          required
                          disabled={isSubmitting || roleOptions.length === 0}
                          error={errors.userRole}
                        />

                        <SelectField
                          control={control}
                          name="accountStatus"
                          label="Account Status"
                          placeholder="Select account status"
                          options={ACCOUNT_STATUS_CREATE_UPDATE}
                          required
                          disabled={isSubmitting}
                          error={errors.accountStatus}
                        />
                      </div>
                    )}

                    {/* Personal Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        control={control}
                        name="firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        disabled={isSubmitting}
                        error={errors.firstName}
                      />

                      <TextField
                        control={control}
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        disabled={isSubmitting}
                        error={errors.lastName}
                      />

                      <TextField
                        control={control}
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        disabled={isSubmitting}
                        error={errors.email}
                      />

                      <TextField
                        control={control}
                        name="phoneNumber"
                        label="Phone Number"
                        placeholder="Enter phone number"
                        disabled={isSubmitting}
                        error={errors.phoneNumber}
                      />

                      <TextField
                        control={control}
                        name="nickname"
                        label="Nickname"
                        placeholder="Enter nickname"
                        disabled={isSubmitting}
                        error={errors.nickname}
                      />

                      <SelectField
                        control={control}
                        name="gender"
                        label="Gender"
                        placeholder="Select gender"
                        options={GENDER_OPTIONS}
                        disabled={isSubmitting}
                        error={errors.gender}
                      />

                      <DateTimePickerField
                        control={control}
                        name="dateOfBirth"
                        label="Date of Birth"
                        mode="date"
                        placeholder="Select date of birth"
                        disabled={isSubmitting}
                        error={errors.dateOfBirth}
                      />

                      <ClickableImageUpload
                        label="Profile Image"
                        value={watch("profileImageUrl") || ""}
                        onChange={(base64) =>
                          setValue("profileImageUrl", base64, {
                            shouldDirty: true,
                          })
                        }
                        aspectRatio="square"
                        height="h-40"
                        maxSize={5}
                        disabled={isSubmitting}
                        error={errors.profileImageUrl as any}
                      />
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-4">
                  <TextareaField
                    control={control}
                    name="remark"
                    label="Remarks"
                    placeholder="Enter any remarks"
                    rows={3}
                    disabled={isSubmitting}
                    error={errors.remark}
                  />
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage={
                isUploadingImage ? "Uploading files..." : "Creating user..."
              }
              updateMessage={
                isUploadingImage ? "Uploading files..." : "Updating user..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create User"
                updateText="Update User"
                submittingCreateText={
                  isUploadingImage ? "Uploading..." : "Creating..."
                }
                submittingUpdateText={
                  isUploadingImage ? "Uploading..." : "Updating..."
                }
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
