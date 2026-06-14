"use client";

import React, { useState, useRef, useEffect } from "react";
import { Controller, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumericInputProps {
  fieldValue: number | undefined | null;
  fieldRef: React.Ref<HTMLInputElement>;
  fieldName: string;
  fieldOnBlur: () => void;
  fieldOnChange: (val: number | undefined) => void;
  allowZero: boolean;
  placeholder: string;
  disabled: boolean;
  autoComplete: string;
  className: string;
}

function NumericInput({
  fieldValue,
  fieldRef,
  fieldName,
  fieldOnBlur,
  fieldOnChange,
  allowZero,
  placeholder,
  disabled,
  autoComplete,
  className,
}: NumericInputProps) {
  const [display, setDisplay] = useState(
    fieldValue === undefined || fieldValue === null ? "" : String(fieldValue)
  );
  const isFocused = useRef(false);

  // Sync display when field value changes externally (e.g. form reset)
  useEffect(() => {
    if (!isFocused.current) {
      setDisplay(fieldValue === undefined || fieldValue === null ? "" : String(fieldValue));
    }
  }, [fieldValue]);

  return (
    <Input
      ref={fieldRef}
      name={fieldName}
      id={fieldName}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      value={display}
      onFocus={() => { isFocused.current = true; }}
      onBlur={() => {
        isFocused.current = false;
        fieldOnBlur();
        if (display === "") fieldOnChange(undefined);
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setDisplay(raw);
        if (raw === "") {
          fieldOnChange(undefined);
          return;
        }
        if (!/^-?\d*\.?\d*$/.test(raw)) return;
        const num = parseFloat(raw);
        if (isNaN(num)) return;
        if (num === 0 && !allowZero) {
          fieldOnChange(undefined);
          return;
        }
        fieldOnChange(num);
      }}
      className={className}
    />
  );
}

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
  /** Optional element (e.g. password eye toggle) stacked inside the input, right-aligned. */
  rightElement?: React.ReactNode;
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
  rightElement,
}: TextFieldProps) {
  return (
    <div className={`space-y-[0.325rem] ${className}`}>
      <Label htmlFor={name} className="text-[12px] font-medium text-foreground">
        {label} {required && <span className="text-red-500 ml-[0.1625rem]">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const inputClass = `transition-all duration-200 border ${disabled ? "bg-muted/50" : ""} ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-input focus:border-primary focus:ring-2 focus:ring-primary/30"
          }`;

          // Numeric fields: dedicated component with local display state
          // so clearing "0" always works regardless of form default value
          if (valueAsNumber && type === "number") {
            return (
              <NumericInput
                fieldValue={field.value}
                fieldRef={field.ref}
                fieldName={field.name}
                fieldOnBlur={field.onBlur}
                fieldOnChange={field.onChange}
                allowZero={allowZero}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                className={inputClass}
              />
            );
          }

          const input = (
            <Input
              {...field}
              value={field.value ?? ""}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              onChange={(e) => {
                if (type === "number") {
                  const value = e.target.value;
                  field.onChange(value === "" ? undefined : value);
                } else {
                  let value = e.target.value;
                  if (pattern) {
                    const regex = new RegExp(`^${pattern}*$`);
                    if (!regex.test(value)) return;
                  }
                  field.onChange(value);
                  onCustomChange?.(value);
                }
              }}
              pattern={pattern}
              className={`${inputClass} ${rightElement ? "pr-[2.25rem]" : ""}`}
            />
          );

          if (rightElement) {
            return (
              <div className="relative">
                {input}
                <div className="absolute right-[0.32rem] inset-y-0 flex items-center">
                  {rightElement}
                </div>
              </div>
            );
          }

          return input;
        }}
      />
      {error && <p className="text-[11px] text-red-500">{error.message}</p>}
    </div>
  );
}
