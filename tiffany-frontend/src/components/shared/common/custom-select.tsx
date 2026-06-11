"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  required?: boolean;
  layout?: "vertical" | "horizontal";
  labelSize?: "xs" | "sm" | "md";
}

const CUSTOM_SELECT_SIZES = {
  sm: {
    button: "h-[1.3rem] text-[0.4875rem]",
    icon: "h-[0.4875rem] w-[0.4875rem]",
    item: "text-[0.4875rem] py-[0.1625rem] px-[0.325rem]",
  },
  md: {
    button: "h-[1.4625rem] text-[0.56875rem]",
    icon: "h-[0.65rem] w-[0.65rem]",
    item: "text-[0.56875rem] py-[0.325rem] px-[0.4875rem]",
  },
  lg: {
    button: "h-[1.625rem] text-[0.65rem]",
    icon: "h-[0.8125rem] w-[0.8125rem]",
    item: "text-[0.65rem] py-[0.325rem] px-[0.4875rem]",
  },
  xl: {
    button: "h-[1.7875rem] text-[0.65rem]",
    icon: "h-[0.8125rem] w-[0.8125rem]",
    item: "text-[0.65rem] py-[0.325rem] px-[0.4875rem]",
  },
} as const;

/**
 * CustomSelect Component
 * Popover-based dropdown (replaces native Select to avoid scroll bugs)
 * Follows SelectField pattern with full accessibility support
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value = "",
  placeholder = "Select option",
  onValueChange,
  className = "",
  disabled = false,
  size = "md",
  label,
  required = false,
  layout = "vertical",
  labelSize = "xs",
}) => {
  const [open, setOpen] = useState(false);
  const sizeConfig = CUSTOM_SELECT_SIZES[size];
  const selectedOption = options.find((opt) => opt.value === value);

  const labelSizeClass = {
    xs: "text-[0.4875rem]",
    sm: "text-[0.56875rem]",
    md: "text-[0.65rem]",
  }[labelSize];

  const wrapperClass = layout === "vertical"
    ? "flex flex-col gap-[0.1625rem] w-full"
    : "flex flex-row items-center gap-[0.325rem] w-full";

  return (
    <div className={wrapperClass}>
      {label && (
        <Label className={cn(labelSizeClass, "font-semibold text-foreground")}>
          {label}
          {required && <span className="text-destructive ml-[0.1625rem]">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between gap-[0.325rem] transition-all duration-200",
              // Default state
              "border-input",
              // Hover state
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              // Focus state
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              // Active/Open state
              open && "bg-primary/20 border-primary text-primary",
              sizeConfig.button,
              className,
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={label || "Select option"}
          >
            <span
              className={cn(
                "truncate",
                selectedOption ? "text-foreground" : "text-muted-foreground",
                // Change text color when open
                open && "text-primary"
              )}
            >
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                `${sizeConfig.icon} shrink-0 transition-all duration-200`,
                !open && "opacity-50",
                open && "opacity-100 text-primary rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          side="bottom"
        >
          <div className="max-h-[300px] overflow-y-auto" role="listbox">
            {options.length === 0 ? (
              <div className="p-[0.4875rem] text-[0.56875rem] text-muted-foreground text-center">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      onValueChange(option.value);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-[0.325rem] text-left transition-colors",
                    sizeConfig.item,
                    "hover:bg-primary/10 hover:text-primary",
                    value === option.value
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-foreground",
                    option.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-[0.65rem] w-[0.65rem] flex-shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
