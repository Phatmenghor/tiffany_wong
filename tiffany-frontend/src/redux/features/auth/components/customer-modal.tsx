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
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { isBase64Image, uploadBase64ToSpaces } from "@/services/spaces-service";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import {
  UpdateUserRequest,
} from "../store/models/request/users-request";
import {
  updateUserSchema,
  UserFormData,
} from "../store/models/schema/user.schema";
import {
  fetchUserByIdService,
  updateUserService,
} from "../store/thunks/users-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedUser } from "../store/slice/users-slice";
import {
  selectError,
  selectOperations,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { AccountStatus } from "@/constants/status/status";
import { ACCOUNT_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { Loading } from "@/components/shared/common/loading";
import { GENDER_OPTIONS } from "@/constants/form-options";

type Props = {
  userId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function CustomerModal({ isOpen, onClose, userId }: Props) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isUpdating } = operations;

  const {
    control: formControl,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(updateUserSchema) as any,
    defaultValues: {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      nickname: "",
      phoneNumber: "",
      accountStatus: AccountStatus.ACTIVE,
      gender: "",
      dateOfBirth: "",
      profileImageUrl: "",
      remark: "",
    },
    mode: "onChange",
  });

  const control = formControl as any;

  const userIdentifier = watch("userIdentifier");
  const email = watch("email");

  // Fetch customer data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !isOpen) return;

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
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            profileImageUrl: data.profileImageUrl || "",
            remark: data.remark || "",
          });
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    fetchData();
  }, [userId, isOpen, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      let profileImageUrl = data.profileImageUrl;
      if (profileImageUrl && isBase64Image(profileImageUrl)) {
        setIsUploadingImage(true);
        try {
          profileImageUrl = await uploadBase64ToSpaces(profileImageUrl);
        } catch {
          showToast.error("Failed to upload profile image");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: UpdateUserRequest = {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        email: data.email || undefined,
        nickname: data.nickname || undefined,
        phoneNumber: data.phoneNumber || undefined,
        accountStatus: data.accountStatus,
        gender: data.gender || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        profileImageUrl: profileImageUrl || undefined,
        remark: data.remark || undefined,
      } as any;

      await dispatch(updateUserService({ userId: data.id, userData: payload })).unwrap();
      showToast.success("Customer updated successfully");
      handleClose();
    } catch (error: any) {
      showToast.error({
        title: "Failed to Update Customer",
        message: error?.message || "Unable to update customer account. Please try again.",
        details: {
          Email: data.email || "N/A",
          Action: "UPDATE",
          "Attempted At": new Date().toLocaleString(),
          Error: error?.message?.substring(0, 50) || "Unknown error",
        },
        duration: 7000,
      });
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = isUpdating || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title="Edit Customer"
          description="Update customer information below"
          avatarName={userIdentifier || email}
          isCreate={false}
        />

        {isFetchingDetail ? (
          <div className="p-[0.975rem] flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-[0.65rem] bg-destructive/10 border border-destructive rounded-[0.325rem] mb-[0.65rem]">
                  <p className="text-[11px] text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-[0.975rem]">
                {/* Personal Information */}
                <div className="space-y-[0.65rem]">
                  <h3 className="text-[13px] font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.65rem]">
                    <TextField
                      control={control}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter first name"
                      disabled={isSubmitting}
                      error={errors.firstName}
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
                      name="nickname"
                      label="Nickname"
                      placeholder="Enter nickname"
                      disabled={isSubmitting}
                      error={errors.nickname}
                    />

                    <TextField
                      control={control}
                      name="phoneNumber"
                      label="Phone Number"
                      placeholder="Enter phone number"
                      disabled={isSubmitting}
                      error={errors.phoneNumber}
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

                    <SpacesImageUpload
                      label="Profile Image"
                      value={watch("profileImageUrl") || ""}
                      onChange={(url) =>
                        setValue("profileImageUrl", url, { shouldDirty: true })
                      }
                      aspectRatio="square"
                      height="h-[6.5rem]"
                      maxSize={5}
                      disabled={isSubmitting}
                      error={errors.profileImageUrl as any}
                    />

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
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={false}
              updateMessage={isUploadingImage ? "Uploading image..." : "Updating customer..."}
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={false}
                updateText="Update Customer"
                submittingUpdateText={isUploadingImage ? "Uploading..." : "Updating..."}
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
