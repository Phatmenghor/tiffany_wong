// components/shared/form/FormFooter.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  isSubmitting: boolean;
  isDirty: boolean;
  isCreate?: boolean;
  createMessage?: string;
  updateMessage?: string;
  noChangesMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFooter({
  isSubmitting,
  isDirty,
  isCreate = true,
  createMessage = "Creating...",
  updateMessage = "Updating...",
  noChangesMessage = "No changes made",
  children,
  className,
}: FormFooterProps) {
  const getStatusMessage = () => {
    if (isSubmitting) {
      return isCreate ? createMessage : updateMessage;
    }
    if (isDirty) {
      return "You have unsaved changes";
    }
    return noChangesMessage;
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-[0.65rem] px-[0.975rem] py-[0.65rem] border-t bg-muted/30 flex-shrink-0",
        "sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="text-[0.56875rem] text-muted-foreground flex items-center gap-[0.325rem]">
        {isSubmitting && (
          <div className="h-[0.325rem] w-[0.325rem] rounded-full bg-blue-500 animate-pulse" />
        )}
        {isDirty && !isSubmitting && (
          <div className="h-[0.325rem] w-[0.325rem] rounded-full bg-orange-500" />
        )}
        <span>{getStatusMessage()}</span>
      </div>
      <div className="flex gap-[0.4875rem] items-center min-w-fit">{children}</div>
    </div>
  );
}
