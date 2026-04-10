"use client";

import React from "react";
import { useWatch, UseFormSetValue, FieldErrors, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { ProductFormData } from "../../store/models/schema/product-schema";

interface ProductMainImageProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  isProcessing: boolean;
  onImageChange: (base64: string) => void;
}

export function ProductMainImage({
  control,
  errors,
  isProcessing,
  onImageChange,
}: ProductMainImageProps) {
  const mainImageUrl = useWatch({ control, name: "mainImageUrl" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Image</CardTitle>
      </CardHeader>
      <CardContent>
        <ClickableImageUpload
          label="Main Product Image"
          value={mainImageUrl}
          onChange={onImageChange}
          aspectRatio="square"
          height="h-48"
          maxSize={5}
          required
          error={errors.mainImageUrl}
          placeholder="Click to upload main product image"
          helperText="PNG, JPG up to 5MB"
        />
      </CardContent>
    </Card>
  );
}
