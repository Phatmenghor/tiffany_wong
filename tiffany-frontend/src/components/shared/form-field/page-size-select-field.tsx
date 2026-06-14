"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageSizeSelectFieldProps {
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  className?: string;
  label?: string;
}

/**
 * PageSizeSelectField Component
 * Custom Popover-based page size selector following SelectField pattern
 * Avoids scroll bugs with native Select component
 */
export function PageSizeSelectField({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className = "",
  label = "Rows per page:",
}: PageSizeSelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex items-center gap-[0.325rem] ${className}`}>
      {label && (
        <span className="text-[12px] text-muted-foreground font-semibold whitespace-nowrap">
          {label}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "justify-between gap-[0.325rem] min-w-[80px] h-[2.375rem] sm:h-[1.625rem] px-[0.4875rem] transition-colors",
              "hover:bg-accent/50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={`Select rows per page, currently showing ${pageSize} rows`}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className="font-medium text-[12px]">{pageSize}</span>
            <ChevronDown
              className={cn(
                "h-[0.65rem] w-[0.65rem] opacity-50 shrink-0 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[100px] p-0"
          align="start"
          side="bottom"
        >
          <div className="space-y-[0.1625rem] p-[0.1625rem]" role="listbox">
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                role="option"
                aria-selected={pageSize === size}
                onClick={() => {
                  onPageSizeChange(size);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-[0.325rem] px-[0.4875rem] py-[0.325rem] text-[12px] text-left rounded-[0.1625rem] transition-colors",
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  pageSize === size
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground"
                )}
                aria-label={`Show ${size} rows per page`}
              >
                <Check
                  className={cn(
                    "h-[0.65rem] w-[0.65rem] flex-shrink-0",
                    pageSize === size ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
                <span>{size}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
