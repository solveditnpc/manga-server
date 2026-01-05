"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-default rounded-lg p-4">
        <h3 className="text-sm font-semibold fg-primary">{title}</h3>

        {description && <p className="mt-2 text-sm fg-muted">{description}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="
              text-sm
              fg-muted
              border border-default
              rounded
              px-3 py-1.5
              hover-card
              focus-ring
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="
              text-sm
              fg-accent
              border border-default
              rounded
              px-3 py-1.5
              focus-ring
            "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
