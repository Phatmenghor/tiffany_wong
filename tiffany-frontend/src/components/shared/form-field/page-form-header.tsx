"use client";

import React from "react";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Plus, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageFormHeaderProps {
  title: string;
  description?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  showAvatar?: boolean;
  isCreate?: boolean;
  className?: string;
}

export function PageFormHeader({
  title,
  description,
  avatarName,
  avatarImageUrl,
  showAvatar = false,
  isCreate = true,
  className,
}: PageFormHeaderProps) {
  // Determine icon based on mode
  const Icon = isCreate ? Plus : Edit;

  return (
    <div
      className={cn("px-[0.975rem] pt-[0.975rem] pb-[0.65rem] border-b flex-shrink-0 bg-white rounded-[0.325rem]", className)}
    >
      <div className="flex items-start gap-[0.65rem]">
        {/* Avatar or Icon - Left side */}
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div className="p-[0.4875rem] bg-brand-100 rounded-[0.325rem] shrink-0">
            <Icon className="h-[0.975rem] w-[0.975rem] text-brand-600" />
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col gap-[0.24375rem] flex-1 min-w-0">
          <h1 className="text-[0.8125rem] font-semibold">{title}</h1>
          {description && (
            <p className="text-[0.56875rem] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
