"use client";

import React from "react";
import { useWatch, UseFormSetValue, FieldErrors, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
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
}

export function ProductBasicInfo({
  control,
  errors,
  isProcessing,
  selectedCategory,
  onCategoryChange,
  onCategoryIdChange,
}: ProductBasicInfoProps) {
  const productName = useWatch({ control, name: "name" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
          <div>
            <TextField
              control={control}
              name="name"
              label="Product Name"
              placeholder="Enter product name"
              required
              disabled={isProcessing}
              error={errors.name}
            />
          </div>

          <div>
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
          </div>

          <div>
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

          <div className="col-span-1 md:col-span-2">
            <TextareaField
              control={control}
              name="description"
              label="Description"
              placeholder="Enter product description"
              rows={1}
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
