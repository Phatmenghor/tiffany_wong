"use client";

import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Plus, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  title: string;
  description?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  showAvatar?: boolean;
  isCreate?: boolean;
  className?: string;
}

export function FormHeader({
  title,
  description,
  avatarName,
  avatarImageUrl,
  showAvatar = false,
  isCreate = true,
  className,
}: FormHeaderProps) {
  // Determine icon based on mode
  const Icon = isCreate ? Plus : Edit;

  return (
    <DialogHeader
      className={cn("px-[0.975rem] pt-[0.975rem] pb-[0.65rem] border-b flex-shrink-0", className)}
    >
      <div className="flex items-start gap-[0.65rem]">
        {/* Avatar or Icon - Left side */}
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div className="p-[0.4875rem] bg-primary/10 border border-primary rounded-lg shrink-0">
            <Icon className="h-[0.975rem] w-[0.975rem] text-primary" />
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col gap-[0.24375rem] flex-1 min-w-0">
          <DialogTitle className="text-[0.8125rem] font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[0.56875rem]">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
