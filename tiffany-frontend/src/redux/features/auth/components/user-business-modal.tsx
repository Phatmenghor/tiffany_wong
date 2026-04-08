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
import { useAppDispatch, useAppSelector } from "@/redux/store";
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
        showToast.success(
          `User business "${
            result.userIdentifier || result.email
          }" created successfully`,
        );
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
        showToast.success(
          `User business "${
            result.fullName || result.email
          }" updated successfully`,
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} user business`,
      );
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
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 flex flex-col">
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
                {/* Account Credentials & Roles - CREATE MODE */}
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
                        error={getFieldError(errors, "userRole")}
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
                    Personal Information <span className="text-red-500">*</span>
                  </h3>
                  <div className="space-y-4">
                    {/* User Role and Account Status - EDIT MODE ONLY (Top) */}
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
                          error={getFieldError(errors, "userRole")}
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
                    </div>
                  </div>
                </div>


                {/* Emergency Contacts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                      <p className="text-sm text-muted-foreground">
                        {contactFields.length > 0
                          ? `${contactFields.length} contact${
                              contactFields.length > 1 ? "s" : ""
                            } added`
                          : "No emergency contacts added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendContact({
                          id: undefined,
                          name: "",
                          phone: "",
                          relationship: "",
                        })
                      }
                      disabled={isSubmitting}
                      className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>

                  {contactFields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        No emergency contacts added
                      </p>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {contactFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="border rounded-lg p-4 relative lg:col-span-2"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <TextField
                                  control={control}
                                  name={`emergencyContacts.${index}.name`}
                                  label="Contact Name"
                                  placeholder="Name"
                                  disabled={isSubmitting}
                                  error={
                                    errors.emergencyContacts?.[index]?.name as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`emergencyContacts.${index}.phone`}
                                  label="Phone Number"
                                  placeholder="Phone"
                                  disabled={isSubmitting}
                                  error={
                                    errors.emergencyContacts?.[index]?.phone as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`emergencyContacts.${index}.relationship`}
                                  label="Relationship"
                                  placeholder="Relationship"
                                  disabled={isSubmitting}
                                  error={
                                    errors.emergencyContacts?.[index]
                                      ?.relationship as any
                                  }
                                />
                              </div>
                              {!isSubmitting && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                                  onClick={() => removeContact(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Documents</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendDocument({
                            id: undefined,
                            type: DocumentType.ID_CARD,
                            number: "",
                            fileUrl: "",
                          })
                        }
                        disabled={isSubmitting}
                        className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>

                  {documentFields.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No documents added
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {documentFields.map((field, index) => (
                            <div key={field.id} className="border rounded-lg p-4 relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(index)}
                                disabled={isSubmitting}
                                className="h-6 w-6 p-0 absolute top-2 right-2 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <SelectField
                                    control={control}
                                    name={`documents.${index}.type`}
                                    label="Type"
                                    placeholder="Type"
                                    options={DOCUMENT_TYPE_OPTIONS}
                                    disabled={isSubmitting}
                                    error={
                                      errors.documents?.[index]?.type as any
                                    }
                                  />
                                  <TextField
                                    control={control}
                                    name={`documents.${index}.number`}
                                    label="Document No"
                                    placeholder="No"
                                    disabled={isSubmitting}
                                    error={
                                      errors.documents?.[index]?.number as any
                                    }
                                  />
                                </div>
                                <div className="w-1/2">
                                  <ClickableImageUpload
                                    label="File"
                                    value={
                                      watch(`documents.${index}.fileUrl`) || ""
                                    }
                                    onChange={(base64) =>
                                      setValue(
                                        `documents.${index}.fileUrl`,
                                        base64,
                                        { shouldDirty: true },
                                      )
                                    }
                                    aspectRatio="auto"
                                    height="h-40"
                                    maxSize={5}
                                    disabled={isSubmitting}
                                    error={
                                      errors.documents?.[index]?.fileUrl as any
                                    }
                                    placeholder="Upload"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Education</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendEducation({
                            id: undefined,
                            level: EducationLevel.HIGH_SCHOOL,
                            schoolName: "",
                            fieldOfStudy: "",
                            startYear: "",
                            endYear: "",
                            isGraduated: false,
                            certificateUrl: "",
                          })
                        }
                        disabled={isSubmitting}
                        className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                  {educationFields.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No education added
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {educationFields.map((field, index) => (
                            <div key={field.id} className="border rounded-lg p-4 relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(index)}
                                disabled={isSubmitting}
                                className="h-6 w-6 p-0 absolute top-2 right-2 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <SelectField
                                    control={control}
                                    name={`educations.${index}.level`}
                                    label="Level"
                                    placeholder="Level"
                                    options={EDUCATION_LEVEL_OPTIONS}
                                    disabled={isSubmitting}
                                    error={
                                      errors.educations?.[index]?.level as any
                                    }
                                  />
                                  <TextField
                                    control={control}
                                    name={`educations.${index}.schoolName`}
                                    label="School"
                                    placeholder="School"
                                    disabled={isSubmitting}
                                    error={
                                      errors.educations?.[index]
                                        ?.schoolName as any
                                    }
                                  />
                                  <TextField
                                    control={control}
                                    name={`educations.${index}.fieldOfStudy`}
                                    label="Field"
                                    placeholder="Field"
                                    disabled={isSubmitting}
                                    error={
                                      errors.educations?.[index]
                                        ?.fieldOfStudy as any
                                    }
                                  />
                                  <DateTimePickerField
                                    control={control}
                                    name={`educations.${index}.startYear`}
                                    label="Start"
                                    mode="date"
                                    placeholder="Start"
                                    disabled={isSubmitting}
                                    error={
                                      errors.educations?.[index]
                                        ?.startYear as any
                                    }
                                  />
                                  <DateTimePickerField
                                    control={control}
                                    name={`educations.${index}.endYear`}
                                    label="End"
                                    mode="date"
                                    placeholder="End"
                                    disabled={isSubmitting}
                                    error={
                                      errors.educations?.[index]?.endYear as any
                                    }
                                  />
                                  <SelectField
                                    control={control}
                                    name={`educations.${index}.isGraduated`}
                                    label="Graduated"
                                    placeholder="Select status"
                                    options={[
                                      { label: "Yes", value: "true" },
                                      { label: "No", value: "false" },
                                    ]}
                                    disabled={isSubmitting}
                                    error={
                                      errors.educations?.[index]?.isGraduated as any
                                    }
                                  />
                                </div>
                                <div className="w-1/2">
                                  <ClickableImageUpload
                                    label="Certificate"
                                    value={
                                      watch(`educations.${index}.certificateUrl`) ||
                                      ""
                                    }
                                    onChange={(base64) =>
                                      setValue(
                                        `educations.${index}.certificateUrl`,
                                        base64,
                                        { shouldDirty: true },
                                      )
                                    }
                                    aspectRatio="auto"
                                    height="h-40"
                                    maxSize={5}
                                    disabled={isSubmitting}
                                    error={
                                      errors.educations?.[index]
                                        ?.certificateUrl as any
                                    }
                                    placeholder="Upload"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Additional Notes */}
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
