"use client";

import React from "react";
import { useWatch, FieldErrors, Control, UseFieldArrayReturn, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import {
  PROMOTION_TYPE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ProductFormData } from "../../store/models/schema/product-schema";

interface ProductSizesProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  isProcessing: boolean;
  sizeFields: any[];
  onAddSize: () => void;
  onRemoveSize: (index: number) => void;
  onResetAllPromotions: () => void;
  onResetPromotion: (index: number) => void;
  setValue: UseFormSetValue<ProductFormData>;
  watch: any;
}

export function ProductSizes({
  control,
  errors,
  isProcessing,
  sizeFields,
  onAddSize,
  onRemoveSize,
  onResetAllPromotions,
  onResetPromotion,
  setValue,
  watch,
}: ProductSizesProps) {
  const hasSizes = sizeFields.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Sizes</CardTitle>
          <div className="flex items-center gap-[0.325rem]">
            {hasSizes && sizeFields.some((_, idx) => {
              const sizePromotionType = watch(`sizes.${idx}.promotionType`);
              return sizePromotionType && sizePromotionType !== "NONE";
            }) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetAllPromotions}
                disabled={isProcessing}
              >
                Reset All Promotions
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddSize}
              disabled={isProcessing}
            >
              <Plus className="h-[0.65rem] w-[0.65rem] mr-[0.325rem]" />
              Add Size
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sizeFields.length === 0 ? (
          <div className="text-center py-[1.3rem]">
            <p className="text-[0.56875rem] text-muted-foreground">
              {hasSizes
                ? "No sizes defined."
                : "No sizes defined. Product will use main pricing."}
            </p>
          </div>
        ) : (
          <div className="space-y-[0.65rem]">
            {sizeFields.map((field, index) => {
              const sizePromotionType = watch(`sizes.${index}.promotionType`);
              const showSizePromotionFields =
                sizePromotionType && sizePromotionType !== "NONE";

              return (
                <div
                  key={field.id}
                  className="border rounded-lg p-[0.65rem] space-y-[0.65rem]"
                >
                  <div className="flex items-center justify-between gap-[0.325rem]">
                    <h4 className="font-semibold text-foreground">
                      Size {index + 1}
                    </h4>
                    <div className="flex items-center gap-[0.325rem]">
                      {showSizePromotionFields && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onResetPromotion(index)}
                          disabled={isProcessing}
                        >
                          Reset
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveSize(index)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-[0.65rem] w-[0.65rem] mr-[0.325rem]" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.65rem] auto-rows-max">
                    <div>
                      <TextField
                        control={control}
                        name={`sizes.${index}.name`}
                        label="Size Name"
                        placeholder="e.g., Small, Medium, Large"
                        disabled={isProcessing}
                        error={errors.sizes?.[index]?.name as any}
                      />
                    </div>

                    <div>
                      <TextField
                        control={control}
                        name={`sizes.${index}.price`}
                        label="Price"
                        type="number"
                        placeholder="Enter price"
                        disabled={isProcessing}
                        error={errors.sizes?.[index]?.price as any}
                        valueAsNumber={true}
                        min={0}
                        step="0.01"
                        allowZero={true}
                      />
                    </div>

                    <div>
                      <SelectField
                        control={control}
                        name={`sizes.${index}.promotionType`}
                        label="Promotion Type"
                        placeholder="Select promotion type"
                        options={PROMOTION_TYPE_CREATE_UPDATE}
                        disabled={isProcessing}
                        error={
                          errors.sizes?.[index]?.promotionType as any
                        }
                      />
                    </div>

                    {showSizePromotionFields && (
                      <>
                        <div>
                          <TextField
                            control={control}
                            name={`sizes.${index}.promotionValue`}
                            label="Promotion Value"
                            type="number"
                            placeholder="Enter promotion value"
                            disabled={isProcessing}
                            error={
                              errors.sizes?.[index]
                                ?.promotionValue as any
                            }
                            valueAsNumber={true}
                            min={0}
                            step="0.01"
                            allowZero={false}
                          />
                        </div>

                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-[0.65rem] auto-rows-max">
                          <div>
                            <DateTimePickerField
                              control={control}
                              name={`sizes.${index}.promotionFromDate`}
                              label="Promotion From"
                              mode="date"
                              placeholder="Select start date"
                              disabled={isProcessing}
                              error={
                                errors.sizes?.[index]
                                  ?.promotionFromDate as any
                              }
                            />
                          </div>

                          <div>
                            <DateTimePickerField
                              control={control}
                              name={`sizes.${index}.promotionToDate`}
                              label="Promotion To"
                              mode="date"
                              placeholder="Select end date"
                              disabled={isProcessing}
                              error={
                                errors.sizes?.[index]
                                  ?.promotionToDate as any
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
