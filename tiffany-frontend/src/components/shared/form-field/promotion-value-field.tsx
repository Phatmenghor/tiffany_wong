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
import { Input } from "@/components/ui/input";

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
        className="text-[12px] font-semibold text-foreground px-[0.08125rem]"
      >
        {label} {required && <span className="text-destructive ml-[0.1625rem]">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className={`relative ${className}`}>
            <Input
              id={name}
              type="text"
              inputMode="decimal"
              placeholder={placeholder}
              disabled={disabled}
              value={field.value === undefined || field.value === null ? "" : String(field.value)}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  field.onChange(undefined);
                } else if (/^-?\d*\.?\d*$/.test(raw)) {
                  const num = parseFloat(raw);
                  field.onChange(isNaN(num) ? undefined : num);
                }
              }}
              onBlur={field.onBlur}
              className={`h-[1.625rem] text-[12px] ${promotionType ? "pr-[1.625rem]" : ""} ${
                error ? "border-red-500 focus:border-red-500" : "border-input focus:border-primary focus:ring-2 focus:ring-primary/30"
              }`}
            />
            {promotionType && (
              <span className="absolute right-[0.4875rem] top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground pointer-events-none">
                {suffix}
              </span>
            )}
          </div>
        )}
      />
      {error && (
        <p className="text-[11px] text-destructive font-medium px-[0.08125rem]">
          {error?.message}
        </p>
      )}
    </div>
  );
}
