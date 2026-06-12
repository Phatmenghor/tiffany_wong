"use client";

import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface TextAreaFieldProps {
  name: string;
  label: string;
  control: any;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function TextAreaField({
  name,
  label,
  control,
  error,
  disabled = false,
  placeholder = "",
  className = "",
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <div className={`space-y-[0.325rem] ${className}`}>
      <Label htmlFor={name as string} className="text-[12px] font-medium text-foreground">
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <textarea
            {...field}
            value={field.value ?? ""}
            id={name as string}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`w-full px-[0.4875rem] py-[0.325rem] rounded-[0.24375rem] border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200 ${
              disabled ? "bg-muted/50 cursor-not-allowed" : ""
            } ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                : "border-input focus:border-primary focus:ring-2 focus:ring-primary/30"
            }`}
          />
        )}
      />
      {error && <p className="text-[11px] text-red-500">{error.message}</p>}
    </div>
  );
}
