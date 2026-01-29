"use client";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
type toastType = "success" | "error" | "warning" | "info";

export default function ToastForServer({
  type,
  title,
  description,
}: {
  type: toastType;
  title: string;
  description?: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    console.log("Firing toast");

    fired.current = true;

    // using timeout to avoid hydration error
    const timeout = setTimeout(() => {
      toast[type](title, { description });
    }, 0);
    return () => clearTimeout(timeout);
  }, [title, description, type]);

  return <></>;
}
