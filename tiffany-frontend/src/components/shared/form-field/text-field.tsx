"use client";

import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  name: string;
  label: string;
  control: any;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  type?:
    | "text"
    | "email"
    | "tel"
    | "password"
    | "number"
    | "url"
    | "datetime-local";
  placeholder?: string;
  className?: string;
  valueAsNumber?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  allowZero?: boolean;
  pattern?: string;
  onCustomChange?: (value: string) => void;
  autoComplete?: string;
}

export function TextField({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  type = "text",
  placeholder = "",
  className = "",
  valueAsNumber = false,
  min,
  max,
  step,
  allowZero = true,
  pattern,
  onCustomChange,
  autoComplete = "off",
}: TextFieldProps) {
  return (
    <div className={`space-y-[0.325rem] ${className}`}>
      <Label htmlFor={name} className="text-[12px] font-medium text-foreground">
        {label} {required && <span className="text-red-500 ml-[0.1625rem]">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            autoComplete={autoComplete}
            onChange={(e) => {
              if (valueAsNumber && type === "number") {
                const value = e.target.valueAsNumber;

                // Handle empty input (NaN)
                if (isNaN(value)) {
                  field.onChange(undefined);
                  return;
                }

                // Handle zero based on allowZero prop
                if (value === 0 && !allowZero) {
                  field.onChange(undefined);
                  return;
                }

                // Valid number (including 0 if allowZero is true)
                field.onChange(value);
              } else if (type === "number" && !valueAsNumber) {
                // Return string representation for number inputs without valueAsNumber
                const value = e.target.value;
                field.onChange(value === "" ? undefined : value);
              } else {
                // For non-number types
                let value = e.target.value;

                // Apply pattern filtering if provided
                if (pattern) {
                  const regex = new RegExp(`^${pattern}*$`);
                  if (!regex.test(value)) {
                    // If value doesn't match pattern, keep the last valid value
                    return;
                  }
                }

                field.onChange(value);
                onCustomChange?.(value);
              }
            }}
            pattern={pattern}
            className={`h-[1.625rem] transition-all duration-200 border ${disabled ? "bg-muted/50" : ""} ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-input focus:border-primary focus:ring-2 focus:ring-primary/30"
            }`}
          />
        )}
      />
      {error && <p className="text-[11px] text-red-500">{error.message}</p>}
    </div>
  );
}
