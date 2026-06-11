"use client";

import React from "react";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  FieldError,
} from "react-hook-form";
import { Label } from "@/components/ui/label";

interface PromotionValueFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  promotionType?: "FIXED_AMOUNT" | "PERCENTAGE";
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function PromotionValueField<T extends FieldValues>({
  name,
  label,
  control,
  promotionType,
  error,
  disabled = false,
  required = false,
  className = "",
}: PromotionValueFieldProps<T>) {
  const suffix = promotionType === "PERCENTAGE" ? "%" : "$";
  const placeholder = promotionType === "PERCENTAGE" ? "0-100" : "Amount";

  return (
    <div className="space-y-[0.325rem]">
      <Label
        htmlFor={name}
        className="text-[0.4875rem] sm:text-[0.56875rem] font-semibold text-foreground px-[0.08125rem]"
      >
        {label} {required && <span className="text-destructive ml-[0.1625rem]">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div
            className={`relative h-[1.625rem] overflow-hidden rounded-md border border-border hover:border-primary/50 transition-colors duration-200 ${className}`}
          >
            <input
              {...field}
              id={name}
              type="number"
              placeholder={placeholder}
              step="0.01"
              min="0"
              max={promotionType === "PERCENTAGE" ? "100" : ""}
              disabled={disabled}
              className="w-full h-full px-[0.4875rem] sm:px-[0.65rem] py-[0.325rem] sm:py-[0.40625rem] border-0 text-[0.4875rem] sm:text-[0.56875rem] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset transition-all bg-background"
            />
            {promotionType && (
              <span className="absolute right-[0.4875rem] sm:right-[0.65rem] top-1/2 -translate-y-1/2 text-[0.4875rem] sm:text-[0.56875rem] font-semibold text-muted-foreground pointer-events-none">
                {suffix}
              </span>
            )}
          </div>
        )}
      />
      {error && (
        <p className="text-[0.4875rem] text-destructive font-medium px-[0.08125rem]">
          {error?.message}
        </p>
      )}
    </div>
  );
}
