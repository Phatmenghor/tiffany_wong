"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { PasswordFieldProps } from ".";

export function PasswordField({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "••••••••",
  onTogglePassword,
  showPassword = false,
  className = "",
}: PasswordFieldProps) {
  return (
    <div className={`space-y-[0.325rem] ${className}`}>
      <Label htmlFor={name} className="text-[11px] font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ""}
              id={name}
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="new-password"
              className={`h-[2.375rem] sm:h-[1.625rem] pr-[1.95rem] transition-all duration-200 ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : "focus:bg-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/30"
              }`}
            />
          )}
        />
        {onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-[0.4875rem]"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-[0.65rem] w-[0.65rem] text-gray-500" />
            ) : (
              <Eye className="h-[0.65rem] w-[0.65rem] text-gray-500" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-600">{error.message}</p>}
    </div>
  );
}
