"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm?: () => void | Promise<void>;
  isProcessing?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  showCancel?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isProcessing = false,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
  showCancel = true,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-2 bg-background-2">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-4">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:space-x-0">
          {showCancel && (
            <Button onClick={() => onOpenChange(false)} disabled={isProcessing}>
              {cancelText}
            </Button>
          )}
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "처리 중..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
