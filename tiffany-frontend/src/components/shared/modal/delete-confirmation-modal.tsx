"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isSubmitting?: boolean;
  variant?: "default" | "critical";
  requireConfirmation?: boolean;
  confirmationText?: string;
  errorMessage?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onDelete,
  title,
  description,
  itemName,
  isSubmitting = false,
  variant = "default",
  requireConfirmation = false,
  confirmationText = "DELETE",
  errorMessage,
}: DeleteConfirmationDialogProps) {
  const [confirmationValue, setConfirmationValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmationValue("");
      setError(null);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    try {
      setError(null);
      setIsDeleting(true);
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const isDeleteDisabled =
    isSubmitting ||
    isDeleting ||
    (requireConfirmation && confirmationValue !== confirmationText);

  const isCritical = variant === "critical";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-sm p-0">
        <VisuallyHidden asChild>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="px-[0.975rem] pt-[0.975rem] pb-[0.65rem] border-b border-border bg-destructive/5">
          <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
          <p className="text-[11px] text-muted-foreground mt-[0.325rem]">{description}</p>
          {isCritical && (
            <p className="text-[11px] text-red-600 font-medium mt-[0.24375rem]">This action cannot be undone.</p>
          )}
        </div>

        {/* Body */}
        <div className="px-[0.975rem] py-[0.65rem] space-y-[0.65rem]">
          {itemName && (
            <div className="p-[0.4875rem] bg-muted rounded-[0.325rem] border border-muted-foreground/20">
              <p className="text-[11px]">
                <span className="text-muted-foreground">Item to delete:</span>
                <span className="font-semibold text-foreground ml-[0.325rem]">
                  "{itemName}"
                </span>
              </p>
            </div>
          )}

          {requireConfirmation && (
            <div className="space-y-[0.325rem]">
              <Label htmlFor="confirmation" className="text-[11px] font-medium">
                Type{" "}
                <code className="bg-muted px-[0.1625rem] py-[0.08125rem] rounded-[0.1625rem] text-red-600 font-mono text-[11px]">
                  {confirmationText}
                </code>{" "}
                to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationValue}
                onChange={(e) => setConfirmationValue(e.target.value)}
                placeholder="Type to confirm deletion"
                className="font-mono text-[12px] h-[1.95rem]"
                autoComplete="off"
                disabled={isDeleting || isSubmitting}
              />
            </div>
          )}

          {(error || errorMessage) && (
            <Alert variant="destructive" className="py-[0.4875rem]">
              <AlertTriangle className="h-[0.65rem] w-[0.65rem]" />
              <AlertDescription className="text-[11px]">{error || errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="px-[0.975rem] py-[0.65rem] border-t border-border bg-muted/30 flex justify-end gap-[0.4875rem]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            className={isCritical ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"}
          >
            {isDeleting || isSubmitting ? (
              <>
                <Loader2 className="h-[0.65rem] w-[0.65rem] animate-spin mr-[0.325rem]" />
                Deleting...
              </>
            ) : `Delete${isCritical ? " Permanently" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
