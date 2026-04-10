"use client";

import React from "react";
import { useWatch, UseFormSetValue, FieldErrors, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import {
  PROMOTION_TYPE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ProductFormData } from "../../store/models/schema/product-schema";

interface ProductPricingProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  isProcessing: boolean;
  onResetPromotion: () => void;
  hasSizes: boolean;
  setValue: UseFormSetValue<ProductFormData>;
}

export function ProductPricing({
  control,
  errors,
  isProcessing,
  onResetPromotion,
  hasSizes,
  setValue,
}: ProductPricingProps) {
  const promotionType = useWatch({ control, name: "promotionType" });
  const showPromotionFields = promotionType && promotionType !== "NONE";

  if (hasSizes) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pricing Information</CardTitle>
          {showPromotionFields && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetPromotion}
              disabled={isProcessing}
            >
              Reset Promotion
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
          <div>
            <TextField
              control={control}
              name="price"
              label="Base Price"
              type="number"
              placeholder="Enter price"
              required
              disabled={isProcessing}
              error={errors.price}
              valueAsNumber={true}
              min={0}
              step="0.01"
              allowZero={true}
            />
          </div>

          <div>
            <SelectField
              control={control}
              name="promotionType"
              label="Promotion Type"
              placeholder="Select promotion type"
              options={PROMOTION_TYPE_CREATE_UPDATE}
              disabled={isProcessing}
              error={errors.promotionType}
            />
          </div>

          {showPromotionFields && (
            <>
              <div>
                <TextField
                  control={control}
                  name="promotionValue"
                  label="Promotion Value"
                  type="number"
                  placeholder="Enter promotion value"
                  disabled={isProcessing}
                  error={errors.promotionValue as any}
                  valueAsNumber={true}
                  min={0}
                  step="0.01"
                  allowZero={false}
                />
              </div>

              <div>
                <DateTimePickerField
                  control={control}
                  name="promotionFromDate"
                  label="Promotion From"
                  mode="datetime"
                  placeholder="Select start date & time"
                  disabled={isProcessing}
                  error={errors.promotionFromDate}
                />
              </div>

              <div>
                <DateTimePickerField
                  control={control}
                  name="promotionToDate"
                  label="Promotion To"
                  mode="datetime"
                  placeholder="Select end date & time"
                  disabled={isProcessing}
                  error={errors.promotionToDate}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
