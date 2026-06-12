"use client";

import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { isBase64Image, uploadBase64ToSpaces } from "@/services/spaces-service";
import { showToast } from "@/components/shared/common/show-toast";

interface ProfilePictureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageCapture: (imageUrl: string) => void;
  onImageRemove?: () => void;
  isLoading?: boolean;
  currentImageUrl?: string;
  userName?: string;
}

export function ProfilePictureModal({
  open,
  onOpenChange,
  onImageCapture,
  onImageRemove,
  isLoading = false,
  currentImageUrl,
  userName,
}: ProfilePictureModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>(currentImageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedImage(currentImageUrl || "");
      setIsRemoving(false);
    }
  }, [open, currentImageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast.error("Please select an image file");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      showToast.error("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveClick = () => {
    setIsRemoving(true);
    setSelectedImage("");
  };

  const handleRestoreClick = () => {
    setIsRemoving(false);
    setSelectedImage(currentImageUrl || "");
  };

  const handleSave = async () => {
    if (isRemoving) {
      onImageRemove?.();
      onOpenChange(false);
      return;
    }

    if (!selectedImage || selectedImage === currentImageUrl) return;

    if (isBase64Image(selectedImage)) {
      setIsUploading(true);
      try {
        const url = await uploadBase64ToSpaces(selectedImage);
        onImageCapture(url);
        onOpenChange(false);
      } catch (err) {
        console.error("Upload failed:", err);
        showToast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else {
      onImageCapture(selectedImage);
      onOpenChange(false);
    }
  };

  const hasChanges = isRemoving || (selectedImage && selectedImage !== currentImageUrl);
  const isBusy = isLoading || isUploading;

  const handleCancel = () => {
    setSelectedImage(currentImageUrl || "");
    setIsRemoving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogTitle asChild>
          <VisuallyHidden>Profile Picture Manager</VisuallyHidden>
        </DialogTitle>
        <DialogDescription asChild>
          <VisuallyHidden>Upload or remove your profile picture</VisuallyHidden>
        </DialogDescription>

        {/* Header */}
        <div className="px-[0.975rem] py-[0.65rem] border-b">
          <h2 className="text-[13px] font-semibold">Update Profile Picture</h2>
        </div>

        {/* Body - Image Preview */}
        <div className="p-[0.975rem] flex flex-col items-center gap-[0.65rem]">
          <div
            className="w-[5.2rem] h-[5.2rem] rounded-full overflow-hidden border-4 border-gray-200 flex items-center justify-center bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              const imageUrl = selectedImage || currentImageUrl;
              if (imageUrl && !imageUrl.startsWith("data:")) {
                window.open(imageUrl, "_blank");
              }
            }}
          >
            {selectedImage || currentImageUrl ? (
              <img
                src={selectedImage || currentImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <CustomAvatar
                imageUrl={currentImageUrl}
                name={userName}
                size="xl"
              />
            )}
          </div>

          {selectedImage && selectedImage !== currentImageUrl && (
            <p className="text-[11px] text-blue-600 font-medium">
              ✓ New image selected
            </p>
          )}

          {(currentImageUrl || selectedImage) && !selectedImage?.startsWith("data:") && (
            <p className="text-[11px] text-muted-foreground">
              Click image to view in new tab
            </p>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t px-[0.975rem] py-[0.65rem] space-y-[0.4875rem]">
          {/* Select Photo Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-[0.325rem] bg-primary hover:bg-primary/90"
            disabled={isBusy || isRemoving}
          >
            <Camera className="h-[0.65rem] w-[0.65rem]" />
            Select Photo
          </Button>

          {/* Remove Picture Button */}
          {currentImageUrl && !isRemoving && (
            <Button
              onClick={handleRemoveClick}
              variant="outline"
              className="w-full gap-[0.325rem] text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isBusy}
            >
              <Trash2 className="h-[0.65rem] w-[0.65rem]" />
              Remove Photo
            </Button>
          )}

          {/* Restore Button (when removing) */}
          {isRemoving && (
            <Button
              onClick={handleRestoreClick}
              variant="outline"
              className="w-full gap-[0.325rem]"
              disabled={isBusy}
            >
              Restore Photo
            </Button>
          )}

          {/* Footer Buttons - Cancel and Save */}
          <div className="flex gap-[0.325rem] pt-[0.325rem]">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isBusy || !hasChanges}
              className="flex-1"
            >
              {isBusy ? (
                <>
                  <Loader2 className="h-[0.65rem] w-[0.65rem] animate-spin mr-[0.325rem]" />
                  {isUploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
