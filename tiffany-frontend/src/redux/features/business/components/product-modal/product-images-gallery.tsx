"use client";

import React, { useRef, useState } from "react";
import { FieldErrors, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { ProductFormData } from "../../store/models/schema/product-schema";
import { showToast } from "@/components/shared/common/show-toast";

const MAX_PRODUCT_IMAGES = 5;

interface ProductImagesGalleryProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  isProcessing: boolean;
  imageFields: any[];
  onAddImages: (base64s: string[]) => void;
  onRemoveImage: (index: number) => void;
  onImageChange: (index: number, base64: string) => void;
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
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
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

    setIsProcessingBatch(true);
    try {
      const maxSize = 5 * 1024 * 1024;

      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const results = await Promise.all(
        filesToProcess.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            return { success: false, error: `${file.name} is not an image` };
          }
          if (file.size > maxSize) {
            return { success: false, error: `${file.name} exceeds 5MB` };
          }
          try {
            const base64 = await toBase64(file);
            return { success: true, base64 };
          } catch {
            return { success: false, error: `Failed to read ${file.name}` };
          }
        }),
      );

      const successBase64s = results
        .filter((r): r is { success: true; base64: string } => r.success)
        .map((r) => r.base64);

      const failedCount = results.filter((r) => !r.success).length;

      if (successBase64s.length > 0) {
        onAddImages(successBase64s);
        showToast.success(
          `Added ${successBase64s.length} image${successBase64s.length > 1 ? "s" : ""}`,
        );
      }

      if (failedCount > 0) {
        showToast.error(`${failedCount} image(s) failed to load`);
      }
    } catch {
      showToast.error("Failed to process images");
    } finally {
      setIsProcessingBatch(false);
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Images</CardTitle>
            <p className="text-[0.4875rem] text-muted-foreground mt-[0.1625rem]">
              {imageFields.length > 0
                ? `${imageFields.length}/${MAX_PRODUCT_IMAGES} images added`
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
                disabled={isProcessing || isProcessingBatch}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isProcessingBatch}
              >
                <Plus className="h-[0.65rem] w-[0.65rem] mr-[0.325rem]" />
                {isProcessingBatch ? "Loading..." : "Add Images"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {imageFields.length === 0 ? (
          <div className="text-center py-[1.3rem] border-2 border-dashed rounded-[0.325rem]">
            <p className="text-[0.56875rem] text-muted-foreground">
              No images added yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-[0.325rem]">
            {imageFields.map((field, index) => (
              <div
                key={field.id}
                className="relative aspect-square rounded-[0.24375rem] overflow-hidden border bg-muted"
              >
                <div className="w-full h-full">
                  <SpacesImageUpload
                    label=""
                    value={watch(`images.${index}.imageUrl`) || ""}
                    onChange={(base64) => {
                      if (base64 === "") {
                        onRemoveImage(index);
                      } else {
                        onImageChange(index, base64);
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
