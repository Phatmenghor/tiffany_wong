"use client";

import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";
import { showToast } from "@/components/shared/common/show-toast";

type AspectRatio = "square" | "banner" | "portrait" | "landscape" | "auto";

interface SpacesImageUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: FieldError;
  maxSize?: number;
  aspectRatio?: AspectRatio;
  height?: string;
  placeholder?: string;
  helperText?: string;
  showPreviewText?: boolean;
}

export function SpacesImageUpload({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  maxSize = 10,
  aspectRatio = "square",
  height,
  placeholder = "Click to upload image",
  helperText,
  showPreviewText = true,
}: SpacesImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "banner":
        return "aspect-[16/6]";
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-[4/3]";
      case "auto":
        return "";
      default:
        return "aspect-square";
    }
  };

  const getHeightClass = () => {
    if (height) return height;
    if (aspectRatio === "banner") return "h-[7.8rem]";
    if (aspectRatio === "auto") return "h-[10.4rem]";
    return "h-[9.1rem]";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast.error("Please select an image file");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      showToast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.onerror = () => showToast.error("Failed to read image. Please try again.");
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-[0.325rem]">
      <Label className="text-[0.56875rem] font-medium">
        {label}
        {required && <span className="text-red-500 ml-[0.1625rem]">*</span>}
      </Label>

      <div className="space-y-[0.4875rem]">
        <div
          onClick={handleClick}
          className={cn(
            "relative w-full rounded-lg overflow-hidden border-2 transition-all",
            getHeightClass(),
            getAspectRatioClass(),
            value
              ? "border-border hover:border-primary/50"
              : "border-dashed border-border hover:border-primary",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:shadow-md",
            error && "border-red-500",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />

          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 bg-muted/20"
              />

              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-[0.325rem] text-white">
                  <Upload className="h-[1.3rem] w-[1.3rem]" />
                  <p className="text-[0.56875rem] font-medium">Click to change image</p>
                </div>
              </div>

              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-[0.4875rem] right-[0.4875rem] z-10"
                  onClick={handleRemove}
                >
                  <X className="h-[0.65rem] w-[0.65rem]" />
                </Button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-[0.4875rem] bg-muted/30">
              <div className="p-[0.65rem] bg-muted rounded-full">
                <ImageIcon className="h-[1.625rem] w-[1.625rem] text-muted-foreground" />
              </div>
              <div className="text-center px-[0.65rem]">
                <p className="text-[0.56875rem] font-medium text-foreground">
                  {placeholder}
                </p>
                <p className="text-[0.4875rem] text-muted-foreground mt-[0.1625rem]">
                  {helperText || `PNG, JPG, GIF up to ${maxSize}MB`}
                </p>
              </div>
            </div>
          )}
        </div>

        {value && !disabled && showPreviewText && (
          <p className="text-[0.4875rem] text-muted-foreground text-center">
            Click on the image to change it
          </p>
        )}
      </div>

      {error && <p className="text-[0.4875rem] text-red-500">{error.message}</p>}
    </div>
  );
}
