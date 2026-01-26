"use client";
import { Button, Modal } from "../../ui";
import { useEffect, useState } from "react";
import { getState, subscribe, accept, cancel } from "./confirm";

export default function ConfirmOverlay() {
  const [_, reRender] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      reRender((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const { open, options } = getState();

  const {
    title = "Confirm Action",
    description,
    confirmLabel = "Confirm",
    variant = "primary",
  } = options || {};

  return (
    <Modal open={open} onOpenChange={(open) => !open && cancel()}>
      {/* Dialog */}
      <h2 className="text-sm font-semibold fg-primary">{title}</h2>

      {description && <p className="mt-2 text-sm fg-muted">{description}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={cancel} className="fg-muted">
          Cancel
        </Button>

        <Button onClick={accept} variant={variant}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
