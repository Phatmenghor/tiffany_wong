"use client";

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextAreaField } from "@/components/shared/form-field/textarea-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  selectError,
  selectOperations,
} from "../store/selectors/banner-selector";
import {
  CreateBannerData,
  createBannerSchema,
  updateBannerSchema,
} from "../store/models/schema/banner-schema";
import {
  createBannerService,
  updateBannerService,
} from "../store/thunks/banner-thunks";
import { clearError, clearSelectedBanner } from "../store/slice/banner-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { BannerResponseModel } from "../store/models/response/banner-response";

type Props = {
  mode: ModalMode;
  banner?: BannerResponseModel | null;
  onClose: () => void;
  isOpen: boolean;
};

export default function BannerModal({
  isOpen,
  onClose,
  banner,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateBannerData>({
    resolver: zodResolver(isCreate ? createBannerSchema : updateBannerSchema),
    defaultValues: {
      imageUrl: "",
      description: "",
      linkUrl: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      if (isCreate) {
        reset({
          imageUrl: "",
          description: "",
          linkUrl: "",
          status: Status.ACTIVE,
        });
      } else if (banner) {
        reset({
          imageUrl: banner.imageUrl || "",
          description: banner.description || "",
          linkUrl: banner.linkUrl || "",
          status: banner.status || "",
        });
      }
    }
  }, [isOpen, banner, isCreate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateBannerData) => {
    try {
      const payload = {
        imageUrl: data.imageUrl,
        description: data.description || "",
        linkUrl: data.linkUrl || "",
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createBannerService(payload)).unwrap();
        showToast.success("Banner created successfully");
        handleClose();
      } else {
        if (!banner?.id) return;
        await dispatch(
          updateBannerService({ id: banner.id, payload }),
        ).unwrap();
        showToast.success("Banner updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} banner`,
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedBanner());
    onClose();
  };

  const isProcessing = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Banner" : "Edit Banner"}
          description={
            isCreate
              ? "Upload an image and configure banner settings"
              : "Update banner information below"
          }
          isCreate={isCreate}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
            <FormBody>
              {/* Display Redux errors */}
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Banner Image Section */}
                <div className="space-y-3">
                  <SpacesImageUpload
                    label="Banner Image"
                    value={imageUrl}
                    onChange={(url) => setValue("imageUrl", url)}
                    aspectRatio="banner"
                    required
                    error={errors.imageUrl}
                    placeholder="Click to upload banner image"
                    disabled={isProcessing}
                  />
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Banner Details
                  </h3>

                  {/* Banner Description */}
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <TextAreaField
                      control={control}
                      name="description"
                      label="Description"
                      placeholder="Enter banner description (optional)"
                      disabled={isProcessing}
                      error={errors.description}
                      rows={3}
                    />
                  </div>

                  {/* Link & Status Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="linkUrl"
                      label="Link URL"
                      type="url"
                      placeholder="https://example.com (optional)"
                      disabled={isProcessing}
                      error={errors.linkUrl}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={BANNER_STATUS_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.status}
                    />
                  </div>
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating banner..."
              updateMessage="Updating banner..."
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Banner"
                updateText="Update Banner"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
              />
            </FormFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
