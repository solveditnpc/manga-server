"use client";
import { useRef, useEffect } from "react";

interface ModalProps extends React.HTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onOpenChange?: (e: boolean) => void;
  children: React.ReactNode;
}

export default function Modal({
  children,
  open,
  onOpenChange,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openRef = useRef<boolean>(open);
  const { className = "", ...rest } = props;

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (open && !dialog.open) dialog.showModal();
      else if (!open && dialog.open) dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      // escape keydown
      e.preventDefault(); // stop auto close
      onOpenChange?.(false);
    };

    const handleClose = () => {
      if (openRef.current) onOpenChange?.(false);
    };

    const handleClick = (e: MouseEvent) => {
      // backdrop click
      if (e.target === dialog) {
        onOpenChange?.(false);
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onOpenChange]);

  return (
    <dialog
      ref={dialogRef}
      className={`
        w-full max-w-sm 
        bg-card border border-default 
        rounded-lg p-4
        backdrop:backdrop-blur-xs
        left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        focus-ring
        ${className}
      `}
      {...rest}
    >
      {children}
    </dialog>
  );
}
