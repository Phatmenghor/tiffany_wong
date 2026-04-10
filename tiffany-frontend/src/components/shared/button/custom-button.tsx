"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomButtonProps extends ButtonProps {
  children?: React.ReactNode;
  // Form submission options
  isSubmitting?: boolean;
  isDirty?: boolean;
  isCreate?: boolean;
  createText?: string;
  updateText?: string;
  submittingCreateText?: string;
  submittingUpdateText?: string;
  icon?: React.ReactNode;
}

export const CustomButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(
  (
    {
      onClick,
      className,
      children,
      type = "button",
      isSubmitting = false,
      isDirty = true,
      isCreate = false,
      createText = "Create",
      updateText = "Update",
      submittingCreateText = "Creating...",
      submittingUpdateText = "Updating...",
      icon,
      ...props
    },
    ref
  ) => {
    // Determine if this is a form submit button (only if no onClick and children provided as text only)
    const isFormSubmitButton = !onClick && !children && isSubmitting !== undefined;
    const isDisabled = isFormSubmitButton
      ? isSubmitting || props.disabled || (!isDirty && !isCreate)
      : props.disabled;

    const getButtonText = () => {
      if (isFormSubmitButton && isSubmitting) {
        return isCreate ? submittingCreateText : submittingUpdateText;
      }
      if (isFormSubmitButton) {
        return isCreate ? createText : updateText;
      }
      return children;
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }
    };

    const buttonContent = isFormSubmitButton && isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {getButtonText()}
      </>
    ) : (
      <>
        {icon && <span className="mr-2">{icon}</span>}
        {getButtonText()}
      </>
    );

    return (
      <Button
        ref={ref}
        type={isFormSubmitButton ? "submit" : type}
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(isFormSubmitButton && "min-w-[120px] transition-all", className)}
        {...props}
      >
        {buttonContent}
      </Button>
    );
  }
);

CustomButton.displayName = "CustomButton";
