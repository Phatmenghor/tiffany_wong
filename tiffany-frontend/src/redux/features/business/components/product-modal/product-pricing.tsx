"use client";

import React from "react";
import { useWatch, UseFormSetValue, FieldErrors, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { Badge } from "@/components/ui/badge";
import {
  PROMOTION_TYPE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ProductFormData } from "../../store/models/schema/product-schema";
import { formatCurrency } from "@/utils/common/currency-format";
import { formatDate } from "@/utils/date/date-time-format";
import { getPromotionPreview } from "@/utils/common/promotion-calc";

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
  const price = useWatch({ control, name: "price" });
  const promotionValue = useWatch({ control, name: "promotionValue" });
  const promotionFromDate = useWatch({ control, name: "promotionFromDate" });
  const promotionToDate = useWatch({ control, name: "promotionToDate" });
  const showPromotionFields = promotionType && promotionType !== "NONE";

  const preview = getPromotionPreview({
    price,
    promotionType,
    promotionValue,
    promotionFromDate,
    promotionToDate,
  });

  const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    active: { label: "Active now", variant: "default" },
    upcoming: { label: "Future promotion", variant: "secondary" },
    expired: { label: "Expired", variant: "destructive" },
  };

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
      <CardContent className="space-y-[0.65rem]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.65rem] auto-rows-max">
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
                  mode="date"
                  placeholder="Select start date"
                  disabled={isProcessing}
                  error={errors.promotionFromDate}
                />
              </div>

              <div>
                <DateTimePickerField
                  control={control}
                  name="promotionToDate"
                  label="Promotion To"
                  mode="date"
                  placeholder="Select end date"
                  disabled={isProcessing}
                  error={errors.promotionToDate}
                />
              </div>
            </>
          )}
        </div>

        {showPromotionFields && preview.status !== "none" && (
          <div className="rounded-[0.325rem] border border-border/60 bg-muted/30 p-[0.65rem]">
            <div className="flex items-center justify-between gap-[0.65rem] flex-wrap">
              <div className="flex items-baseline gap-[0.4875rem]">
                <span className="text-[12px] text-muted-foreground line-through">
                  {formatCurrency(preview.basePrice)}
                </span>
                <span className="text-[15px] font-bold text-green-600">
                  {formatCurrency(preview.finalPrice)}
                </span>
                {preview.savings > 0 && (
                  <span className="text-[12px] font-medium text-red-600">
                    Save {formatCurrency(preview.savings)} ({preview.savingsPercent}%)
                  </span>
                )}
              </div>
              <Badge variant={statusBadge[preview.status].variant}>
                {statusBadge[preview.status].label}
              </Badge>
            </div>
            {preview.status === "upcoming" && promotionFromDate && (
              <p className="mt-[0.325rem] text-[11px] text-muted-foreground">
                Starts on {formatDate(promotionFromDate)} — the regular price{" "}
                {formatCurrency(preview.basePrice)} shows until then.
              </p>
            )}
            {preview.status === "expired" && promotionToDate && (
              <p className="mt-[0.325rem] text-[11px] text-muted-foreground">
                Ended on {formatDate(promotionToDate)} — the regular price applies.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
