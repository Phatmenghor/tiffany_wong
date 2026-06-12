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
import { CustomDateTimePicker } from "../common/custom-date-picker";

interface DateTimePickerFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  mode?: "date" | "datetime";
}

export function DateTimePickerField<T extends FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select date",
  className = "",
  mode = "date",
}: DateTimePickerFieldProps<T>) {
  return (
    <div className={`space-y-[0.325rem]`}>
      <Label
        htmlFor={name}
        className="text-[12px] font-semibold text-foreground"
      >
        {label} {required && <span className="text-destructive ml-[0.1625rem]">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CustomDateTimePicker
            className={className}
            id={name}
            value={field.value || ""}
            onChange={field.onChange}
            disabled={disabled}
            placeholder={placeholder}
            error={!!error}
            mode={mode}
          />
        )}
      />
      {error && (
        <p className="text-[11px] text-destructive font-medium">{error?.message}</p>
      )}
    </div>
  );
}
