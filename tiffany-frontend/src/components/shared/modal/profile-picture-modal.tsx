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

interface ProfilePictureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageCapture: (imageData: string) => void;
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
  const [isRemoving, setIsRemoving] = useState(false);

  // Reset state when modal opens/closes
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
      alert("Please select an image file");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      alert("File size must be less than 5MB");
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

  const handleSave = () => {
    if (isRemoving) {
      onImageRemove?.();
      onOpenChange(false);
    } else if (selectedImage && selectedImage !== currentImageUrl) {
      onImageCapture(selectedImage);
      onOpenChange(false);
    }
  };

  const hasChanges = isRemoving || (selectedImage && selectedImage !== currentImageUrl);

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
          <VisuallyHidden>Upload, download, or remove your profile picture</VisuallyHidden>
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
              const imageUrl = selectedImage || currentImageUrl;
              if (imageUrl && !imageUrl.startsWith('data:')) {
                window.open(imageUrl, '_blank');
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
            <p className="text-sm text-blue-600 font-medium">
              ✓ New image selected
            </p>
          )}

          {(currentImageUrl || selectedImage) && !selectedImage?.startsWith('data:') && (
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
            disabled={isLoading || isRemoving}
          >
            {isLoading ? (
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
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
