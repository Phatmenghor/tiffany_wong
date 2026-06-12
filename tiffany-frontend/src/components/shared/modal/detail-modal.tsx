"use client";

import type React from "react";
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Loading } from "../common/loading";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  avatarUrl?: string;
  avatarName?: string;
  badges?: ReactNode;
  children: ReactNode;
}

export function DetailModal({
  isOpen,
  onClose,
  isLoading = false,
  title = "Details",
  description,
  avatarUrl,
  avatarName,
  badges,
  children,
}: DetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-[0.975rem] py-[0.65rem] border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-[0.65rem] pr-[1.3rem]">
            {(avatarUrl || avatarName) && (
              <CustomAvatar imageUrl={avatarUrl} name={avatarName} size="xl" />
            )}

            <div className="flex-1">
              <DialogTitle className="text-[13px] font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-[11px] text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
              {badges && (
                <div className="flex items-center gap-[0.325rem] mt-[0.325rem]">{badges}</div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content - Use explicit height calculation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-[0.975rem]">{isLoading ? <Loading /> : children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
