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
import { uploadToSpaces } from "@/services/spaces-service";
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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(currentImageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedImageUrl(currentImageUrl || "");
      setIsRemoving(false);
    }
  }, [open, currentImageUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);
    try {
      const result = await uploadToSpaces(file);
      setSelectedImageUrl(result.url);
    } catch (err) {
      console.error("Upload failed:", err);
      showToast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveClick = () => {
    setIsRemoving(true);
    setSelectedImageUrl("");
  };

  const handleRestoreClick = () => {
    setIsRemoving(false);
    setSelectedImageUrl(currentImageUrl || "");
  };

  const handleSave = () => {
    if (isRemoving) {
      onImageRemove?.();
      onOpenChange(false);
    } else if (selectedImageUrl && selectedImageUrl !== currentImageUrl) {
      onImageCapture(selectedImageUrl);
      onOpenChange(false);
    }
  };

  const hasChanges = isRemoving || (selectedImageUrl && selectedImageUrl !== currentImageUrl);
  const isBusy = isLoading || isUploading;

  const handleCancel = () => {
    setSelectedImageUrl(currentImageUrl || "");
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
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Update Profile Picture</h2>
        </div>

        {/* Body - Image Preview */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 flex items-center justify-center bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              const imageUrl = selectedImageUrl || currentImageUrl;
              if (imageUrl) {
                window.open(imageUrl, "_blank");
              }
            }}
          >
            {selectedImageUrl || currentImageUrl ? (
              <img
                src={selectedImageUrl || currentImageUrl}
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

          {isUploading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </p>
          )}

          {selectedImageUrl && selectedImageUrl !== currentImageUrl && !isUploading && (
            <p className="text-sm text-blue-600 font-medium">
              ✓ New image ready
            </p>
          )}

          {(currentImageUrl || selectedImageUrl) && (
            <p className="text-xs text-muted-foreground">
              Click image to view in new tab
            </p>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t px-6 py-4 space-y-3">
          {/* Select Photo Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
            disabled={isBusy || isRemoving}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Select Photo
              </>
            )}
          </Button>

          {/* Remove Picture Button */}
          {currentImageUrl && !isRemoving && (
            <Button
              onClick={handleRemoveClick}
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isBusy}
            >
              <Trash2 className="h-4 w-4" />
              Remove Photo
            </Button>
          )}

          {/* Restore Button (when removing) */}
          {isRemoving && (
            <Button
              onClick={handleRestoreClick}
              variant="outline"
              className="w-full gap-2"
              disabled={isBusy}
            >
              Restore Photo
            </Button>
          )}

          {/* Footer Buttons - Cancel and Save */}
          <div className="flex gap-2 pt-2">
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
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
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
