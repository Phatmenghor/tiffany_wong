"use client";

import React from "react";
import { useWatch, FieldErrors, Control, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { ProductFormData } from "../../store/models/schema/product-schema";

const MAX_PRODUCT_IMAGES = 5;

interface ProductImagesGalleryProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  isProcessing: boolean;
  isProcessingImages: boolean;
  imageFields: any[];
  onUploadImages: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onImageChange: (index: number, base64: string) => void;
  watch: any;
}

export function ProductImagesGallery({
  control,
  errors,
  isProcessing,
  isProcessingImages,
  imageFields,
  onUploadImages,
  onRemoveImage,
  onImageChange,
  watch,
}: ProductImagesGalleryProps) {
  const canAddMore = imageFields.length < MAX_PRODUCT_IMAGES;

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
                type="file"
                id="multiple-image-upload"
                multiple
                accept="image/*"
                onChange={onUploadImages}
                className="hidden"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document
                    .getElementById("multiple-image-upload")
                    ?.click()
                }
                disabled={isProcessing}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isProcessingImages ? "Processing..." : "Upload"}
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
                  <ClickableImageUpload
                    label=""
                    value={
                      watch(`images.${index}.imageUrl`) || ""
                    }
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
                    error={
                      errors.images?.[index]?.imageUrl as any
                    }
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
