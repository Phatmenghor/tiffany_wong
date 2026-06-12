"use client";

import React from "react";
import { useWatch, UseFormSetValue, FieldErrors, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import {
  PRODUCT_STATUS_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { ProductFormData } from "../../store/models/schema/product-schema";

interface ProductBasicInfoProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  isProcessing: boolean;
  selectedCategory: CategoriesResponseModel | null;
  onCategoryChange: (category: CategoriesResponseModel | null) => void;
  onCategoryIdChange: (categoryId: string) => void;
  onImageChange: (url: string) => void;
}

export function ProductBasicInfo({
  control,
  errors,
  isProcessing,
  selectedCategory,
  onCategoryChange,
  onCategoryIdChange,
  onImageChange,
}: ProductBasicInfoProps) {
  const mainImageUrl = useWatch({ control, name: "mainImageUrl" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-[0.65rem]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[0.65rem]">
          {/* Left: text fields */}
          <div className="md:col-span-2 space-y-[0.65rem]">
            <TextField
              control={control}
              name="name"
              label="Product Name"
              placeholder="Enter product name"
              required
              disabled={isProcessing}
              error={errors.name}
            />

            <ComboboxSelectCategories
              dataSelect={selectedCategory}
              onChangeSelected={(category) => {
                onCategoryChange(category);
                onCategoryIdChange(category?.id || "");
              }}
              label="Category"
              placeholder="Select category"
              required
              disabled={isProcessing}
              error={errors.categoryId?.message}
              showAllOption={false}
            />

            <SelectField
              control={control}
              name="status"
              label="Status"
              placeholder="Select status"
              options={PRODUCT_STATUS_CREATE_UPDATE}
              required
              disabled={isProcessing}
              error={errors.status}
            />
          </div>

          {/* Right: main image fills the space beside the fields */}
          <div className="md:col-span-1">
            <SpacesImageUpload
              label="Product Image"
              value={mainImageUrl}
              onChange={onImageChange}
              aspectRatio="square"
              height="h-[11.7rem]"
              maxSize={5}
              required
              error={errors.mainImageUrl}
              placeholder="Click to upload"
              helperText="PNG, JPG up to 5MB"
              disabled={isProcessing}
            />
          </div>

          {/* Description spans full width below */}
          <div className="md:col-span-3">
            <TextareaField
              control={control}
              name="description"
              label="Description"
              placeholder="Enter product description"
              rows={3}
              required
              disabled={isProcessing}
              error={errors.description}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
