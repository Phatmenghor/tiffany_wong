"use client";

import React, { useRef, useState } from "react";
import { FieldErrors, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { ProductFormData } from "../../store/models/schema/product-schema";
import { uploadToSpaces } from "@/services/spaces-service";
import { showToast } from "@/components/shared/common/show-toast";

const MAX_PRODUCT_IMAGES = 5;

interface ProductImagesGalleryProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  isProcessing: boolean;
  imageFields: any[];
  onAddImages: (urls: string[]) => void;
  onRemoveImage: (index: number) => void;
  onImageChange: (index: number, url: string) => void;
  watch: any;
}

export function ProductImagesGallery({
  control,
  errors,
  isProcessing,
  imageFields,
  onAddImages,
  onRemoveImage,
  onImageChange,
  watch,
}: ProductImagesGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const canAddMore = imageFields.length < MAX_PRODUCT_IMAGES;

  const handleMultiUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (imageFields.length >= MAX_PRODUCT_IMAGES) {
      showToast.error(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
      event.target.value = "";
      return;
    }

    const availableSlots = MAX_PRODUCT_IMAGES - imageFields.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    if (files.length > availableSlots) {
      showToast.warning(
        `Only ${availableSlots} slot${availableSlots > 1 ? "s" : ""} remaining. Processing first ${availableSlots} image${availableSlots > 1 ? "s" : ""}.`,
      );
    }

    setIsUploadingBatch(true);
    try {
      const maxSize = 5 * 1024 * 1024;
      const results = await Promise.all(
        filesToProcess.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            return { success: false, error: `${file.name} is not an image` };
          }
          if (file.size > maxSize) {
            return { success: false, error: `${file.name} exceeds 5MB` };
          }
          try {
            const result = await uploadToSpaces(file);
            return { success: true, url: result.url };
          } catch {
            return { success: false, error: `Failed to upload ${file.name}` };
          }
        }),
      );

      const successUrls = results
        .filter((r): r is { success: true; url: string } => r.success)
        .map((r) => r.url);

      const failedCount = results.filter((r) => !r.success).length;

      if (successUrls.length > 0) {
        onAddImages(successUrls);
        showToast.success(
          `Added ${successUrls.length} image${successUrls.length > 1 ? "s" : ""}`,
        );
      }

      if (failedCount > 0) {
        showToast.error(`${failedCount} image(s) failed to upload`);
      }
    } catch {
      showToast.error("Failed to process images");
    } finally {
      setIsUploadingBatch(false);
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Images</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {imageFields.length > 0
                ? `${imageFields.length}/${MAX_PRODUCT_IMAGES} images uploaded`
                : `Upload up to ${MAX_PRODUCT_IMAGES} product images`}
            </p>
          </div>
          {canAddMore && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultiUpload}
                className="hidden"
                disabled={isProcessing || isUploadingBatch}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isUploadingBatch}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isUploadingBatch ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {imageFields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
              No images uploaded yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
            {imageFields.map((field, index) => (
              <div
                key={field.id}
                className="relative aspect-square rounded-md overflow-hidden border bg-muted"
              >
                <div className="w-full h-full">
                  <SpacesImageUpload
                    label=""
                    value={watch(`images.${index}.imageUrl`) || ""}
                    onChange={(url) => {
                      if (url === "") {
                        onRemoveImage(index);
                      } else {
                        onImageChange(index, url);
                      }
                    }}
                    aspectRatio="square"
                    height="h-full"
                    maxSize={5}
                    disabled={isProcessing}
                    error={errors.images?.[index]?.imageUrl as any}
                    showPreviewText={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
