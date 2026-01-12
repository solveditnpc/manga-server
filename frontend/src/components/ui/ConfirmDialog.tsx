"use client";
import { Button, Modal } from "./";
type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  error?: string | null;
  variant?: "primary" | "danger";
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  error,
  variant = "primary",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onOpenChange={(open) => !open && onCancel()}>
      {/* Dialog */}
      <h2 className="text-sm font-semibold fg-primary">{title}</h2>

      {description && <p className="mt-2 text-sm fg-muted">{description}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onCancel} className="fg-muted">
          Cancel
        </Button>

        <Button onClick={onConfirm} variant={variant}>
          {confirmLabel}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm fg-danger text-right italic">{error}</p>
      )}
    </Modal>
  );
}
